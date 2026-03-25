// ========================
// Weather App — script.js
// ========================

// ⚠️ STEP 1: Yahan apna OpenWeatherMap API Key daalo
// openweathermap.org pe free account banao → API Keys section mein milegi
const API_KEY = "85f08c0cb451b9525e822a8f41ccf9f0";

// Base URL (change nahi karna)
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// ========================
// Main Function — Weather Fetch
// ========================
async function fetchWeather() {
  const cityInput = document.getElementById("cityInput");
  const city = cityInput.value.trim();

  // Empty check
  if (!city) {
    showError("Koi city naam toh likhein pehle!");
    return;
  }

  // UI State: Loading shuru
  setLoading(true);
  hideError();
  hideCard();

  try {
    // ========================
    // API Call
    // ?q=city name
    // &appid=API key
    // &units=metric → Celsius
    // &lang=en → English descriptions
    // ========================
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=en`;

    const response = await fetch(url);

    // API error handle karo (e.g. city nahi mili, invalid key)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`"${city}" city nahi mili. Sahi spelling check karein.`);
      } else if (response.status === 401) {
        throw new Error("API Key galat hai. openweathermap.org pe check karein.");
      } else {
        throw new Error(`Kuch gadbad ho gayi (Error ${response.status}). Dobara try karein.`);
      }
    }

    const data = await response.json();

    // Data UI mein dikhao
    displayWeather(data);

  } catch (error) {
    showError(error.message);
  } finally {
    // Loading band karo chahe success ho ya fail
    setLoading(false);
  }
}

// ========================
// Weather Data Display Function
// API response se data nikaalke UI mein lagao
// ========================
function displayWeather(data) {
  // City aur Country
  document.getElementById("cityName").textContent = data.name;
  document.getElementById("countryBadge").textContent = data.sys.country;

  // Temperature (Math.round se clean integer)
  document.getElementById("temp").textContent = Math.round(data.main.temp);
  document.getElementById("feelsLike").textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;

  // Weather description aur icon
  const weatherMain = data.weather[0].main;
  const weatherDesc = data.weather[0].description;
  document.getElementById("desc").textContent = weatherDesc;
  document.getElementById("wIcon").textContent = getWeatherIcon(weatherMain);

  // Stats
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed.toFixed(1);
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("visibility").textContent = data.visibility
    ? (data.visibility / 1000).toFixed(1)
    : "N/A";

  // Sunrise & Sunset (Unix timestamp → readable time)
  document.getElementById("sunrise").textContent = formatTime(data.sys.sunrise, data.timezone);
  document.getElementById("sunset").textContent = formatTime(data.sys.sunset, data.timezone);

  // Card dikhao
  showCard();
}

// ========================
// Helper: Unix Timestamp → HH:MM format
// timezone = city ka UTC offset (seconds mein)
// ========================
function formatTime(unixTime, timezoneOffset) {
  // UTC time + city timezone offset
  const date = new Date((unixTime + timezoneOffset) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, "0");
  const minutes = date.getUTCMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

// ========================
// Helper: Weather condition → Emoji icon
// OpenWeatherMap ke "main" field pe based
// ========================
function getWeatherIcon(condition) {
  const icons = {
    Clear: "☀️",
    Clouds: "☁️",
    Rain: "🌧",
    Drizzle: "🌦",
    Thunderstorm: "⛈",
    Snow: "❄️",
    Mist: "🌫",
    Fog: "🌫",
    Haze: "🌫",
    Dust: "🌪",
    Sand: "🌪",
    Smoke: "💨",
    Tornado: "🌪",
  };
  return icons[condition] || "🌤";
}

// ========================
// UI Helper Functions
// ========================
function setLoading(isLoading) {
  const loader = document.getElementById("loader");
  const btn = document.getElementById("searchBtn");
  loader.style.display = isLoading ? "block" : "none";
  btn.disabled = isLoading;
  btn.textContent = isLoading ? "Loading..." : "Search";
}

function showError(message) {
  const errorBox = document.getElementById("errorBox");
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function hideError() {
  document.getElementById("errorBox").style.display = "none";
}

function showCard() {
  document.getElementById("weatherCard").style.display = "block";
}

function hideCard() {
  document.getElementById("weatherCard").style.display = "none";
}

// ========================
// Enter Key Support
// ========================
document.getElementById("cityInput").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    fetchWeather();
  }
});
