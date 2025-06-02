// ShoreSquad Main Application
class ShoreSquad {
    constructor() {
        this.state = {
            currentLocation: null,
            weatherData: null,
            events: [],
            isLoading: false
        };

        // Initialize components
        this.initializeComponents();
        this.setupEventListeners();
        this.updateTimestamp();
    }

    initializeComponents() {
        // Initialize mobile menu
        this.mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.weatherContainer = document.getElementById('weather-data');

        // Initialize loading states
        this.loadingElements = document.querySelectorAll('.loading');

        // Load initial weather data
        this.loadWeatherData();
    }

    setupEventListeners() {
        // Mobile menu toggle
        this.mobileMenuToggle?.addEventListener('click', () => {
            this.navMenu?.classList.toggle('active');
        });

        // Form submission
        const eventForm = document.querySelector('.event-form');
        eventForm?.addEventListener('submit', (e) => this.handleEventSubmit(e));

        // Update timestamp every minute
        setInterval(() => this.updateTimestamp(), 60000);

        // CTA button
        const ctaButton = document.querySelector('.cta-button');
        ctaButton?.addEventListener('click', () => {
            document.querySelector('#map').scrollIntoView({ behavior: 'smooth' });
        });
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('utc-timestamp');
        if (timestampElement) {
            const now = new Date();
            const utcString = now.toISOString().slice(0, 19).replace('T', ' ');
            timestampElement.textContent = `UTC: ${utcString}`;
        }
    }

async loadWeatherData() {
    if (this.weatherContainer) {
        this.weatherContainer.innerHTML = '<p class="loading-text">Loading weather information...</p>';
    }

    this.setLoading(true);
    try {
        // Fetch both 24-hour and 4-day weather forecasts from NEA API
        const [todayResponse, fourDayResponse] = await Promise.all([
            fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            }),
            fetch('https://api.data.gov.sg/v1/environment/4-day-weather-forecast', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            })
        ]);

        if (!todayResponse.ok || !fourDayResponse.ok) {
            throw new Error('Weather data fetch failed');
        }

        const todayData = await todayResponse.json();
        const fourDayData = await fourDayResponse.json();

        if (!todayData.items?.length || !fourDayData.items?.length) {
            throw new Error('No weather data available');
        }

        // Process real-time weather data
        this.state.weatherData = {
            current: {
                forecast: todayData.items[0].general.forecast,
                temperature: todayData.items[0].general.temperature,
                relative_humidity: todayData.items[0].general.relative_humidity,
                wind: todayData.items[0].general.wind,
                timestamp: new Date(todayData.items[0].timestamp)
            },
            forecast: fourDayData.items[0].forecasts.map(day => ({
                date: day.date,
                forecast: day.forecast,
                temperature: {
                    low: day.temperature.low,
                    high: day.temperature.high
                },
                relative_humidity: day.relative_humidity
            })),
            timestamp: new Date()
        };

    } catch (error) {
        console.error('Error loading weather:', error);
        throw error; // Let the error propagate to show proper error state
    } finally {
        this.setLoading(false);
        if (this.state.weatherData) {
            this.renderWeather();
        }
    }
}

renderWeather() {
    if (!this.weatherContainer || !this.state.weatherData) return;

    const { current, forecast } = this.state.weatherData;

    const getWeatherIcon = (forecast) => {
        const conditions = forecast.toLowerCase();
        if (conditions.includes('thundery') || conditions.includes('thunder')) {
            return '⛈️';
        } else if (conditions.includes('rain') || conditions.includes('showers')) {
            return '🌧️';
        } else if (conditions.includes('cloudy')) {
            return '☁️';
        } else if (conditions.includes('overcast')) {
            return '🌥️';
        } else if (conditions.includes('sunny')) {
            return '☀️';
        }
        return '🌤️'; // Default partly cloudy icon
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-SG', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const weatherHTML = `
        <div class="weather-info">
            <h2>Weather Forecast</h2>
            <div class="current-weather">
                <div class="weather-icon">${getWeatherIcon(current.forecast)}</div>
                <h3>${current.forecast}</h3>
                <div class="weather-details">
                    <p class="temperature">
                        <span class="icon">🌡️</span>
                        Temperature: ${current.temperature.low}°C - ${current.temperature.high}°C
                    </p>
                    <p class="humidity">
                        <span class="icon">💧</span>
                        Humidity: ${current.relative_humidity.low}% - ${current.relative_humidity.high}%
                    </p>
                    <p class="wind">
                        <span class="icon">💨</span>
                        Wind: ${current.wind.speed.low} - ${current.wind.speed.high} km/h ${current.wind.direction}
                    </p>
                </div>
            </div>
            <div class="forecast-grid">
                ${forecast.map(day => `
                    <div class="forecast-day">
                        <h4>${formatDate(day.date)}</h4>
                        <div class="weather-icon">${getWeatherIcon(day.forecast)}</div>
                        <p class="temperature">${day.temperature.low}°C - ${day.temperature.high}°C</p>
                        <p class="forecast-text">${day.forecast}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;

    this.weatherContainer.innerHTML = weatherHTML;
}

showError(message, duration = 5000) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message fade-in';
    errorDiv.textContent = message;

    // Remove any existing error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());

    // Add new error message
    document.body.appendChild(errorDiv);

    // Remove error after duration
    setTimeout(() => {
        errorDiv.classList.add('fade-out');
        setTimeout(() => errorDiv.remove(), 300);
    }, duration);
}

    setLoading(isLoading) {
        this.state.isLoading = isLoading;
        this.loadingElements.forEach(element => {
            if (isLoading) {
                element.classList.add('loading');
            } else {
                element.classList.remove('loading');
            }
        });
    }

    // ... rest of your methods remain the same ...
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ShoreSquad();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}