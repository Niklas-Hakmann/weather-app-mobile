const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";

export type Weather = {
  name: string;
  coord: { lat: number; lon: number };
  main: { temp: number };
  weather: { description: string }[];
};
export type ForecastItem = {
  dt: number;
  main: { temp: number };
  weather: { description: string }[];
};

export async function getWeather(city: string): Promise<Weather> {
  const params = new URLSearchParams({
    q: city,
    units: "metric",
    lang: "da",
    appid: API_KEY ?? "",
  });
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function getWeatherByCoords(
  lat: number,
  lon: number,
): Promise<Weather> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    lang: "da",
    appid: API_KEY ?? "",
  });
  const res = await fetch(`${BASE_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
export async function getForecast(lat: number, lon: number): Promise<ForecastItem[]> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    lang: "da",
    appid: API_KEY ?? "",
  });
  const res = await fetch(`${FORECAST_URL}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.list;
}