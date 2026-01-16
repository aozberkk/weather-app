import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MCPClient } from './mcp-client.js';
import { LLMHandler } from './llm-handler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Conversation history store (in-memory, session-based)
const conversationHistory = new Map();

// MCP Client instance
let mcpClient = null;

// Initialize MCP Client on server start
async function initializeMCP() {
  try {
    mcpClient = new MCPClient();
    await mcpClient.connect();
    console.log('MCP Client connected successfully');
  } catch (error) {
    console.error('Failed to initialize MCP Client:', error);
    process.exit(1);
  }
}

// Get current date and time in Turkish format
function getCurrentDateTime() {
  const now = new Date();
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${date} ${month} ${year}, ${day}, Saat ${hours}:${minutes}`;
}

// System prompt template
const SYSTEM_PROMPT = `# ROLE & IDENTITY
Sen Türkçe konuşan bir AI asistanısın. Hava durumu bilgisi sağlamak ve şehir görselleri göstermek için tool çağrıları yaparsın.
Dış API'lere doğrudan erişimin yok. Tüm dış veri erişimi yalnızca MCP server üzerinden expose edilen tool'lar aracılığıyla yapılmalı.
Kullanıcıyla yalnızca Türkçe konuşmalısın, doğal ve samimi bir ton kullanmalısın.

# CURRENT CONTEXT
Current Date and Time: {{CURRENT_DATE_TIME}}
Bu tarihi "yarın" (tomorrow) veya "hafta sonu" (weekend) gibi göreceli zaman referanslarını çözmek için kullan.

# ARCHITECTURAL AWARENESS (CRITICAL)
Çok katmanlı bir sistem içinde çalışıyorsun:
1. Frontend (UI): Pasif ve stateless.
2. Backend: Konuşma geçmişi ve kullanıcı girdisi sağlar.
3. MCP Server: Yalnızca tool şemalarını expose eder. Stateless ve reactive.
4. n8n: API çağrılarını execute eder, retry ve veri temizleme yapar.

Kullanıcıya asla MCP, n8n, API, JSON şema, fonksiyon çağırma veya sistem iç yapılarından bahsetme.

# AVAILABLE TOOLS (MCP TOOLS)
Aşağıdaki tool'lara erişimin var. Bunları yalnızca gerektiğinde çağırmalısın.

1. \`get_weather\`
   - Purpose: Belirli bir şehir için mevcut hava durumu bilgisini alır.
   - Input Schema: { "city": "string" }
   - Output Includes: Sıcaklık (°C), Hava durumu, Nem oranı.

2. \`get_city_image\`
   - Purpose: Unsplash'tan bağlamsal, atmosferik bir şehir görseli alır.
   - Input Schema: { "search_query": "string" }
   - ÖNEMLİ KURALLAR:
     - Asla sadece şehir adını kullanma.
     - Her zaman hava durumu sonucundan türetilen hava durumu, atmosfer ve ruh halini dahil et.
     - Sorgu MUTLAKA İngilizce olmalı.
     - Örnekler: "Istanbul rainy city street", "Ankara sunny skyline", "Izmir cloudy evening cityscape".

# DECISION & ORCHESTRATION RULES (VERY IMPORTANT)

## 1. Intent Detection
- Kullanıcının hava durumu bilgisi isteyip istemediğini belirle.
- Şehir adları kısaltılmış veya ima edilmiş olabilir. Doğru şehri anlamak için dil anlayışını kullan.

## 2. Tool Invocation Order (Chain of Thought)
- **Adım 1:** ÖNCE her zaman \`get_weather\` çağır.
- **Adım 2:** Hava durumu sonucunu analiz et (örn. Yağmur yağıyor mu? Gece mi?).
- **Adım 3:** **HER ZAMAN** şehir görseli al. Kullanıcı "sadece sıcaklık" demedikçe görsel göstermelisin.
- **Adım 4:** Hava durumu bilgisine göre açıklayıcı bir İngilizce sorgu oluştur ve \`get_city_image\` çağır.
  - Örnek: Yağmur varsa → "Istanbul rainy city street"
  - Örnek: Güneşli ise → "Istanbul sunny skyline"
  - Örnek: Bulutlu ise → "Istanbul cloudy cityscape"
  - Örnek: Gece ise → "Istanbul night city lights"

## 3. You Are the Decision Maker
- MCP tool'ları otomatik olarak chain etmez. Akışı SEN belirlersin.
- Kullanıcı açıkça "sadece sıcaklık" veya "görsel gerekmez" demedikçe, HER ZAMAN görsel göster.

# STATE & CONTEXT HANDLING
- Konuşma geçmişi sağlanır. "orası" (there) veya "yarın" (tomorrow) gibi ifadeleri çözmek için kullan.
- MCP tool'ları stateless. Her zaman tam çözülmüş parametreler gönder (örn. "orası" yerine "Istanbul").

# RESPONSE GENERATION RULES
- Tool çağrıları tamamlandıktan sonra, tek ve tam bir yanıt üret.
- Doğal Türkçe kullan.
- **CRITICAL - Image Formatting:** \`get_city_image\` tool'u çağırıldığında ve bir image_url döndüğünde, MUTLAKA Markdown syntax kullanarak görseli ekle: \`![Şehir Görseli](image_url)\`
- Görsel her zaman hava durumu açıklamasından SONRA gelmeli.
- Örnek Format:
  \`\`\`
  İstanbul'da bugün hava 25°C ve yağmurlu. Şemsiyeni almayı unutma! ☔
  
  ![İstanbul Görseli](https://images.unsplash.com/...)
  \`\`\`
- Eğer görsel URL'i varsa ama eklemezsen, bu bir hatadır. Her zaman görsel URL'i Markdown formatında ekle.

# ERROR HANDLING
- Şehir belirsizse: Nazikçe açıklama iste.
- Hava durumu verisi başarısız olursa: Özür dile ve şehir adını kontrol etmesini öner.
- Asla veri uydurma.`;

// Replace placeholder in system prompt
function getSystemPrompt() {
  const currentDateTime = getCurrentDateTime();
  return SYSTEM_PROMPT.replace('{{CURRENT_DATE_TIME}}', currentDateTime);
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hava Durumu Backend API',
    status: 'ok',
    endpoints: {
      health: '/health',
      chat: '/api/chat',
      weatherData: '/api/weather-data/:city',
      weatherForecast: '/api/weather-forecast/:city'
    },
    mcpConnected: mcpClient !== null && mcpClient.isConnected() 
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    mcpConnected: mcpClient !== null && mcpClient.isConnected() 
  });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    console.log('Chat endpoint called');
    console.log('Request body:', req.body);
    
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      console.log('Error: Message is required');
      return res.status(400).json({ error: 'Message is required' });
    }
    
    console.log(`Processing message: "${message}" for session: ${sessionId}`);
    
    // Get or create conversation history for this session
    if (!conversationHistory.has(sessionId)) {
      conversationHistory.set(sessionId, []);
    }
    const history = conversationHistory.get(sessionId);
    
    // Add user message to history
    history.push({ role: 'user', content: message });
    
    // Get system prompt with current date/time
    const systemPrompt = getSystemPrompt();
    
    // Initialize LLM Handler if needed
    console.log('Creating LLM handler...');
    const llmHandler = new LLMHandler(mcpClient, systemPrompt);
    console.log('LLM handler created');
    
    // Process message through LLM with MCP tools
    console.log('Calling LLM handler.processMessage...');
    const response = await llmHandler.processMessage(message, history);
    console.log('LLM handler.processMessage completed');
    console.log(`Response content length: ${response.content?.length || 0} characters`);
    
    // Add assistant response to history
    history.push({ role: 'assistant', content: response.content });
    
    // Keep history size manageable (last 20 messages)
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
    
    console.log('Sending response to frontend...');
    res.json({
      content: response.content,
      toolCalls: response.toolCalls || []
    });
    console.log('Response sent to frontend');
    
  } catch (error) {
    console.error('Chat error:', error);
    console.error('Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Internal server error';
    
    // Check for common errors
    if (error.message && error.message.includes('API_KEY')) {
      errorMessage = 'API key is missing or invalid. Please check your .env file.';
    } else if (error.message && (error.message.includes('quota') || error.message.includes('insufficient'))) {
      errorMessage = 'API quota exceeded. Please add credits to your API account.';
    } else if (error.message && error.message.includes('invalid')) {
      errorMessage = 'Invalid API key. Please check your .env file.';
    }
    
    res.status(500).json({ 
      error: 'Internal server error', 
      message: errorMessage 
    });
  }
});

// Weather data endpoint (structured data for frontend)
app.get('/api/weather-data/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    if (!mcpClient || !mcpClient.isConnected()) {
      console.error('MCP Client not connected when calling weather-data endpoint');
      return res.status(503).json({ error: 'MCP Client not connected' });
    }
    
    console.log(`Fetching weather data for city: ${city}`);
    
    // Call get_weather tool via MCP
    const result = await mcpClient.callTool('get_weather', { city });
    
    console.log('Weather data result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('Weather tool returned error:', result.error);
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Weather data error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Weather forecast endpoint (5-day forecast)
app.get('/api/weather-forecast/:city', async (req, res) => {
  try {
    const { city } = req.params;
    
    if (!city) {
      return res.status(400).json({ error: 'City parameter is required' });
    }
    
    if (!mcpClient || !mcpClient.isConnected()) {
      console.error('MCP Client not connected when calling weather-forecast endpoint');
      return res.status(503).json({ error: 'MCP Client not connected' });
    }
    
    console.log(`Fetching weather forecast for city: ${city}`);
    
    // Call get_weather_forecast tool via MCP
    const result = await mcpClient.callTool('get_weather_forecast', { city });
    
    console.log('Forecast result:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('Forecast tool returned error:', result.error);
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
    
  } catch (error) {
    console.error('Weather forecast error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
});

// Start server
async function startServer() {
  await initializeMCP();
  
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    if (mcpClient) {
      await mcpClient.disconnect();
    }
    process.exit(0);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
