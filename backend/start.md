
```sh
rm -rf dist
npx tsc --noEmit
bun run build

bun run dev
```

# Temizlik için:

```sh
#dev
rm -rf dist
rm -rf build
rm -rf node_modules/.cache
bun install
npx tsc --noEmit
npm run build

bun run dev

#prod

rm -rf dist
rm -rf build
rm -rf node_modules/.cache
bun install
npx tsc --noEmit
npm run build
pm2 restart tariftarif-backend
pm2 save


cd /var/www/tarifintarifi/backend

# (Temiz başlamak için) varsa eski süreci sil
pm2 delete tarifintarifi-backend || true

# Ecosystem dosyasından sadece backend’i başlat
pm2 start ecosystem.backend.config.cjs --only tarifintarifi-backend

# Kalıcılaştır (reboot sonrası da ayağa kalksın)
pm2 save
pm2 startup systemd -u root --hp /root   # Çıktıda verdiği komutu bir kere çalıştır
```

```sh
npx ts-node -r tsconfig-paths/register src/scripts/sync/masterSync.ts
```

```sh
npx ts-node -r tsconfig-paths/register src/generateMeta.ts
```

```sh
npx ts-node -r tsconfig-paths/register src/scripts/section/masterSyncSections.ts
```

```sh
npx ts-node -r tsconfig-paths/register src/scripts/sync/cloneModuleMetaToTenants.ts
```

```sh
npx ts-node -r tsconfig-paths/register src/scripts/sync/seedAllModuleMeta.ts
```

```sh
git fetch origin
git reset --hard origin/main
```

Alternatif olarak:

```sh
pm2 start server --name "my-app"
```

* Uygulamaya **my-app** adını verir.

---

## **📌 3. Çalışan Uygulamaları Listeleme**

```sh
pm2 list
```

* **Çalışan tüm process’leri gösterir.**

---

## **📌 4. Belirli Bir Uygulamayı Durdurma ve Silme**

```sh
pm2 stop metahub-backend     # Uygulamayı durdurur
pm2 restart my-app           # Uygulamayı yeniden başlatır
pm2 delete metahub-backend   # PM2’den kaldırır
```

ID kullanarak da işlem yapılabilir:

```sh
pm2 stop <id>
pm2 restart <id>
pm2 delete <id>
```

---

## **📌 5. PM2'yi Kalıcı Hale Getirme (Restart Sonrası Otomatik Çalıştırma)**

```sh
pm2 startup
```

* **PM2'yi sistem servisi olarak başlatır.**
* Sunucu **yeniden başlatıldığında uygulamalar otomatik olarak çalışır.**

---

## **📌 6. Logları Görüntüleme**

```sh
pm2 logs
```

* **Tüm uygulamaların loglarını gösterir.**

Belirli bir uygulamanın loglarını görmek için:

```sh
pm2 logs my-app
```

Logları temizlemek için:

```sh
pm2 flush
```
