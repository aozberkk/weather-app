# 🌦️ AI Weather & Mood Assistant (Powered by MCP)

Bu proje, **Model Context Protocol (MCP)** mimarisini kullanarak geliştirilmiş modern bir yapay zeka asistanıdır. Google Gemini AI modelini, gerçek dünya verileriyle (Hava durumu, Görseller) buluşturur ve bunu otonom bir şekilde yönetir.

![Architecture Diagram](https://mermaid.ink/img/pako:eNp1k01v2zAMhv8KoXMulh3bS9cNhqFbDzv0sGxAtyAvNlaRWFIkymnQ_z6q_IgD0yF9iCL58SMlVd6w1qzgfcf-Ea2F_WbdCjbz7c1682G9fbferlZ3q_XdfLX6sPq4uvm4erf6uPr848vnh_X3L_uX1erD-_W7b_v7P_u_q9XnL7vd_s--vF_df3n499fV6tO_L35wQdCcoSVQh5Y8Wj6T5zP0TmhL0DthKIET14b1kS1t78ihE4YjQeuE0QRdc4K-c-TSCeMI-s6RZ3JowtATdM0Jhu4EfR-F4UTQ91G4k4dO0A_k0JMjTy2Z28ieHJrI0EWGjhz6yJErGboK6FqgO0N3gq4EuhLoztCdQU-O7oKhu0DXAt0ZdCXQnaErge4MugvoLqC7gK4EegroKqCngK4CegroKqA7g54CuhLoKaArgZ4CuhLoKaArgZ4CeiroKqCngq4CeiroKqCngq4CeiroyNBVQE8FPRV0FdBVQVcBPVXkSF9Q_wP1P1D_A_WvoH4C9a-gfgL1r6B-AvU_UP8D9X9I_T-QY0uOrRybyLGNHNuQYxuObci5DTm3Iec25NyGnNuQcxvo3AZybiM5t5Gc20jObSTnNpJzG8m5jeTcRnJuozi3UZzbKM5tFOc2inMbxbmN4txGcW6jOLdRntsoz22U5zaKc5vi3KZwbkM5t6Gc21DObSjnNpRzG8q5DeXchnJuI7m2kVzbiN5tpN5tpN5tpN5tpN5tpN5tpN5tpN5tpN5tpN5t5N5t5N5t5N5t5N5tJOc2knMbybmN5NxGcm4jObeRnNtIzm0k5zaScxvJuY3k3EZybqM4t1Gc2yjObRTnNopzG8W5jeLcRnFuozj3P4FqF6s?type=png)

## 🏗️ Proje Mimarisi

### Bu Projede MCP Nasıl Kullanılıyor?

1.  **MCP Server (Python):**
    * **Konum:** `mcp-server/server.py`
    * **Görevi:** Tool'ları tanımlar (`get_weather`, `get_city_image`, `get_weather_forecast`) ve n8n webhook'larına istek atar.
    * **Teknoloji:** Python SDK, httpx (Async HTTP Client).

2.  **MCP Client (Node.js):**
    * **Konum:** `backend/src/mcp-client.js`
    * **Görevi:** Python sunucusunu `stdio` üzerinden çalıştırır ve yönetir. AI modelinin tool çağrılarını bu sunucuya iletir.
    * **Teknoloji:** Node.js, Child Process.

### İletişim Akışı
```mermaid
graph TD
    A[Yapay Zeka Modeli] -->|Tool Çağrısı| B(Backend / MCP Client)
    B -->|JSON-RPC via stdio| C(MCP Server / Python)
    C -->|HTTP Request| D(n8n Webhook)
    D -->|API Call| E[External APIs]
    E -->|Response| D
    D -->|Response| C
    C -->|JSON-RPC Response| B
    B -->|Final Content| A
    A -->|Yanıt| F[Frontend / React]

🚀 Kurulum ve Başlangıç
Gereksinimler
Node.js (v18+)

Python (v3.9+)

n8n (Lokal veya Cloud)

Adım Adım Kurulum
1. Projeyi Klonlayın
git clone https://github.com/aozberkk/weather-app.git
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

🐛 Sorun Giderme (Troubleshooting)
Hata: GEMINI_API_KEY environment variable is required

Çözüm: backend/.env dosyasını kontrol edin ve API anahtarının doğru olduğundan emin olun.

Hata: MCP Client not connected

Çözüm: Python'un yüklü olduğunu ve mcp-server klasöründeki requirements.txt bağımlılıklarının kurulduğunu doğrulayın.

Hata: Connection error... webhook/weather

Çözüm: n8n'in çalıştığından (localhost:5678) ve workflow'ların Active (Yeşil) durumda olduğundan emin olun.
