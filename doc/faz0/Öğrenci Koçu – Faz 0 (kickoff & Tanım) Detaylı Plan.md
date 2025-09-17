# Faz 0 — Kickoff & Tanım (Gün 1–2) · Detaylı Plan

Bu doküman, **Öğrenci Koçu (LearnCompass)** projesinin MVP yol haritasındaki **Faz 0** adımını alt başlıklara bölerek yapılacak işleri, dikkat edilmesi gereken hususları ve somut çıktıları tanımlar. Kod yazımı içermez; karar, hazırlık ve dokümantasyon odaklıdır.

---

## 0. Hızlı Özet (2 günde hedeflenenler)

* Proje kapsamının netleştirilmesi (P0 hedefleri ve başarı metrikleri)
* Paydaş, karar mekanizması ve iletişim ritminin kurulması
* **Veri Sözleşmesi v1**: örnek veri formatları ve minimum alanlar
* **Güvenlik/GDPR–KVKK** asgari gereksinimlerinin belirlenmesi
* **Teknik Tercihler Taslağı**: LLM, vektör arama, barındırma, çoklu-kullanıcı/tenant stratejisi
* **Teslimat Planı & Risk Kaydı**: riskler, etki/olasılık, önlemler

> **Çıktılar:** PRD Lite, Veri Sözleşmesi v1, Risk Kaydı, Metrik Tanımları, Karar & İletişim Politikası taslağı.

---

## 1) Hedefler ve Başarı Metrikleri (P0)

### 1.1 İş Hedefleri

* **H1:** Öğrenciye kişiselleştirilmiş çalışma planı üretimi (P0 akışlarının temeli)
* **H2:** Öğretmen geri bildirimini toplayıp akışları iyileştirme
* **H3:** MVP’de düşük entegrasyon maliyeti ve hızlı kurulum

### 1.2 P0 Başarı Metrikleri (operasyonel tanımlarla)

* **Plan Görüntüleme Oranı (PGR):**

  * **Tanım:** İlk oturumda plan sayfasını gören benzersiz öğrenci / toplam benzersiz öğrenci
  * **Formül:** `unique_students_view_plan / unique_students_signed_in`
  * **Hedef (pilot):** ≥ %60
* **Plan Kabul Oranı (PKO):**

  * **Tanım:** Önerilen planı kabul eden öğrenci / planı görüntüleyen öğrenci
  * **Formül:** `unique_students_accept_plan / unique_students_view_plan`
  * **Hedef (pilot):** ≥ %30
* **Öğretmen Fayda Puanı (OFP):**

  * **Tanım:** “Faydalı/uygun” değerlendirmesi (1–5 Likert) ortalaması
  * **Ölçüm:** Haftalık mini anket + panel içi tek tık feedback
  * **Hedef (pilot):** ≥ 3.5/5 (≈ %70 olumlu)
* **Hata/yanıltıcı içerik oranı (HYİ):**

  * **Tanım:** İçerik hatası bildirimi / toplam üretim
  * **Hedef:** ≤ %3 (pilot dönemde)

### 1.3 Telemetri & Event Sözlüğü (v0)

* **Oturum Başlatıldı** `{student_id, school_id, locale, ua}`
* **Plan Görüntülendi** `{plan_id, student_id, source: {suggested-by: ai|teacher}}`
* **Plan Kabul/Red** `{plan_id, action: accept|reject, reason?}`
* **Soru Oluşturuldu** `{topic_id, difficulty, tokens_in/out, time_ms}`
* **Hata Raporlandı** `{content_id?, type: factual|tone|policy, note}`

> **Dikkat:** Event anahtarları PII içermemeli; `student_id` gibi kimlikler **pseudonym** (haritalama tablosu) ile yönetilmelidir.

**Çıktı:** *Metrik Tanımları v1* (tanım, formül, hedef, veri kaynağı, örnek dashboard taslağı)

---

## 2) Paydaşlar, Kararlar, İletişim Ritmi

### 2.1 Paydaş Haritası & Roller

* **Ürün Sahibi (PO):** İş öncelikleri, kabul kriterleri
* **Teknik Sorumlu:** Mimari, güvenlik, devops planı
* **Akış Tasarım/Prompt Sahibi:** İçerik doğruluğu ve guardrails
* **Öğretmen Temsilcisi:** Akademik kalite kontrol
* **Gizlilik/Uyum Temsilcisi:** GDPR–KVKK sorumlulukları

### 2.2 RACI (örnek)

* **Metrikler:** R: Teknik Sorumlu, A: PO, C: Öğretmen, I: Tüm ekip
* **Veri Sözleşmesi:** R: Teknik + Öğretmen, A: PO, C: Uyum, I: Tüm ekip
* **Güvenlik Politikası:** R: Teknik, A: Uyum, C: PO, I: Tüm ekip

### 2.3 Karar Mekanizması & İletişim

* **Haftalık 60 dk ritim** (gündem: metrikler, riskler, engeller)
* **Tek karar noktası:** PO (zaman/fayda dengesi)
* **Karar Logu:** Tarih, konu, alternatifler, gerekçe, etkiler, sorumlu
* **Hızlı kanal:** Slack/Discord; kritikler için 24 saat SLA

**Çıktı:** *Yönetişim & İletişim Politikası* + *Karar Logu Şablonu*

---

## 3) Veri Sözleşmesi (v1)

### 3.1 Kapsam & Kaynaklar

* **Transkriptler** (not kırılımları, konu/ünite eşlemesi)
* **Öğretmen Notları** (metin/etiketler: güçlü/zayıf konular, öneriler)
* **Sınav/Ödev Özetleri** (puan, tarih, beceri/kazanım eşleşmesi)

### 3.2 Minimum Şema (alanlar & tipler – örnek)

* **Öğrenci:** `student_key (pseudo)`, sınıf/seviye, hedefler, dil tercihi
* **Ders → Konu → Alt konu**: benzersiz kodlar, ünite/hafta etiketi
* **Performans Kaydı:** `student_key`, `topic_code`, skor(0–100), tarih(ISO)
* **Öğretmen Notu:** `student_key`, `topic_code`, not (metin), zorluk(1–5)

> **Not:** `student_key` kişisel kimlik (PII) ile **ayrı** bir eşleme tablosunda tutulur (salt okunur hizmetler görmez).

### 3.3 Dosya Formatları & Aktarım

* Kabul edilen biçimler: **CSV, JSON, XLSX**
* Kodlama: **UTF-8**; tarih: **ISO-8601**; dil kodu: **BCP-47** (`tr`, `de`, `en`)
* Boyut sınırları ve parçalı yükleme (ör. 10–50 MB dilimleri)

### 3.4 Kalite Kuralları & Validasyon

* Zorunlu alanlar boş değil
* Kod listeleri (topic\_code vb.) **sözlük** ile doğrulanır
* Tarihler geçerli aralıkta
* Kişisel yorumlarda PII kaçak kontrolü (regex + manuel göz)

**Çıktı:** *Veri Sözleşmesi v1* (alan sözlüğü, örnek veri dosyaları, validasyon checklist’i, red–hata kodları)

---

## 4) Güvenlik & GDPR–KVKK

### 4.1 PII Envanteri & Azaltma

* PII listesi: ad-soyad, okul e-postası, numara, doğum tarihi (varsa)
* **Minimizasyon:** MVP’de zorunlu olmayan PII toplanmaz
* **Mask/Pseudonym:** Sistem içi işlemlerde yalnızca `student_key` kullanılır

### 4.2 Erişim Politikaları

* **RBAC (admin/öğretmen/öğrenci)**
* En az ayrıcalık; sadece “görmesi gerekeni gör”
* Yetki değişikliklerinin audit log’u (kim, ne zaman, neyi)

### 4.3 Veri Akışı & Saklama

* **AB/EU bölgesi** barındırma tercihi (veri yerleşimi)
* Transit ve beklemede şifreleme (TLS, disk şifreleme)
* Yedekleme & geri dönüş test periyodu (örn. haftalık)
* Silme/anonimleştirme politikası (talep üzerine, SLA)

### 4.4 Hukuki Dayanak & Haklar

* İşleme dayanağı (rıza/kontrat/meşru menfaat – MVP’ye uygun olanı seç)
* **Aydınlatma metni** ve **KVKK/GDPR bilgilendirme**
* Erişim/düzeltme/silme taşıma haklarının akışı (istek yönetimi)

### 4.5 Olay Yönetimi & DPIA

* İhlal bildirim planı ve iletişim şablonu
* Etki/olasılık matrisi; DPIA gerekip gerekmediğinin değerlendirmesi

**Çıktı:** *Gizlilik & Güvenlik Notları v1*, *Erişim Politikası Özeti*, *Aydınlatma Taslağı*

---

## 5) Teknik Tercihler Taslağı

### 5.1 LLM Stratejisi (karar kriterleri)

* **Kalite:** konu-özetleme, açıklamalı çözüm üretimi doğruluğu
* **Maliyet:** token başı maliyet ve önbellekleme (cache) imkânı
* **Gecikme:** hedef < 3–5 sn yanıt (MVP)
* **Uyum:** eğitim içeriği ve güvenli yanıt guardrails

> Karar Notu: İlk pilotta **barındırılan (hosted) LLM** + **prompt guardrails**; ileride yerel model A/B.

### 5.2 Arama & Vektör Dizini

* **Seçenek A:** MongoDB **Atlas Vector Search** (mevcut ekosistemle uyum)
* **Seçenek B:** **Qdrant** (özel yetenekler, ayrı ölçek)
* **Hibrit Arama:** BM25 + vektör (bağlam isabeti ↑)

### 5.3 Çoklu Kullanıcı/İzolasyon

* MVP’de **tek DB, tenant alanı ile satır bazlı izolasyon** (öğrenci=tenant değil). Pseudonym `student_key`.
* Yetki ve kapsam filtreleri (school\_id/class\_id → sorgu ön koşulu)

### 5.4 Barındırma & DevOps

* **Ortamlar:** dev / pilot
* **Günlükleme:** request id, event id, hata türleri
* **Sırlar:** .env yönetimi, rota bazlı erişim anahtarları

**Çıktı:** *Teknik Tercihler Notu v1* (seçenekler, artı/eksi, öneri)

---

## 6) Teslimat Planı & Risk/Önlem Tablosu

### 6.1 Zamanlama (Gün 1–2 atölye akışı)

* **Gün 1 – AM:** Kickoff + hedef & metrik atölyesi
* **Gün 1 – PM:** Veri Sözleşmesi atölyesi (örnek dosyalarla)
* **Gün 2 – AM:** Güvenlik & uyum mini-DPIA
* **Gün 2 – PM:** Teknik tercihler + yol haritası onayı

### 6.2 Risk Kaydı (örnek girdiler)

| Risk           | Olasılık | Etki   | Önlem                  | Trigger               | Plan B                  |
| -------------- | -------- | ------ | ---------------------- | --------------------- | ----------------------- |
| Veri gecikmesi | Orta     | Yüksek | Sahte veri setleri     | D1 sonunda veri yok   | Akışları dummy ile kur  |
| Model maliyeti | Düşük    | Orta   | Önbellek + sınır       | Günlük maliyet > X    | Daha ucuz model A/B     |
| Uyum riski     | Düşük    | Yüksek | Minimizasyon + denetim | PII sızıntısı şüphesi | Erişimi kes, olay planı |
| Scope creep    | Orta     | Orta   | P0/P1 ayrımı           | Yeni istek listesi    | CR süreci               |

**Çıktı:** *Risk Kaydı v1* (matris + aksiyon sahipleri)

---

## 7) Kabul Kriterleri (Definition of Done)

* **PRD Lite** yayınlandı ve PO onayı alındı
* **Metrik Tanımları** formül + örnek olay ile doğrulandı
* **Veri Sözleşmesi v1**: en az 1 örnek dosya ile sağlama yapıldı
* **Gizlilik & Güvenlik Notları** paylaşıldı, kritik açık yok
* **Teknik Tercihler Notu v1** üzerinde mutabakat var
* **Risk Kaydı v1** oluşturuldu, sahipler atandı

---

## 8) Şablonlar (ekler)

### 8.1 PRD Lite (başlıklar)

1. Amaç & Kapsam (MVP-P0)
2. Hedef Kullanıcılar & Use-case’ler (öğrenci/öğretmen)
3. P0 Akışları (özet plan, konu özeti, örnek soru, yanlış analizi)
4. Başarı Metrikleri (tanım, formül, hedef)
5. Varsayımlar & Kısıtlar
6. Veri Gereksinimleri (kaynak, kalite, frekans)
7. Güvenlik & Uyum Özeti
8. Teknik Mimari Taslak (yüksek seviye)
9. Riskler & Bağımlılıklar
10. Yol Haritası & Kilometre Taşları

### 8.2 Veri Sözleşmesi – Alan Sözlüğü (örnek satırlar)

* `student_key` *(string, zorunlu)*: Pseudonym kimlik
* `school_id` *(string, zorunlu)*: Kurum/okul kimliği
* `topic_code` *(string, zorunlu)*: Müfredat sözlüğündeki benzersiz kod
* `score` *(number, 0–100)*: Değerlendirme skoru
* `note` *(string, opsiyonel)*: Öğretmen notu
* `lang` *(string, BCP-47)*: `tr|de|en`
* `ts` *(string, ISO-8601)*: Zaman damgası

### 8.3 Karar Logu (örnek kayıt)

* **Konu:** Vektör arama seçimi
* **Seçenekler:** Atlas VS, Qdrant
* **Karar:** Atlas (MVP)
* **Gerekçe:** Operasyon basitliği, mevcut yığınla uyum
* **Etkiler:** Maliyet/bağımlılık, geçiş yolu korunacak
* **Sorumlu/Tarih:** PO / 2025-09-16

---

## 9) Yapılacaklar Checklist (Faz 0)

* [ ] Kickoff toplantısı yapıldı, notlar paylaşıldı
* [ ] Metrik tanımları netleşti ve kabul edildi
* [ ] Veri Sözleşmesi v1 hazır, örnek dosya ile doğrulandı
* [ ] Gizlilik & Güvenlik notları paylaşıldı (RBAC, PII, silme politikası)
* [ ] Teknik Tercihler Notu v1 üzerinde mutabakat
* [ ] Risk Kaydı v1 oluşturuldu ve sahipler atandı
* [ ] Ritim & karar mekanizması dokümante edildi (SLA’ler dahil)

---

## 10) Açık Sorular (karar bekleyenler)

1. MVP’de **hangi ders/kaynak** ile pilot yapılacak? (örn. Matematik – 8. sınıf)
2. Öğretmen geri bildirim kanalı: panel içi mi, harici form mu?
3. Hangi LLM tedarikçisiyle başlanacak? (maliyet/kalite dengesi)
4. Vektör dizin ilk yüklemeleri: kaç içerik ve hangi diller?
5. Veri yerleşimi (EU bölgesi) ve barındırma tercihi (VPS vs. managed)

> Bu sorular Gün 1–2 sonunda **Karar Logu**na işlenmelidir.
