# n8n Workflow Import Rehberi

Bu klasörde n8n workflow JSON dosyaları bulunmaktadır. Bu workflow'ları n8n'e import edebilirsiniz.

## Workflow'lar

1. **weather-workflow.json** - Hava durumu webhook workflow'u
2. **city-image-workflow.json** - Şehir görseli webhook workflow'u

## Import Etme

### Yöntem 1: n8n UI Üzerinden

1. n8n arayüzüne gidin: `http://localhost:5678`
2. Sağ üstteki **"Workflow"** menüsünden **"Import from File"** seçeneğine tıklayın
3. İlgili JSON dosyasını seçin
4. Workflow import edildikten sonra:
   - Webhook path'lerini kontrol edin
   - Workflow'u aktif edin (sağ üstteki toggle)

### Yöntem 2: n8n API ile

```bash
# Weather workflow
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: your-api-key" \
  -d @weather-workflow.json

# City image workflow
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: your-api-key" \
  -d @city-image-workflow.json
```

## Unsplash API Key Ayarlama

`city-image-workflow.json` workflow'unda Unsplash API key placeholder olarak eklenmiştir:

- **Placeholder:** `YOUR_UNSPLASH_ACCESS_KEY`
- **Format:** `Client-ID YOUR_UNSPLASH_ACCESS_KEY`

Workflow JSON dosyasında Unsplash API key header'ında placeholder olarak tanımlıdır. API key'i eklemek için:

1. n8n'de workflow'u açın
2. **Unsplash API** node'una tıklayın
3. Header Parameters bölümünde `Authorization` header'ını bulun
4. `Client-ID` kısmından sonraki API key'i güncelleyin

## Workflow'ları Aktif Etme

Import ettikten sonra:

1. Her workflow'u açın
2. Sağ üstteki **"Active"** toggle'ı açın
3. Webhook URL'lerini not edin:
   - Weather: `http://localhost:5678/webhook/weather`
   - City Image: `http://localhost:5678/webhook/city-image`

## Test Etme

### Weather Workflow Test

```bash
curl -X POST http://localhost:5678/webhook/weather \
  -H "Content-Type: application/json" \
  -d '{"city": "Istanbul"}'
```

### City Image Workflow Test

```bash
curl -X POST http://localhost:5678/webhook/city-image \
  -H "Content-Type: application/json" \
  -d '{"search_query": "Istanbul rainy city street"}'
```

## Notlar

- Unsplash API key workflow JSON dosyasında placeholder olarak eklenmiştir (`YOUR_UNSPLASH_ACCESS_KEY`)
- OpenWeatherMap API key workflow JSON dosyasında placeholder olarak eklenmiştir (`YOUR_OPENWEATHERMAP_API_KEY`)
- Webhook path'leri JSON dosyalarında tanımlıdır (weather ve city-image)
- **ÖNEMLİ:** Workflow'ları import ettikten sonra, API key'leri kendi key'leriniz ile değiştirmeyi unutmayın!

