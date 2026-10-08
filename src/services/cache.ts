import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveCache<T>(key: string, value: T) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() }));
  } catch {
    // cache er "nice to have", så en fejl her må ikke vælte appen
  }
}

export async function loadCache<T>(key: string): Promise<{ value: T; savedAt: number } | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}