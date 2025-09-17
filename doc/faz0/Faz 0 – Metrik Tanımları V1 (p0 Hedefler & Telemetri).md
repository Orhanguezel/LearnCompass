# Faz 0 – Metrik Tanımları v1 (P0 Hedefler & Telemetri)

Bu doküman, **Öğrenci Koçu (LearnCompass)** MVP’si için P0 metriklerini **operasyonel** düzeyde tanımlar: kesin formüller, sayım kuralları, olay (event) şemaları, örnek payload’lar, veri kaynakları, kalite kontrolleri, dashboard taslakları ve ölçüm pencereleri. Kod içermez; veri ve ölçüm tasarımı rehberidir.

---

## 1) Metrik Sözlüğü (P0)

### 1.1 Plan Görüntüleme Oranı (PGR)

* **Tanım:** İlk oturumda plan sayfasını gören benzersiz öğrenci / ilk oturumda giriş yapan benzersiz öğrenci.
* **Formül:** `PGR = unique_students_view_plan / unique_students_signed_in`
* **Zaman penceresi:** Öğrencinin **ilk oturumu** (first-session) veya pilot haftasında ilk login; o gün içindeki tekrarlar sayılmaz.
* **Numeratör:** `plan_view` event’i **en az bir kez** gönderen benzersiz `student_key` sayısı.
* **Denominatör:** `session_start` (veya `login_success`) event’i gönderen benzersiz `student_key` sayısı.
* **Filtreler:** `env=pilot`, `role=student`, `school_id in pilot_schools`.
* **Deduplikasyon:** Aynı öğrenci aynı gün içinde birden fazla görüntülese **tek sayılır**.
* **Hedef:** **≥ %60** (pilot).

### 1.2 Plan Kabul Oranı (PKO)

* **Tanım:** Önerilen planı kabul eden öğrenci / planı görüntüleyen öğrenci.
* **Formül:** `PKO = unique_students_accept_plan / unique_students_view_plan`
* **Numeratör:** `plan_action{action=accept}` event’i olan benzersiz `student_key`.
* **Denominatör:** `plan_view` event’i olan benzersiz `student_key`.
* **Eşleştirme:** Aynı gün içinde `plan_view` → `plan_action` (accept) zinciri; 24 saatlik pencere.
* **Hedef:** **≥ %30** (pilot).

### 1.3 Öğretmen Fayda Puanı (OFP)

* **Tanım:** Öğretmen panelinde tek tık **faydalı/uygun** değerlendirmesi (1–5) ortalaması.
* **Formül:** `OFP = avg(feedback_rating)`
* **Kaynak:** `flow_feedback{role=teacher, flow in [summary, plan, qa, error_review]}`.
* **Ağırlıklandırma (ops.):** öğretmen başına eşit ağırlık (oversampling önlemek için `avg_by_teacher` sonra global ortalama).
* **Hedef:** **≥ 3.5/5** (≈ %70 olumlu).

### 1.4 Hata/Yanıltıcı İçerik Oranı (HYİ)

* **Tanım:** İçerik hatası bildirimi / toplam üretim (LLM çıktısı).
* **Formül:** `HYİ = flagged_contents / total_generations`
* **Numeratör:** `content_flagged{reason in [factual,tone,policy]}` event sayısı.
* **Denominatör:** `flow_completed` event’lerinin toplamı (öğrenci+öğretmen görünür çıktıları).
* **Hedef:** **≤ %3** (pilot).

---

## 2) Olay (Event) Şemaları v0.1

> **Gizlilik:** Tüm eventlerde **PII yok**. Kimlik alanı **`student_key`** (pseudonym). İsteğe bağlı `email_hash` öğretmen/admin için SHA‑256.

### 2.1 Ortak Alanlar

* `event` *(string)* – ör. `session_start`, `plan_view`
* `event_version` *(string)* – ör. `v0.1`
* `ts` *(ISO‑8601)* – olay zamanı
* `env` *(enum)* – `dev|pilot|prod`
* `tenant_id` *(string)* – okul/kurum kimliği
* `student_key?` *(string)* – öğrenci için pseudonym
* `role` *(enum)* – `student|teacher|admin`
* `locale` *(BCP‑47)* – `tr|de|en`
* `ua_hash` *(string)* – user‑agent hash
* `ip_region?` *(string)* – bölge/ülke (IP’den ülke, kişisel IP kaydı yok)

### 2.2 `session_start`

* Ek alanlar: `referrer?`, `source? (email|direct|portal)`, `ab_variant?`
* Kullanım: PGR’in paydasında.

### 2.3 `plan_view`

* Ek alanlar: `plan_id`, `source.suggested_by (ai|teacher)`, `topic_code?`

### 2.4 `plan_action`

* Ek alanlar: `plan_id`, `action (accept|reject|snooze|regenerate)`, `reason?`, `latency_ms?`

### 2.5 `flow_started` / `flow_completed`

* Ek alanlar (başlangıç): `flow (summary|plan|qa|error_review)`, `topic_code`, `model`, `tokens_in_est`
* Ek alanlar (tamamlandı): `tokens_in`, `tokens_out`, `duration_ms`, `cost_estimate`

### 2.6 `flow_feedback`

* Ek alanlar: `flow`, `rating (1..5)`, `note?`, `by (student|teacher)`

### 2.7 `content_flagged`

* Ek alanlar: `flow`, `reason (factual|tone|policy)`, `note?`, `content_id?`

**Versiyonlama:** Şema değişimlerinde `event_version` artar; panolarda **sağdan uyumlu** dönüşüm kuralları tutulur.

---

## 3) Örnek Payload’lar (maskeli)

```json
{
  "event": "session_start",
  "event_version": "v0.1",
  "ts": "2025-09-16T08:12:03Z",
  "env": "pilot",
  "tenant_id": "schoolA",
  "student_key": "sk_9c1f...",
  "role": "student",
  "locale": "tr",
  "ua_hash": "uA6f...",
  "source": "portal",
  "ab_variant": "A"
}
```

```json
{
  "event": "plan_action",
  "event_version": "v0.1",
  "ts": "2025-09-16T08:14:55Z",
  "env": "pilot",
  "tenant_id": "schoolA",
  "student_key": "sk_9c1f...",
  "role": "student",
  "plan_id": "pl_7b21...",
  "action": "accept",
  "latency_ms": 930
}
```

---

## 4) Ölçüm Kuralları & Edge Case Politikaları

* **Tekil sayım:** `unique_students_*` metrikleri **`student_key`** bazında; aynı gün tekrarları **tek**.
* **Pencere eşleştirme:** `plan_view → plan_action` eşleştirmeleri **24 saat** penceresinde.
* **Bot/Anomali süzgeci:** aşırı düşük `duration_ms < 300`, olağan dışı `ua_hash` kümeleri, çok yüksek hızda event akışı → dışla.
* **Önbellek/yenileme:** aynı `plan_id` için art arda `plan_view` → **debounce 10 sn**.
* **Çoklu cihaz:** `ua_hash` farklı olsa da aynı gün aynı `student_key` → tek.
* **A/B kapsama:** `ab_variant` zorunlu alan; metrikler varyanta göre ayrıştırılır.

---

## 5) Veri Hatları & Kaynaklar

* **Event Store (ham):** `events_raw` (JSON lines).
* **Modelleme:** günlük işlenmiş tablo `events_daily` (boyutlar: tarih, tenant, role, locale, variant).
* **Boyut sözlüğü:** `dim_topic` (topic\_code→ad/yol), `dim_user` (sadece pseudonym ilişkileri; PII ayrı kasada).
* **Saklama:** `events_raw` 14 gün, `events_daily` 12 ay (anonim).
* **ETL Kontrol:** eksik alanlar, şema uyumu, tarih sırası, hash doğrulama.

---

## 6) Örnek Sorgular (psödo)

### 6.1 PGR

```sql
-- Denominatör
WITH login AS (
  SELECT DISTINCT student_key
  FROM events_daily
  WHERE date BETWEEN @d1 AND @d2 AND env='pilot' AND role='student'
    AND event='session_start'
)
SELECT COUNT(DISTINCT v.student_key) AS view_u,
       (SELECT COUNT(*) FROM login)     AS login_u,
       COUNT(DISTINCT v.student_key) * 1.0 / (SELECT COUNT(*) FROM login) AS pgr
FROM events_daily v
JOIN login l USING (student_key)
WHERE v.event='plan_view';
```

### 6.2 PKO

```sql
WITH views AS (
  SELECT student_key, MIN(ts) AS first_view_ts
  FROM events_raw
  WHERE event='plan_view' AND env='pilot'
  GROUP BY 1
), accepts AS (
  SELECT DISTINCT student_key
  FROM events_raw e
  JOIN views v USING (student_key)
  WHERE e.event='plan_action' AND e.action='accept'
    AND e.ts BETWEEN v.first_view_ts AND v.first_view_ts + INTERVAL '24 hour'
)
SELECT COUNT(*) * 1.0 / (SELECT COUNT(*) FROM views) AS pko
FROM accepts;
```

### 6.3 OFP

```sql
SELECT AVG(rating) AS ofp
FROM events_raw
WHERE event='flow_feedback' AND role='teacher' AND env='pilot';
```

### 6.4 HYİ

```sql
SELECT SUM(CASE WHEN event='content_flagged' THEN 1 ELSE 0 END) * 1.0 /
       SUM(CASE WHEN event='flow_completed' THEN 1 ELSE 0 END) AS hyi
FROM events_daily
WHERE env='pilot';
```

---

## 7) Dashboard Taslakları

* **Funnel (PGR→PKO):** gün/sınıf/dil kırılımı; varyant A/B overlay.
* **OFP Dağılımı:** öğretmen başına kutu grafiği; düşük/hızlı geri bildirim uyarıları.
* **HYİ Trend:** sebep kırılımı (factual/tone/policy); 7 günlük hareketli ortalama.
* **Gecikme & Maliyet:** p50/p95 latency, tokens\_in/out; oturum başı € tahmini.

---

## 8) Kalite Güvencesi (QA) & Doğrulama

* **Event Şema Testi:** required alanlar, enum doğrulama, tarih sırası.
* **Numeratör/Denominatör Tutarlılığı:** örneklem bazlı **manuel denetim** (günlük 10 öğrenci).
* **Outlier Avı:** çok yüksek/çok düşük latency, sıra dışı token kullanımı.
* **Gölge Sayaçlar:** istemci ve sunucu tarafı sayaçların karşılaştırılması (±%5 tolerans).

---

## 9) Yönetişim & Versiyonlama

* **Metrik Tanımları:** bu doküman `v1.0`. Değişiklikte `CHANGELOG` güncellenir.
* **Karar Logu:** metrik formülü/ölçüm penceresi değişirse kayda geçer (tarih, gerekçe, etki).
* **Rollout:** yeni event alanları önce `dev` → `pilot` → `prod` aşamalarında, feature flag ile.

---

## 10) Açık Noktalar (karar gerektiren)

1. PGR’de “ilk oturum” yerine “ilk 24 saat” mi esas alınacak?
2. PKO eşleştirme penceresi 24 saat mi, 48 saat mi?
3. OFP’de öğretmen ağırlıklandırması uygulanacak mı?
4. HYİ’de **ton** (tone) raporlarının eşik/haritalaması nasıl olacak?
