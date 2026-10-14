import { render, screen, waitFor } from "@testing-library/react-native";
import * as Location from "expo-location";
import type { ReactNode } from "react";
import Index from "@/app/index";
import { loadCache, saveCache } from "@/services/cache";
import { getWeather, getWeatherByCoords } from "@/services/weather";


jest.mock("@/services/cache");
jest.mock("@/services/weather");
jest.mock("expo-location");
jest.mock("expo-router", () => {
  const { Text } = require("react-native");
  return {
    Link: ({ children, ...props }: { children: ReactNode }) => <Text {...props}>{children}</Text>,
  };
});

const mockedLoadCache = loadCache as jest.Mock;
const mockedSaveCache = saveCache as jest.Mock;
const mockedGetWeather = getWeather as jest.Mock;
const mockedGetWeatherByCoords = getWeatherByCoords as jest.Mock;
const mockedRequestPermissions = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockedGetCurrentPosition = Location.getCurrentPositionAsync as jest.Mock;

const weather = {
  name: "Odense",
  coord: { lat: 55.4, lon: 10.4 },
  main: { temp: 12.3 },
  weather: [{ description: "cloudy" }],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockedLoadCache.mockResolvedValue(null);
  mockedSaveCache.mockResolvedValue(undefined);
});

describe("Index screen", () => {
  it("falls back to Odense when location permission is denied", async () => {
    mockedRequestPermissions.mockResolvedValue({ status: "denied" });
    mockedGetWeather.mockResolvedValue(weather);

    render(<Index />);

    await waitFor(() => expect(screen.getByText("Odense")).toBeTruthy());

    expect(mockedGetWeather).toHaveBeenCalledWith("Odense");
    expect(mockedGetWeatherByCoords).not.toHaveBeenCalled();
    expect(screen.getByText("12°")).toBeTruthy();
    expect(mockedSaveCache).toHaveBeenCalledWith("weather", weather);
  });

  it("uses coordinates when location permission is granted", async () => {
    mockedRequestPermissions.mockResolvedValue({ status: "granted" });
    mockedGetCurrentPosition.mockResolvedValue({ coords: { latitude: 55.4, longitude: 10.4 } });
    mockedGetWeatherByCoords.mockResolvedValue(weather);

    render(<Index />);

    await waitFor(() => expect(screen.getByText("Odense")).toBeTruthy());

    expect(mockedGetWeatherByCoords).toHaveBeenCalledWith(55.4, 10.4);
    expect(mockedGetWeather).not.toHaveBeenCalled();
  });

  it("shows cached data immediately while the fresh request is pending", async () => {
    mockedLoadCache.mockResolvedValue({ value: weather, savedAt: Date.parse("2026-01-01T10:00:00") });
    mockedRequestPermissions.mockReturnValue(new Promise(() => {}));

    render(<Index />);

    await waitFor(() => expect(screen.getByText("Odense")).toBeTruthy());
    expect(screen.getByText(/Offline: viser data fra/)).toBeTruthy();
  });

  it("shows an error message when there is no cache and the request fails", async () => {
    mockedRequestPermissions.mockResolvedValue({ status: "denied" });
    mockedGetWeather.mockRejectedValue(new Error("Network error"));

    render(<Index />);

    await waitFor(() => expect(screen.getByText("Network error")).toBeTruthy());
  });
});