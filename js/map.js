// Map Page JavaScript

// API Key
const API_KEY = 'a63621689253688a2cdd47570e15c520'; // Replace with your actual API key
let currentCity = 'India';
let weatherMap, miniMap;

// DOM Elements
const currentLocationElement = document.getElementById('current-location');
const mapTempElement = document.getElementById('map-temp');
const mapHumidityElement = document.getElementById('map-humidity');
const alertsListElement = document.getElementById('alerts-list');
const layerButtons = document.querySelectorAll('.map-controls button');

// Initialize weather data and maps
function initWeather(city) {
    currentCity = city;
    initMaps();
    fetchWeatherAlerts();
}

// Initialize maps
function initMaps() {
    // Main map
    weatherMap = L.map('weather-map').setView([51.505, -0.09], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(weatherMap);
    
    // Add temperature layer (placeholder - in a real app, you'd use a weather API with tile layers)
    addTemperatureLayer();
    
    // Mini map
    miniMap = L.map('mini-map').setView([51.505, -0.09], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(miniMap);
    
    // Get current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            weatherMap.setView([latitude, longitude], 5);
            miniMap.setView([latitude, longitude], 10);
            
            // Add marker
            L.marker([latitude, longitude]).addTo(miniMap)
                .bindPopup('Your Location')
                .openPopup();
            
            // Reverse geocode to get city name
            reverseGeocode(latitude, longitude);
        }, error => {
            console.error('Error getting location:', error);
            // Default to London
            weatherMap.setView([51.505, -0.09], 5);
            miniMap.setView([51.505, -0.09], 10);
            currentLocationElement.textContent = 'London, UK';
        });
    } else {
        console.log('Geolocation is not supported by this browser.');
        weatherMap.setView([51.505, -0.09], 5);
        miniMap.setView([51.505, -0.09], 10);
        currentLocationElement.textContent = 'London, UK';
    }
    
    // Map click event
    weatherMap.on('click', async e => {
        const { lat, lng } = e.latlng;
        miniMap.setView([lat, lng], 10);
        
        // Clear existing markers
        miniMap.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                miniMap.removeLayer(layer);
            }
        });
        
        // Add new marker
        L.marker([lat, lng]).addTo(miniMap)
            .bindPopup('Selected Location')
            .openPopup();
        
        // Reverse geocode to get city name
        reverseGeocode(lat, lng);
        
        // Fetch weather for clicked location
        try {
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
            const data = await response.json();
            
            if (data.cod !== 200) {
                throw new Error(data.message);
            }
            
            mapTempElement.textContent = Math.round(data.main.temp);
            mapTempElement.setAttribute('data-temp', data.main.temp);
            mapHumidityElement.textContent = `${data.main.humidity}%`;
        } catch (error) {
            console.error('Error fetching weather for location:', error);
        }
    });
}

// Add temperature layer (placeholder)
function addTemperatureLayer() {
    // In a real app, you would use a weather API that provides tile layers
    // This is just a placeholder to demonstrate the concept
    console.log('Temperature layer added');
}

// Reverse geocode coordinates to get city name
async function reverseGeocode(lat, lng) {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        
        if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county;
            const country = data.address.country;
            currentLocationElement.textContent = `${city}, ${country}`;
        }
    } catch (error) {
        console.error('Error reverse geocoding:', error);
    }
}

// Fetch weather alerts
async function fetchWeatherAlerts() {
    try {
        // Note: OpenWeatherMap's alert feature is part of the One Call API 2.5 which requires paid plan
        // This is a placeholder implementation with mock data
        const mockAlerts = [
            {
                event: "Heat Advisory",
                description: "High temperatures expected. Stay hydrated and avoid prolonged sun exposure.",
                start: Math.floor(Date.now() / 1000),
                end: Math.floor(Date.now() / 500) + 6000,
                sender: "National Weather Service"
            }
        ];
        
        displayWeatherAlerts(mockAlerts);
    } catch (error) {
        console.error('Error fetching weather alerts:', error);
    }
}

// Display weather alerts
function displayWeatherAlerts(alerts) {
    if (alerts.length === 0) {
        alertsListElement.innerHTML = `
            <div class="no-alerts">
                <i class="fas fa-check-circle"></i>
                <p>No active weather alerts for this location</p>
            </div>
        `;
        return;
    }
    
    alertsListElement.innerHTML = '';
    
    alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = 'alert-item';
        
        alertElement.innerHTML = `
            <h4><i class="fas fa-exclamation-triangle"></i> ${alert.event}</h4>
            <p>${alert.description}</p>
            <div class="alert-time">
                <span>From: ${formatTime(alert.start)}</span>
                <span>To: ${formatTime(alert.end)}</span>
            </div>
            <p class="alert-sender">Issued by: ${alert.sender}</p>
        `;
        
        alertsListElement.appendChild(alertElement);
    });
}

// Layer toggle functionality
layerButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        layerButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // In a real app, we would switch between different map layers
        // For now, we'll just show a message
        console.log(`Showing ${btn.id.replace('-layer', '')} layer`);
    });
});

// Expose initWeather for script.js
window.initWeather = initWeather;