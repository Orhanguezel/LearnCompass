# Faz 4 — Ölçümleme, Dökümantasyon, Yayına Hazırlık (Hafta 4) · Detaylı Plan

Bu doküman, **Öğrenci Koçu (LearnCompass)** MVP yol haritasındaki **Faz 4** adımını ayrıntılandırır. Amaç; içerik/doğruluk ölçümü, A/B prompt denemeleri, yayın paketinin hazırlanması, operasyonel runbook ve handover dokümantasyonunu P0 seviyede tamamlamaktır. Kod içermez; süreç ve çıktı odaklıdır.

---

## 0) Hafta 4 Hızlı Özet (Hedeflenenler)

* **Değerlendirme Raporu**: altın soru seti, örneklem inceleme, metrikler ve bulgular
* **A/B Prompt Planı**: deney tasarımı, ölçütler, günlük iyileştirme notları
* **Yayına Hazırlık Paketi**: docker-compose, .env şablonları, çalıştırma kılavuzu, smoke test listesi
* **Operasyon Runbook’u**: günlük/haftalık kontroller, uyarı eşikleri, olay yönetimi ve sorun giderme

> **Çıktılar:** Değerlendirme Raporu v1, Yayına Hazırlık Paketi v1, Operasyon Runbook’u v1

---

## 1) Metrik ve Doğruluk Değerlendirmesi

### 1.1 Altın Soru Seti (Gold Set)

* **Kapsam:** Pilot ders(ler) ve dillerde 40–80 örnek (dengeli dağılım: konu, zorluk, dil)
* **Etiketleme:** En az iki değerlendirici (öğretmen/uzman); uyuşmazlıkta üçüncü göz
* **Güvenirlik:** Cohen’s κ (hedef ≥ 0.70)
* **Saklama:** Etiketli örnekler PII’siz; revizyonlarla sürümlenir (v1, v1.1…)

### 1.2 Değerlendirme Boyutları (flow-bazlı)

* **Konu Özeti:** doğruluk, açıklık, terim uyumu, mini-quiz isabeti
* **Çalışma Planı:** kişiselleştirme kalitesi, uygulanabilirlik, kabul oranı
* **Örnek Soru:** çözüm doğruluğu, adım netliği, tipik hata uyarısı
* **Yanlış Analizi:** hata sınıflaması doğruluğu, düzeltme önerisi etkinliği

### 1.3 Nicel Göstergeler (eşik önerileri)

* **Doğruluk puanı (1–5 ort.):** ≥ 3.8
* **nDCG\@10 (arama):** ≥ 0.65 (pilot)
* **Plan kabul oranı:** ≥ %30 (pilot)
* **Hata/yanıltıcı içerik oranı:** ≤ %3
* **Gecikme (p95):** ≤ 4 s; **p50:** ≤ 2 s
* **Maliyet/oturum:** bütçe sınırı (gün başı X €); token başı maliyet kontrolü

### 1.4 Örneklemle İnceleme (Qual)

* Haftalık 20–30 örnek kök-neden analizi (good/bad)
* Hata temaları: terim sapmaları, düzey uyumsuzluğu, kaynak gösterimi
* İyileştirme notları: prompt revizyonu, synonym sözlüğü, chunking ayarı

**Çıktı:** *Değerlendirme Raporu v1* (bulgular, grafikler, öneriler, kabul/ret kararları)

---

## 2) A/B Prompt Sürümleme ve İyileştirme

### 2.1 Deney Tasarımı (P0)

* **Randomizasyon:** kullanıcı oturumu bazlı 50/50 (A vs B)
* **Örneklem:** minimum N; güç analizi kabaca (ikili oranlar için)
  `N ≈ 16 · p·(1−p) / Δ²` (tek varyant başına, p=beklenen oran, Δ=hedef fark)
* **Süre:** minimum 3–5 gün veya N tamamlanana kadar; hafta içi trafikte başlat

### 2.2 İzleme & Durdurma Kuralları

* **Anlamlılık:** α=0.05, iki kuyruk; **Güç:** 0.8 hedef
* **Ara kontrol:** günlük; istatistiksel durma **yok** (MVP’de sabit N)
* **Güvenlik:** olumsuz etki > X% veya HYİ > %3 → deneyi durdur/rollback

### 2.3 Hedef Metrikler (örnek)

* Plan kabul oranı (primary), geri dönüş oranı, flow tamamlama, p95 latency, içerik şikayeti oranı

### 2.4 Prompt Sürümleme & Günlük Notları

* **Sürümleme:** `prompt-flowName-vMAJOR.MINOR.patch` (örn. `plan-v1.2.0`)
* **Changelog:** tarih, yapılan değişiklik, hipotez, etki, karar
* **Rollback:** son iyi sürüm; parametre bayraklarıyla anında dönüş

**Çıktı:** *A/B Deney Planı & Prompt Changelog* (şablon + ilk kayıtlar)

---

## 3) Yayına Hazırlık Paketi (Release Readiness)

### 3.1 Docker-compose Bileşen Haritası (kod içermeyen tanım)

* **api** (HTTP): akış uçları, telemetri endpoint’leri, health `GET /healthz` (readiness) & `GET /livez` (liveness)
* **worker**: ETL, indeks yükleme, planlayıcı işler
* **vector-store**: Atlas VS veya Qdrant (pilotta seçilen)
* **db**: Mongo (BM25 + operasyonel veri)
* **cache**: Redis (oturum, rate limit, prompt cache)
* **mailer**: SMTP stub/test harness (magic link e-postası)
* **proxy**: Nginx/Caddy (TLS, sıkıştırma, güvenlik başlıkları)

### 3.2 .env Şablonları (örnek anahtar listesi)

* **Genel:** `NODE_ENV`, `PORT`, `LOG_LEVEL`, `TZ`, `DEFAULT_LOCALE`
* **Auth:** `MAGIC_JWT_SECRET`, `MAGIC_TTL_MIN`, `ALLOWED_ORIGINS`
* **DB/Index:** `MONGO_URI`, `ATLAS_SEARCH_INDEX`, `QV_HOST/QV_API_KEY?`
* **LLM:** `LLM_PROVIDER`, `LLM_MODEL`, `LLM_API_KEY`, `MAX_TOKENS`, `TEMPERATURE`
* **Mail:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
* **Telemetry:** `METRICS_ENDPOINT`, `ANONYMIZE=true`, `SAMPLE_RATE=0.05`

### 3.3 Çalıştırma Kılavuzu (operasyonel)

1. **Ön koşullar:** Docker, docker-compose, çevre dosyaları
2. **Başlatma:** `compose up` → health check’ler **yeşil** olmalı
3. **Smoke Test:**

   * `/healthz` 200, `/livez` 200
   * “Konu Özeti” akışında örnek gold set’ten 1 vaka
   * Magic link ile giriş – tek tık/tek cihaz onayı
   * ETL örnek dosya ingest → index doğrulama
4. **Gözlem:** p50/p95 latency, hata oranı, loglarda PII yok

### 3.4 Güvenlik & Uyum Kontrol Listesi

* [ ] TLS etkin; HSTS başlığı
* [ ] Rate limit: auth & akış POST uçları
* [ ] RBAC kontrolleri (teacher vs admin)
* [ ] Log anonymizasyonu; PII taraması
* [ ] Cookie/politika metinleri ve gizlilik notları yayınlandı

**Çıktı:** *Yayına Hazırlık Paketi v1* (env şablonları, çalıştırma kılavuzu, smoke & güvenlik checklist’leri)

---

## 4) Operasyon Runbook’u

### 4.1 Günlük Kontroller (AM)

* **Durum panosu:** hizmetlerin up-time, p95 latency, hata oranı
* **Maliyet:** dünkü token/€ harcaması, bütçe sapması
* **İçerik bayrakları:** `content_flagged` olayları; eşiği aşarsa inceleme

### 4.2 Haftalık Bakım

* Gold set revizyonu (yeni/çıkarılan örnekler)
* Sözlük/synonym güncellemeleri; prompt sürüm değerlendirme
* Yedekleme doğrulama (restore test)

### 4.3 Olay Yönetimi (Incident)

* **Sınıflar:** P1 (kritik), P2 (yüksek), P3 (orta)
* **Akış:** tespit → triage → geçici çözüm → kök neden → kapatma notu
* **SLA:** P1 ilk yanıt ≤ 15 dk; P2 ≤ 2 saat
* **İletişim:** durum sayfası / bilgi notu şablonu

### 4.4 Sorun Giderme (Playbooks)

* **Auth/Magic link:** TTL aşımları, clock skew, rate-limit tetiklenmesi
* **ETL/Index:** ingest başarısız; `E-INDEX-004`; rollback adımları
* **LLM hataları:** quota, zaman aşımı; fallback model/yeniden deneme
* **Performans:** aniden p95 ↑ → cache ısınması, indeks yeniden yapılandırma

**Çıktı:** *Operasyon Runbook’u v1* (günlük/haftalık görevler, olay sınıfları, playbook’lar)

---

## 5) Yayın Töreni (Go/No-Go) & Sonrası 72 Saat

### 5.1 Go/No-Go Toplantısı (checklist)

* [ ] Tüm health check’ler yeşil
* [ ] Güvenlik checklist’i tamam
* [ ] Değerlendirme Raporu onaylandı
* [ ] A/B deneylerinde olumsuz varyant **yok**
* [ ] Rollback planı ve iletişim hazır

### 5.2 İlk 72 Saat Planı

* **Kaptan gözcü:** 7×24 gözlem periyodu (düşük yoğunlukta vardiya)
* **Eşikler:** p95>5 s veya HYİ>%3 → acil durum
* **Hızlı sürüm:** prompt hotfix veya sözlük güncelleme prosedürü

---

## 6) Hafta 4 Takvimi (D1–D5)

* **D1 – AM:** Gold set son hal; değerlendirici kalibrasyonu
  **D1 – PM:** İlk ölçüm turu + ön bulgular
* **D2 – AM:** A/B deney planı başlatma
  **D2 – PM:** Yayın paketi dokümantasyonu (compose/env)
* **D3 – AM:** Runbook taslağı
  **D3 – PM:** Smoke & güvenlik testleri
* **D4 – AM:** Bulguların konsolidasyonu
  **D4 – PM:** Go/No-Go provası + rollback tatbikatı
* **D5 – AM:** Değerlendirme Raporu v1 yayını
  **D5 – PM:** Go/No-Go ve (onaylanırsa) pilot yayın

---

## 7) Definition of Done (Faz 4)

* **Değerlendirme Raporu v1**: metrikler, grafikler, bulgular, kararlar
* **A/B Planı & Changelog**: en az 1 aktif deney ve kayıtlar
* **Yayına Hazırlık Paketi v1**: compose bileşenleri, env şablonları, kılavuzlar
* **Operasyon Runbook’u v1**: günlük/haftalık bakım, olay süreci, playbook’lar
* **Go/No-Go**: check-list tamamlandı, rollback planı hazır

---

## 8) Riskler & Önlemler (Faz 4)

| Risk                       | Olasılık | Etki   | Önlem                              | Trigger            | Plan B                        |
| -------------------------- | -------- | ------ | ---------------------------------- | ------------------ | ----------------------------- |
| Değerlendirici uyumsuzluğu | Orta     | Orta   | Kalibrasyon oturumu, örnek anahtar | κ < 0.7            | Üçüncü göz + şablon revizyonu |
| A/B’de olumsuz varyant     | Orta     | Yüksek | Erken izleme, durdurma eşiği       | HYİ>%3             | Rollback, varyantı kara liste |
| Compose/Env hataları       | Düşük    | Yüksek | Smoke test, .env doğrulama         | Health kırmızı     | Son iyi sürüme dönüş          |
| Maliyet aşımları           | Orta     | Orta   | Token bütçesi, cache, limitler     | Günlük maliyet > X | Model/parametre düşürme       |

---

## 9) Şablonlar (Ekler)

### 9.1 Değerlendirme Raporu Şablonu

1. Amaç & Kapsam
2. Veri Seti (gold set dağılımı)
3. Nicel Sonuçlar (grafikler)
4. Nitel Bulgular (temalar)
5. Hatalar & İyileştirme Önerileri
6. Aksiyon Planı & Sorumlular
7. Ekler (örnekler, etiket yönergeleri)

### 9.2 A/B Deney Kaydı (Changelog)

* **Kimlik:** `flow`, `variant`, `version`
* **Hipotez:** beklenen etki
* **Değişiklik:** prompt/param
* **Metrikler:** primary/secondary
* **Karar:** win|lose|inconclusive + notlar

### 9.3 Operasyon Playbook Şablonu

* **Belirti:** …
* **Muhtemel Nedenler:** …
* **Teşhis Adımları:** …
* **Geçici Çözüm:** …
* **Kök Neden & Kalıcı Çözüm:** …
* **Önleme:** …

### 9.4 .env Doğrulama Listesi

* [ ] Zorunlu anahtarlar mevcut
* [ ] Mantıksal aralıklar (TTL, rate limit)
* [ ] URI’ler geçerli
* [ ] Debug bayrakları prod’da kapalı
* [ ] Anonimizasyon `true`
