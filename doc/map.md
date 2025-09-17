# Proje Adı (Çalışma Başlıkları)

1. **ClassPilot** – sınıf içi öğrenme rehberi hissi; nötr ve kurumsal.
2. **StudyCopilot** – bireysel çalışma asistanı çağrışımı; teknoloji odaklı.
3. **LearnCompass** – yön bulma/rehberlik vurgusu; güven veren ton.
4. **KoçAI** – Türkçe, direkt değer vaadi; kısa ve akılda kalır.
5. **MentorMind** – mentorluk ve bilişsel destek iması; premium algı.

**Önerim:** *LearnCompass* (B2C/B2B’ye uygun, yerelleştirilebilir, ileride “LearnCompass Coach / Teacher / Admin” ürün ailelerine açılır.)

---

# Yol Haritası (MVP – 4 Hafta)

## Faz 0 — Kickoff & Tanım (Gün 1–2)

* Hedefler ve başarı metrikleri (P0): plan kabul oranı, ilk hafta aktif kullanıcı, öğretmen geri bildirimi.
* Paydaşlar, karar süreçleri, iletişim ritmi (haftalık 60 dk, tek karar noktası).
* Veri sözleşmesi: örnek transkript, müfredat iskeleti, kullanıcı listesi formatları.
* Güvenlik/KVKK: PII alanları, maskeleme/anonimleştirme stratejisi, erişim politikaları.
* Teknik tercihlerin taslağı: LLM (OpenAI/yerel), vektör DB (Atlas/Qdrant), barındırma.
* Teslimat planı ve risk/önlem tablosu onayı.

**Çıktılar:** Proje Tanım Dokümanı (PRD lite), Veri Sözleşmesi v1, Risk Kaydı, Metrik Tanımları.

---

## Faz 1 — ETL & Dizine Alma (Hafta 1)

* ETL tasarımı: transkript/öğretmen notları/ödev–sınav özetleri için şablonlar.
* Parçalama (chunking) ve metadata: ders → konu → alt konu, hafta/ünite, öğretmen, zorluk.
* Vektör dizin (Atlas veya Qdrant) + BM25 hibrit arama planı.
* Minimum 5–10 örnek içerik ile pilot dizinleme ve kalite kontrol checklist’i.

**Çıktılar:** ETL Şablonları, Dizine Alma Raporu, Veri Kalitesi Kontrol Listesi.

---

## Faz 2 — Öğrenci Koçu Akışları (Hafta 2)

* Context Builder: öğrenci profili (seviye, hedef, son performans) + ders bağlamı birleşimi.
* P0 akışları: konu özeti, kişisel çalışma planı, örnek soru & açıklamalı çözüm, yanlış analizi.
* Prompt şablonları ve guardrails (müstehcen/yanıltıcı içerik, kaynak talebi, temkinli dil).
* Günlük kullanım telemetrisi (event şeması) ve temel loglama.

**Çıktılar:** Akış Tanımları, Prompt Kitaplığı v1, Guardrail Politikaları, Telemetri Şeması.

---

## Faz 3 — Öğretmen Mini Paneli (Hafta 3)

* Görünümler: öğrenci durumu, zayıf konular, önerilen ödevler.
* Basit rol-yetki (admin/öğretmen/öğrenci) ve e-posta “magic link” giriş.
* Whitelabel tema (logo/renk) ve mevcut portale yönlendirme/yerleştirme stratejisi (deep-link veya embed).

**Çıktılar:** Öğretmen Paneli Taslak Akışları, Whitelabel UI Kılavuzu, Giriş Politikası.

---

## Faz 4 — Ölçümleme, Dökümantasyon, Yayına Hazırlık (Hafta 4)

* Metrik ve doğruluk değerlendirmesi (altın soru seti, örnekle inceleme).
* A/B prompt sürümleri ve iyileştirme notları.
* Docker-compose ile çalışma ortamı, .env şablonları, çalıştırma kılavuzu.
* Handover: operasyon notları, runbook, sorun giderme.

**Çıktılar:** Değerlendirme Raporu, Yayına Hazırlık Paketi, Operasyon Runbook’u.

---

# Roller & Sorumluluklar

* **Siz (Müşteri):** Örnek veri, rol/ yetki onayı, marka öğeleri, haftalık karar toplantısı.
* **Biz:** ETL/dizin, akış tasarımı, guardrails, panel taslakları, telemetri, kurulum ve dokümantasyon.

---

# Riskler & Önlemler

* **Veri gecikmesi:** Sahte veri + yer tutucu içerik ile akış geliştirme; veri geldikçe güncelleme.
* **Model maliyetleri:** Toplam token bütçesi ve önbellekleme (cache) politikası.
* **Kapsam genişlemesi:** MVP için P0/P1 ayrımı; değişiklik talepleri için mini CR süreci.

---

# Başarı Kriterleri (MVP)

* İlk hafta ≥ %60 plan görüntüleme ve ≥ %30 plan kabul oranı (pilot grupta).
* Öğretmen geri bildiriminde ≥ %70 “faydalı/uygun” puanı.
* Hata/yanıltıcı içerik raporlarının ≤ %3 olması (pilot dönemde).

---

# Backlog (P1 Sonrası)

* Gelişmiş kişiselleştirme (öğrenme stili, hız adaptasyonu).
* Kurumsal SSO/SAML entegrasyonu (isteğe bağlı).
* Gelişmiş sınav üretimi ve zorluk kalibrasyonu.
* Çok dilli içerik & otomatik çeviri kalite izleme.
* Analitik panosu (cohort, etkileşim hunisi).


Süper başlangıç yaptık! Sana Node.js + Express + TypeScript + MongoDB için temiz, gelecek-dayanıklı bir iskelet kurdum. Kod ve dosya ağacının tamamı üstteki “LearnCompass API – Node.js/Express/TypeScript/Mongo • Scaffold v1” canvas’ında.

Kısaca neler var:

Clean structure (config/db/models/services/controllers/routes/middlewares/utils/types)

Env doğrulama (zod), pino logger, helmet/cors/compression, health endpoint’leri

Magic-link auth placeholder, tenant middleware (row-level isolation)

Mongoose base/soft-delete pluginleri, Plan/Student/Curriculum/Event modelleri

Telemetry ingest (POST /api/v1/events), Plan oluştur/kabul uçları

Dockerfile + docker-compose, ESLint + Prettier, TypeScript strict

Hemen çalıştırma (lokal):

.env dosyanı .env.example’dan kopyala ve gerekirse düzenle.

docker-compose up -d mongo (opsiyonel: mailhog)

npm i

npm run dev → http://localhost:5033/healthz

Örnek istekler:

POST /api/v1/events (header: x-tenant-id: schoolA) → telemetri kaydı

POST /api/v1/plans (headers: Authorization: Bearer <token>, x-tenant-id) body: { "studentKey": "sk_123", "topicCode": "MATH8-1" }

POST /api/v1/plans/:planId/accept

İlerleyiş (yol haritasına göre):

Faz 0: healthz/livez, env/logging, auth/tenant iskeleti ✅

Faz 1 (ETL/dizin): bir sonraki adımda ingest modülü + curriculum endpoint’leri ve validasyonları ekleyelim.

Faz 2 (akışlar): summary/plan/qa/error_review flow uçları ve telemetri alan genişletmeleri.

Faz 3 (panel): öğretmen paneline hizmet eden assignments, weak-topics read-only API’leri.

Faz 4: health checks, smoke & güvenlik checklist’leri zaten hazır; dashboard metrikleri için basit sorgu uçları ekleyebiliriz.