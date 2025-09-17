# Faz 1 — ETL & Dizine Alma (Hafta 1) · Detaylı Plan

Bu doküman, **Öğrenci Koçu (LearnCompass)** projesinin MVP yol haritasındaki **Faz 1** adımını alt başlıklara bölerek yapılacak işleri, dikkat edilmesi gereken hususları ve somut çıktıları tanımlar. Kod yazımı içermez; karar, süreç ve dokümantasyon odaklıdır.

---

## 0) Hafta 1 Hızlı Özet (Hedeflenenler)

* Kaynak veri setlerinin tanımlanması ve **ETL şablonlarının** kesinleşmesi
* Parçalama (**chunking**) stratejisinin kararlaştırılması ve örneklerle test edilmesi
* **Hibrit arama** (BM25 + vektör) planının netleşmesi ve pilot dizinleme
* **5–10 örnek içerik** ile dizin kalitesi denemesi ve **Veri Kalitesi Kontrol Listesi**nin işletilmesi

> **Çıktılar:** ETL Şablonları, Dizine Alma Raporu v1, Veri Kalitesi Kontrol Listesi v1.

---

## 1) Kaynaklar & Kapsam

### 1.1 Veri Kaynakları (MVP)

* **Transkriptler:** Ders-öğrenci not kırılımları, tarih/sınav türü eşleşmeleri
* **Öğretmen Notları:** Metinsel yorumlar, zayıf/güçlü konu etiketleri, öneriler
* **Sınav/Ödev Özetleri:** Puanlar, tarihler, kazanım/konu eşlemeleri
* **Müfredat Sözlüğü:** Ders → konu → alt konu → ünite/hafta kodları (referans sözlük)

### 1.2 Dosya Biçimleri & Klasör Düzeni

* **Desteklenen biçimler:** CSV, JSON, XLSX (metin alanları UTF-8)
* **Adlandırma:** `YYYYMMDD_source_docType_lang.ext` (örn. `20250916_schoolA_transcripts_tr.csv`)
* **Klasörler:** `/incoming`, `/processed`, `/rejected`, `/samples`
* **Boyut:** Parçalı yükleme tercih edilir (10–50 MB dilimleri)

**Dikkat:** Dosya adları ve iç metadata **birbiriyle tutarlı** olmalı (tarih, dil, kaynak kimliği).

---

## 2) Kanonik Şema & Alan Sözlüğü (ETL Şablonları)

### 2.1 Öğrenci Profili (referans; PII’siz kullanım)

* `student_key` *(string, zorunlu)* — pseudonym kimlik (PII eşleme ayrı tabloda)
* `grade_level` *(string/int, zorunlu)* — sınıf/seviye (örn. 8)
* `goals` *(string, opsiyonel)* — hedefler/kısa not
* `lang` *(BCP-47, opsiyonel)* — `tr|de|en`

### 2.2 Performans Kaydı

* `student_key` *(string, zorunlu)*
* `course_code` *(string, zorunlu)* — ders kodu (örn. MATH8)
* `topic_code` *(string, zorunlu)* — konu/alt konu kodu
* `score` *(0–100, zorunlu)*
* `assessment_type` *(enum)* — quiz|exam|assignment|project
* `date` *(ISO-8601, zorunlu)*

### 2.3 Öğretmen Notu

* `student_key` *(string, zorunlu)*
* `topic_code` *(string, opsiyonel)*
* `note` *(string, zorunlu)* — metin yorum
* `difficulty` *(1–5, opsiyonel)*
* `created_at` *(ISO-8601)*

### 2.4 Müfredat Sözlüğü (lookup)

* `course_code` *(string, zorunlu)*
* `topic_code` *(string, zorunlu, benzersiz)*
* `topic_path` *(string, zorunlu)* — `ders>konu>alt_konu`
* `unit_or_week` *(string, opsiyonel)* — ünite/hafta etiketi
* `reading_level` *(string, opsiyonel)*

**Not:** Tüm ETL şablonlarında tarih **ISO-8601**, dil **BCP-47**, sayısal alanlar **`.`** ondalıkla.

---

## 3) ETL Süreç Adımları (End-to-end)

### 3.1 Extract (Alım)

* Kaynaktan dosyaların alınması (manuel/otomatik)
* Dosya bütünlüğü: **checksum** (örn. SHA-256) üretimi ve kaydı
* Dosya başına **manifest** kaydı: kaynak, tür, satır sayısı, boyut, checksum

### 3.2 Validate (Doğrulama)

* Şema uygunluğu: zorunlu alanlar, tür denetimi
* Sözlük eşlemesi: `course_code`, `topic_code` doğrulama
* Tarih aralık kontrolü ve **dil kodu** doğruluğu
* PII kaçak taraması (regex + anahtar kelime listeleri) → şüpheliler **/rejected**

### 3.3 Transform (Dönüşüm)

* Alan standartlaştırma (örn. notlar %0–100 aralığına ölçekleme)
* Metin temizliği (HTML/RTF temizleme, tek boşluk)
* `student_key` dışında kimliklerin **maskelenmesi**
* Zorunlu alanlar eksikse: satır işaretlenir, **hata kodu** atanır

### 3.4 Enrich (Zenginleştirme)

* `topic_path` ve `unit_or_week` sözlükten doldurma
* `reading_level` veya `difficulty` heuristikleri (varsa)
* Dil tespiti (otomatik) ve `lang` onayı

### 3.5 Chunking (Parçalama)

* **Hedef token uzunluğu:** 200–300 token/chunk
* **Örtüşme (overlap):** 10–15% (bağlam akışı için)
* **Sınırlar:** başlık/alt başlık, paragraf bitişleri
* **Filtre:** 30 token altı kısa parçaları bir önceki parça ile birleştir

### 3.6 Metadata Ekleme (Her chunk için)

* `source_id`, `doc_type` (transcript|teacher\_note|assessment|curriculum)
* `course_code`, `topic_code`, `unit_or_week`
* `lang`, `reading_level?`, `privacy_level` (public|internal|restricted)
* `version`, `checksum`, `ingested_at`, `embeddings_version`

### 3.7 Load (Yükleme)

* **BM25 deposu** (metin + metadata)
* **Vektör dizini** (embedding + aynı metadata)
* Başarılı/başarısız kayıt sayıları, hata türleri → **ETL log**

**Çıktı:** *ETL Süreç Tanımı v1* + *Manifest & Hata Kodu Sözlüğü*

---

## 4) Chunking Stratejisi (Detay)

* **Belge türüne göre kural setleri:**

  * *Transkript:* tablo satırı odaklı; öğrenci/konu bazında kısa özet chunk’ları
  * *Öğretmen notu:* paragraf sınırları ve noktalama işaretleriyle böl
  * *Müfredat:* başlık hiyerarşisi → her alt konu bir chunk
* **Normalize:** başlık seviyelerini (`H1>H2>...`) metadata’ya yaz
* **Dil-özel kurallar:** Türkçe birleşik kelime/eklemeler için min chunk uzunluğu ayarı

**Kalite ipucu:** Chunk başına **özlü özet** (1–2 cümle) üretip `summary` metadata’sına koymak, sonuçların açıklanabilirliğini artırır (MVP’de opsiyonel).

---

## 5) Hibrit Arama Planı (BM25 + Vektör)

### 5.1 BM25 (Sözcüksel) Katman

* Yüksek geri çağırım (recall) için ilk tarama (top **K1=100**)
* **Synonym/lemma** sözlükleri (müfredat terimleri, kısaltmalar)

### 5.2 Vektör (Anlamsal) Katman

* K1 sonuçlarının embedding’leri ile **yeniden sıralama** (re-rank, top **K2=20**)
* Çok dilli içerik için ortak embedding uzayı

### 5.3 Skor Birleşimi

* **Formül (örnek):** `score = α·norm(bm25) + (1-α)·norm(cosine)`
* **Başlangıç α:** 0.5 (pilot sırasında A/B ile ayarlanır)

### 5.4 Değerlendirme

* **Altın sorgu listesi** (10–20 arama)
* Ölçütler: nDCG\@10, Recall\@50, Ortalama sıralama pozisyonu

**Çıktı:** *Hibrit Arama Taslağı v1* (parametreler, sözlükler, değerlendirme seti)

---

## 6) Vektör Dizin Seçenekleri (Atlas vs Qdrant) — Karar Notu

| Kriter      | Atlas Vector Search            | Qdrant                                       |
| ----------- | ------------------------------ | -------------------------------------------- |
| Entegrasyon | Mongo ekosistemi ile doğal     | Bağımsız; dil/SDK çeşitliliği                |
| Operasyon   | Yönetimli indeks, bakım kolay  | İnşa & yönetim esnek ama ek DevOps           |
| Özellik     | Hybrid (search index + vector) | Hızlı, segment/collections; payload filtresi |
| Maliyet     | Küme/indeks boyutuna bağlı     | Sunucu maliyeti kontrolü yüksek              |

> **Öneri (MVP):** Atlas ile başla (basitlik), Qdrant’a **göç planı** hazırlıklı tut.

**Çıktı:** *Teknik Tercihler (Arama) Notu v1* (artı/eksi, seçilen yol, rollback/göç planı)

---

## 7) Veri Kalitesi Kontrol Listesi (v1)

### 7.1 Boylamsal & Alan Düzeyi

* **Tamlık:** Zorunlu alan boş değil
* **Tutarlılık:** Kodlar sözlükle uyumlu
* **Geçerlilik:** Tarihler, aralıklar, sayısal sınırlar doğru
* **Benzersizlik:** `topic_code` + `course_code` kısıtları
* **Zamanlılık:** Veri güncelliği (örn. son 12 ay)

### 7.2 Metin & İçerik Kalitesi

* Gürültü/HTML kırpılmış
* Dil **BCP-47** ile uyumlu ve algılanan dille çelişmiyor
* Chunk başına anlamlı uzunluk (≥200 token hedefi ±)

### 7.3 Gizlilik & Uyum

* PII sızıntısı **yok** (otomatik + manuel örneklem)
* Erişim etiketleri (`privacy_level`) doğru atanmış

**Çıktı:** *Veri Kalitesi Kontrol Listesi v1* (işletme talimatı + örnek rapor)

---

## 8) Loglama, İzlenebilirlik ve Hata Yönetimi

### 8.1 ETL Log Kayıtları

* **Seviye:** INFO/ERROR/WARN
* **İçerik:** `file_id`, `row_no`, `error_code`, `stage` (extract|validate|transform|load), `ts`

### 8.2 Hata Sözlüğü (örnek)

* `E-SCHEMA-001` — Zorunlu alan eksik
* `E-LOOKUP-002` — topic\_code eşleşmedi
* `E-PII-003` — PII şüphesi
* `E-INDEX-004` — Dizin yükleme hatası

### 8.3 İzlenebilirlik

* Her **chunk** için `source_id` + `checksum` + `ingested_at`
* Geri alma (rollback) için **/processed** anlık görüntü (snapshot) kuralları

**Çıktı:** *ETL Operasyon Notları v1* (log alanları, hata akışı, rollback adımları)

---

## 9) Pilot Dizinleme (5–10 İçerik)

### 9.1 Örneklem Dağılımı

* 2× transkript, 2× öğretmen notu, 2× sınav/ödev özeti, 1–2× müfredat sayfası
* Dil çeşitliliği: en az 2 dil (`tr` + `en` veya `de`)

### 9.2 Başarı Kriterleri (pilot)

* Altın sorgularla **nDCG\@10 ≥ 0.65** (başlangıç hedef)
* Hata/yanıltıcı içerik rapor oranı ≤ %3
* İlk yanıt gecikmesi: ≤ 3–5 sn (ortalama)

**Çıktı:** *Dizine Alma Raporu v1* (veri seti özeti, parametreler, metrikler, bulgular, öneriler)

---

## 10) Hafta 1 Takvimi (D1–D5)

* **D1 – AM:** Kaynak & şema atölyesi → ETL şablonları taslağı
* **D1 – PM:** Validasyon kuralları + hata sözlüğü
* **D2 – AM:** Chunking kuralları A/B (örnek belgelerde deneme)
* **D2 – PM:** Metadata sözlüğü & enrich kuralları
* **D3 – AM:** Hibrit arama parametreleri ve sözlükler (synonym/lemma)
* **D3 – PM:** Pilot içerik seçimi ve ingest
* **D4 – AM:** Pilot dizinleme & metrik ölçümü
* **D4 – PM:** Bulgular → ayarlamalar (α, K1/K2, chunk boyu)
* **D5 – AM:** Dökümantasyon: Dizine Alma Raporu v1 + QC listesi
* **D5 – PM:** Paydaş sunumu ve Faz 2 giriş kriterleri onayı

---

## 11) Definition of Done (Faz 1)

* **ETL Şablonları**: Alan sözlüğü + örnek dosyalar (CSV/JSON) + validasyon kuralları yayınlandı
* **Chunking & Metadata**: kural setleri ve örnek çıktı dosyaları hazır
* **Hibrit Arama**: başlangıç parametreleri ve sözlükler tanımlandı
* **Pilot Dizinleme**: 5–10 içerik indekslendi; metrikler raporlandı
* **Veri Kalitesi Kontrol Listesi**: işletildi ve bulgular raporlandı
* **Riskler & Aksiyonlar**: güncellendi, sahipler atandı

---

## 12) Riskler & Önlemler (Faz 1 odaklı)

* **Zayıf Sözlük Eşleşmesi:** Müfredat sözlüğünü erken dondur; map tablosu kullan
* **Aşırı Kısa/Uzun Chunk’lar:** Hedef token aralığına oturt, kısa chunk birleştirme kuralı uygula
* **Çok dilli Karışıklık:** Dil tespiti + `lang` zorunlu; yanlış dil algısı için manuel örneklem
* **İndeks Maliyeti/Performans:** Pilotta K1/K2, α parametrelerini optimizasyon döngüsüne al
* **PII Kaçakları:** Otomatik tarama + manuel örneklem kontrolü; şüphelide ingest durdur

---

## 13) Şablonlar (Ekler)

### 13.1 ETL Şablon Özeti (başlıklar)

1. Kaynak & sahip (owner)
2. Şema alanları (ad, tip, zorunluluk, örnek)
3. Validasyon kuralları & hata kodları
4. Dönüşüm & zenginleştirme kuralları
5. Chunking kuralları
6. Metadata sözlüğü
7. Yükleme hedefleri (BM25/vektör) ve anahtar konfig parametreleri

### 13.2 Dizine Alma Raporu (taslak bölümler)

* Veri seti özeti (adet, tür dağılımı, diller)
* Hibrit arama parametreleri (K1/K2, α, synonyms)
* Ölçüm sonuçları (nDCG\@10, Recall\@50, latency)
* Hata analizi & örnek sorgular
* İyileştirme önerileri ve kararlar

### 13.3 Veri Kalitesi Kontrol Formu (örnek maddeler)

* [ ] Zorunlu alanlarda boşluk yok
* [ ] Kod/lookup uyumlu
* [ ] Tarih/sayı formatı doğru
* [ ] Chunk uzunlukları hedef aralıkta
* [ ] PII sızıntısı izine rastlanmadı

---

## 14) Rollerin Katkısı (Hafta 1)

* **Teknik Sorumlu:** ETL kuralları, chunking, indeks parametreleri
* **Öğretmen Temsilcisi:** Müfredat sözlüğü, konu öncelikleri, synonym listeleri
* **PO:** Pilot kapsam ve başarı kıstaslarının onayı
* **Uyum:** PII ve erişim etiketleri denetimi

---

## 15) Açık Sorular

1. Pilotta kaç **ders/kurs** kapsanacak? (örn. sadece Matematik 8?)
2. Çok dilli içerikte başlangıç **hedef diller** hangileri? (tr|de|en?)
3. Synonym/lemma sözlükleri kimin onayıyla dondurulacak? (öğretmen temsilcisi)
4. Vektör dizini için **Atlas** ile mi başlanacak; Qdrant’a geçiş şartı ne olacak?

> Bu soruların cevapları **D1–D3** aralığında karar loguna işlenmelidir.
