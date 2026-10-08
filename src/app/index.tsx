import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import * as Location from "expo-location";
import { getWeather, getWeatherByCoords, Weather } from "@/services/weather";

export default function Index() {
  const [data, setData] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);

useEffect(() => {
  (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setData(await getWeather("Odense")); // fallback
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setData(await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude));
    } catch (e) {
      setError((e as Error).message);
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
    </View>
  );
}