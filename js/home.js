// Home Page JavaScript

// API Key - Note: In a real app, this should be secured and not exposed in client-side code
const API_KEY = 'a63621689253688a2cdd47570e15c520'; // Replace with your actual API key
let currentCity = 'India'; // Default city

// DOM Elements
const cityNameElement = document.getElementById('city-name');
const currentDateElement = document.getElementById('current-date');
const currentTimeElement = document.getElementById('current-time');
const currentTempElement = document.getElementById('current-temp');
const weatherIconElement = document.getElementById('weather-icon');
const weatherDescElement = document.getElementById('weather-desc');
const humidityElement = document.getElementById('humidity');
const windElement = document.getElementById('wind');
const uvElement = document.getElementById('uv');
const sunriseElement = document.getElementById('sunrise');
const sunsetElement = document.getElementById('sunset');
const hourlyForecastElement = document.getElementById('hourly-forecast');
const favoriteBtn = document.getElementById('favorite-btn');
const shareBtn = document.getElementById('share-btn');
const copyBtn = document.getElementById('copy-btn');

// Initialize weather data
function initWeather(city) {
    currentCity = city;
    fetchCurrentWeather();
    fetchHourlyForecast();
    updateDateTime();
    
    // Update time every minute
    setInterval(updateDateTime, 60000);
}

// Fetch current weather data
async function fetchCurrentWeather() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (data.cod !== 200) {
            throw new Error(data.message);
        }
        
        displayCurrentWeather(data);
        setDynamicBackground(data.main.temp);
    } catch (error) {
        console.error('Error fetching current weather:', error);
        alert(`Error: ${error.message}`);
    }
}

// Display current weather data
function displayCurrentWeather(data) {
    cityNameElement.textContent = data.name;
    currentTempElement.textContent = Math.round(data.main.temp);
    currentTempElement.setAttribute('data-temp', data.main.temp);
    weatherDescElement.textContent = data.weather[0].description;
    humidityElement.textContent = `${data.main.humidity}%`;
    windElement.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;
    sunriseElement.textContent = formatTime(data.sys.sunrise);
    sunsetElement.textContent = formatTime(data.sys.sunset);
    
    // Set weather icon
    const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
    weatherIconElement.src = iconUrl;
    weatherIconElement.alt = data.weather[0].main;
    
    // Simple UV index (OpenWeatherMap requires separate API call for UV)
    uvElement.textContent = 'Moderate'; // Placeholder
}

// Fetch hourly forecast
async function fetchHourlyForecast() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${API_KEY}&units=metric&cnt=12`);
        const data = await response.json();
        
        if (data.cod !== '200') {
            throw new Error(data.message);
        }
        
        displayHourlyForecast(data.list);
    } catch (error) {
        console.error('Error fetching hourly forecast:', error);
    }
}

// Display hourly forecast
function displayHourlyForecast(hourlyData) {
    hourlyForecastElement.innerHTML = '';
    
    hourlyData.forEach(hour => {
        const hourTime = new Date(hour.dt * 1000);
        const hourElement = document.createElement('div');
        hourElement.className = 'hourly-card glass-card';
        
        hourElement.innerHTML = `
            <div class="time">${hourTime.getHours()}:00</div>
            <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
            <div class="temp" data-temp="${hour.main.temp}">${Math.round(hour.main.temp)}°</div>
        `;
        
        hourlyForecastElement.appendChild(hourElement);
    });
}

// Update date and time
function updateDateTime() {
    const now = new Date();
    currentDateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
    currentTimeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Set dynamic background based on temperature
function setDynamicBackground(temp) {
    const body = document.body;
    
    if (temp < 0) {
        body.style.backgroundImage = "url('images/cold-snow.jpg')";
    } else if (temp >= 0 && temp < 19) {
        body.style.backgroundImage = "url('images/cool-breeze.jpg')";
    } else if (temp >= 19 && temp < 28) {
        body.style.backgroundImage = "url('images/mild-sky1.jpg')";
    } else if (temp >= 28 && temp < 32) {
        body.style.backgroundImage = "url('images/warm-sun1.jpg')";
    } else {
        body.style.backgroundImage = "url('images/hot-sun.jpg')";
    }
}

// Event Listeners
if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
        // Add to favorites
        const favorites = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
        if (!favorites.includes(currentCity)) {
            favorites.push(currentCity);
            localStorage.setItem('favoriteCities', JSON.stringify(favorites));
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Added to Favorites';
            setTimeout(() => {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
            }, 2000);
        } else {
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Already in Favorites';
            setTimeout(() => {
                favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Add to Favorites';
            }, 2000);
        }
    });
}

if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: `Weather in ${currentCity}`,
                text: `Check out the current weather in ${currentCity}`,
                url: window.location.href
            }).catch(err => {
                console.log('Error sharing:', err);
            });
        } else {
            // Fallback for browsers that don't support Web Share API
            const shareUrl = `${window.location.origin}${window.location.pathname}?city=${encodeURIComponent(currentCity)}`;
            navigator.clipboard.writeText(shareUrl).then(() => {
                shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Copied!';
                setTimeout(() => {
                    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
                }, 2000);
            });
        }
    });
}

if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        const weatherText = `Current weather in ${currentCity}: ${currentTempElement.textContent}°C, ${weatherDescElement.textContent}. Humidity: ${humidityElement.textContent}, Wind: ${windElement.textContent}.`;
        navigator.clipboard.writeText(weatherText).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy Weather';
            }, 2000);
        });
    });
}

// Initialize particles.js if available
if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#ffffff" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#ffffff", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false, out_mode: "out" }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: { enable: true, mode: "repulse" },
                onclick: { enable: true, mode: "push" }
            }
        }
    });
}

// Expose initWeather for script.js
window.initWeather = initWeather;