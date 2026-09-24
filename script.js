const wrapper = document.querySelector(".wrapper"),
    inputPart = document.querySelector(".input-part"),
    infoTxt = inputPart.querySelector(".info-txt"),
    inputField = inputPart.querySelector("input"),
    locationBtn = inputPart.querySelector("button"),
    weatherPart = wrapper.querySelector(".weather-part"),
    wIcon = weatherPart.querySelector("img"),
    arrowBack = wrapper.querySelector("header .back-btn"),
    unitButtons = weatherPart.querySelectorAll(".unit-toggle button");

let api;
let lastCity = null; // city name of the current search, null for geolocation lookups

// show a message in the status box; type is "pending", "error" or null to hide it
const UNIT_KEY = "weatherUnit";
let unit = "C";
let tempsCelsius = null;

try {
    if (localStorage.getItem(UNIT_KEY) === "F") unit = "F";
} catch (e) {}

function formatTemp(celsius) {
    return Math.round(unit === "F" ? celsius * 9 / 5 + 32 : celsius);
}

function renderTemps() {
    unitButtons.forEach(btn => btn.setAttribute("aria-pressed", String(btn.dataset.unit === unit)));
    weatherPart.querySelectorAll(".unit").forEach(el => el.innerText = unit);
    if (!tempsCelsius) return;
    weatherPart.querySelector(".temp .numb").innerText = formatTemp(tempsCelsius.temp);
    weatherPart.querySelector(".temp .numb-2").innerText = formatTemp(tempsCelsius.feels_like);
}

function setUnit(newUnit) {
    unit = newUnit;
    try {
        localStorage.setItem(UNIT_KEY, unit);
    } catch (e) {}
    renderTemps();
}

unitButtons.forEach(btn => btn.addEventListener("click", () => setUnit(btn.dataset.unit)));
renderTemps();

function setStatus(message, type) {
    infoTxt.classList.remove("pending", "error");
    if (type) infoTxt.classList.add(type);
    infoTxt.innerText = message;
}

inputField.addEventListener("keyup", e => {
    // if user pressed enter btn and input value is not empty
    const city = inputField.value.trim();
    if (e.key == "Enter" && city != "") {
        requestApi(city);
    }
});

locationBtn.addEventListener("click", () => {
    if (navigator.geolocation) { // if browser support geolocation api
        navigator.geolocation.getCurrentPosition(onSuccess, onError);
    } else {
        alert("Your browser not support geolocation api");
    }
});

function requestApi(city) {
    lastCity = city;
    api = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=93f2fce913853464e6211aafd3aa5678
    `;
    fetchData();
}

function onSuccess(position) {
    lastCity = null;
    const { latitude, longitude } = position.coords; // getting lat and lon of the user device from coords obj
    api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=93f2fce913853464e6211aafd3aa5678
    `;
    fetchData();
}

function onError(error) {
    // if any error occur while getting user location then we'll show it in infoText
    setStatus(error.message, "error");
}

// turn a failed API response into a message the user can act on
function apiErrorMessage(status, body) {
    if (status == 404) {
        return lastCity ? `"${lastCity}" isn't a valid city name` : "No weather data found for your location";
    }
    if (status == 401) return "The weather service rejected the API key";
    if (status == 429) return "Too many requests, please try again in a minute";
    return (body && body.message) || `Weather service error (HTTP ${status})`;
}

function fetchData() {
    setStatus("Getting weather details...", "pending");
    fetch(api)
        .then(res => res.json().catch(() => null).then(body => {
            if (!res.ok || !body) throw new Error(apiErrorMessage(res.status, body));
            return body;
        }))
        .then(result => weatherDetails(result))
        .catch(err => {
            // TypeError means the request itself failed (offline, blocked, CORS)
            const message = err instanceof TypeError ? "Could not reach the weather service, check your connection" : err.message;
            setStatus(message, "error");
        });
}

function weatherDetails(info) {
    if (!info.weather || !info.weather.length || !info.main) {
        setStatus("The weather service returned an unexpected response", "error");
    } else {
        //getting required properties value from the whole weather information
        const city = info.name;
        const country = info.sys && info.sys.country; // absent for some coordinates (e.g. at sea)
        const { description, id } = info.weather[0];
        const { temp, feels_like, humidity } = info.main;

        // using custom weather icon according to the id which api gives to us
        if (id == 800) {
            wIcon.src = "icons/clear.svg";
        } else if (id >= 200 && id <= 232) {
            wIcon.src = "icons/storm.svg";
        } else if (id >= 600 && id <= 622) {
            wIcon.src = "icons/snow.svg";
        } else if (id >= 701 && id <= 781) {
            wIcon.src = "icons/haze.svg";
        } else if (id >= 801 && id <= 804) {
            wIcon.src = "icons/cloud.svg";
        } else if ((id >= 500 && id <= 531) || (id >= 300 && id <= 321)) {
            wIcon.src = "icons/rain.svg";
        }

        //passing a particular weather info to a particular element
        tempsCelsius = { temp, feels_like };
        renderTemps();
        weatherPart.querySelector(".weather").innerText = description;
        wIcon.alt = description;
        weatherPart.querySelector(".location span").innerText = [city, country].filter(Boolean).join(", ") || "Unknown location";
        weatherPart.querySelector(".humidity span").innerText = `${humidity}%`;
        setStatus("", null);
        inputField.value = "";
        wrapper.classList.add("active");
    }
}

arrowBack.addEventListener("click", () => {
    wrapper.classList.remove("active");
    inputField.focus();
});
