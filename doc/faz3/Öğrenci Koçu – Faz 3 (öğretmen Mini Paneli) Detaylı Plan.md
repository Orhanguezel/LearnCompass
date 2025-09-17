# Faz 3 — Öğretmen Mini Paneli (Hafta 3) · Detaylı Plan

Bu doküman, **Öğrenci Koçu (LearnCompass)** MVP yol haritasındaki **Faz 3** adımını ayrıntılandırır. Kod içermez; akış tasarımı, veri sözleşmeleri, yetkilendirme ve whitelabel UI ilkeleri üzerine odaklanır.

---

## 0) Hafta 3 Hızlı Özet (Hedeflenenler)

* Öğretmen odaklı **mini panel**: öğrenci durumu, zayıf konular, önerilen ödevler
* Basit **RBAC** (admin/öğretmen/öğrenci) ve **e‑posta magic link** oturum açma akışı
* **Whitelabel tema** (logo/renk/typography token’ları) ve mevcut portale **embed/deep‑link** stratejisi

> **Çıktılar:** Öğretmen Paneli Taslak Akışları, Whitelabel UI Kılavuzu, Giriş (Auth) Politikası.

---

## 1) Hedefler & Kapsam (P0)

* **G1:** Öğretmenlerin, pilot dersteki öğrencilerin **durumunu ve zayıf konularını** tek yerden görmesi
* **G2:** Sistem önerilerine göre **ödev/çalışma planı** atayabilmesi
* **G3:** Basit ve güvenli **magic link** giriş ile friksiyonsuz erişim
* **G4:** Mevcut okula ait portale **görsel uyum** (whitelabel) ve kolay yerleştirme (embed/deep‑link)

**Kapsam Dışı (P1+):** Tam not defteri, zengin ödev gönderim değerlendirme ekranları, SSO/SAML, offline kullanım.

---

## 2) Personalar & Roller

* **Öğretmen (primary):** 20–150 öğrenci yönetir; hızlı özet, riskli öğrenciler, tek tık atama ister.
* **Okul Admin (secondary):** Kullanıcı ekleme/davet, marka ayarları, erişim.
* **Öğrenci (viewer/light):** Kendi planı ve öğretmen atamalarına bakar (bu fazda sınırlı).

**RBAC P0:**

* **admin:** kullanıcı daveti, marka ayarları görüntüle/güncelle, tüm öğrenci/görünümler
* **teacher:** kendi sınıf/kapsamındaki öğrenciler, atama oluşturma
* **student:** yalnızca kendi planını görüntüleme (panel dışı akışla hizalı)

---

## 3) Bilgi Mimarisi (IA) & Navigasyon

1. **Dashboard** (özet):

   * Bugünün aksiyonları (X öğrenci kritik, Y öğrenci planı reddetti)
   * Zayıf konu ısı haritası (kurs → konu)
   * Son atamalar ve durumları
2. **Öğrenciler Listesi**:

   * Filtre: sınıf/seviye, son aktivite, risk skoru, dil
   * Sütunlar: öğrenci adı\*, risk skoru, son plan tarihi, zayıf konu sayısı (\*adı pseudonym veya masked)
3. **Öğrenci Profili**:

   * Son performans grafiği, zayıf/kuvvetli konular, plan geçmişi
   * **Ödev/Plan Ata** (modal/panel)
4. **Zayıf Konular** (Konu görünümü):

   * Konu → öğrenci listesi (en çok zorlanan ilk 10 konu)
   * Önerilen içerik/ödev setleri
5. **Atamalar**:

   * Taslak/aktif/tamamlandı listeleri
   * Hızlı durum güncelleme (tamamlandı, iptal)
6. **Ayarlar (admin):** Marka/tema, kullanıcı daveti, erişim alanları

---

## 4) Panel Akışları (P0)

### 4.1 Dashboard Özet Akışı

* Giriş → tenant/school kapsamı → son 7/30 gün metrikleri → kritik öğrenciler listesi
* Aksiyon kısayolları: "Atama Oluştur", "Zayıf Konu İncele"

### 4.2 Öğrenci Durumu İnceleme

* Öğrenci arama/filtre → profil → performans sparkline, son plan, hatalı/yanıltıcı uyarı raporları
* **Atama Oluştur**: konu seç, hedef tarih, kaynak paket (öneri listesi), öğrenci(ler)

### 4.3 Zayıf Konular İçgörüleri

* Kurs/kategori → en sorunlu 10 konu → öğrenci alt listeleri
* Konu başına önerilen ödev şablonları (P0: sistem önerisi + öğretmen seçimi)

### 4.4 Atama Yönetimi

* Taslak → yayınla → not/yorum ekle → durum takibi (görüldü/başlandı/tamamlandı)
* Toplu hatırlatma (P0: panel içi bildirim; e‑posta/Push P1)

---

## 5) Veri Sözleşmeleri (API Şekilleri – örnek alanlar)

> **Not:** Kod değil; alan adları/filtreler örnek amaçlıdır. `student_id` yerine **`student_key`** (pseudonym) kullanılır; öğrenci isimleri panelde maskelenebilir.

### 5.1 Öğrencileri Listele (GET)

* **Sorgu:** `class_id?` `min_risk?` `lang?` `q?` `cursor?` `limit?`
* **Döndürülen Alanlar:** `student_key` `risk_score` `last_plan_ts` `weak_topics_count` `tags[]`

### 5.2 Öğrenci Profili (GET)

* **Gövde:** —
* **Dönüş:** `student_key` `progress[] (ts, score, topic_code)` `weak_topics[]` `accepted_plans[]` `language`

### 5.3 Zayıf Konular (GET)

* **Sorgu:** `course_code` `since` `topN`
* **Dönüş:** `topic_code` `topic_name` `affected_students_count` `avg_score`

### 5.4 Önerilen Ödevler (GET)

* **Sorgu:** `topic_code` `difficulty?` `lang?`
* **Dönüş:** `assignment_templates[] {id, title, est_time_min, resources[], rationale}`

### 5.5 Atama Oluştur (POST)

* **Gövde:** `assignee_keys[]` `topic_code` `template_id` `due_date` `notes?`
* **Dönüş:** `assignment_id` `status` `created_at`

### 5.6 Atama Durumu (PATCH)

* **Gövde:** `status` (`draft|published|cancelled|completed`) `note?`

**Filtreleme & Yetki:** Tüm uçlar `tenant_id/school_id` ve **role scope** ile otomatik filtrelenir.

---

## 6) Whitelabel UI Kılavuzu (P0)

### 6.1 Tema Token’ları

* **Renkler:** `primary`, `primary-contrast`, `surface`, `surface-variant`, `border`, `success`, `warning`, `danger`
* **Typography:** `font_family`, `heading_scale`, `body_scale`
* **Logolar:** `brand_logo_light`, `brand_logo_dark`, `favicon`
* **Bileşen Yoğunluğu:** `radius`, `shadow`, `spacing-scale`

### 6.2 Erişilebilirlik (A11y)

* Kontrast: WCAG AA (en az 4.5:1)
* Odak göstergeleri, klavye navigasyonu
* Dil anahtarı: `tr|de|en` (panel için P0: en az 2 dil)

### 6.3 Yerleşim & Bileşenler

* **Header:** logo + tenant adı + profil/çıkış
* **Sidebar:** modüller; responsive çökme (collapsible)
* **Kartlar/Tablolar:** yoğun veri için tablo; hızlı aksiyon butonları

**Çıktı:** *Whitelabel UI Kılavuzu v1* (token listesi + görsel referanslar + yerleştirme örnekleri)

---

## 7) Giriş Politikası — E‑posta Magic Link

### 7.1 Akış

1. Kullanıcı e‑posta girer
2. **Tek kullanımlık**, **kısa ömürlü** (örn. 15 dk) imzalı link oluşturulur
3. E‑posta ile gönderilir; tıklandığında oturum kurulur (nonce tüketilir)

### 7.2 Güvenlik Kuralları

* Link **tek tık / tek cihaz**, **TTL ≤ 15 dk**
* **İmzalı token** (HMAC/ed25519), scope: `role`, `tenant_id`, `email`, `nonce`, `exp`
* IP/device parmak izi eşleştirme (P0: hafif), anomali tespiti → ikinci doğrulama
* Hız sınırlama: istek başına ve hesap başına rate‑limit
* Audit log: kim, ne zaman, hangi IP / user‑agent

### 7.3 E‑posta İçeriği (taslak)

* Başlık: "Giriş bağlantınız (15 dk geçerli)"
* Gövde: marka logo, tek tık buton, alternatif URL, destek iletişimi

**Çıktı:** *Giriş Politikası v1* (magic link kuralları, TTL, audit, rate‑limit, e‑posta şablonu)

---

## 8) Embed / Deep‑link Stratejisi

### 8.1 Embed (iFrame)

* **Kullanım:** Mevcut okul portalında paneli gömmek
* **İzinli kökenler (CSP):** allow‑list ile sınırla
* **postMessage API:** oturum durumları ve navigasyon komutları (ileri faz)

### 8.2 Deep‑link

* **Kullanım:** Portal menüsünden panel alt sayfalarına bağlantı
* `state` parametreleri: `tab`, `filters`, `return_url`

### 8.3 Seçim Kriterleri

* Portal ekibinin teknik kısıtları, SEO gereksinimi (iFrame SEO‑dışı), güvenlik politikaları

**Çıktı:** *Yerleştirme Kılavuzu v1* (embed/deep‑link karar matrisi, örnek URL şemaları)

---

## 9) Telemetri & Loglama (Öğretmen Kullanımı)

### 9.1 Event Şeması

* `teacher_login` `{tenant_id, email_hash, method: magic_link}`
* `dashboard_view` `{cards, ts}`
* `student_profile_view` `{student_key, tabs}` (student\_key hashlenebilir)
* `weak_topic_view` `{topic_code, affected_count}`
* `assignment_create` `{assignee_count, topic_code, template_id}`
* `assignment_status_change` `{assignment_id, from, to}`

### 9.2 Gizlilik

* E‑posta **hash/pseudonym**; PII saklanmaz
* IP/UA sadece güvenlik & audit amaçlı, süreli saklama

**Çıktı:** *Telemetri Şeması v1* + dashboard taslakları (grafik tanımları)

---

## 10) Performans & Güvenlik (NFR)

* **Yanıt süresi:** P95 < 700 ms (panel API’leri)
* **İçerik yükü:** Lazy‑load ve sayfalama (cursor‑based)
* **Rate‑limit:** auth, assignment create
* **Veri Yerleşimi:** EU; transit ve beklemede şifreleme
* **Yetki Kontrolü:** her istekten önce scope doğrulama; multi‑tenant ayrımı

---

## 11) Definition of Done (Faz 3)

* **Akış Diyagramları & Wireframe’ler**: Dashboard, Öğrenci Listesi, Öğrenci Profili, Zayıf Konular, Atamalar
* **RBAC Matrisi**: rol → izinler (okuma/yazma/atama)
* **Giriş Politikası v1**: magic link TTL, tek kullanımlık nonce, audit, rate‑limit
* **Whitelabel UI Kılavuzu v1**: tema token’ları, logo/renk yönergeleri, a11y notları
* **Yerleştirme Kılavuzu v1**: embed/deep‑link stratejisi ve URL şemaları
* **Telemetri Şeması v1**: event alanları, örnek dashboard metrikleri

---

## 12) Riskler & Önlemler (Faz 3)

| Risk                       | Olasılık | Etki   | Önlem                                | Trigger                | Plan B                  |
| -------------------------- | -------- | ------ | ------------------------------------ | ---------------------- | ----------------------- |
| Magic link kötüye kullanım | Orta     | Yüksek | TTL≤15dk, tek tık, rate‑limit        | Şüpheli istek pikleri  | İkincil doğrulama (kod) |
| Embed güvenliği            | Orta     | Orta   | CSP allow‑list, X‑Frame‑Options      | Portal domain değişimi | Deep‑link’e geçiş       |
| Aşırı bilgi/karmaşa        | Orta     | Orta   | Minimalist UI, varsayılan filtreler  | Düşük kullanım         | Tur/yardım overlay      |
| Çok dilli metin eksikliği  | Düşük    | Orta   | i18n checklist, varsayılan İngilizce | QA’da eksik anahtarlar | Sürüm blokajı           |

---

## 13) Açık Sorular

1. Öğrenci adı **maskelenmeli mi** (sadece `student_key` + etiket)? Pilot kurum politikası?
2. **Embed mi** öncelikli, **deep‑link mi**? Portal ekibinin teknik kısıtları neler?
3. Magic link **TTL** ve **domen**: kurumsal e‑posta gerekecek mi?
4. Whitelabel’da zorunlu **tema token** seti ve logo ölçüleri (SVG/PNG) nedir?

> Bu sorular Faz 3 başında cevaplanıp **Karar Logu**na işlenmelidir.
