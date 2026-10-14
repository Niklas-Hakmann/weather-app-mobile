import { getForecast, getWeather, getWeatherByCoords } from "@/services/weather";

function mockFetchOnce(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
  }) as jest.Mock;
}

describe("getWeather", () => {
  it("calls the weather endpoint with a city name and returns the json", async () => {
    const weather = {
      name: "Odense",
      coord: { lat: 55.4, lon: 10.4 },
      main: { temp: 12.3 },
      weather: [{ description: "cloudy" }],
    };
    mockFetchOnce(weather);

    const result = await getWeather("Odense");

    expect(result).toEqual(weather);
    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("q=Odense");
  });

  it("throws an error when the response is not ok", async () => {
    mockFetchOnce({}, false, 404);

    await expect(getWeather("Unknown")).rejects.toThrow("HTTP 404");
  });
});

describe("getWeatherByCoords", () => {
  it("sends lat/lon in the request", async () => {
    mockFetchOnce({
      name: "Odense",
      coord: { lat: 55.4, lon: 10.4 },
      main: { temp: 10 },
      weather: [{ description: "sunny" }],
    });

    await getWeatherByCoords(55.4, 10.4);

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as string;
    expect(url).toContain("lat=55.4");
    expect(url).toContain("lon=10.4");
  });
});

describe("getForecast", () => {
  it("returns the list array from the forecast response", async () => {
    const list = [{ dt: 1, main: { temp: 5 }, weather: [{ description: "rain" }] }];
    mockFetchOnce({ list });

    const result = await getForecast(55.4, 10.4);

    expect(result).toEqual(list);
  });

  it("throws an error when the response is not ok", async () => {
    mockFetchOnce({}, false, 500);

    await expect(getForecast(55.4, 10.4)).rejects.toThrow("HTTP 500");
  });
});