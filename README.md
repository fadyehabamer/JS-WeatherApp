<p align='center'>
  <img src="read.png">
</p>

# JS Weather App

Current weather for any city, or for your current location, in plain HTML, CSS and JavaScript (no build step). Data comes from the [OpenWeatherMap Current Weather API](https://openweathermap.org/current).

Live demo: https://getweathernow.vercel.app/

## Features

- Search by city name (press <kbd>Enter</kbd>)
- "Get Device Location" uses the browser Geolocation API
- Shows temperature, "feels like", humidity and a condition icon
- Clear error messages for unknown cities, rejected API keys, rate limits and network failures

## Running locally

Serve the folder with any static server (geolocation requires `https://` or `localhost`):

```sh
npx serve .
# or
python3 -m http.server 8000
```

Then open the printed URL.

## API key

The OpenWeatherMap API key is hard-coded in the request URLs in `script.js` (`appid=` in `requestApi` and `onSuccess`). Because this is a static front-end app, any key shipped to the browser is visible to every visitor; it cannot be kept secret without a server-side proxy.

To use your own key:

1. Create a free key at <https://home.openweathermap.org/api_keys>.
2. Replace the `appid` value in both URLs in `script.js`.
3. Keep usage limits in mind and rotate the key if it is abused.

## License

[MIT](LICENSE)
