const weatherForm = document.getElementById('checkBtn');
const cityInput = document.getElementById('cityInput');
const unitSelect = document.getElementById('unitSelect');
const weatherStatus = document.getElementById('weatherStatus');
const weatherResult = document.getElementById('weatherResult');
const resultCity = document.getElementById('resultCity');
const resultDesc = document.getElementById('resultDesc');
const resultTemp = document.getElementById('resultTemp');
const weatherGrid = document.getElementById('weatherGrid');

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
};

function setStatus(message, isError = false) {
  weatherStatus.textContent = message;
  weatherStatus.style.color = isError ? 'var(--coral)' : 'inherit';
}

function formatLabel(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

function buildForecastCards(data, unitLabel) {
  return data.time
    .map((date, index) => {
      const code = data.weathercode[index];
      return `
        <article class="weather-card">
          <strong>${formatLabel(date)}</strong>
          <p>${weatherCodes[code] || 'Mixed weather'}</p>
          <p>${Math.round(data.temperature_2m_max[index])}°${unitLabel} / ${Math.round(data.temperature_2m_min[index])}°${unitLabel}</p>
        </article>
      `;
    })
    .join('');
}

async function fetchWeather(city, units) {
  setStatus('Looking up city…');
  weatherResult.classList.add('hidden');

  const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
  const geocodeResponse = await fetch(geocodeUrl);
  if (!geocodeResponse.ok) throw new Error('City lookup failed.');

  const geocodeData = await geocodeResponse.json();
  if (!geocodeData.results || geocodeData.results.length === 0) {
    throw new Error('City not found. Try another location.');
  }

  const location = geocodeData.results[0];
  const unitParams = units === 'fahrenheit' ? 'fahrenheit' : 'celsius';
  const tempLabel = units === 'fahrenheit' ? 'F' : 'C';
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&temperature_unit=${unitParams}&timezone=auto`;

  setStatus('Fetching forecast…');
  const weatherResponse = await fetch(weatherUrl);
  if (!weatherResponse.ok) throw new Error('Weather service is unavailable.');

  const weatherData = await weatherResponse.json();
  if (!weatherData.current_weather || !weatherData.daily) {
    throw new Error('Incomplete weather data returned.');
  }

  resultCity.textContent = `${location.name}, ${location.country || ''}`.trim();
  resultDesc.textContent = weatherCodes[weatherData.current_weather.weathercode] || 'Current conditions';
  resultTemp.textContent = `${Math.round(weatherData.current_weather.temperature)}°${tempLabel}`;
  weatherGrid.innerHTML = buildForecastCards(weatherData.daily, tempLabel);
  weatherResult.classList.remove('hidden');
  setStatus('');
}

if (weatherForm && cityInput && unitSelect) {
  weatherForm.addEventListener('click', function (event) {
    event.preventDefault();
    const city = cityInput.value.trim();

    if (!city) {
      setStatus('Please enter a city name.', true);
      return;
    }

    fetchWeather(city, unitSelect.value).catch((error) => {
      weatherResult.classList.add('hidden');
      setStatus(error.message || 'Unable to load weather.', true);
    });
  });
}
