import React from 'react';
import ForecastCard from './ForecastCard';
import './WeatherForecast.css';

function WeatherForecast({ forecastData }) {
  const { forecasts } = forecastData;

  if (!forecasts || forecasts.length === 0) {
    return null;
  }

  return (
    <div className="weather-forecast">
      <h3 className="forecast-title">7 Günlük Tahmin</h3>
      <div className="forecast-cards">
        {forecasts.map((forecast, index) => (
          <ForecastCard key={index} forecast={forecast} />
        ))}
      </div>
    </div>
  );
}

export default WeatherForecast;

