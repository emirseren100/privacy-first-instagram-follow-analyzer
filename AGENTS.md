# AGENTS.md

Bu proje icin tum asistan ciktilari Turkce olmalidir.

## Proje Ozeti

Bu repo privacy-first bir Instagram follow analyzer uygulamasidir.

Uygulama yalnizca kullanicinin kendi Instagram data export ZIP, JSON veya HTML dosyalarini tarayicida analiz eder. Veri sunucuya gonderilmez. Instagram'a istek atilmaz.

## Mutlak Sinirlar

- Instagram scrape etme.
- Instagram login, sifre, cookie, session veya token isteme.
- Resmi olmayan Instagram API kullanma.
- Kullanici adindan veri cekme.
- Backend, API route, server action veya veri yukleme endpoint'i ekleme.
- Yuklenen export verisini dis servise, telemetry'ye veya log sunucusuna gonderme.
- Kullanici dosyalarindaki username listesini cevapta gereksiz yere acik yazma.

## Teknik Stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- JSZip
- Vitest + jsdom
- Client-side only parsing

## Onemli Dosyalar

- `app/page.tsx`: Ana ekran, upload akisi, sonuc state'i.
- `components/UploadDropzone.tsx`: ZIP/JSON/HTML secimi ve parse mesajlari.
- `components/ResultTabs.tsx`: Sonuc sekmeleri.
- `components/UserList.tsx`: Arama, siralama, kopyalama, CSV export ve profil linkleri.
- `utils/parseInstagramExport.ts`: Instagram export parser.
- `utils/normalizeUsername.ts`: Username normalize/deduplicate.
- `utils/setOperations.ts`: Difference/intersection/analysis.
- `utils/exportCsv.ts`: CSV ve clipboard yardimcilari.
- `tests/*.test.ts`: Parser, normalization ve set operation testleri.

## Parser Kurallari

Parser su kaynaklari desteklemelidir:

- `followers_1.json`, `followers_2.json`, `followers_1 (1).json`
- `following.json`, `following_1.json`, `following_1 (1).json`
- ZIP icindeki ayni dosyalar
- HTML export dosyalari
- Instagram `_u/{username}` profil redirect linkleri

Username normalize kurali:

- trim
- lowercase
- bastaki `@` karakterlerini kaldir
- bos degerleri at
- `Set` ile deduplicate et

Parser sadece export dosyasinin lokal icerigini okumali. Ag istegi yapmamali.

## Gelistirme Komutlari

PowerShell'de `npm` execution policy'ye takilabilecegi icin Windows'ta `npm.cmd` kullan.

```bash
npm.cmd install
npm.cmd run dev
npm.cmd test
npm.cmd run build
npm.cmd audit --audit-level=moderate
```

Degisiklikten sonra en az sunlari calistir:

```bash
npm.cmd test
npm.cmd run build
```

Bagimlilik degistiyse ayrica:

```bash
npm.cmd audit --audit-level=moderate
```

## UI Ilkeleri

- UI calismalarinda ust duzey product designer gibi davran: once kullanicinin asil isini, sonra bilgi hiyerarsisini, sonra gorsel cilayi dusun.
- Arayuz premium, modern, sakin ve guven veren bir arac gibi hissettirmeli; generic AI SaaS landing page gibi gorunmemeli.
- Ilk ekran kullanilabilir uygulama olmali: upload, gizlilik, dogru export talimati ve sonuc beklentisi hemen anlasilmali.
- Hero/ust alan pazarlama sayfasi degil, islevsel onboarding olmali. Kullaniciya `All time / Tum zamanlar`, `JSON preferred`, `Followers and following` ayarlarini net gostermeli.
- Privacy-first mesajlari dekor degil, karar verdiren guven sinyali olmali: no login, no scraping, local-only.
- Hata, uyari ve parse detaylari teknik ama anlasilir olmali. Kullanici "neden 65 cikti?" gibi sorulara UI icinden cevap bulabilmeli.
- Eksik export uyarilari gorunur olmali ama panik yaratmamali; ne yapilacagini soylemeli.
- Sonuc dashboard'u hizli taranabilir olmali: followers, following, not following back, I don't follow back, mutuals.
- Listeler is odakli olmali: arama, A-Z/Z-A siralama, copy, CSV export ve Instagram profil linki her tabda ergonomik calismali.
- Bos tab state'leri o tabin neden bos oldugunu sade sekilde anlatmali.
- Mobil tasarim birinci sinif desteklenmeli: yatay tasma yok, buton metinleri sigar, tablar kaydirilabilir, kartlar dar ekranda okunur.
- Responsive layout icin sabit olmayan ama kontrollu olculer kullan: `minmax`, `max-width`, `overflow-x-auto`, tutarli spacing.
- Animasyonlar yumusak ve islevsel olmali: kart girisi, tab degisimi, hover/focus gecisleri. Performansi veya okunabilirligi bozma.
- Renk paleti tek nota olmamali; koyu tema sadece siyah kartlardan ibaret kalmamali. Rose/emerald/sky/amber gibi islevsel vurgu renkleri dengeli kullanilabilir.
- Ikon kullan: lucide-react ikonlari tercih et. Anlasilmayan ikonlarda `title` veya gorunmez erisilebilir metin kullan.
- Form/input/button durumlari eksiksiz olmali: disabled, hover, focus, empty, loading, warning, error.
- Kart icinde kart kullanmaktan kacin; sadece gercekten cercevelenmesi gereken arac/parca icin kart kullan.
- UI degisikliginden sonra Browser ile en az desktop ve mobil gorunumu kontrol et; console error ve yatay tasma olmadigini dogrula.

## Test Beklentisi

Parser veya veri isleme degisirse test ekle/guncelle:

- username normalization
- duplicate handling
- set difference
- intersection
- JSON parser
- HTML parser
- ZIP parser
- Instagram `_u/{username}` href formati
- eksik followers/following dosyalari

## Cevap Stili

- Turkce yaz.
- Kisa ama net ol.
- Dosya veya komut verirken tam yol veya calistirilabilir komut ver.
- Kullanici "hata var" dediginde once kanitla: dosya sayisi, kayit sayisi, parser sonucu, sonra duzelt.
- Privacy ve guvenlik sinirlarini zayiflatan oneriler sunma.
