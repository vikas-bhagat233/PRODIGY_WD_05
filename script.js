// script.js
const apiKey = '2355bd5796257f13506a2192f5450261';
const weatherBox = document.getElementById('weather');
const forecastBox = document.getElementById('forecast');
const cityInput = document.getElementById('cityInput');
const cityList = document.getElementById('city-list');
const app = document.getElementById('app');

// Set initial background
app.style.backgroundImage = 'url(https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0)';
app.style.backgroundSize = 'cover';
app.style.backgroundPosition = 'center';
app.style.backgroundAttachment = 'fixed';

// Update time every second
setInterval(() => {
  document.getElementById('datetime').innerText = new Date().toLocaleString();
}, 1000);

// Theme toggle functionality
document.getElementById("themeToggle").onclick = () => {
  const isLight = app.classList.toggle("light");
  const icon = document.querySelector("#themeToggle i");
  icon.className = isLight ? "fas fa-sun" : "fas fa-moon";
};

// Autocomplete functionality
cityInput.addEventListener("input", async () => {
  const val = cityInput.value.trim();
  if (val.length < 3) {
    cityList.innerHTML = '';
    return;
  }

  try {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${val}&limit=5&appid=${apiKey}`);
    const data = await response.json();

    cityList.innerHTML = data.map(city => 
      `<option value="${city.name}, ${city.country}">${city.name}, ${city.state ? city.state + ', ' : ''}${city.country}</option>`
    ).join('');
  } catch (error) {
    console.error("Autocomplete error:", error);
  }
});

cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") getWeatherByCity();
});

function getWeatherByCity() {
  const city = cityInput.value.trim();
  if (!city) return alert("Please enter a city name");
  fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
}

function getWeatherByLocation() {
  if (!navigator.geolocation) return alert("Geolocation not supported");

  weatherBox.innerHTML = "<p>Detecting your location...</p>";

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetchWeatherData(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`);
  }, err => {
    weatherBox.innerHTML = `<p style="color:red;">Location access denied: ${err.message}</p>`;
  });
}

function fetchWeatherData(url) {
  weatherBox.innerHTML = "<p>Loading weather data...</p>";
  forecastBox.innerHTML = "";

  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error("City not found or network error");
      return res.json();
    })
    .then(data => {
      const icon = data.weather[0].icon;
      const desc = data.weather[0].main;
      app.style.transition = 'background-image 1s ease';
      app.style.backgroundImage = `url(${getBackground(desc)})`;

      weatherBox.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${desc}" />
        <h3>${desc}</h3>
        <p><strong>Temperature:</strong> ${Math.round(data.main.temp)}°C (Feels like ${Math.round(data.main.feels_like)}°C)</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind:</strong> ${data.wind.speed} m/s</p>
        <p><strong>Pressure:</strong> ${data.main.pressure} hPa</p>
      `;

      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(err => {
      weatherBox.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
    });
}

function getForecast(lat, lon) {
  fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
      const filtered = data.list.filter((item, i) => i % 8 === 0).slice(0, 5);
      forecastBox.innerHTML = filtered.map((day, index) => {
        const date = new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' });
        const icon = day.weather[0].icon;
        return `
          <div class="forecast-item" onclick="showDayForecast(${index})" data-index="${index}">
            <div>${date}</div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${day.weather[0].description}" />
            <div>${Math.round(day.main.temp)}°C</div>
          </div>
        `;
      }).join('');

      window.dayData = data.list;
    })
    .catch(err => {
      forecastBox.innerHTML = `<p style="color:red;">Could not load forecast</p>`;
    });
}

function showDayForecast(index) {
  if (!window.dayData || !window.dayData[index]) return;

  const day = window.dayData[index];
  const icon = day.weather[0].icon;
  const date = new Date(day.dt * 1000).toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  weatherBox.innerHTML = `
    <h2>Forecast for ${date}</h2>
    <img class="weather-icon" src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${day.weather[0].description}" />
    <h3>${day.weather[0].main}</h3>
    <p><strong>Temperature:</strong> ${Math.round(day.main.temp)}°C (Feels like ${Math.round(day.main.feels_like)}°C)</p>
    <p><strong>Humidity:</strong> ${day.main.humidity}%</p>
    <p><strong>Wind:</strong> ${day.wind.speed} m/s</p>
    <p><strong>Pressure:</strong> ${day.main.pressure} hPa</p>
    <button onclick="showCurrentWeather()" style="margin-top: 15px; padding: 8px 15px; border: none; border-radius: 5px; background: rgba(255,255,255,0.2); color: white; cursor: pointer;">Back to Current</button>
  `;
}

function showCurrentWeather() {
  const city = cityInput.value.trim();
  if (city) getWeatherByCity();
  else getWeatherByLocation();
}

function getBackground(weather) {
  const map = {
    Clear: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
    Rain: "https://i.pinimg.com/736x/7f/53/0f/7f530f6e2583aa24c733232140dbbd55.jpg",
    Clouds: "https://images.unsplash.com/photo-1525164286255-d12f95cf9d9b",
    Snow: "https://images.unsplash.com/photo-1608889175692-55e7eac0049d",
    Thunderstorm: "https://images.unsplash.com/photo-1600674636533-68d5d6bb61b3",
    Drizzle: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0",
    Mist: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55",
    Fog: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55",
    Haze: "https://images.unsplash.com/photo-1504253163759-c23fccaebb55"
  };
  return map[weather] || "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0";
}

window.onload = function () {
  getWeatherByLocation();
};
