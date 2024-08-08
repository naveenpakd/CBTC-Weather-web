const apiKey = '1f8d22e88c5248b69d9155552242107';

const searchBox = document.querySelector('.inputBox');
const searchBtn = document.querySelector('.searchBtn');
const locationBtn = document.querySelector('.locationBtn');
const conditionImage = document.querySelector('.conditionImage');
const temperature = document.querySelector('.temperature');
const condition = document.querySelector('.condition');
const humidity = document.querySelector('.humidity');
const windSpeed = document.querySelector('.windSpeed');
const feelsLike = document.querySelector('.feelsLike');
const uvIndex = document.querySelector('.uvIndex');
const locationElement = document.querySelector('.location');
const error = document.querySelector('.error');
const forecastContainer = document.querySelector('.forecastCards');

function updateWeatherUI(data) {
    const weatherReport = data.current;
    const location = data.location;

    conditionImage.src = `https:${weatherReport.condition.icon}`;
    conditionImage.alt = weatherReport.condition.text;
    temperature.textContent = `${weatherReport.temp_c}°C`;
    condition.textContent = weatherReport.condition.text;
    humidity.textContent = `Humidity: ${weatherReport.humidity}%`;
    windSpeed.textContent = `Wind Speed: ${weatherReport.wind_kph} km/h`;
    feelsLike.textContent = `Feels Like: ${weatherReport.feelslike_c}°C`;
    uvIndex.textContent = `UV Index: ${weatherReport.uv}`;
    locationElement.textContent = `${location.name}, ${location.region}, ${location.country}`;
    
    document.body.style.background = getBackgroundColor(weatherReport.condition.text);
}

function getBackgroundColor(condition) {
    if (condition.includes("Sunny") || condition.includes("Clear")) {
        return 'linear-gradient(135deg, #f39c12, #f1c40f)';
    } else if (condition.includes("Rain")) {
        return 'linear-gradient(135deg, #3498db, #2980b9)';
    } else if (condition.includes("Snow")) {
        return 'linear-gradient(135deg, #ecf0f1, #bdc3c7)';
    } else {
        return 'linear-gradient(135deg, #3498db, #8e44ad)';
    }
}

function showError(message) {
    error.style.display = 'block';
    error.textContent = message;
}

function fetchWeather(query) {
    fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`)
        .then(response => response.json())
        .then(data => {
            updateWeatherUI(data);
            fetchForecast(query);
        })
        .catch(err => {
            showError('Location not found. Please try again.');
            console.error('Error:', err);
        });
}

function fetchForecast(query) {
    fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=3&aqi=no&alerts=no`)
        .then(response => response.json())
        .then(data => updateForecastUI(data.forecast.forecastday))
        .catch(err => console.error('Error:', err));
}

function updateForecastUI(forecastDays) {
    forecastContainer.innerHTML = '';
    forecastDays.forEach(day => {
        const card = document.createElement('div');
        card.className = 'forecastCard';

        card.innerHTML = `
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <h4>${new Date(day.date).toLocaleDateString('en-US', { weekday: 'long' })}</h4>
            <p>${day.day.avgtemp_c}°C</p>
            <p>${day.day.condition.text}</p>
        `;

        forecastContainer.appendChild(card);
    });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const query = `${latitude},${longitude}`;
                fetchWeather(query);
            },
            (error) => {
                showError('Unable to retrieve your location. Please try again.');
                console.error('Error:', error);
            }
        );
    } else {
        showError('Geolocation is not supported by this browser.');
    }
}

searchBtn.addEventListener('click', () => {
    const query = searchBox.value.trim();
    error.style.display = 'none';
    
    if (!query) {
        showError('Please enter a location');
        return;
    }

    fetchWeather(query);
});

locationBtn.addEventListener('click', () => {
    error.style.display = 'none';
    getCurrentLocation();
});

// Allow searching by pressing Enter key
searchBox.addEventListener('keyup', (event) => {
    if (event.key === 'Enter') {
        searchBtn.click();
    }
});

// Fetch weather for default location on page load
window.addEventListener('load', () => {
    getCurrentLocation();
});
