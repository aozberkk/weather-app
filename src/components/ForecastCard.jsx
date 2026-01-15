import React from 'react';
import { WiDaySunny, WiRain, WiCloudy, WiDayCloudy } from 'react-icons/wi';
import './ForecastCard.css';

function getWeatherIcon(condition) {
  const conditionLower = condition?.toLowerCase() || '';
  
  if (conditionLower.includes('yağmur') || conditionLower.includes('rain')) {
    return <WiRain className="forecast-icon rain" />;
  } else if (conditionLower.includes('bulutlu') || conditionLower.includes('cloud')) {
    return <WiCloudy className="forecast-icon cloud" />;
  } else if (conditionLower.includes('açık') || conditionLower.includes('clear')) {
    return <WiDaySunny className="forecast-icon sun" />;
  } else {
    return <WiDayCloudy className="forecast-icon cloud" />;
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  // Eğer bugün ise "Bugün" göster
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return 'Bugün';
  }
  
  return `${dayName} ${day} ${month}`;
}

function ForecastCard({ forecast }) {
  const { date, temp_min, temp_max, condition } = forecast;

  return (
    <div className="forecast-card">
      <div className="forecast-date">{formatDate(date)}</div>
      {getWeatherIcon(condition)}
      <div className="forecast-temps">
        {temp_max !== undefined && (
          <span className="temp-max">{Math.round(temp_max)}°</span>
        )}
        {temp_min !== undefined && (
          <span className="temp-min">{Math.round(temp_min)}°</span>
        )}
      </div>
      {condition && (
        <div className="forecast-condition">{condition}</div>
      )}
    </div>
  );
}

export default ForecastCard;

