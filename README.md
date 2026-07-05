# Privacy-first Instagram Follow Analyzer

Kendi Instagram veri dışa aktarım dosyalarını tarayıcı içinde analiz eden Next.js uygulaması.

## Özellikler

- Instagram kullanıcı adıyla veri çekmez.
- Instagram girişi, şifre, cookie, session veya token istemez.
- Scraping ya da resmi olmayan Instagram API kullanmaz.
- ZIP veya JSON dosyalarını yalnızca kullanıcının cihazında, tarayıcı içinde işler.
- ZIP içindeki veya doğrudan yüklenen HTML export dosyalarını DOMParser ile tarayıcı içinde işler.
- `followers_1.json`, `followers_2.json` ve `following.json` benzeri Instagram export dosyalarından `string_list_data[].value` alanlarını okur.
- Kullanıcı adlarını küçük harfe çevirir, baştaki `@` işaretini kaldırır, boşlukları temizler ve tekrarları siler.

## Kurulum

```bash
npm install
npm run dev
```

Tarayıcıda:

```text
http://localhost:3000
```

Windows PowerShell yürütme ilkesi `npm` komutunu engellerse aynı komutları `npm.cmd` ile çalıştırabilirsin:

```bash
npm.cmd install
npm.cmd run dev
```

Testleri çalıştırmak için:

```bash
npm run test
```

## Instagram verisini indirme

1. Instagram uygulamasında veya web sitesinde hesap ayarlarına gir.
2. Account Center / Your information and permissions bölümünden Download your information akışını aç.
3. Instagram hesabını seç.
4. Followers and following verilerini içeren export oluştur.
5. Tarih aralığı olarak **All time / Tüm zamanlar** seç. Son 1 yıl gibi sınırlı aralıklar mevcut tüm takipçi listesini vermeyebilir.
6. Format olarak JSON seç. HTML export da desteklenir.
7. Veri kategorisi olarak **Followers and following** seç.
8. Hazır olduğunda ZIP dosyasını indir.
9. Bu uygulamada ZIP dosyasını doğrudan yükle veya ZIP içinden ilgili JSON/HTML dosyalarını seç.

Instagram arayüzündeki menü adları zamanla değişebilir; önemli olan JSON formatında kendi veri export dosyanı indirmen.

## Gizlilik modeli

Bu uygulama client-side çalışır. ZIP dosyası JSZip ile tarayıcı belleğinde açılır, JSON dosyaları yine tarayıcıda parse edilir ve sonuçlar yerel state içinde hesaplanır. Dosya içeriği uygulama sunucusuna gönderilmez.

Uygulama yalnızca statik arayüz dosyalarını servis eder. Analiz için kullanılan takipçi ve takip edilen kişi verileri cihazından çıkmaz.

## Limitasyonlar

- Bu uygulama Instagram scrape etmez.
- Kullanıcı adı yazarak çalışmaz.
- Instagram login bilgisi, cookie, session veya token ile çalışmaz.
- Resmi ya da resmi olmayan Instagram API üzerinden veri çekmez.
- Sonuçların doğruluğu yüklenen Instagram export dosyasının güncelliğine bağlıdır.
- Sınırlı tarih aralığıyla alınan exportlar eksik görünebilir; uygulama düşük takipçi sayısı, tek followers dosyası veya takip edilen/takipçi sayısı arasında şüpheli fark görürse uyarı gösterir.

## Hesaplanan sonuçlar

- People I follow who do not follow me back
- People who follow me but I do not follow back
- Mutual follows
- Total followers and following counts

Her listede arama, A-Z / Z-A sıralama, kullanıcı adlarını kopyalama, CSV export ve Instagram profil linki bulunur.
