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

        // Initialize loading states
        this.loadingElements = document.querySelectorAll('.loading');
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
    }

    async getCurrentLocation() {
        try {
            if ('geolocation' in navigator) {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                this.state.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                await this.loadNearbyEvents();
            }
        } catch (error) {
            console.error('Error getting location:', error);
            this.showError('Location access is required to find nearby cleanups');
        }
    }

    async loadNearbyEvents() {
        if (!this.state.currentLocation) return;

        this.setLoading(true);
        try {
            // TODO: Implement API call to load events
            // For now, using mock data
            this.state.events = [
                {
                    id: 1,
                    title: 'Weekend Beach Cleanup',
                    location: 'Main Beach',
                    date: '2025-06-15'
                }
            ];
            this.renderEvents();
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError('Unable to load nearby events');
        } finally {
            this.setLoading(false);
        }
    }

    async loadWeatherData() {
        if (!this.state.currentLocation) return;

        this.setLoading(true);
        try {
            // TODO: Implement weather API integration
            // For now, using mock data
            this.state.weatherData = {
                temperature: 75,
                conditions: 'Sunny'
            };
            this.renderWeather();
        } catch (error) {
            console.error('Error loading weather:', error);
            this.showError('Unable to load weather data');
        } finally {
            this.setLoading(false);
        }
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('utc-timestamp');
        if (timestampElement) {
            const now = new Date();
            const utcString = now.toISOString().slice(0, 19).replace('T', ' ');
            timestampElement.textContent = `UTC: ${utcString}`;
        }
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

    showError(message) {
        // TODO: Implement error UI
        console.error(message);
    }

    handleEventSubmit(e) {
        e.preventDefault();
        // TODO: Implement event creation
        console.log('Event submitted');
    }

    renderEvents() {
        // TODO: Implement events rendering
    }

    renderWeather() {
        // TODO: Implement weather rendering
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new ShoreSquad();
    // Start loading data
    app.getCurrentLocation();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}