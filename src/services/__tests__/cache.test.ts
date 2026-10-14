import { loadCache, saveCache } from "@/services/cache";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("saveCache / loadCache", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("saves and fetches falue again", async () => {
    await saveCache("weather", { city: "Odense" });

    const result = await loadCache<{ city: string }>("weather");

    expect(result?.value).toEqual({ city: "Odense" });
    expect(typeof result?.savedAt).toBe("number");
  });

  it("returns null when nothing is cached", async () => {
    const result = await loadCache("missing-key");

    expect(result).toBeNull();
  });

  it("returns null instead of throwing if data is not valid", async () => {
    await AsyncStorage.setItem("broken", "{ not valid json");

    const result = await loadCache("broken");

    expect(result).toBeNull();
  });

  it("swallows erros from saveCache instead of throwing", async () => {
    jest
      .spyOn(AsyncStorage, "setItem")
      .mockRejectedValueOnce(new Error("disk full"));

    await expect(
      saveCache("weather", { city: "Odense" }),
    ).resolves.toBeUndefined();
  });
});
