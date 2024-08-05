const apiKey = '1f8d22e88c5248b69d9155552242107';

const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
const locationBtn = document.querySelector('.location-btn');
const weatherIcon = document.querySelector('.weather-icon');
const temperature = document.querySelector('.temperature');
const condition = document.querySelector('.condition');
const humidity = document.querySelector('.humidity');
const windSpeed = document.querySelector('.wind-speed');
const feelsLike = document.querySelector('.feels-like');
const uvIndex = document.querySelector('.uv-index');
const locationElement = document.querySelector('.location');
const errorMessage = document.querySelector('.error-message');
const forecastContainer = document.querySelector('.forecast-container');

async function getIPBasedLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        return `${data.city}, ${data.country_name}`;
    } catch (error) {
        console.error('Error fetching IP-based location:', error);
        return null;
    }
}

async function getBrowserLocation() {
    return new Promise((resolve, reject) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    resolve(`${latitude},${longitude}`);
                },
                (error) => {
                    console.error('Error getting browser location:', error);
                    reject(error);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            reject(new Error('Geolocation is not supported by this browser.'));
        }
    });
}

async function getCurrentLocation() {
    try {
        // First, try to get the location based on IP
        const ipLocation = await getIPBasedLocation();
        if (ipLocation) {
            fetchWeather(ipLocation);
        }

        // Then, try to get a more accurate location using the browser's geolocation
        const browserLocation = await getBrowserLocation();
        if (browserLocation) {
            fetchWeather(browserLocation);
        }
    } catch (error) {
        showError('Unable to retrieve your location. Please enter a location manually.');
        console.error('Error getting location:', error);
    }
}

function updateWeatherUI(data) {
    const weatherReport = data.current;
    const location = data.location;

    weatherIcon.src = `https:${weatherReport.condition.icon}`;
    weatherIcon.alt = weatherReport.condition.text;
    temperature.textContent = `${weatherReport.temp_c}°C`;
    condition.textContent = weatherReport.condition.text;
    humidity.textContent = `Humidity: ${weatherReport.humidity}%`;
    windSpeed.textContent = `Wind: ${weatherReport.wind_kph} km/h`;
    feelsLike.textContent = `Feels like: ${weatherReport.feelslike_c}°C`;
    uvIndex.textContent = `UV Index: ${weatherReport.uv}`;
    locationElement.textContent = `${location.name}, ${location.region}, ${location.country}`;
    
    document.body.style.background = getBackgroundGradient(weatherReport.condition.text);
}

function getBackgroundGradient(condition) {
    if (condition.includes("Sunny") || condition.includes("Clear")) {
        return 'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)';
    } else if (condition.includes("Rain")) {
        return 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)';
    } else if (condition.includes("Snow")) {
        return 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    } else if (condition.includes("Cloud")) {
        return 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)';
    } else {
        return 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)';
    }
}

function showError(message) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

function fetchWeather(query) {
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            updateForecastUI(data.forecast.forecastday);
            errorMessage.style.display = 'none';
        })
        .catch(err => {
            showError('Location not found. Please try again.');
            console.error('Error:', err);
        });
}

function updateForecastUI(forecastDays) {
    forecastContainer.innerHTML = '';
    forecastDays.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';

        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}</div>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="forecast-icon">
            <div class="forecast-temp">${day.day.avgtemp_c}°C</div>
            <div class="forecast-condition">${day.day.condition.text}</div>
        `;

        forecastContainer.appendChild(forecastItem);
    });
}

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        fetchWeather(query);
    } else {
        showError('Please enter a location');
    }
});

locationBtn.addEventListener('click', getCurrentLocation);

searchInput.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

// Fetch weather for default location on page load
window.addEventListener('load', getCurrentLocation);