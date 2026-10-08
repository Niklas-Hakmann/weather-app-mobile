import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { ForecastItem, getForecast } from "@/services/weather";

export default function Forecast() {
  const { lat, lon } = useLocalSearchParams<{ lat: string; lon: string }>();
  const [items, setItems] = useState<ForecastItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getForecast(Number(lat), Number(lon))
      .then(setItems)
      .catch((e) => setError(e.message));
  }, [lat, lon]);

  if (error) return <Text>{error}</Text>;
  if (!items) return <ActivityIndicator />;

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => String(item.dt)}
      renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#ddd" }}>
          <Text>{new Date(item.dt * 1000).toLocaleString("da-DK", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</Text>
          <Text>{Math.round(item.main.temp)}° {item.weather[0].description}</Text>
        </View>
      )}
    />
  );
}