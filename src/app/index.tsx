import { loadCache, saveCache } from "@/services/cache";
import { getWeather, getWeatherByCoords, Weather } from "@/services/weather";
import * as Location from "expo-location";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

export default function Index() {
  const [data, setData] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const cached = await loadCache<Weather>("weather");
      if (cached) {
        setData(cached.value);
        setSavedAt(cached.savedAt);
      }

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        const fresh =
          status === "granted"
            ? await Location.getCurrentPositionAsync({}).then((pos) =>
                getWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
              )
            : await getWeather("Odense");

        setData(fresh);
        setSavedAt(null);
        await saveCache("weather", fresh);
      } catch (e) {
        if (!cached) setError((e as Error).message);
      }
    })();
  }, []);

  if (error) return <Text>{error}</Text>;
  if (!data) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>{data.name}</Text>
      <Text style={{ fontSize: 48 }}>{Math.round(data.main.temp)}°</Text>
      <Text>{data.weather[0].description}</Text>
      {savedAt && (
        <Text style={{ color: "gray", marginTop: 8 }}>
          Offline: viser data fra{" "}
          {new Date(savedAt).toLocaleTimeString("da-DK", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      )}
      <Link
        href={{
          pathname: "/forecast",
          params: { lat: data.coord.lat, lon: data.coord.lon },
        }}
        style={{ marginTop: 24, color: "#007AFF" }}
      >
        Se 5-dages prognose
      </Link>
    </View>
  );
}
