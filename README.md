

# 🌦️ AI Weather & Mood Assistant (Powered by MCP)

Bu proje, **Model Context Protocol (MCP)** mimarisini kullanarak geliştirilmiş modern bir yapay zeka asistanıdır. Google Gemini AI modelini, gerçek dünya verileriyle (Hava durumu, Görseller) buluşturur ve bunu otonom bir şekilde yönetir.

## 🏗️ Proje Mimarisi

### İletişim Akışı (Mimari Şeması)

```text
                                +-----------------+
                                |  KULLANICI (UI) |
                                +--------+--------+
                                         |
                                         v
+-----------------+            +---------+---------+            +-----------------+
|  GOOGLE GEMINI  |<-----------|     BACKEND       |<-----------|    FRONTEND     |
|       (AI)      |----------->| (Node.js/Express) |----------->|  (React + Vite) |
+-----------------+   Karar    +---------+---------+   Yanıt    +-----------------+
                                         |
                                         | (JSON-RPC via Stdio)
                                         v
                               +---------+---------+
                               |    MCP SERVER     |
                               |     (Python)      |
                               +---------+---------+
                                         |
                                         | (HTTP Webhook)
                                         v
+-----------------+            +---------+---------+
|  EXTERNAL APIs  |<-----------|       n8n         |
| (Weather/Image) |----------->|   (Workflows)     |
+-----------------+            +-------------------+

Bu Projede MCP Nasıl Kullanılıyor?
MCP Server (Python):

Konum: mcp-server/server.py

Görevi: Tool'ları tanımlar (get_weather, get_city_image, get_weather_forecast) ve n8n webhook'larına istek atar.

Teknoloji: Python SDK, httpx (Async HTTP Client).

MCP Client (Node.js):

Konum: backend/src/mcp-client.js

Görevi: Python sunucusunu stdio üzerinden çalıştırır ve yönetir. AI modelinin tool çağrılarını bu sunucuya iletir.

Teknoloji: Node.js, Child Process.

🚀 Kurulum ve Başlangıç
Gereksinimler
Node.js (v18+)

Python (v3.9+)

n8n (Lokal veya Cloud)

Adım Adım Kurulum
1. Projeyi Klonlayın
git clone [https://github.com/aozberkk/weather-app.git](https://github.com/aozberkk/weather-app.git)
cd weather-app

2. Backend Kurulumu
cd backend
npm install
.env dosyasını oluşturun ve şu bilgileri ekleyin:
PORT=3001
GEMINI_API_KEY=your_gemini_api_key
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

3. Frontend Kurulumu
cd ../frontend
npm install

4. MCP Server Kurulumu
cd ../mcp-server
# Sanal ortam önerilir (Optional)
python -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate
pip install -r requirements.txt

5. n8n Workflow Kurulumu

n8n-workflows/ klasöründeki 3 adet .json dosyasını n8n arayüzünden Import edin.

n8n içinde OpenWeatherMap ve Unsplash API credential'larını tanımladığınızdan emin olun.

🎮 Uygulamayı Çalıştırma
Projeyi tam kapasite çalıştırmak için 3 ayrı terminalde şu komutları çalıştırın:

Terminal 1 (Backend):
cd backend
npm start

Terminal 2 (Frontend):
cd frontend
npm run dev

Terminal 3 (n8n):
n8n start

🔧 Teknik Detaylar: MCP Tool'ları
Tool Adı,Açıklama,Input Schema
get_weather,Şehir için anlık hava durumu bilgisini getirir.,"{ ""city"": ""string"" }"
get_city_image,Hava durumuna uygun atmosferik şehir görseli arar (Unsplash).,"{ ""search_query"": ""string"" }"
get_weather_forecast,Şehir için 5 günlük detaylı hava tahminini getirir.,"{ ""city"": ""string"" }"













































