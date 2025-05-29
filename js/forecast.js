// Forecast Page JavaScript

// API Key
const API_KEY = 'a63621689253688a2cdd47570e15c520'; // Replace with your actual API key
let currentCity = 'India';

// DOM Elements
const chartToggleBtns = document.querySelectorAll('.toggle-btn');
const weatherChartCtx = document.getElementById('weather-chart');
const dailyForecastElement = document.getElementById('daily-forecast');
let weatherChart;

// Initialize weather data
function initWeather(city) {
    currentCity = city;
    fetchDailyForecast();
}

// Fetch daily forecast
async function fetchDailyForecast() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (data.cod !== '200') {
            throw new Error(data.message);
        }
        
        // Process data for 7-day forecast
        const dailyData = processDailyData(data.list);
        displayDailyForecast(dailyData);
        renderTemperatureChart(dailyData);
    } catch (error) {
        console.error('Error fetching daily forecast:', error);
        alert(`Error: ${error.message}`);
    }
}

// Process daily data from 3-hour intervals to daily
function processDailyData(list) {
    const dailyData = {};
    
    list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        
        if (!dailyData[dateStr]) {
            dailyData[dateStr] = {
                date: dateStr,
                timestamp: item.dt,
                temps: [],
                humidity: [],
                wind: [],
                weather: [],
                pressure: [],
                pop: [] // probability of precipitation
            };
        }
        
        dailyData[dateStr].temps.push(item.main.temp);
        dailyData[dateStr].humidity.push(item.main.humidity);
        dailyData[dateStr].wind.push(item.wind.speed);
        dailyData[dateStr].weather.push(item.weather[0]);
        dailyData[dateStr].pressure.push(item.main.pressure);
        dailyData[dateStr].pop.push(item.pop * 100); // convert to percentage
    });
    
    // Convert to array and calculate averages
    return Object.values(dailyData).map(day => {
        return {
            date: day.date,
            timestamp: day.timestamp,
            minTemp: Math.min(...day.temps),
            maxTemp: Math.max(...day.temps),
            avgTemp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
            avgHumidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length,
            avgWind: day.wind.reduce((a, b) => a + b, 0) / day.wind.length,
            mainWeather: getMostFrequentWeather(day.weather),
            avgPressure: day.pressure.reduce((a, b) => a + b, 0) / day.pressure.length,
            maxPop: Math.max(...day.pop)
        };
    }).slice(0, 7); // Get only 7 days
}

// Helper function to get most frequent weather condition
function getMostFrequentWeather(weatherArray) {
    const counts = {};
    weatherArray.forEach(w => {
        counts[w.main] = (counts[w.main] || 0) + 1;
    });
    const mostFrequent = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
    return weatherArray.find(w => w.main === mostFrequent);
}

// Display daily forecast
function displayDailyForecast(dailyData) {
    dailyForecastElement.innerHTML = '';
    
    dailyData.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'forecast-card glass-card';
        
        dayElement.innerHTML = `
            <div class="forecard-header">
                <div class="forecast-day">${day.date.split(',')[0]}</div>
                <div class="forecast-date">${day.date.split(',')[1]}</div>
            </div>
            <div class="forecast-main">
                <div class="forecast-temp">
                    <span class="max-temp" data-temp="${day.maxTemp}">${Math.round(day.maxTemp)}°</span> / 
                    <span class="min-temp" data-temp="${day.minTemp}">${Math.round(day.minTemp)}°</span>
                </div>
                <div class="forecast-icon">
                    <img src="https://openweathermap.org/img/wn/${day.mainWeather.icon}.png" alt="${day.mainWeather.description}">
                </div>
            </div>
            <div class="forecast-desc">${day.mainWeather.description}</div>
            <div class="forecast-details">
                <div class="detail-row">
                    <span class="detail-label">Humidity:</span>
                    <span>${Math.round(day.avgHumidity)}%</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Wind:</span>
                    <span>${(day.avgWind * 3.6).toFixed(1)} km/h</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Pressure:</span>
                    <span>${Math.round(day.avgPressure)} hPa</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Rain Chance:</span>
                    <span>${Math.round(day.maxPop)}%</span>
                </div>
            </div>
            <div class="expand-btn"><i class="fas fa-chevron-down"></i></div>
        `;
        
        dayElement.addEventListener('click', () => {
            dayElement.classList.toggle('expanded');
            const expandBtn = dayElement.querySelector('.expand-btn i');
            if (dayElement.classList.contains('expanded')) {
                expandBtn.classList.remove('fa-chevron-down');
                expandBtn.classList.add('fa-chevron-up');
            } else {
                expandBtn.classList.remove('fa-chevron-up');
                expandBtn.classList.add('fa-chevron-down');
            }
        });
        
        dailyForecastElement.appendChild(dayElement);
    });
}

// Render temperature chart
function renderTemperatureChart(dailyData) {
    if (weatherChart) {
        weatherChart.destroy();
    }
    
    const labels = dailyData.map(day => day.date.split(',')[0]);
    const maxTemps = dailyData.map(day => day.maxTemp);
    const minTemps = dailyData.map(day => day.minTemp);
    
    weatherChart = new Chart(weatherChartCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Max Temperature (°C)',
                    data: maxTemps,
                    borderColor: '#ff7675',
                    backgroundColor: 'rgba(255, 118, 117, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Min Temperature (°C)',
                    data: minTemps,
                    borderColor: '#74b9ff',
                    backgroundColor: 'rgba(116, 185, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.body).getPropertyValue('--text-color')
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Chart toggle functionality
chartToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        chartToggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // In a real app, we would update the chart based on the selected data type
        // For now, we'll just show a message
        console.log(`Showing ${btn.dataset.chart} data`);
    });
});

// Expose initWeather for script.js
window.initWeather = initWeather;