# Roller & Sorumluluklar • Riskler & Önlemler • Başarı Kriterleri • Backlog (P1) – Detaylı Çerçeve

Bu doküman, **Öğrenci Koçu (LearnCompass)** MVP’si için fazlar sonrası yönetişim, ölçüm ve geliştirme yolunu detaylandırır. Kod içermez; karar, süreç ve kabul ölçütleri odaklıdır.

---

## 1) Roller & Sorumluluklar

### 1.1 Sorumluluk Özeti

* **Siz (Müşteri)**

  * **Veri Sağlama:** Örnek transkriptler, öğretmen notları, sınav/ödev özetleri (PII’siz/pseudonym).
  * **Rol/Yetki Onayı:** admin/öğretmen/öğrenci kapsam ve yetki matrisi.
  * **Marka Öğeleri:** logo (SVG/PNG), renk paleti, tipografi tercihleri; whitelabel onayı.
  * **Karar Ritimleri:** haftalık 60 dk toplantı; kritik kararlarda tek karar noktası (PO).
  * **Uyum Onayı:** KVKK/GDPR metinleri, aydınlatma, veri işleme sözleşmesi.
  * **Pilot Erişim:** pilot öğretmen/öğrenci listesi (pseudonym), geri bildirim toplama.

* **Biz**

  * **ETL & Dizin:** şema/validasyon, chunking, BM25+vektör hibrit arama.
  * **Akış Tasarımı:** konu özeti, kişisel plan, örnek soru, yanlış analizi.
  * **Guardrails:** içerik güvenliği, temkinli dil, reddetme şablonları.
  * **Mini Panel:** öğretmen görünümleri, RBAC, magic-link giriş politikası.
  * **Telemetri:** event sözlüğü, log alanları, metrik panolarının taslağı.
  * **Kurulum & Dökümantasyon:** docker-compose, .env şablonları, runbook.

### 1.2 RACI Matrisi (özet)

| Aktivite                   | R (Sorumlu) | A (Hesap veren) | C (Danışılan)  | I (Bilgilendirilen) |
| -------------------------- | ----------- | --------------- | -------------- | ------------------- |
| Veri sözleşmesi            | Biz         | PO (Müşteri)    | Öğretmen, Uyum | Tüm ekip            |
| ETL kuralları/validasyon   | Biz         | Biz             | Müşteri teknik | Müşteri             |
| Hibrit arama parametreleri | Biz         | Biz             | Öğretmen       | Müşteri             |
| Guardrail politikaları     | Biz         | PO              | Uyum           | Tüm ekip            |
| RBAC & giriş politikası    | Biz         | PO              | Uyum           | Müşteri             |
| Whitelabel tema            | Biz         | PO              | Tasarım        | Öğretmen            |
| Telemetri & metrikler      | Biz         | PO              | Öğretmen       | Müşteri             |
| Go/No‑Go                   | Biz         | PO              | —              | Tüm ekip            |

### 1.3 Çalışma Anlaşmaları (SLA/OLA)

* **İletişim:** Slack/Discord ana kanal; kritiklerde 24 saat içinde yanıt.
* **Karar Kayıtları:** Karar Logu’na tarih|konu|gerekçe|etki|sorumlu eklenir.
* **Geri Bildirim Döngüsü:** Öğretmenlerden haftalık mini anket + örnek yorumlar.
* **Erişim & Güvenlik:** En az ayrıcalık; tüm ortamlar EU bölgesi; audit log tutulur.

**Kabul Kriteri:** Yukarıdaki kalemler imzalı **Yönetişim Notu**nda yayımlanır.

---

## 2) Riskler & Önlemler (Risk Kaydı)

### 2.1 Çekirdek Riskler (verilenler genişletildi)

| #  | Risk                               | Kategori  | Olasılık | Etki   | Erken Uyarı/Trigger        | Önlem                                           | Plan B                            | Sahip |
| -- | ---------------------------------- | --------- | -------- | ------ | -------------------------- | ----------------------------------------------- | --------------------------------- | ----- |
| R1 | **Veri gecikmesi**                 | Operasyon | Orta     | Yüksek | D1 sonunda veri yok        | Sahte veri + yer tutucu içerik; ETL mock        | Pilot içeriği kısıtla; faz kaydır | Biz   |
| R2 | **Model maliyetleri**              | Maliyet   | Orta     | Orta   | Günlük € bütçe aşılıyor    | Token sınırları, önbellek, çıktı kısaltma       | Daha ucuz model, sıcak/soğuk rota | Biz   |
| R3 | **Kapsam genişlemesi**             | Ürün      | Orta     | Orta   | Yeni istek listesi artıyor | P0/P1 ayrımı, mini CR süreci                    | Faz sonrası sprint                | PO    |
| R4 | **Uyum/KVKK ihlali**               | Uyum      | Düşük    | Yüksek | PII sızıntı uyarıları      | Pseudonym, PII tarama, erişim etiketi           | İhlal planı, erişimi kes          | Uyum  |
| R5 | **Hallucination/yanıltıcı içerik** | İçerik    | Orta     | Orta   | Şikâyet oranı ↑            | Guardrails, kaynak işareti, düşük güven bayrağı | Öğretmen onayı, varyantı durdur   | Biz   |
| R6 | **İndeks performansı**             | Teknik    | Düşük    | Orta   | p95 > 5 s                  | K1/K2, α tuning; cache                          | Parçalama ayarı, donanım artışı   | Biz   |
| R7 | **Vendor lock‑in**                 | Stratejik | Düşük    | Orta   | Bulut bağımlılıkları       | Abstraksiyon katmanı, göç planı                 | Alternatif (Qdrant, yerel LLM)    | Biz   |
| R8 | **Embed güvenliği**                | Güvenlik  | Orta     | Orta   | Portal domain değişimi     | CSP allow‑list, X‑Frame‑Options                 | Deep‑link’e geçiş                 | Biz   |

**Kabul Kriteri:** Risk Kaydı v1’de *olasılık×etki* puanı, **sahip** ve **gözden geçirme tarihi** yer alır.

---

## 3) Başarı Kriterleri (MVP)

### 3.1 Primer Metrikler (tanım + formül)

* **Plan Görüntüleme Oranı (PGR):** `unique_students_view_plan / unique_students_signed_in` — **Hedef ≥ %60**
* **Plan Kabul Oranı (PKO):** `unique_students_accept_plan / unique_students_view_plan` — **Hedef ≥ %30**
* **Öğretmen Fayda Puanı (OFP):** 1–5 ortalama; panel içi tek tık — **Hedef ≥ 3.5/5 (\~%70 olumlu)**
* **Hata/yanıltıcı içerik oranı (HYİ):** `flags / total_generations` — **Hedef ≤ %3**

### 3.2 Sekonder Metrikler

* **D7 geri dönüş** (retention) ≥ %25 (pilot)
* **Gecikme:** p95 ≤ 4 s, p50 ≤ 2 s
* **Maliyet/öğrenci/hafta:** bütçe tavanı (örn. ≤ €X)
* **Arama Kalitesi:** nDCG\@10 ≥ 0.65

### 3.3 Ölçüm Yöntemi & Örneklem

* Telemetri olayları: `flow_started`, `flow_completed`, `plan_action`, `flow_feedback`, `content_flagged`.
* **Pencere:** Pilot ilk 14 gün; haftalık rapor.
* **Segmentler:** Dil (`tr/de/en`), sınıf/seviye, öğretmen grupları.
* **Güvenirlik:** Gold set kontrolü ve çift değerlendirici ile kalite örneklemesi (κ≥0.70).

**Kabul Kriteri:** Metrik panosu ve **Değerlendirme Raporu v1** yayımlandı; eşikler sağlanıyorsa Go.

---

## 4) Backlog (P1 Sonrası) — Epik Tanımları

### 4.1 Gelişmiş Kişiselleştirme (öğrenme stili, hız adaptasyonu)

* **Amaç:** Zaman/tempo, zorluk ve içerik türünü öğrenci yanıtlarına göre dinamik ayarlamak.
* **Kapsam:** öğrenme stili anketi (kısa), tempo modellemesi, otomatik seviye kaydırma, adaptif mini-quiz.
* **Veri:** Yanıt süreleri, doğru/yanlış paterni, öz değerlendirme.
* **Bağımlılıklar:** Telemetri zenginliği, Context Builder genişletmesi.
* **Kabul:** En az %10 plan kabul artışı veya D7 geri dönüş +%5.

### 4.2 Kurumsal SSO/SAML entegrasyonu (opsiyonel)

* **Amaç:** Kurumsal kimlik sağlayıcılarıyla tek oturum (Azure AD, Google Workspace).
* **Kapsam:** SAML/OIDC entegrasyonu, role mapping, Just‑In‑Time provisioning.
* **Risk:** Kurumsal güvenlik politikaları; metadata/sertifika yönetimi.
* **Kabul:** 3 kurumsal tenant’ta sorunsuz giriş; audit log tamam.

### 4.3 Gelişmiş sınav üretimi & zorluk kalibrasyonu

* **Amaç:** Hedef zorluk aralığına göre soru üretimi ve otomatik kalibrasyon.
* **Kapsam:** Item response theory (IRT) sinyalleri, seviye etiketleme, kalibrasyon döngüsü.
* **Kabul:** Öğretmen doğruluk onayı ≥ %75; öğrenci zorlanma şikâyeti azalışı.

### 4.4 Çok dilli içerik & otomatik çeviri kalite izleme

* **Amaç:** TR/DE/EN eşdeğerlik; otomatik çeviri + kalite metriği (BLEU/LQA hafif).
* **Kapsam:** Çeviri hafızası, terminoloji sözlüğü, kalite uyarıları.
* **Kabul:** Çeviri hatası şikâyeti ≤ %2; terminoloji tutarlılığı (+synonym sözlüğü).

### 4.5 Analitik panosu (cohort, etkileşim hunisi)

* **Amaç:** Yönetim ve öğretmenler için davranışsal ve öğrenme çıktısı analitiği.
* **Kapsam:** Cohort analizi, funnel, konu bazlı başarı ısı haritaları, maliyet/performans görünümü.
* **Kabul:** Haftalık karar toplantılarında 3+ aksiyon üretilmesi; öğretmen NPS ↑.

### 4.6 (Opsiyonel) İçerik Yazar Modu & Kütüphane

* **Amaç:** Öğretmenlerin yerel içerik/ödev şablonu oluşturması ve paylaşması.
* **Kapsam:** Basit editör, sürümleme, paylaşım izinleri, telif/politika kontrolü.

### 4.7 (Opsiyonel) LMS Entegrasyonları (Moodle/Google Classroom)

* **Amaç:** Ödevlerin dış sisteme aktarımı ve not/sunum eşitlemesi.
* **Kapsam:** Basit push/pull API’leri, grade sync, link‑back.

**Önceliklendirme:** 4.1 → 4.5 → 4.3 → 4.4 → 4.2 → (4.6/4.7)
**Tahmin (T‑shirt):** L–XL boyutlu epikler; 2–4 haftalık iterasyonlarla.

---

## 5) Yönetişim & Kabul — Checklist’ler

### 5.1 Müşteri Tarafı Hazırlık

* [ ] Veri setleri pseudonym + sözlükle uyumlu
* [ ] RBAC matris onayı
* [ ] Marka token’ları (renk, font), logo dosyaları
* [ ] Pilot katılımcı listesi ve iletişim kanalı

### 5.2 Bizim Teslimat Kabulü

* [ ] ETL & Dizin raporları (pilot)
* [ ] Akış tanımları + Prompt Kitaplığı v1
* [ ] Guardrails & reddetme şablonları
* [ ] Telemetri & metrik panosu
* [ ] Compose/.env ve Runbook v1

---

## 6) İzleme & Sürekli İyileştirme

* **Aylık Gözden Geçirme:** metrikler, maliyet, kalite, öğretmen geri bildirimi.
* **Prompt Changelog:** her değişiklik hipotez & etki ile kayıt altına alınır.
* **Risk Revizyonu:** en az ayda bir risk tablosu güncellenir; yeni riskler eklenir.

> **Not:** Tüm başlıklar, Faz 0–4 dokümanlarıyla **uyumlu sürüm etiketi** (v1.x) ile yayımlanır; Karar Logu’nda izlenir.

---

## 2.a) Risk Sahipleri (İsimlendirme)

Aşağıdaki atamalar varsayılan başlangıç dağılımıdır; ihtiyaç halinde güncellenebilir.

| Risk ID | Risk                           | Sahip (Owner)   | Rol                             |
| ------- | ------------------------------ | --------------- | ------------------------------- |
| R1      | Veri gecikmesi                 | **Orhan Güzel** | PO / Proje Yöneticisi           |
| R2      | Model maliyetleri              | **Rami**        | Backend & LLM Maliyet/Kapasite  |
| R3      | Kapsam genişlemesi             | **Orhan Güzel** | PO (Kapsam Yönetimi)            |
| R4      | Uyum/KVKK ihlali               | **Radoslawa**   | Uyum & i18n Koordinasyonu       |
| R5      | Hallucination/yanıltıcı içerik | **Norman**      | Prompting & İçerik QA           |
| R6      | İndeks performansı             | **Rami**        | Backend / Arama & Performans    |
| R7      | Vendor lock‑in                 | **Orhan Güzel** | Mimari & Strateji               |
| R8      | Embed güvenliği                | **Norman**      | Frontend Güvenlik & Entegrasyon |

> Not: İsimler örnek olarak eklenmiştir; kurumsal unvanlar/rollerle değiştirilebilir.

---

## 4.a) P1 Epikleri — Sprint Tahminleri (2 hafta/sprint)

Öncelik: **4.1 → 4.5 → 4.3 → 4.4 → 4.2 → (4.6/4.7)**

| Epik                                        | Sprint Tahmini | Ana Bağımlılıklar                           | Not                                            |
| ------------------------------------------- | -------------: | ------------------------------------------- | ---------------------------------------------- |
| 4.1 Gelişmiş kişiselleştirme                |   **3 sprint** | Telemetri v2, Context sinyalleri, mini‑quiz | Aşamalı açılış önerilir (pilot cohort)         |
| 4.5 Analitik panosu                         |   **2 sprint** | Telemetri şeması, event akışı               | İlk sürüm: cohort + funnel                     |
| 4.3 Sınav üretimi & zorluk kalibrasyonu     |   **3 sprint** | Soru şablonları, IRT sinyalleri             | Öğretmen onay döngüsü gerekli                  |
| 4.4 Çok dilli içerik & çeviri kalite izleme |   **2 sprint** | Terminoloji sözlüğü, TM/TMS entegrasyonu    | LQA hafif metrik (BLEU/LQA‑lite)               |
| 4.2 Kurumsal SSO/SAML                       |   **2 sprint** | IdP metadata, domain doğrulama              | İlk IdP için 2; ek IdP +1 sprint               |
| 4.6 İçerik Yazar Modu                       |   **2 sprint** | RBAC genişlemesi, sürümleme                 | P0: taslak→yayın akışı                         |
| 4.7 LMS entegrasyonları                     |   **2 sprint** | API anahtarları, ders eşlemesi              | Öneri: Moodle + 1 platform; her ek platform +1 |

> Tahminler başlangıçtır; sprint 0 sonunda yeniden kalibre edilir.

---

## Ek: Aydınlatma Metni (KVKK/GDPR) — **Kısa Taslak**

**Bu metin örnek amaçlıdır; hukuki danışmanlık yerine geçmez.** Kurumsal bilgiler eklenerek gözden geçirilmelidir.

**1) Veri Sorumlusu**
**{Kurum/Okul Adı}**, {adres/ülke (ops.)}. İletişim: **{e‑posta/telefon}**.

**2) Amaçlar**
Öğrenciye kişiselleştirilmiş öğrenme desteği sağlamak; performans analizi ve öneriler üretmek; sistem güvenliği, ölçümleme ve geliştirme yapmak.

**3) İşlenen Veri Kategorileri**
Profil (sınıf/seviye, dil tercihi), eğitim performansı ve öğretmen notları (pseudonym), kullanım/telemetri verileri, **e‑posta** (magic link için). **Hassas veri işlenmez**; gerekmedikçe toplanmaz.

**4) Hukuki Dayanak**
Sözleşmenin ifası/öncesi adımlar, meşru menfaat (ürün güvenliği ve iyileştirme), açık rıza (opsiyonel – iletişim/anket vb.).

**5) Saklama Süreleri**
Pilot verileri **{6–12 ay}**; telemetri ham log **7–14 gün**; sonrasında **anonimleştirme/silme** politikası uygulanır.

**6) Aktarımlar & Paylaşım**
Hizmet sağlayıcılarla (barındırma, e‑posta, analitik) **sözleşme kapsamında sınırlı** paylaşım. Veri yerleşimi **EU/EES** öncelikli; yurt dışına aktarımda uygun güvenceler sağlanır.

**7) İlgili Kişi Hakları**
Erişim, düzeltme, silme, kısıtlama, itiraz, taşınabilirlik hakları; talepler **{DPO/e‑posta}** üzerinden alınır. Şikâyet hakkı: {KVKK Kurumu/ülke otoritesi}.

**8) Çerezler**
Zorunlu çerezler kullanılabilir; tercih/analitik çerezler için açık rıza mekanizması sunulur.

**9) İletişim**
Veri Koruma İrtibatı: **{İsim/DPO} – {e‑posta}**.

**10) Yürürlük**
Bu aydınlatma **{tarih}** itibarıyla geçerlidir; güncellemeler platform üzerinde yayımlanır.
