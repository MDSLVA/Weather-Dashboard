// Global variables
const apiKey = '5c9ea14d4fc3b12695f61b5b28754ceb';
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('city-input');
const currentWeatherInfo = document.getElementById('current-weather-info');
const forecastInfo = document.getElementById('forecast-info');
const searchHistoryList = document.getElementById('search-history-list');
const searchHistory = [];

// Function to fetch weather data for a city
function getWeatherData(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Unable to fetch weather data.');
      }
      return response.json();
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

// Function to fetch 5-day forecast data for a city
function getForecastData(cityName) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}`;

  return fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Unable to fetch forecast data.');
      }
      return response.json();
    })
    .catch(error => {
      console.error(error);
      throw error;
    });
}

// Function to display current weather information
function displayCurrentWeather(data) {
  currentWeatherInfo.innerHTML = '';

  const cityName = data.name;
  const date = new Date(data.dt * 1000).toLocaleDateString();
  const iconCode = data.weather[0].icon;
  const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
  const temperature = Math.round(data.main.temp - 273.15);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const cityElement = createElement('h2', `City: ${cityName}`);
  const dateElement = createElement('div', `Date: ${date}`);
  const iconElement = createElement('img', '', { src: iconUrl, alt: 'Weather Icon' });
  const temperatureElement = createElement('div', `Temperature: ${temperature} °C`);
  const humidityElement = createElement('div', `Humidity: ${humidity}%`);
  const windSpeedElement = createElement('div', `Wind Speed: ${windSpeed} m/s`);

  appendChildren(currentWeatherInfo, cityElement, dateElement, iconElement, temperatureElement, humidityElement, windSpeedElement);
}

// Function to display forecast information
function displayForecast(data) {
  forecastInfo.innerHTML = '';

  const forecastList = data.list;
  const forecastByDay = groupForecastByDay(forecastList);

  for (const [date, forecast] of forecastByDay) {
    const firstForecast = forecast[0];

    const formattedDate = new Date(firstForecast.dt * 1000).toLocaleDateString();
    const iconCode = firstForecast.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/w/${iconCode}.png`;
    const temperature = Math.round(firstForecast.main.temp - 273.15);
    const humidity = firstForecast.main.humidity;
    const windSpeed = firstForecast.wind.speed;

    const forecastElement = createElement('div', '', { class: 'forecast-item' });
    const dateElement = createElement('div', formattedDate);
    const iconElement = createElement('img', '', { src: iconUrl, alt: 'Weather Icon' });
    const temperatureElement = createElement('div', `Temperature: ${temperature} °C`);
    const humidityElement = createElement('div', `Humidity: ${humidity}%`);
    const windSpeedElement = createElement('div', `Wind Speed: ${windSpeed} m/s`);

    appendChildren(forecastElement, dateElement, iconElement, temperatureElement, humidityElement, windSpeedElement);
    forecastInfo.appendChild(forecastElement);
  }
}

// Utility function to group forecast data by day
function groupForecastByDay(forecastList) {
  const forecastByDay = new Map();

  forecastList.forEach(forecast => {
    const date = new Date(forecast.dt * 1000).toLocaleDateString();
    if (!forecastByDay.has(date)) {
      forecastByDay.set(date, []);
    }
    forecastByDay.get(date).push(forecast);
  });

  return forecastByDay;
}

// Utility function to create HTML elements
function createElement(tagName, textContent = '', attributes = {}) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

// Utility function to append multiple children to a parent element
function appendChildren(parent, ...children) {
  children.forEach(child => parent.appendChild(child));
}

// Function to add a city to the search history
function addToSearchHistory(cityName) {
  if (!searchHistory.includes(cityName)) {
    searchHistory.push(cityName);

    const listItem = createElement('li', cityName);

    listItem.addEventListener('click', () => {
      searchInput.value = cityName;
      searchForm.dispatchEvent(new Event('submit'));
    });

    searchHistoryList.appendChild(listItem);
  }
}

// Function to handle form submission
function handleFormSubmit(event) {
  event.preventDefault();
  const cityName = searchInput.value;

  getWeatherData(cityName)
    .then(weatherData => {
      displayCurrentWeather(weatherData);
      return getForecastData(cityName);
    })
    .then(forecastData => {
      displayForecast(forecastData);
      addToSearchHistory(cityName);
      searchInput.value = '';
    })
    .catch(error => {
      console.error(error);
    });
}

// Add event listener to the search form
searchForm.addEventListener('submit', handleFormSubmit);