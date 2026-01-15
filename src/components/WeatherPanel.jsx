import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import CurrentWeather from "./CurrentWeather";
import WeatherForecast from "./WeatherForecast";
import FavoriteCities from "./FavoriteCities";
import WeatherCharts from "./WeatherCharts";
import WeatherAlerts from "./WeatherAlerts";
import "./WeatherPanel.css";

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function WeatherPanel({
  city,
  weatherData,
  forecastData,
  cityImageUrl,
  onCitySelect,
}) {
  // Set background image when city image URL is available
  useEffect(() => {
    if (cityImageUrl) {
      const panel = document.querySelector(".weather-panel");
      if (panel) {
        panel.style.backgroundImage = `url(${cityImageUrl})`;
        panel.style.backgroundSize = "cover";
        panel.style.backgroundPosition = "center";
      }
    }
  }, [cityImageUrl]);

  if (!city || !weatherData) {
    return (
      <div className="weather-panel">
        <div className="weather-panel-empty">
          <p>🌤️ Hava durumu bilgisi için bir şehir seçin</p>
        </div>
      </div>
    );
  }

  const { lat, lon } = weatherData;

  return (
    <div className="weather-panel">
      <div className="weather-panel-overlay"></div>
      <div className="weather-panel-content">
        {/* Map Section */}
        {lat && lon && (
          <div className="weather-map-container">
            <MapContainer
              center={[lat, lon]}
              zoom={13}
              style={{
                height: "300px",
                width: "100%",
                borderRadius: "12px",
                zIndex: 1,
              }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[lat, lon]}>
                <Popup>
                  <strong>{city}</strong>
                  <br />
                  {weatherData.temperature &&
                    `${Math.round(weatherData.temperature)}°C`}
                  {weatherData.condition && ` - ${weatherData.condition}`}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Weather Alerts */}
        <WeatherAlerts weatherData={weatherData} forecastData={forecastData} />

        {/* Current Weather Card */}
        <CurrentWeather weatherData={weatherData} city={city} />

        {/* Favorite Cities */}
        <FavoriteCities currentCity={city} onCitySelect={onCitySelect} />

        {/* Weather Charts */}
        <WeatherCharts weatherData={weatherData} forecastData={forecastData} />

        {/* Forecast Section */}
        {forecastData && forecastData.forecasts && (
          <WeatherForecast forecastData={forecastData} />
        )}
      </div>
    </div>
  );
}

export default WeatherPanel;
