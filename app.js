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
        this.setLoading(true);
        try {
            // Fetch weather data from NEA API
            const response = await fetch('https://api.data.gov.sg/v1/environment/24-hour-weather-forecast', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Weather data fetch failed');
            }

            const data = await response.json();

            // Process weather data
            if (data.items && data.items.length > 0) {
                const forecast = data.items[0];
                this.state.weatherData = {
                    forecast: forecast.general.forecast,
                    temperature: {
                        low: forecast.general.temperature.low,
                        high: forecast.general.temperature.high
                    },
                    humidity: {
                        low: forecast.general.relative_humidity.low,
                        high: forecast.general.relative_humidity.high
                    },
                    wind: {
                        speed: {
                            low: forecast.general.wind.speed.low,
                            high: forecast.general.wind.speed.high
                        },
                        direction: forecast.general.wind.direction
                    },
                    timestamp: new Date(forecast.timestamp)
                };
            } else {
                throw new Error('No weather data available');
            }

        } catch (error) {
            console.error('Error loading weather:', error);
            // Fallback to mock data
            this.state.weatherData = {
                forecast: 'Partly cloudy with passing showers',
                temperature: { low: 24, high: 32 },
                humidity: { low: 65, high: 95 },
                wind: {
                    speed: { low: 10, high: 20 },
                    direction: 'NE'
                },
                timestamp: new Date()
            };
        } finally {
            this.renderWeather();
            this.setLoading(false);
        }
    }

    renderWeather() {
        if (!this.weatherContainer || !this.state.weatherData) return;

        const { weatherData } = this.state;

        // Format time to match current time format (15:33)
        const timeString = new Date().toLocaleTimeString('en-SG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Use 24-hour format
        });

        this.weatherContainer.innerHTML = `
        <div class="weather-info">
            <div class="weather-header">
                <h3>Beach Weather Forecast</h3>
                <span class="weather-time">Updated at ${timeString}</span>
            </div>
            <div class="weather-body">
                <div class="weather-main">
                    <p class="forecast">${weatherData.forecast}</p>
                    <p class="temperature">
                        <span class="temp-icon">🌡️</span>
                        ${weatherData.temperature.low}°C - ${weatherData.temperature.high}°C
                    </p>
                </div>
                <div class="weather-details">
                    <p class="humidity">
                        <span class="humid-icon">💧</span>
                        Humidity: ${weatherData.humidity.low}% - ${weatherData.humidity.high}%
                    </p>
                    <p class="wind">
                        <span class="wind-icon">🌬️</span>
                        Wind: ${weatherData.wind.speed.low}-${weatherData.wind.speed.high} km/h ${weatherData.wind.direction}
                    </p>
                </div>
            </div>
        </div>
    `;
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

    handleEventSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const eventData = {
            location: formData.get('event-location'),
            date: formData.get('event-date'),
            time: formData.get('event-time'),
            description: formData.get('event-description')
        };

        // Store event data (in real app, this would be sent to a server)
        console.log('New cleanup event:', eventData);

        // Show success message
        this.showError('Event created successfully! 🌊', 3000);

        // Clear form
        e.target.reset();
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ShoreSquad();
});

// Service Worker Registration for offline support
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