 // DOM Elements
        const savedCitiesContainer = document.getElementById('saved-cities');
        const unitToggleButtons = document.querySelectorAll('[data-unit]');
        const themeToggleButtons = document.querySelectorAll('[data-theme]');
        const notificationCheckboxes = document.querySelectorAll('input[type="checkbox"]');
        const apiKeyInput = document.getElementById('api-key');
        const saveApiKeyBtn = document.getElementById('save-api-key');
        const clearCacheBtn = document.getElementById('clear-cache');
        const resetSettingsBtn = document.getElementById('reset-settings');
        const confirmationModal = document.getElementById('confirmation-modal');
        const cancelResetBtn = document.getElementById('cancel-reset');
        const confirmResetBtn = document.getElementById('confirm-reset');
        const toast = document.getElementById('toast');
        const navbarUnitToggle = document.querySelector('.unit-toggle');

        // Sample saved cities data
        const sampleCities = [
            { id: 1, name: "New York, US" },
            { id: 2, name: "London, UK" },
            { id: 3, name: "Tokyo, Japan" },
            { id: 4, name: "Sydney, Australia" }
        ];

        // Initialize settings
        function initSettings() {
            // Render saved cities
            renderSavedCities();
            
            // Set active unit toggle
            const activeUnit = localStorage.getItem('weatherUnit') || 'celsius';
            setActiveUnit(activeUnit);
            
            // Set active theme
            const activeTheme = localStorage.getItem('theme') || 'light';
            setTheme(activeTheme);
            
            // Load notification settings
            loadNotificationSettings();
            
            // Load API key if exists
            const savedApiKey = localStorage.getItem('apiKey');
            if (savedApiKey) {
                apiKeyInput.value = savedApiKey;
            }
        }

        // Render saved cities
        function renderSavedCities() {
            // In a real app, this would come from localStorage
            const savedCities = sampleCities;
            
            if (savedCities.length === 0) {
                savedCitiesContainer.innerHTML = `
                    <div class="no-cities">
                        <i class="fas fa-plus-circle"></i>
                        <p>No saved locations yet. Search for a city and click "Add to Favorites" to save it here.</p>
                    </div>
                `;
                return;
            }
            
            savedCitiesContainer.innerHTML = savedCities.map(city => `
                <div class="city-item">
                    <span>${city.name}</span>
                    <button class="delete-city" data-id="${city.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `).join('');
            
            // Add event listeners to delete buttons
            document.querySelectorAll('.delete-city').forEach(button => {
                button.addEventListener('click', function() {
                    const cityId = this.getAttribute('data-id');
                    deleteCity(cityId);
                });
            });
        }

        // Delete a city
        function deleteCity(cityId) {
            // In a real app, remove from localStorage
            const index = sampleCities.findIndex(city => city.id == cityId);
            if (index !== -1) {
                sampleCities.splice(index, 1);
                renderSavedCities();
                showToast('Location removed');
            }
        }

        // Set active unit
        function setActiveUnit(unit) {
            // Update UI
            unitToggleButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.unit === unit);
            });
            
            // Update navbar toggle
            document.querySelectorAll('.unit-toggle span').forEach(span => {
                span.classList.toggle('active', span.id === unit);
            });
            
            // Save to localStorage
            localStorage.setItem('weatherUnit', unit);
        }

        // Set theme
        function setTheme(theme) {
            // Remove existing theme classes
            document.body.classList.remove('theme-light', 'theme-dark', 'theme-neon');
            // Add selected theme
            document.body.classList.add(`theme-${theme}`);
            
            // Update UI
            themeToggleButtons.forEach(button => {
                button.classList.toggle('active', button.dataset.theme === theme);
            });
            
            // Save to localStorage
            localStorage.setItem('theme', theme);
        }

        // Load notification settings
        function loadNotificationSettings() {
            // In a real app, load from localStorage
            notificationCheckboxes.forEach(checkbox => {
                const savedValue = localStorage.getItem(checkbox.id);
                if (savedValue !== null) {
                    checkbox.checked = savedValue === 'true';
                }
            });
        }

        // Save notification settings
        function saveNotificationSetting(checkbox) {
            localStorage.setItem(checkbox.id, checkbox.checked);
        }

        // Show toast notification
        function showToast(message) {
            toast.textContent = message;
            toast.classList.add('active');
            
            setTimeout(() => {
                toast.classList.remove('active');
            }, 3000);
        }

        // Event Listeners
        // Unit toggle
        unitToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const unit = button.dataset.unit;
                setActiveUnit(unit);
                showToast(`Temperature unit set to ${unit.toUpperCase()}`);
            });
        });

        // Navbar unit toggle
        navbarUnitToggle.addEventListener('click', (e) => {
            if (e.target.tagName === 'SPAN') {
                const unit = e.target.id;
                setActiveUnit(unit);
                showToast(`Temperature unit set to ${unit.toUpperCase()}`);
            }
        });

        // Theme toggle
        themeToggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                setTheme(theme);
                showToast(`Theme set to ${theme.charAt(0).toUpperCase() + theme.slice(1)}`);
            });
        });

        // Notification settings
        notificationCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                saveNotificationSetting(checkbox);
                showToast('Notification settings updated');
            });
        });

        // Save API key
        saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = apiKeyInput.value.trim();
            if (apiKey) {
                localStorage.setItem('apiKey', apiKey);
                showToast('API Key saved successfully');
            } else {
                showToast('Please enter a valid API key');
            }
        });

        // Clear cache
        clearCacheBtn.addEventListener('click', () => {
            // In a real app, clear specific cache items
            localStorage.removeItem('weatherData');
            localStorage.removeItem('forecastData');
            showToast('Cache cleared successfully');
        });

        // Reset settings
        resetSettingsBtn.addEventListener('click', () => {
            confirmationModal.classList.add('active');
        });

        // Cancel reset
        cancelResetBtn.addEventListener('click', () => {
            confirmationModal.classList.remove('active');
        });

        // Confirm reset
        confirmResetBtn.addEventListener('click', () => {
            // Clear all settings
            localStorage.clear();
            
            // Reset UI
            initSettings();
            
            // Hide modal
            confirmationModal.classList.remove('active');
            
            showToast('All settings have been reset');
        });

        // Initialize settings on page load
        document.addEventListener('DOMContentLoaded', initSettings);
