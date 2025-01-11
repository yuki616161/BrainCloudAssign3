// Navigation Toggle
const toggleNav = document.getElementById('toggle-nav');
const leftNav = document.getElementById('left-nav');
const logoutBtn = document.getElementById('logout-btn');

// Toggle navigation menu
toggleNav.addEventListener('click', () => {
    leftNav.classList.toggle('show');
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('user');
        alert('Logged out successfully.');
        window.location.href = 'login.html'; 
    }
});

// Close navigation when clicking outside
document.addEventListener('click', (e) => {
    if (!leftNav.contains(e.target) && !toggleNav.contains(e.target)) {
        leftNav.classList.remove('show');
    }
});

// Fetch weather data
document.getElementById('fetch-weather').addEventListener('click', async () => {
    const cityInput = document.getElementById('city-input');
    const city = cityInput.value.trim();
    const apiKey = '36cf795989049fbc7ea03f817e590060';

    // Validate city input
    if (!city) {
        alert('Please enter a city name.');
        cityInput.value = ''; // Reset input field
        return;
    }
    if (!isNaN(city)) {
        alert('City name cannot be a number. Please enter a valid city name.');
        cityInput.value = ''; // Reset input field
        return;
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    try {
        // Fetch current weather data
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        if (weatherData.cod === 200) {
            updateWeatherTable(weatherData);
            await logActivity('Weather API', `Fetched weather data for city: ${city}`);
        } else {
            alert('City not found or invalid.');
            cityInput.value = ''; // Reset input field
        }

        // Fetch forecast data and generate chart
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        if (forecastData.cod === '200') {
            generateForecastChart(forecastData);
        } else {
            alert('Unable to fetch forecast data.');
            cityInput.value = ''; // Reset input field
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Error fetching weather data. Please try again.');
        cityInput.value = ''; // Reset input field
    }
});

// Function to convert Kelvin to Celsius
function kelvinToCelsius(kelvin) {
    return (kelvin - 273.15).toFixed(2);
}

// Update weather table
function updateWeatherTable(data) {
    document.getElementById('forecast').style.display = 'block';
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const currentDate = new Date().toLocaleDateString('en-GB', options);

    const tempCelsius = kelvinToCelsius(data.main.temp);

    document.getElementById('date').textContent = currentDate;
    document.getElementById('city').textContent = data.name;
    document.getElementById('temperature').textContent = `${tempCelsius}°C`;
    document.getElementById('weather').textContent = data.weather[0].description;
    document.getElementById('humidity').textContent = `${data.main.humidity}%`;
    document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
    document.getElementById('weather-table').style.display = 'table';

    // Show precautionary messages based on temperature
    const temp = parseFloat(tempCelsius);
    if (temp < 10) {
        alert('It\'s quite cold outside. Consider wearing a warm coat.');
    } else if (temp <= 25) {
        alert('The weather seems pleasant. Enjoy your day!');
    } else {
        alert('It\'s hot outside. Stay hydrated and protect yourself from the sun.');
    }

    if (data.weather[0].description.toLowerCase().includes('rain')) {
        alert('It looks like it\'s raining. Don\'t forget to bring an umbrella!');
    }
}

// Generate forecast chart
function generateForecastChart(data) {
    const labels = [];
    const temps = [];
    const currentTime = new Date();
    const twentyFourHoursLater = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);

    // Filter forecast data for the next 24 hours
    const forecastData = data.list.filter(entry => {
        const entryTime = new Date(entry.dt_txt);
        return entryTime >= currentTime && entryTime <= twentyFourHoursLater;
    });

    const dateTimeObjects = [];
    forecastData.forEach(entry => {
        const dateTime = new Date(entry.dt_txt);
        dateTimeObjects.push(dateTime);
        labels.push(dateTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        temps.push(kelvinToCelsius(entry.main.temp));
    });

    if (labels.length > 0) {
        const ctx = document.getElementById('weather-chart').getContext('2d');
        if (window.weatherChart) {
            window.weatherChart.destroy();
        }
        window.weatherChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Temperature (°C)',
                    data: temps,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            title: context => {
                                const index = context[0].dataIndex;
                                return dateTimeObjects[index].toLocaleString('en-GB', {
                                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                });
                            },
                            label: context => `Temperature: ${context.raw}°C`
                        }
                    }
                },
                scales: {
                    y: {
                        title: { display: true, text: 'Temperature (°C)' }
                    },
                    x: {
                        title: { display: true, text: 'Time' }
                    }
                }
            }
        });
    } else {
        alert('No forecast data available for the next 24 hours.');
    }
}

// Log activity
async function logActivity(apiName, description) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
        const response = await fetch('https://braincloud.cmsa.digital/srphp/logActivity.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: user.id,
                api_used: apiName,
                activity_description: description
            })
        });

        const data = await response.json();
        if (!data.success) {
            console.error('Failed to log activity:', data.message);
        }
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

