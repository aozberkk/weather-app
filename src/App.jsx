import React, { useState, useEffect } from 'react';
import ChatPanel from './components/ChatPanel';
import WeatherPanel from './components/WeatherPanel';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  
  // Weather panel state
  const [currentCity, setCurrentCity] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [cityImageUrl, setCityImageUrl] = useState(null);

  // Extract city name from messages and fetch weather data
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant') {
      // Extract city name from message - improved regex to catch more cases
      // Check for "İstanbul", "Istanbul", "istanbul" etc. (case insensitive)
      const cityMatch = lastMessage.content.match(/\b(İstanbul|Istanbul|Ankara|İzmir|Izmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Sanliurfa|Kocaeli|Mersin|Diyarbakır|Diyarbakir|Hatay|Manisa|Kayseri|Trabzon|Samsun|Eskişehir|Eskisehir|Malatya|Erzurum|Van|Batman|Elazığ|Elazig|Denizli|Şanlıurfa|Sivas|Kahramanmaraş|Kahramanmaras|Mardin|Muğla|Mugla|Aydın|Aydin|Tekirdağ|Tekirdag|Sakarya|Balıkesir|Balikesir|Tunceli|Çanakkale|Canakkale|Afyonkarahisar|Ağrı|Agri|Amasya|Artvin|Bilecik|Bingöl|Bingol|Bitlis|Bolu|Burdur|Çankırı|Cankiri|Çorum|Corum|Edirne|Erzincan|Giresun|Gümüşhane|Gumushane|Hakkari|Iğdır|Igdir|Isparta|Kars|Kastamonu|Kırıkkale|Kirikkale|Kırklareli|Kirklareli|Kilis|Nevşehir|Nevsehir|Niğde|Nigde|Ordu|Osmaniye|Rize|Siirt|Sinop|Şırnak|Sirnak|Tokat|Uşak|Usak|Yalova|Yozgat|Zonguldak)\b/i);
      
      if (cityMatch) {
        let city = cityMatch[1];
        // Normalize city names (Istanbul -> İstanbul for API)
        const cityMap = {
          'Istanbul': 'İstanbul',
          'Izmir': 'İzmir',
          'Sanliurfa': 'Şanlıurfa',
          'Diyarbakir': 'Diyarbakır',
          'Eskisehir': 'Eskişehir',
          'Elazig': 'Elazığ',
          'Kahramanmaras': 'Kahramanmaraş',
          'Mugla': 'Muğla',
          'Aydin': 'Aydın',
          'Tekirdag': 'Tekirdağ',
          'Balikesir': 'Balıkesir',
          'Canakkale': 'Çanakkale',
          'Agri': 'Ağrı',
          'Bingol': 'Bingöl',
          'Cankiri': 'Çankırı',
          'Corum': 'Çorum',
          'Gumushane': 'Gümüşhane',
          'Igdir': 'Iğdır',
          'Kirikkale': 'Kırıkkale',
          'Kirklareli': 'Kırklareli',
          'Nevsehir': 'Nevşehir',
          'Nigde': 'Niğde',
          'Sirnak': 'Şırnak',
          'Usak': 'Uşak'
        };
        city = cityMap[city] || city;
        
        if (city !== currentCity) {
          console.log('City detected from message:', city);
          setCurrentCity(city);
          fetchWeatherData(city);
        }
      }
      
      // Extract image URL from markdown
      const imageMatch = lastMessage.content.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
      if (imageMatch) {
        console.log('Image URL extracted:', imageMatch[1]);
        setCityImageUrl(imageMatch[1]);
      }
    }
  }, [messages]);

  const fetchWeatherData = async (city) => {
    if (!city) {
      console.log('fetchWeatherData: No city provided');
      return;
    }
    
    console.log('fetchWeatherData: Fetching data for', city);
    
    try {
      // Fetch current weather
      console.log('fetchWeatherData: Fetching current weather...');
      const weatherResponse = await fetch(`/api/weather-data/${encodeURIComponent(city)}`);
      console.log('fetchWeatherData: Weather response status:', weatherResponse.status);
      
      if (weatherResponse.ok) {
        const weather = await weatherResponse.json();
        console.log('fetchWeatherData: Weather data received:', weather);
        if (weather.error) {
          console.error('Weather API error:', weather.error);
        } else {
          setWeatherData(weather);
          console.log('fetchWeatherData: Weather data set');
        }
      } else {
        const errorText = await weatherResponse.text();
        console.error('Weather API response not ok:', weatherResponse.status, errorText);
      }

      // Fetch forecast
      console.log('fetchWeatherData: Fetching forecast...');
      const forecastResponse = await fetch(`/api/weather-forecast/${encodeURIComponent(city)}`);
      console.log('fetchWeatherData: Forecast response status:', forecastResponse.status);
      
      if (forecastResponse.ok) {
        const forecast = await forecastResponse.json();
        console.log('fetchWeatherData: Forecast data received:', forecast);
        if (forecast.error) {
          console.error('Forecast API error:', forecast.error);
        } else {
          setForecastData(forecast);
          console.log('fetchWeatherData: Forecast data set');
        }
      } else {
        const errorText = await forecastResponse.text();
        console.error('Forecast API response not ok:', forecastResponse.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to UI
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    // Try to extract city from user message directly
    const cityMatch = userMessage.match(/\b(İstanbul|Istanbul|Ankara|İzmir|Izmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şanlıurfa|Sanliurfa|Kocaeli|Mersin|Diyarbakır|Diyarbakir|Hatay|Manisa|Kayseri|Trabzon|Samsun|Eskişehir|Eskisehir|Malatya|Erzurum|Van|Batman|Elazığ|Elazig|Denizli|Şanlıurfa|Sivas|Kahramanmaraş|Kahramanmaras|Mardin|Muğla|Mugla|Aydın|Aydin|Tekirdağ|Tekirdag|Sakarya|Balıkesir|Balikesir|Tunceli|Çanakkale|Canakkale|Afyonkarahisar|Ağrı|Agri|Amasya|Artvin|Bilecik|Bingöl|Bingol|Bitlis|Bolu|Burdur|Çankırı|Cankiri|Çorum|Corum|Edirne|Erzincan|Giresun|Gümüşhane|Gumushane|Hakkari|Iğdır|Igdir|Isparta|Kars|Kastamonu|Kırıkkale|Kirikkale|Kırklareli|Kirklareli|Kilis|Nevşehir|Nevsehir|Niğde|Nigde|Ordu|Osmaniye|Rize|Siirt|Sinop|Şırnak|Sirnak|Tokat|Uşak|Usak|Yalova|Yozgat|Zonguldak)\b/i);
    if (cityMatch) {
      let city = cityMatch[1];
      const cityMap = {
        'Istanbul': 'İstanbul',
        'Izmir': 'İzmir',
        'Sanliurfa': 'Şanlıurfa',
        'Diyarbakir': 'Diyarbakır',
        'Eskisehir': 'Eskişehir',
        'Elazig': 'Elazığ',
        'Kahramanmaras': 'Kahramanmaraş',
        'Mugla': 'Muğla',
        'Aydin': 'Aydın',
        'Tekirdag': 'Tekirdağ',
        'Balikesir': 'Balıkesir',
        'Canakkale': 'Çanakkale',
        'Agri': 'Ağrı',
        'Bingol': 'Bingöl',
        'Cankiri': 'Çankırı',
        'Corum': 'Çorum',
        'Gumushane': 'Gümüşhane',
        'Igdir': 'Iğdır',
        'Kirikkale': 'Kırıkkale',
        'Kirklareli': 'Kırklareli',
        'Nevsehir': 'Nevşehir',
        'Nigde': 'Niğde',
        'Sirnak': 'Şırnak',
        'Usak': 'Uşak'
      };
      city = cityMap[city] || city;
      if (city !== currentCity) {
        console.log('City detected from user message:', city);
        setCurrentCity(city);
        // Don't fetch here, wait for assistant response
      }
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();
      
      // Add assistant response to UI
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.content 
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCityDetected = (city) => {
    if (city && city !== currentCity) {
      setCurrentCity(city);
      fetchWeatherData(city);
    }
  };

  const handleCitySelect = (city) => {
    setCurrentCity(city);
    fetchWeatherData(city);
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🌤️ Hava Durumu Asistanı</h1>
        <p>Şehir adını yazın, hava durumunu öğrenin!</p>
      </div>
      
      <div className="app-split-layout">
        <ChatPanel
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          onSubmit={handleSubmit}
          onCityDetected={handleCityDetected}
        />
        
        <WeatherPanel
          city={currentCity}
          weatherData={weatherData}
          forecastData={forecastData}
          cityImageUrl={cityImageUrl}
          onCitySelect={handleCitySelect}
        />
      </div>
    </div>
  );
}

export default App;
