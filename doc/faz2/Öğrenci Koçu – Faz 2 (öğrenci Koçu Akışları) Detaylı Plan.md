# Faz 2 — Öğrenci Koçu Akışları · Derinleştirme v2

Bu sürüm, Faz 2’nin bir önceki “Detaylı Plan” dokümanını **derinleştirir**: akışların durum makineleri, giriş/çıkış sözleşmeleri, ölçümleme, guardrail karar tabloları, değerlendirme rubriği ve test senaryoları eklenmiştir. Kod içermez; tasarım ve operasyon seviyesinde rehberdir.

---

## 1) Context Builder — Bileşim Kuralları

### 1.1 Ağırlıklı Puanlama (öneri)

* **Zaman ağırlığı:** $w_{30}=0.6, w_{90}=0.3, w_{old}=0.1$
* **Konu skoru:** $S_{topic} = 0.6·\overline{score}_{30} + 0.3·\overline{score}_{90} + 0.1·adj(teacher\_note)$
* **Zorluk hedefi:** `target_level = clamp(baseline_level + f(S_topic), min, max)`

### 1.2 Veri Eksikliği (Cold‑start) Kuralları

* Performans yoksa:
  **(a)** *diagnostic mini‑quiz* öner (3 soru),
  **(b)** varsayılan seviye = sınıf seviyesi,
  **(c)** plan süresi kısa (3 gün), hızlı geri bildirim döngüsü.

### 1.3 Özet Bütçesi & Sınırlar

* `student_context` ≤ **400 token**
* `course_context` ≤ **300 token**
* `recent_activity` ≤ **5 madde**
* PII yok; yalnızca `student_key`.

### 1.4 Kalite Notları

* Dil uyumu: `target_lang`
* Okunabilirlik: Flesch‑Kincaid benzeri basitlik hedefi (ortaokul için \~8–10).

---

## 2) P0 Akışları — Durum Makineleri & I/O

### 2.1 Konu Özeti

**Durumlar:** `START → NEED_INFO? → GENERATE → QUIZ → FEEDBACK → END`

* **NEED\_INFO?:** Eksik konu/alt konu varsa tek net soru sor.
* **GENERATE:** Özet + ana noktalar + mini quiz üret.
* **QUIZ:** 3 kısa soru (çoktan seçmeli/kısa yanıt).
* **FEEDBACK:** Öğrencinin “anladım” puanı + açık uçlu not; telemetriye yaz.

**Girdi:** `{student_context, course_context, topic_code, lang}`
**Çıktı:** `{summary, key_points[5–7], mini_quiz[3], further_reading}`
**Hatalar:** `E-MISSING-TOPIC`, `E-LANG-MISMATCH`

### 2.2 Kişisel Çalışma Planı

**Durumlar:** `START → ASK_TIME? → PLAN_DRAFT → CONFIRM → SCHEDULED|REVISE → END`

* **ASK\_TIME?:** `available_time` bilinmiyorsa tek soru.
* **PLAN\_DRAFT:** 3–7 gün; 15–25 dk bloklar; kademeli zorluk.
* **CONFIRM:** `accept|reject|snooze|regenerate` seçenekleri.
* **SCHEDULED:** planı “aktif”e al; check‑in noktaları kaydı.

**Girdi:** `{student_context, recent_activity, topic_code, available_time?}`
**Çıktı:** `{plan:{days:[{tasks,est_time}]}, resources[], checkpoints[]}`
**Hatalar:** `E-TIME-UNREALISTIC` (aşırı düşük/sıfır)

### 2.3 Örnek Soru & Açıklamalı Çözüm

**Durumlar:** `START → SET_LEVEL → GENERATE_QA → FOLLOW_UP → END`

* **SET\_LEVEL:** `target_level = auto|easy|medium|hard` (öğrenci/öğretmen override).
* **GENERATE\_QA:** `question`, `solution_steps[]`, `why_it_works`, `common_mistake`.
* **FOLLOW\_UP:** “Benzeri bir soru ister misin?”

**Girdi:** `{topic_code, student_context, level?}`
**Çıktı:** `{question, solution_steps[], why_it_works, common_mistake}`
**Format:** Matematikte LaTeX benzeri çıktı önerisi (`$...$`), metin tabanlı alternatif şart.

### 2.4 Yanlış Analizi

**Durumlar:** `START → CAPTURE_INPUT → CLASSIFY → EXPLAIN → PRACTICE → END`

* **CAPTURE\_INPUT:** Öğrencinin cevap/çözüm ekran görüntüsü yerine metinle alın; PII taraması.
* **CLASSIFY:** `error_category = conceptual|procedural|attention|strategy`.
* **EXPLAIN:** Sapma noktası, doğrusu ve kısa gerekçe.
* **PRACTICE:** 2–3 mini alıştırma; bir sonraki küçük adım planına yaz.

**Girdi:** `{student_wrong_answer, topic_code, student_context}`
**Çıktı:** `{error_category, explanation, fix_practice[], next_step}`
**Hatalar:** `E-INPUT-LOWQUALITY` (okunaksız/eksik)

---

## 3) Prompt Kitaplığı — Üretim Şablonları (Geliştirici‑yüzü)

> **Not:** System/Developer/User katmanları ayrıdır. Aşağıda iskelet ve çıktı şemaları bulunur; gerçek sistemde parametrelerle doldurulur.

### 3.1 Ortak System Mesajı

* Rol: `{target_lang}` konuşan **pedagojik koç**.
* İlkeler: açık, kademeli, güvenli; müfredat terimleri; belirsizlikte temkinli dil.
* Gizlilik: PII talep etme; `student_key` dışında kimlik kullanma.

### 3.2 Konu Özeti — Prompt

* **System:** “Müfredat uyumlu, 300–500 kelime; 5–7 madde ana nokta; 3 mini quiz.”
* **Dev:** “Önce kısa plan, sonra içerik; teknik terimleri öğrencinin seviyesine göre açıkla.”
* **User Vars:** `{student_context, course_context, topic_code, target_lang}`
* **Beklenen JSON:** `{summary, key_points[], mini_quiz[], further_reading}`

### 3.3 Plan — Prompt

* **System:** “Kısa bloklar; kademeli zorluk; eksik bilgi varsa **tek soruda** iste.”
* **Dev:** “Görevleri net fiillerle başlat (Çöz, Oku, Tekrarla).”
* **User Vars:** `{student_context, recent_activity, topic_code, available_time?, target_lang}`
* **Beklenen JSON:** `{plan:{days:[{title,tasks[],est_time}]}, resources[], checkpoints[]}`

### 3.4 Örnek Soru — Prompt

* **System:** “Adım adım çözüm + neden çalışır açıklaması + tipik hata.”
* **User Vars:** `{topic_code, level, target_lang, student_context}`
* **Beklenen JSON:** `{question, solution_steps[], why_it_works, common_mistake}`

### 3.5 Yanlış Analizi — Prompt

* **System:** “Nazik, teşhis + mini pratik; yargılayıcı dil yok.”
* **User Vars:** `{student_wrong_answer, topic_code, target_lang, student_context}`
* **Beklenen JSON:** `{error_category, explanation, fix_practice[], next_step}`

**Token Bütçesi (öneri):** girdi ≤ 2k, çıktı ≤ 800 token; maliyet kontrolü için cache + kısıtlama.

---

## 4) Guardrails — Karar Tablosu & Mikro Metinler

### 4.1 Karar Tablosu

| Senaryo                   | Aksiyon                               | Not                              |
| ------------------------- | ------------------------------------- | -------------------------------- |
| Müstehcen/zararlı talep   | Kibar reddet + güvenli yönlendirme    | Çok kısa, yargısız ton           |
| Müfredat dışı spekülasyon | Kapsam dışı uyarı + ilgili konuya dön | “Şu an {topic\_code} odaklıyız…” |
| Sağlık/hukuk vs.          | Reddet + güvenli kaynak öner          | Politika uyumu                   |
| PII talebi                | Reddet; anonim kalma politikası       | `student_key` dışında kimlik yok |
| Düşük güven               | Temkinli dil + netleştirici soru      | “Bunu doğrulamak için …”         |

### 4.2 Reddetme Mikro Metinleri (TR/EN/DE)

* **TR:** “Bu istek eğitim kapsamımızın ve güvenli kullanım ilkelerimizin dışında. İstersen {topic\_name} konusunda şu hedefle devam edebiliriz: …”
* **EN:** “This request falls outside our educational and safety guidelines. If you like, we can continue with {topic\_name} and this goal: …”
* **DE:** “Diese Anfrage liegt außerhalb unserer Bildungs- und Sicherheitsrichtlinien. Wir können mit {topic\_name} und folgendem Ziel fortfahren: …”

---

## 5) Telemetri — Olay Şeması & Gizlilik

### 5.1 Olaylar

* `flow_started {flow, student_key, topic_code, lang, ts}`
* `need_info_prompted {flow, field}`
* `flow_completed {flow, duration_ms, tokens_in, tokens_out, model}`
* `flow_feedback {flow, rating, note?}`
* `content_flagged {flow, reason}`

### 5.2 Redaksiyon & Saklama

* Maskelenmiş örnek girdi/çıktı **%5 örneklem**
* Ham log saklama **7–14 gün**, özet metrikler uzun süre
* PII yok; e‑posta/ad yok; yalnızca `student_key`.

### 5.3 Gözlenebilirlik

* Gecikme (p50/p95), hata oranı, maliyet (≈ token → €) dashboard’ları
* Akış bazlı kabul/ret ve geri dönüş oranları

---

## 6) Değerlendirme Rubriği

### 6.1 İçerik Kalitesi (1–5)

* **Doğruluk:** müfredat uyumu, maddi hata yok
* **Açıklık:** adım adım, uygun terim seviyesi
* **Uygunluk:** dil/yaş uyumu, saygılı ton
* **Yönlendiricilik:** “sonraki adım” netliği

### 6.2 Akış Verimliliği

* Gereksiz soru sayısı (≤1), `NEED_INFO?` isabeti
* İlk denemede kabul oranı (plan/özet)
* Yanıt süresi hedefi (≤3–5 sn ortalama)

---

## 7) Test Senaryoları (Red/QA Seti)

1. **Eksik konu kodu:** `topic_code` yok → tek soru ile tamamlama
2. **Çok uzun öğrenci girdi metni:** özetleyip çekirdek kısımları kullanma
3. **Dil uyuşmazlığı:** öğrenci `de`, içerik `tr` → dil eşleme
4. **Yanlış analizi boş/eksik çözüm:** netleştirici soru
5. **Aşırı zor plan:** uyarı ve seviye düşürme
6. **Müstehcen/zararlı istek:** reddetme metni + güvenli alternatif
7. **Düşük güven RAG sonucu:** temkinli dil + kaynak işareti
8. **Hızlı tekrar talebi:** kısa checkpoint önerileri

---

## 8) DoR/DoD — Genişletme

**DoR:**

* [ ] `student_context` ve `course_context` hazır
* [ ] Sözlük (topic\_path) donduruldu
* [ ] Guardrail tablosu onaylandı
* [ ] Telemetri alanları kabul edildi

**DoD:**

* [ ] 4 akış için durum makineleri ve I/O sözleşmeleri
* [ ] Prompt şablonları + örnek çıktılar
* [ ] Guardrail mikro metinleri (TR/EN/DE)
* [ ] Telemetri olayları sisteme bağlandı (mock yeter)
* [ ] Rubrik ile örnek değerlendirme tamamlandı (≥10 örnek)

---

## 9) Açık Kararlar

1. **Okunabilirlik seviyesi** (TR/DE/EN için hedef aralık)
2. **LaTeX/biçimlendirme** kullanım kuralları (platform desteği)
3. **Diagnostic mini‑quiz** soru havuzu ve kabul eşiği
4. **Düşük güven bayrağı** için eşik (örn. benzerlik skoru < 0.55)
