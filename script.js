async function searchCity() {

    const city = document.getElementById("cityInput")
        .value.trim();

    const error = document.getElementById("error");

    error.textContent = "";

    if (city === "") {
        error.textContent = "Please enter a city name.";
        return;
    }

    try {

        const geoResponse = await fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json"
        );

        const geoData = await geoResponse.json();

        if (!geoData.results) {
            throw new Error("City not found");
        }

        const location = geoData.results[0];

        const weatherResponse = await fetch(
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + location.latitude +
            "&longitude=" + location.longitude +
            "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
            "&daily=weather_code,temperature_2m_max,temperature_2m_min" +
            "&timezone=auto"
        );

        const data = await weatherResponse.json();

        displayWeather(location, data);
        displayForecast(data);
        displayTravelSuggestions(data.current.weather_code);

    } catch (error) {

        document.getElementById("error").textContent =
            "City not found. Please enter a valid city.";
    }
}


function displayWeather(location, data) {

    const current = data.current;

    document.getElementById("city").textContent =
        location.name + ", " + location.country;

    document.getElementById("temperature").textContent =
        current.temperature_2m + " °C";

    document.getElementById("humidity").textContent =
        current.relative_humidity_2m;

    document.getElementById("wind").textContent =
        current.wind_speed_10m;

    const weather = getWeather(current.weather_code);

    document.getElementById("weatherIcon").textContent =
        weather.icon;

    document.getElementById("description").textContent =
        weather.description;
}


function displayForecast(data) {

    const forecast = document.getElementById("forecast");

    forecast.innerHTML = "";

    for (let i = 0; i < 5; i++) {

        const weather = getWeather(data.daily.weather_code[i]);

        forecast.innerHTML += `
            <div class="forecast-day">

                <strong>
                    ${data.daily.time[i]}
                </strong>

                <div class="icon">
                    ${weather.icon}
                </div>

                <p>${weather.description}</p>

                <p>
                    ${data.daily.temperature_2m_max[i]}° /
                    ${data.daily.temperature_2m_min[i]}°
                </p>

            </div>
        `;
    }
}


function displayTravelSuggestions(code) {

    const suggestion =
        document.getElementById("travelSuggestion");

    const tips =
        document.getElementById("travelTips");

    tips.innerHTML = "";

    if (code === 0 || (code >= 1 && code <= 3)) {

        suggestion.textContent =
            "Great weather for outdoor travel!";

        tips.innerHTML = `
            <div class="tip">🕶️ Carry sunglasses.</div>
            <div class="tip">🚶 Good time for sightseeing.</div>
            <div class="tip">💧 Carry enough water.</div>
        `;

    } else if (code >= 51 && code <= 82) {

        suggestion.textContent =
            "Rainy weather. Plan indoor activities.";

        tips.innerHTML = `
            <div class="tip">☔ Carry an umbrella.</div>
            <div class="tip">🏛️ Visit indoor attractions.</div>
            <div class="tip">👟 Wear suitable footwear.</div>
        `;

    } else if (code >= 95) {

        suggestion.textContent =
            "Thunderstorm expected. Avoid outdoor travel.";

        tips.innerHTML = `
            <div class="tip">🏠 Stay indoors when possible.</div>
            <div class="tip">⚠️ Check weather updates.</div>
        `;

    } else {

        suggestion.textContent =
            "Check local conditions before travelling.";

        tips.innerHTML = `
            <div class="tip">📱 Keep checking weather updates.</div>
        `;
    }
}


function getWeather(code) {

    if (code === 0) {
        return {
            description: "Clear Sky",
            icon: "☀️"
        };
    }

    if (code >= 1 && code <= 3) {
        return {
            description: "Partly Cloudy",
            icon: "⛅"
        };
    }

    if (code >= 51 && code <= 67) {
        return {
            description: "Rain",
            icon: "🌧️"
        };
    }

    if (code >= 71 && code <= 77) {
        return {
            description: "Snow",
            icon: "❄️"
        };
    }

    if (code >= 80 && code <= 82) {
        return {
            description: "Rain Showers",
            icon: "🌦️"
        };
    }

    if (code >= 95) {
        return {
            description: "Thunderstorm",
            icon: "⛈️"
        };
    }

    return {
        description: "Cloudy",
        icon: "☁️"
    };
}