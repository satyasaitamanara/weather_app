// Common functionality across all pages

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const searchToggle = document.querySelector('.search-toggle');
const unitToggleCelsius = document.getElementById('celsius');
const unitToggleFahrenheit = document.getElementById('fahrenheit');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Toggle mobile menu
if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        searchToggle.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// Unit toggle functionality
if (unitToggleCelsius && unitToggleFahrenheit) {
    unitToggleCelsius.addEventListener('click', () => {
        if (!unitToggleCelsius.classList.contains('active')) {
            unitToggleCelsius.classList.add('active');
            unitToggleFahrenheit.classList.remove('active');
            // Convert temperatures to Celsius
            convertTemperatures('celsius');
            // Save preference to localStorage
            localStorage.setItem('temperatureUnit', 'celsius');
        }
    });

    unitToggleFahrenheit.addEventListener('click', () => {
        if (!unitToggleFahrenheit.classList.contains('active')) {
            unitToggleFahrenheit.classList.add('active');
            unitToggleCelsius.classList.remove('active');
            // Convert temperatures to Fahrenheit
            convertTemperatures('fahrenheit');
            // Save preference to localStorage
            localStorage.setItem('temperatureUnit', 'fahrenheit');
        }
    });
}

// Temperature conversion function
function convertTemperatures(unit) {
    const tempElements = document.querySelectorAll('[data-temp]');
    
    tempElements.forEach(element => {
        const tempC = parseFloat(element.getAttribute('data-temp'));
        if (unit === 'fahrenheit') {
            const tempF = (tempC * 9/5) + 32;
            element.textContent = tempF.toFixed(1);
        } else {
            element.textContent = tempC.toFixed(1);
        }
    });
    
    // Update unit display
    const unitElements = document.querySelectorAll('.unit');
    unitElements.forEach(unitEl => {
        unitEl.textContent = unit === 'fahrenheit' ? '℉' : '℃';
    });
}

// Search functionality
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            // Store the searched city
            localStorage.setItem('lastSearchedCity', city);
            // Redirect to home page with the searched city
            window.location.href = `index.html?city=${encodeURIComponent(city)}`;
        }
    });
}

// Check for temperature unit preference on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedUnit = localStorage.getItem('temperatureUnit') || 'celsius';
    if (savedUnit === 'fahrenheit' && unitToggleFahrenheit) {
        unitToggleFahrenheit.classList.add('active');
        unitToggleCelsius.classList.remove('active');
        convertTemperatures('fahrenheit');
    }
    
    // Check for theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = `${savedTheme}-theme`;
    
    // Check for last searched city
    const urlParams = new URLSearchParams(window.location.search);
    const cityParam = urlParams.get('city');
    const lastCity = cityParam || localStorage.getItem('lastSearchedCity') || 'London';
    
    // Store for other pages to use
    localStorage.setItem('currentCity', lastCity);
    
    // Initialize weather data
    if (typeof initWeather === 'function') {
        initWeather(lastCity);
    }
});

// Theme switching
function setTheme(theme) {
    document.body.className = `${theme}-theme`;
    localStorage.setItem('theme', theme);
}

// Helper function to format date
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Helper function to format time
function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Helper function to get weather icon
function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'clear-day',
        '01n': 'clear-night',
        '02d': 'partly-cloudy-day',
        '02n': 'partly-cloudy-night',
        '03d': 'cloudy',
        '03n': 'cloudy',
        '04d': 'cloudy',
        '04n': 'cloudy',
        '09d': 'rain',
        '09n': 'rain',
        '10d': 'rain',
        '10n': 'rain',
        '11d': 'thunderstorm',
        '11n': 'thunderstorm',
        '13d': 'snow',
        '13n': 'snow',
        '50d': 'fog',
        '50n': 'fog'
    };
    return `assets/icons/${iconMap[iconCode] || 'clear-day'}.svg`;
}