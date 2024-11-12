import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [city, setCity] = useState("");
  const [currentWeather, setCurrentWeather] = useState(null);
  const [hourlyWeather, setHourlyWeather] = useState(null);
  const [climateData, setClimateData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState("");
  const geocodeAPI = "https://geocoding-api.open-meteo.com/v1/search"; // Open Meteo Geocoding API

  const fetchWeatherByCity = async (city) => {
    setLoading(true);
    setError(null);
    setActiveSection("");
    try {
      // Get latitude and longitude for the city
      const geoResponse = await axios.get(geocodeAPI, {
        params: {
          name: city,
        },
      });
      const { latitude, longitude } = geoResponse.data.results[0];

      // Get current weather data
      const weatherResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude,
          longitude,
          current_weather: true,
          air_quality: true, // Request air quality data here
          temperature_unit: "celsius",
          windspeed_unit: "kmh",
          humidity_unit: "percent",
        },
      });

      // Set current weather
      setCurrentWeather(weatherResponse.data.current_weather);

      // Get hourly weather data for today's date only
      const today = new Date().toISOString().split("T")[0]; // Get today's date
      const hourlyWeatherResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude,
          longitude,
          hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m",
          temperature_unit: "celsius",
          windspeed_unit: "kmh",
          humidity_unit: "percent",
          start_date: today,  // Set today's date as start date
          end_date: today,    // Set today's date as end date
        },
      });
      setHourlyWeather(hourlyWeatherResponse.data.hourly);

      // Get climate change data (daily temperature)
      const climateDataResponse = await axios.get("https://api.open-meteo.com/v1/forecast", {
        params: {
          latitude,
          longitude,
          daily: "temperature_2m_max", // Request max temperature for the day
          temperature_unit: "celsius",
        },
      });

      setClimateData(climateDataResponse.data.daily);

    } catch (err) {
      setError("Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Weather Now</h1>
      </header>

      <div className="weather-container">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter a city"
          className="city-input"
        />
        <button onClick={() => fetchWeatherByCity(city)} className="weather-btn">
          Get Weather
        </button>

        {loading && <p className="loading">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {currentWeather && (
          <div className="weather-info-card">
            <h2>Current Weather</h2>
            <p>
              <strong>Time:</strong> {currentWeather.time}
            </p>
            <p>
              <strong>Temperature:</strong> {currentWeather.temperature}°C
            </p>
            <p>
              <strong>Wind Speed:</strong> {currentWeather.windspeed} km/h
            </p>
          </div>
        )}

        <div className="button-container">
          {currentWeather && (
            <>
              <button
                onClick={() => setActiveSection(activeSection === "hourly" ? "" : "hourly")}
                className="toggle-btn"
              >
                {activeSection === "hourly" ? "Hide Hourly" : "Show Hourly"}
              </button>
              <button
                onClick={() => setActiveSection(activeSection === "climateChange" ? "" : "climateChange")}
                className="toggle-btn"
              >
                {activeSection === "climateChange" ? "Hide Climate Change Data" : "Show Climate Change Data"}
              </button>
            </>
          )}
        </div>

        {/* Display hourly weather data for today */}
        {activeSection === "hourly" && hourlyWeather && (
          <div className="hourly-weather-card">
            <h2>Hourly Weather</h2>
            <ul>
              {hourlyWeather.time.map((time, index) => (
                <li key={index}>
                  <strong>{time}:</strong> Temp: {hourlyWeather.temperature_2m[index]}°C, Humidity:{" "}
                  {hourlyWeather.relative_humidity_2m[index]}%, Wind Speed:{" "}
                  {hourlyWeather.wind_speed_10m[index]} km/h
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Display climate change data */}
        {activeSection === "climateChange" && climateData && (
          <div className="climate-change-card">
            <h2>Climate Change Projections</h2>
            <ul>
              {climateData.time.map((date, index) => (
                <li key={index}>
                  <strong>{date}:</strong> Max Temp: {climateData.temperature_2m_max[index]}°C
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
