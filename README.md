Bu Projede MCP Nasıl Kullanılıyor?
1. MCP Server (Python)
Konum: mcp-server/server.py
Ne Yapar?
Tool'ları tanımlar: get_weather, get_city_image, get_weather_forecast
Tool çağrılarını işler
n8n webhook'larına HTTP istekleri gönderir
Sonuçları JSON-RPC formatında döndürür
Neden Python?
MCP Python SDK'sı mevcut
API çağrıları için httpx gibi kütüphaneler kolay
Hızlı prototipleme için uygun
2. MCP Client (Node.js)
Konum: backend/src/mcp-client.js
Ne Yapar?
Python MCP Server'ı çalıştırır (spawn eder)
stdio üzerinden JSON-RPC mesajları gönderir/alır
Tool listesini yapay zeka modeline sunar
Tool çağrılarını yönetir
Neden Node.js?
Backend zaten Node.js kullanıyor
Process spawn işlemleri kolay
Async/await desteği
3. İletişim Akışı
4. Yapay Zeka Modeli
    ↓ (Tool çağrısı ister)
Backend (MCP Client)
    ↓ (JSON-RPC mesajı gönderir - stdio)
MCP Server (Python)
    ↓ (HTTP isteği gönderir)
n8n Webhook
    ↓ (API çağrısı yapar)
External API (OpenWeatherMap, Unsplash)
    ↓ (Sonuç döner)
MCP Server
    ↓ (JSON-RPC response - stdio)
Backend
    ↓ (Sonucu model'e iletir)
Yapay Zeka Modeli
    ↓ (Kullanıcıya cevap verir)
Frontend

MCP'nin Avantajları
Güvenlik: Tool'lar sadece MCP Server tarafından expose edilir, model doğrudan API'lere erişemez
Standart: Tüm MCP uyumlu sistemler birbiriyle çalışabilir
Esneklik: Farklı programlama dillerinde MCP Server yazılabilir
Kontrol: Hangi tool'ların kullanılacağını kontrol edebilirsiniz
🏗️ Proje Mimarisi
Genel Mimari

┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React + Vite                                                │
│  - ChatPanel: Kullanıcı mesajları                           │
│  - WeatherPanel: Hava durumu görselleştirme                 │
│  - Components: CurrentWeather, Forecast, Charts, Alerts      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (REST API)
                       │ POST /api/chat
                       │ GET /api/weather-data/:city
                       │ GET /api/weather-forecast/:city
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  Node.js + Express                                           │
│  - index.js: HTTP server, route handlers                     │
│  - llm-handler.js: Gemini AI entegrasyonu                    │
│  - mcp-client.js: MCP Server ile iletişim                    │
└──────┬───────────────────────────────┬──────────────────────┘
       │                               │
       │ stdio (JSON-RPC)              │ HTTP
       │                               │
       ▼                               ▼
┌──────────────────┐         ┌──────────────────┐
│   MCP SERVER     │         │       n8n         │
│   (Python)       │         │   (Workflows)     │
│                  │         │                   │
│  - get_weather   │────────▶│  - weather        │
│  - get_city_     │         │    workflow       │
│    image         │         │  - city-image     │
│  - get_weather_  │         │    workflow       │
│    forecast      │         │  - forecast       │
│                  │         │    workflow       │
└──────────────────┘         └─────────┬─────────┘
                                       │ HTTP
                                       ▼
                              ┌──────────────────┐
                              │  EXTERNAL APIs   │
                              │                  │
                              │  - OpenWeatherMap│
                              │  - Unsplash      │
                              └──────────────────┘

Katmanların Açıklaması
1. Frontend Katmanı (React)
Ne İş Yapar?
Kullanıcı arayüzünü gösterir
Kullanıcı mesajlarını backend'e gönderir
Backend'den gelen yanıtları gösterir
Hava durumu verilerini görselleştirir
Neden React?
Modern, popüler framework
Component tabanlı yapı (yeniden kullanılabilir kod)
Büyük topluluk ve kütüphane desteği
Hızlı geliştirme
Teknolojiler:
React 18.2.0
Vite (build tool)
React Icons (ikonlar)
React Leaflet (harita)
React Markdown (markdown render)
2. Backend Katmanı (Node.js)
Ne İş Yapar?
HTTP isteklerini dinler
Yapay zeka modeli ile iletişim kurar
MCP Server ile iletişim kurar
Konuşma geçmişini yönetir
API endpoint'leri sağlar
Neden Node.js?
JavaScript (frontend ile aynı dil)
Hızlı ve ölçeklenebilir
Büyük ekosistem (npm paketleri)
Async/await desteği
Teknolojiler:
Express (web framework)
@google/generative-ai (Gemini AI)
dotenv (environment variables)
child_process (Python script çalıştırma)
3. MCP Server Katmanı (Python)
Ne İş Yapar?
Tool'ları tanımlar ve expose eder
Tool çağrılarını işler
n8n webhook'larına HTTP istekleri gönderir
Sonuçları JSON-RPC formatında döndürür
Neden Python?
MCP Python SDK mevcut
API çağrıları için kolay (httpx)
Hızlı prototipleme
Geniş kütüphane desteği
Teknolojiler:
httpx (HTTP client)
JSON-RPC (protokol)
stdio (iletişim)
4. n8n Katmanı (Workflow Automation)
Ne İş Yapar?
API çağrılarını otomatikleştirir
Hata durumunda retry yapar
Veri formatını düzenler
Webhook endpoint'leri sağlar
Neden n8n?
Görsel workflow editor
Kolay API entegrasyonu
Retry ve error handling
Ücretsiz (self-hosted)
Workflow'lar:
weather-workflow: OpenWeatherMap API çağrısı
city-image-workflow: Unsplash API çağrısı
weather-forecast-workflow: 7 günlük tahmin
5. External APIs
OpenWeatherMap API:
Hava durumu verisi sağlar
Ücretsiz tier: 60 çağrı/dakika
Endpoint: https://api.openweathermap.org/data/2.5/weather
Unsplash API:
Şehir fotoğrafları sağlar
Ücretsiz tier: 50 çağrı/saat
Endpoint: https://api.unsplash.com/search/photos
🚀 Kurulum
Gereksinimler
1. Node.js (v18 veya üzeri)
Ne İçin Gerekiyor?
Backend ve Frontend kodlarını çalıştırmak için
npm paketlerini yönetmek için
Nasıl Kurulur?
https://nodejs.org/ adresine gidin
"LTS" (Long Term Support) versiyonunu indirin
Kurulum sihirbazını takip edin
Kontrol:
node --version
# v18.x.x veya üzeri görmelisiniz
2. Python (v3.9 veya üzeri)
Ne İçin Gerekiyor?
MCP Server'ı çalıştırmak için
Nasıl Kurulur?
https://www.python.org/downloads/ adresine gidin
Python 3.9 veya üzeri bir versiyon indirin
Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin
Kontrol:
python --version
# Python 3.9.x veya üzeri görmelisiniz
3. n8n
Ne İçin Gerekiyor?
API çağrılarını otomatikleştirmek için
Webhook endpoint'leri sağlamak için
Nasıl Kurulur?
npm install -g n8n
Nasıl Çalıştırılır?
n8n

Kontrol:
Browser'da http://localhost:5678 adresine gidin
n8n arayüzü açılıyorsa, çalışıyor demektir
Adım Adım Kurulum
1. Projeyi İndirin
# Git ile klonlayıngit clone https://github.com/aozberkk/weather-app.gitcd weather-app
2. Backend Kurulumu
cd backendnpm install
.env Dosyası Oluşturun:
backend/.env dosyasını oluşturun ve şu içeriği ekleyin:
PORT=3001GEMINI_API_KEY=your-gemini-api-key-hereN8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook
Gemini API Key Nasıl Alınır?
https://makersuite.google.com/app/apikey adresine gidin
"Create API Key" butonuna tıklayın
API key'inizi kopyalayın
.env dosyasındaki your-gemini-api-key-here yerine yapıştırın
3. Frontend Kurulumu
cd frontendnpm install
4. MCP Server Kurulumu
cd mcp-serverpip install -r requirements.txt
5. n8n Workflow'larını Import Edin
n8n arayüzüne gidin: http://localhost:5678
"Workflows" sekmesine gidin
"+ Add workflow" veya "Import" butonuna tıklayın
Şu 3 workflow'u import edin:
n8n-workflows/weather-workflow.json
n8n-workflows/city-image-workflow.json
n8n-workflows/weather-forecast-workflow.json
⚠️ ÖNEMLİ: API Key'leri Workflow'lara Ekleyin
Her workflow'u import ettikten sonra, API key'leri eklemeniz gerekiyor:
OpenWeatherMap API Key (Weather ve Weather Forecast Workflow'ları için):
https://openweathermap.org/api adresine gidin
Ücretsiz hesap oluşturun ve API key alın
n8n'de "Weather Webhook" workflow'unu açın
"OpenWeatherMap API" node'una tıklayın
Query Parameters bölümünde appid parametresini bulun
YOUR_OPENWEATHERMAP_API_KEY yerine gerçek API key'inizi yazın
Aynı işlemi "Weather Forecast Webhook" workflow'u için de yapın
Unsplash API Key (City Image Webhook için):
https://unsplash.com/developers adresine gidin
Ücretsiz hesap oluşturun ve Access Key alın
n8n'de "City Image Webhook" workflow'unu açın
"Unsplash API" node'una tıklayın
Header Parameters bölümünde Authorization header'ını bulun
YOUR_UNSPLASH_ACCESS_KEY yerine gerçek Access Key'inizi yazın
Format: Client-ID YOUR_ACTUAL_ACCESS_KEY
Her workflow'un toggle'ını aktif (yeşil) yapın
🎮 Kullanım
Uygulamayı Başlatma
3 terminal açmanız gerekir:
Terminal 1: Backend
cd backend
npm start
Beklenen Çıktı:
MCP Client connected successfully
Backend server running on http://localhost:3001
Terminal 2: Frontend
cd frontend
npm run dev
Beklenen Çıktı:
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
Terminal 3: n8n
n8n
Beklenen Çıktı:
n8n ready on 0.0.0.0, port 5678
Editor is now accessible via:
→ http://localhost:5678
Uygulamayı Kullanma
Browser'da http://localhost:5173 (veya 5174) adresine gidin
Chat kutusuna şehir adı yazın (örn: "İstanbul")
"Gönder" butonuna tıklayın
Sağ panel'de hava durumu bilgilerini görün
🔧 Teknik Detaylar
Backend API Endpoint'leri
POST /api/chat
Ne İş Yapar?
Kullanıcı mesajını alır
Yapay zeka modeline gönderir
Tool çağrılarını yönetir
Yanıtı döndürür
Request:
{  "message": "İstanbul hava durumu",  "sessionId": "session-1234567890"}
Response:
{  "content": "İstanbul'da bugün hava 15°C ve bulutlu..."}
GET /api/weather-data/:city
Ne İş Yapar?
Belirli bir şehir için anlık hava durumu bilgisini getirir
Request:
GET /api/weather-data/İstanbul
Response:
{  "temperature": 15.5,  "condition": "parçalı bulutlu",  "humidity": 65,  "wind_speed": 5.2,  "feels_like": 14.0,  "pressure": 1013,  "lat": 41.0351,  "lon": 28.9833,  "city": "İstanbul",  "country": "TR"}
GET /api/weather-forecast/:city
Ne İş Yapar?
Belirli bir şehir için 7 günlük hava durumu tahminini getirir
Request:
GET /api/weather-forecast/İstanbul
Response:
{  "city": "İstanbul",  "country": "TR",  "lat": 41.0351,  "lon": 28.9833,  "forecasts": [    {      "date": "2025-01-01",      "temp_min": 12.5,      "temp_max": 18.3,      "temp_avg": 15.4,      "condition": "parçalı bulutlu",      "humidity": 65,      "wind_speed": 5.2    }  ]}
MCP Tool'ları
Tool 1: get_weather
Ne İş Yapar?
Şehir adını alır
n8n webhook'una POST isteği gönderir
OpenWeatherMap API'den hava durumu bilgisini alır
Sonucu döndürür
Input Schema:
{  "city": "string" // Örnek: "Istanbul", "Ankara"}
Output:
{  "temperature": 15.5,  "condition": "parçalı bulutlu",  "humidity": 65,  "wind_speed": 5.2,  "feels_like": 14.0,  "pressure": 1013,  "lat": 41.0351,  "lon": 28.9833,  "city": "İstanbul",  "country": "TR"}
Tool 2: get_city_image
Ne İş Yapar?
Arama sorgusu alır (İngilizce)
n8n webhook'una POST isteği gönderir
Unsplash API'den görsel URL'i alır
Sonucu döndürür
Input Schema:
{  "search_query": "string" // Örnek: "Istanbul rainy city street"}
Output:
{  "image_url": "https://images.unsplash.com/photo-..."}
Tool 3: get_weather_forecast
Ne İş Yapar?
Şehir adını alır
n8n webhook'una POST isteği gönderir
OpenWeatherMap Forecast API'den 7 günlük tahmini alır
Sonucu döndürür
Input Schema:
{  "city": "string" // Örnek: "Istanbul", "Ankara"}
Output:
{  "city": "İstanbul",  "country": "TR",  "forecasts": [    {      "date": "2025-01-01",      "temp_min": 12.5,      "temp_max": 18.3,      "condition": "parçalı bulutlu",      "humidity": 65,      "wind_speed": 5.2    }  ]}
🐛 Sorun Giderme
Sorun 1: Backend Başlamıyor
Hata: Error: GEMINI_API_KEY environment variable is required
Çözüm:
backend/.env dosyasının var olduğundan emin olun
GEMINI_API_KEY değişkeninin doğru yazıldığından emin olun
API key'in başında/sonunda boşluk olmadığından emin olun
Sorun 2: MCP Server Bağlanamıyor
Hata: MCP Client not connected
Çözüm:
Python'un kurulu olduğunu kontrol edin: python --version
MCP Server bağımlılıklarını kurun: pip install -r requirements.txt
Python path'inin doğru olduğundan emin olun
Sorun 3: n8n Webhook Çalışmıyor
Hata: Connection error: Cannot connect to http://localhost:5678/webhook/weather
Çözüm:
n8n'in çalıştığını kontrol edin: http://localhost:5678
Workflow'ların aktif olduğundan emin olun (yeşil toggle)
Webhook path'lerini kontrol edin:
Weather: /webhook/weather
City Image: /webhook/city-image
Forecast: /webhook/weather-forecast
Sorun 4: Port Çakışması
Hata: Error: listen EADDRINUSE: address already in use :::3001
Çözüm:
# Port 3001'i kullanan process'i bulnetstat -ano | findstr :3001# Process'i durdur (PID'yi değiştirin)Stop-Process -Id <PID> -Force
Sorun 5: Frontend'de Özellikler Görünmüyor
Çözüm:
Browser console'u açın (F12)
Hata mesajlarını kontrol edin
Network sekmesinde API çağrılarını kontrol edin
Browser'ı yenileyin (Ctrl+F5)
📚 Öğrenme Kaynakları
MCP Hakkında
MCP Official Documentation: https://modelcontextprotocol.io/
MCP Python SDK: https://github.com/modelcontextprotocol/python-sdk
MCP TypeScript SDK: https://github.com/modelcontextprotocol/typescript-sdk
Kullanılan Teknolojiler
React Documentation: https://react.dev/
Express Documentation: https://expressjs.com/
n8n Documentation: https://docs.n8n.io/
OpenWeatherMap API: https://openweathermap.org/api
Unsplash API: https://unsplash.com/documentation
Google Gemini AI: https://ai.google.dev/
📝 Lisans
Bu proje eğitim amaçlıdır. Kendi projelerinizde serbestçe kullanabilirsiniz.
🤝 Katkıda Bulunma
Bu proje öğrenme amaçlıdır. İyileştirme önerileriniz için issue açabilir veya pull request gönderebilirsiniz.
📞 İletişim
Sorularınız için issue açabilirsiniz.
Son Güncelleme: 15 Ocak 2026

</details>

## Workflow'lar

Workflow'lar `n8n-workflows/` klasöründe:
- `weather-workflow.json` — Hava durumu
- `weather-forecast-workflow.json` — 7 günlük tahmin
- `city-image-workflow.json` — Şehir görseli

Bu dosyalar commit edildi. GitHub'da görünmüyorsa, repository'yi yenileyin veya birkaç dakika bekleyin.

## GitHub'da README ekleme

1. https://github.com/aozberkk/weather-app adresine gidin
2. "Add a README" butonuna tıklayın
3. Dosya adını `README.md` yapın
4. Yukarıdaki içeriği yapıştırın
5. "Commit new file" butonuna tıklayın

README.md içeriği hazır. GitHub'da manuel olarak ekleyebilirsiniz.
