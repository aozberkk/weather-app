# Kurulum Rehberi - Detaylı Adım Adım Açıklama

Bu dokümanda, projeyi kendi bilgisayarınızda çalıştırmak için gerekli tüm adımlar **başlangıç seviyesinde** açıklanmıştır. Programlama bilgisi olmayan biri bile bu rehberi takip ederek projeyi çalıştırabilir.

---

## 1. Gereksinimler (Ne Gerekiyor?)

Projeyi çalıştırmak için bilgisayarınızda bazı yazılımların kurulu olması gerekir.

### Sistem Gereksinimleri

**Node.js (v18 veya üzeri)**
- **Nedir?** Node.js, JavaScript programlama dilini bilgisayarınızda çalıştırmak için kullanılan bir platformdur
- **Neden Gerekiyor?** Backend ve Frontend kodları JavaScript ile yazılmıştır, bu kodları çalıştırmak için Node.js gereklidir
- **Nasıl Kurulur?** https://nodejs.org/ adresine gidin ve "LTS" (Long Term Support) versiyonunu indirin
- **Kontrol:** Terminal'de `node --version` komutunu çalıştırın. v18 veya üzeri bir versiyon görmelisiniz

**Python (v3.9 veya üzeri)**
- **Nedir?** Python, bir programlama dilidir
- **Neden Gerekiyor?** MCP Server Python ile yazılmıştır
- **Nasıl Kurulur?** https://www.python.org/downloads/ adresine gidin ve Python 3.9 veya üzeri bir versiyon indirin
- **Kontrol:** Terminal'de `python --version` komutunu çalıştırın. v3.9 veya üzeri bir versiyon görmelisiniz
- **Önemli:** Kurulum sırasında "Add Python to PATH" seçeneğini işaretleyin

**n8n (localhost:5678'de çalışıyor olmalı)**
- **Nedir?** n8n, iş akışlarını otomatikleştirmek için kullanılan bir araçtır
- **Neden Gerekiyor?** API çağrıları (OpenWeatherMap, Unsplash) n8n workflow'ları üzerinden yapılır
- **Nasıl Kurulur?** n8n'i global olarak kurmak için: `npm install -g n8n`
- **Nasıl Çalıştırılır?** Terminal'de `n8n` komutunu çalıştırın
- **Kontrol:** Browser'da `http://localhost:5678` adresine gidin. n8n arayüzü açılıyorsa, çalışıyor demektir

**npm (Node.js ile birlikte gelir)**
- **Nedir?** npm (Node Package Manager), JavaScript paketlerini yönetmek için kullanılan bir araçtır
- **Neden Gerekiyor?** Projedeki bağımlılıkları (paketleri) kurmak için kullanılır
- **Kontrol:** Terminal'de `npm --version` komutunu çalıştırın. Bir versiyon numarası görmelisiniz

### API Keys (API Anahtarları)

**API Key Nedir?**
- API key, bir servise (örneğin OpenAI, OpenWeatherMap) erişmek için kullanılan bir anahtardır
- Şifre gibi düşünebilirsiniz - sadece sizde olmalı ve kimseyle paylaşılmamalıdır

**OpenWeatherMap API Key**
- **Nasıl Alınır?** https://openweathermap.org/api adresine gidin ve ücretsiz hesap oluşturun
- **Nerede Kullanılır?** n8n workflow'unda (weather-workflow.json ve weather-forecast-workflow.json)

**Unsplash API Key**
- **Nasıl Alınır?** https://unsplash.com/developers adresine gidin ve bir uygulama oluşturun
- **Nerede Kullanılır?** n8n workflow'unda (city-image-workflow.json)

**Google Gemini API Key**
- **Nasıl Alınır?** https://makersuite.google.com/app/apikey adresine gidin
- **Nerede Kullanılır?** Backend `.env` dosyasında

---

## 2. Projeyi İndirme (Clone)

**Git Nedir?**
- Git, proje dosyalarını yönetmek için kullanılan bir araçtır
- GitHub'dan projeyi indirmek için Git kullanılır

**Projeyi İndirme:**
1. Terminal'i açın
2. Projeyi indirmek istediğiniz klasöre gidin (örneğin: `cd Desktop`)
3. Şu komutu çalıştırın:
   ```bash
   git clone https://github.com/aozberkk/weather-app.git
   ```
4. Proje klasörüne gidin:
   ```bash
   cd weather-app
   ```

---

## 3. Backend Kurulumu

**Backend Nedir?**
- Backend, sunucu tarafında çalışan koddur
- API isteklerini işler ve veritabanı ile iletişim kurar

**Kurulum Adımları:**

1. **Backend klasörüne gidin:**
   ```bash
   cd backend
   ```

2. **Bağımlılıkları kurun:**
   ```bash
   npm install
   ```
   - Bu komut, `package.json` dosyasında listelenen tüm paketleri indirir ve kurar
   - İlk kez çalıştırıldığında birkaç dakika sürebilir

3. **`.env` dosyası oluşturun:**
   - `env.example` dosyasını kopyalayın ve `.env` olarak kaydedin:
     ```bash
     # Windows'ta:
     copy env.example .env
     
     # Mac/Linux'ta:
     cp env.example .env
     ```

4. **`.env` dosyasını düzenleyin:**
   - `.env` dosyasını bir metin editörü ile açın
   - `GEMINI_API_KEY` değerini kendi API key'iniz ile değiştirin
   - Örnek:
     ```
     GEMINI_API_KEY=your-actual-api-key-here
     ```

5. **Backend'i başlatın:**
   ```bash
   npm start
   ```
   - Backend başarıyla başladıysa, terminal'de "Server running on port 3001" mesajını görmelisiniz
   - Backend'i durdurmak için `Ctrl+C` tuşlarına basın

---

## 4. Frontend Kurulumu

**Frontend Nedir?**
- Frontend, kullanıcının gördüğü arayüzdür
- Tarayıcıda çalışan React uygulamasıdır

**Kurulum Adımları:**

1. **Yeni bir terminal penceresi açın** (Backend çalışırken)

2. **Frontend klasörüne gidin:**
   ```bash
   cd frontend
   ```

3. **Bağımlılıkları kurun:**
   ```bash
   npm install
   ```

4. **Frontend'i başlatın:**
   ```bash
   npm run dev
   ```
   - Frontend başarıyla başladıysa, terminal'de bir URL göreceksiniz (genellikle `http://localhost:5173`)
   - Bu URL'yi tarayıcınızda açın

---

## 5. MCP Server Kurulumu

**MCP Server Nedir?**
- MCP (Model Context Protocol) Server, AI modeli ile iletişim kurmak için kullanılan bir servistir

**Kurulum Adımları:**

1. **Yeni bir terminal penceresi açın**

2. **MCP Server klasörüne gidin:**
   ```bash
   cd mcp-server
   ```

3. **Python bağımlılıklarını kurun:**
   ```bash
   pip install -r requirements.txt
   ```
   - Eğer `pip` komutu çalışmıyorsa, `pip3` deneyin

4. **MCP Server'ı başlatın:**
   ```bash
   python server.py
   ```
   - Veya `python3 server.py`

---

## 6. n8n Workflow'larını İçe Aktarma

**n8n Workflow Nedir?**
- n8n workflow, API çağrılarını otomatikleştiren bir iş akışıdır
- Bu projede, hava durumu verilerini almak için kullanılır

**İçe Aktarma Adımları:**

1. **n8n'i başlatın** (eğer çalışmıyorsa):
   ```bash
   n8n
   ```

2. **n8n arayüzünü açın:**
   - Tarayıcıda `http://localhost:5678` adresine gidin

3. **Workflow'ları içe aktarın:**
   - n8n arayüzünde, sol üst köşedeki menüden "Workflows" seçeneğine tıklayın
   - "Import from File" butonuna tıklayın
   - `n8n-workflows` klasöründeki JSON dosyalarını tek tek içe aktarın:
     - `weather-workflow.json`
     - `weather-forecast-workflow.json`
     - `city-image-workflow.json`

4. **API Key'leri güncelleyin:**
   - Her workflow'u açın
   - OpenWeatherMap ve Unsplash API key'lerini kendi key'leriniz ile değiştirin
   - Workflow'u kaydedin ve aktif hale getirin

---

## 7. Projeyi Çalıştırma

**Tüm Servisleri Başlatma:**

Projeyi çalıştırmak için **4 terminal penceresi** açmanız gerekir:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Terminal 3 - MCP Server:**
   ```bash
   cd mcp-server
   python server.py
   ```

4. **Terminal 4 - n8n:**
   ```bash
   n8n
   ```

**Kontrol:**
- Backend: `http://localhost:3001` (API çalışıyor olmalı)
- Frontend: `http://localhost:5173` (Uygulama açılmalı)
- n8n: `http://localhost:5678` (n8n arayüzü açılmalı)
- MCP Server: Terminal'de çalışıyor olmalı (hata mesajı yoksa başarılı)

---

## 8. Sorun Giderme (Troubleshooting)

**Port Zaten Kullanılıyor Hatası:**
- Bir port zaten kullanılıyorsa, o portu kullanan uygulamayı kapatın
- Windows'ta: `netstat -ano | findstr :3001` (port numarasını değiştirin)
- Mac/Linux'ta: `lsof -i :3001`

**npm install Hataları:**
- `npm cache clean --force` komutunu çalıştırın
- `node_modules` klasörünü silin ve tekrar `npm install` yapın

**Python Modül Bulunamadı Hatası:**
- `pip install -r requirements.txt` komutunu tekrar çalıştırın
- Python'un PATH'e eklendiğinden emin olun

**n8n Workflow Çalışmıyor:**
- Workflow'un aktif olduğundan emin olun
- API key'lerin doğru girildiğini kontrol edin
- n8n log'larını kontrol edin

---

## 9. Sonraki Adımlar

Proje başarıyla çalıştıktan sonra:

1. **API Key'leri güvenli tutun** - `.env` dosyasını asla GitHub'a yüklemeyin
2. **Dokümantasyonu okuyun** - `README.md` dosyasını inceleyin
3. **Özelleştirin** - Kodu kendi ihtiyaçlarınıza göre düzenleyin

---

## Yardım ve Destek

Sorun yaşıyorsanız:
- GitHub Issues: https://github.com/aozberkk/weather-app/issues
- README.md dosyasını kontrol edin
- n8n dokümantasyonunu inceleyin: https://docs.n8n.io/

---

**İyi çalışmalar! 🚀**
