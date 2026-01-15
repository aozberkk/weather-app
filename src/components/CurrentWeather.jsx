import React from "react";
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiDayCloudy,
  WiStrongWind,
  WiHumidity,
} from "react-icons/wi";
import { FaTemperatureHigh, FaTemperatureLow } from "react-icons/fa";
import "./CurrentWeather.css";

function getWeatherIcon(condition) {
  const conditionLower = condition?.toLowerCase() || "";

  if (conditionLower.includes("yağmur") || conditionLower.includes("rain")) {
    return <WiRain className="weather-icon rain" />;
  } else if (
    conditionLower.includes("bulutlu") ||
    conditionLower.includes("cloud")
  ) {
    return <WiCloudy className="weather-icon cloud" />;
  } else if (
    conditionLower.includes("açık") ||
    conditionLower.includes("clear")
  ) {
    return <WiDaySunny className="weather-icon sun" />;
  } else {
    return <WiDayCloudy className="weather-icon cloud" />;
  }
}

function CurrentWeather({ weatherData, city }) {
  const { temperature, condition, humidity, wind_speed, feels_like, pressure } =
    weatherData;

  return (
    <div className="current-weather-card">
      <div className="current-weather-header">
        <h2>{city}</h2>
        {getWeatherIcon(condition)}
      </div>

      <div className="current-weather-main">
        <div className="temperature-display">
          {temperature !== undefined && (
            <>
              <span className="temperature-value">
                {Math.round(temperature)}
              </span>
              <span className="temperature-unit">°C</span>
            </>
          )}
        </div>
        {condition && <p className="weather-condition">{condition}</p>}
      </div>

      <div className="current-weather-details">
        {feels_like !== undefined && (
          <div className="weather-detail-item">
            <FaTemperatureHigh className="detail-icon" />
            <span>Hissedilen: {Math.round(feels_like)}°C</span>
          </div>
        )}

        {humidity !== undefined && (
          <div className="weather-detail-item">
            <WiHumidity className="detail-icon" />
            <span>Nem: %{humidity}</span>
          </div>
        )}

        {wind_speed !== undefined && (
          <div className="weather-detail-item">
            <WiStrongWind className="detail-icon" />
            <span>Rüzgar: {wind_speed} m/s</span>
          </div>
        )}

        {pressure !== undefined && (
          <div className="weather-detail-item">
            <WiHumidity className="detail-icon" />
            <span>Basınç: {pressure} hPa</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default CurrentWeather;
