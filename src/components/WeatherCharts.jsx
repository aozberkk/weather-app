import React from 'react';
import './WeatherCharts.css';

function WeatherCharts({ weatherData, forecastData }) {
  if (!weatherData || !forecastData || !forecastData.forecasts) {
    return null;
  }

  const { humidity } = weatherData;
  const forecasts = forecastData.forecasts;

  // Prepare temperature data for chart
  const tempData = forecasts.map(f => ({
    date: new Date(f.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    min: f.temp_min,
    max: f.temp_max,
    avg: f.temp_avg || (f.temp_min + f.temp_max) / 2
  }));

  // Prepare humidity data for chart
  const humidityData = forecasts.map(f => ({
    date: new Date(f.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
    humidity: f.humidity || humidity
  }));

  // Calculate max values for scaling
  const maxTemp = Math.max(...tempData.map(d => d.max));
  const minTemp = Math.min(...tempData.map(d => d.min));
  const tempRange = maxTemp - minTemp || 1;

  const maxHumidity = Math.max(...humidityData.map(d => d.humidity), humidity || 0);
  const minHumidity = Math.min(...humidityData.map(d => d.humidity), humidity || 0);
  const humidityRange = maxHumidity - minHumidity || 1;

  return (
    <div className="weather-charts">
      <h3 className="charts-title">Görsel Grafikler</h3>
      
      {/* Temperature Chart */}
      <div className="chart-container">
        <h4 className="chart-title">Sıcaklık Trendi (°C)</h4>
        <div className="chart">
          {tempData.map((data, index) => {
            const maxHeight = ((data.max - minTemp) / tempRange) * 100;
            const minHeight = ((data.min - minTemp) / tempRange) * 100;
            const avgHeight = ((data.avg - minTemp) / tempRange) * 100;
            
            return (
              <div key={index} className="chart-bar-group">
                <div className="chart-bars">
                  <div
                    className="chart-bar max-temp"
                    style={{ height: `${maxHeight}%` }}
                    title={`Max: ${Math.round(data.max)}°C`}
                  />
                  <div
                    className="chart-bar avg-temp"
                    style={{ height: `${avgHeight}%` }}
                    title={`Ort: ${Math.round(data.avg)}°C`}
                  />
                  <div
                    className="chart-bar min-temp"
                    style={{ height: `${minHeight}%` }}
                    title={`Min: ${Math.round(data.min)}°C`}
                  />
                </div>
                <div className="chart-label">{data.date}</div>
                <div className="chart-values">
                  <span className="temp-max">{Math.round(data.max)}°</span>
                  <span className="temp-min">{Math.round(data.min)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Humidity Chart */}
      <div className="chart-container">
        <h4 className="chart-title">Nem Oranı (%)</h4>
        <div className="chart humidity-chart">
          {humidityData.map((data, index) => {
            const height = ((data.humidity - minHumidity) / humidityRange) * 100;
            
            return (
              <div key={index} className="chart-bar-group">
                <div className="chart-bars">
                  <div
                    className="chart-bar humidity-bar"
                    style={{ height: `${height}%` }}
                    title={`Nem: ${data.humidity}%`}
                  />
                </div>
                <div className="chart-label">{data.date}</div>
                <div className="chart-value">{data.humidity}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default WeatherCharts;

