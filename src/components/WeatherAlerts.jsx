import React from 'react';
import { WiDaySunny, WiRain, WiSnow, WiStrongWind, WiThermometer } from 'react-icons/wi';
import './WeatherAlerts.css';

function WeatherAlerts({ weatherData, forecastData }) {
  if (!weatherData) return null;

  const alerts = [];
  const { temperature, feels_like, wind_speed, condition, humidity } = weatherData;

  // Temperature alerts
  if (temperature !== undefined) {
    if (temperature >= 35) {
      alerts.push({
        type: 'hot',
        icon: <WiThermometer />,
        message: 'Yüksek Sıcaklık Uyarısı! Sıcaklık 35°C\'nin üzerinde. Bol su için ve güneşten korunun.',
        severity: 'high'
      });
    } else if (temperature <= 0) {
      alerts.push({
        type: 'cold',
        icon: <WiSnow />,
        message: 'Düşük Sıcaklık Uyarısı! Sıcaklık 0°C\'nin altında. Kalın giysiler giyin.',
        severity: 'high'
      });
    } else if (temperature >= 30) {
      alerts.push({
        type: 'warm',
        icon: <WiDaySunny />,
        message: 'Sıcak Hava! Sıcaklık 30°C\'nin üzerinde. Hafif giysiler tercih edin.',
        severity: 'medium'
      });
    }
  }

  // Feels like temperature alerts
  if (feels_like !== undefined && feels_like >= 40) {
    alerts.push({
      type: 'feels-hot',
      icon: <WiThermometer />,
      message: `Hissedilen Sıcaklık Uyarısı! Hissedilen sıcaklık ${Math.round(feels_like)}°C. Dışarıda dikkatli olun.`,
      severity: 'high'
    });
  }

  // Wind speed alerts
  if (wind_speed !== undefined) {
    if (wind_speed >= 15) {
      alerts.push({
        type: 'wind',
        icon: <WiStrongWind />,
        message: 'Güçlü Rüzgar Uyarısı! Rüzgar hızı yüksek. Dışarıda dikkatli olun.',
        severity: 'high'
      });
    } else if (wind_speed >= 10) {
      alerts.push({
        type: 'wind',
        icon: <WiStrongWind />,
        message: 'Orta Şiddetli Rüzgar. Rüzgar hızı artmış durumda.',
        severity: 'medium'
      });
    }
  }

  // Weather condition alerts
  if (condition) {
    const conditionLower = condition.toLowerCase();
    if (conditionLower.includes('yağmur') || conditionLower.includes('rain')) {
      alerts.push({
        type: 'rain',
        icon: <WiRain />,
        message: 'Yağmur Bekleniyor! Şemsiye almayı unutmayın.',
        severity: 'medium'
      });
    }
    if (conditionLower.includes('kar') || conditionLower.includes('snow')) {
      alerts.push({
        type: 'snow',
        icon: <WiSnow />,
        message: 'Kar Yağışı! Yollar kaygan olabilir, dikkatli olun.',
        severity: 'high'
      });
    }
  }

  // Humidity alerts
  if (humidity !== undefined) {
    if (humidity >= 80) {
      alerts.push({
        type: 'humidity',
        icon: <WiRain />,
        message: 'Yüksek Nem Oranı! Nem oranı %80\'in üzerinde. Hava çok nemli.',
        severity: 'medium'
      });
    }
  }

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="weather-alerts">
      <h3 className="alerts-title">⚠️ Hava Uyarıları</h3>
      <div className="alerts-list">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className={`alert-item alert-${alert.severity} alert-${alert.type}`}
          >
            <div className="alert-icon">{alert.icon}</div>
            <div className="alert-message">{alert.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WeatherAlerts;

