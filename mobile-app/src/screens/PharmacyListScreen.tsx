import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";

import type { Pharmacy } from "../../../shared/types/pharmacy";
import {
  LEBANON_REGIONS,
  REGION_CITIES,
  type LebanonRegion,
} from "../../../shared/constants/lebanonLocations";
import {
  filterPharmacies,
  getVerifiedActivePharmacies,
  listenToFavoritePharmacyIds,
  toggleFavoritePharmacy,
  type PharmacyFilterMode,
  type UserLocation,
} from "../services/pharmacyService";
import { pharmacyStyles as styles } from "../styles/pharmacyStyles";

const getPharmacyName = (pharmacy: Pharmacy) => {
  return pharmacy.pharmacyNameEnglish || pharmacy.pharmacyNameArabic || "Pharmacy";
};

const getLocationText = (pharmacy: Pharmacy) => {
  const region = pharmacy.address?.region;
  const city = pharmacy.address?.city;

  if (region && city) return `${region}, ${city}`;
  if (region) return region;
  if (city) return city;

  return "Location not specified";
};

export default function PharmacyListScreen() {
  const navigation = useNavigation<any>();

  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [filterMode, setFilterMode] = useState<PharmacyFilterMode>("all");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [region, setRegion] = useState<LebanonRegion | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVerifiedActivePharmacies()
      .then(setPharmacies)
      .catch((error) => {
        console.error("Failed to load pharmacies:", error);
        Alert.alert("Error", "Could not load pharmacies.");
      })
      .finally(() => setLoading(false));

    const unsubscribeFavorites = listenToFavoritePharmacyIds(
      setFavoriteIds,
      (error) => console.error("Failed to listen to favorites:", error)
    );

    return unsubscribeFavorites;
  }, []);

  const filteredPharmacies = useMemo(() => {
    return filterPharmacies(pharmacies, {
      mode: filterMode,
      userLocation,
      region,
      city,
    });
  }, [pharmacies, filterMode, userLocation, region, city]);

  const handleNearbyFilter = async () => {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          "Location permission is required to find nearby pharmacies."
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync({});

      setUserLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      setRegion(null);
      setCity(null);
      setFilterMode("nearby");
    } catch {
      Alert.alert("Error", "Could not get your current location.");
    }
  };

  const handleToggleFavorite = async (pharmacyId: string) => {
    try {
      await toggleFavoritePharmacy(
        pharmacyId,
        favoriteIds.includes(pharmacyId)
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update favorite.";
      Alert.alert("Error", message);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Browse Pharmacies</Text>
          <Text style={styles.subtitle}>
            Find verified active pharmacies by location.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.filterCard}>
          <View style={styles.filterRow}>
            <Pressable
              style={[
                styles.filterButton,
                filterMode === "all" && styles.filterButtonActive,
              ]}
              onPress={() => {
                setFilterMode("all");
                setRegion(null);
                setCity(null);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === "all" && styles.filterButtonTextActive,
                ]}
              >
                All
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                filterMode === "nearby" && styles.filterButtonActive,
              ]}
              onPress={handleNearbyFilter}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === "nearby" && styles.filterButtonTextActive,
                ]}
              >
                Nearby
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.filterButton,
                filterMode === "area" && styles.filterButtonActive,
              ]}
              onPress={() => {
                setFilterMode("area");
                setUserLocation(null);
              }}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  filterMode === "area" && styles.filterButtonTextActive,
                ]}
              >
                Area
              </Text>
            </Pressable>
          </View>

          {filterMode === "area" && (
            <>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={region}
                  onValueChange={(value: LebanonRegion | null) => {
                    setRegion(value);
                    setCity(null);
                  }}
                >
                  <Picker.Item label="Choose region..." value={null} />
                  {LEBANON_REGIONS.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>

              <View
                style={[styles.pickerBox, !region && styles.disabledPickerBox]}
              >
                <Picker
                  selectedValue={city}
                  enabled={!!region}
                  onValueChange={(value: string | null) => setCity(value)}
                >
                  <Picker.Item
                    label={region ? "Choose city..." : "Choose region first"}
                    value={null}
                  />

                  {region &&
                    REGION_CITIES[region].map((item) => (
                      <Picker.Item key={item} label={item} value={item} />
                    ))}
                </Picker>
              </View>
            </>
          )}
        </View>

        {loading ? (
          <ActivityIndicator color="#4e7e5d" />
        ) : filteredPharmacies.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={28} color="#4e7e5d" />
            <Text style={styles.emptyTitle}>No pharmacies found</Text>
            <Text style={styles.emptyText}>
              Try changing the filter or browsing all pharmacies.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {filteredPharmacies.map((pharmacy) => {
              const isFavorite = favoriteIds.includes(pharmacy.id);

              return (
                <Pressable
                  key={pharmacy.id}
                  style={styles.pharmacyCard}
                  onPress={() =>
                    navigation.navigate("PharmacyDetails", { pharmacy })
                  }
                >
                  <View style={styles.pharmacyTopRow}>
                    <View style={styles.pharmacyIcon}>
                      <Ionicons
                        name="medical-outline"
                        size={22}
                        color="#4e7e5d"
                      />
                    </View>

                    <View style={styles.pharmacyInfo}>
                      <Text style={styles.pharmacyName} numberOfLines={1}>
                        {getPharmacyName(pharmacy)}
                      </Text>

                      <Text style={styles.pharmacyMeta}>
                        {getLocationText(pharmacy)}
                      </Text>
                    </View>

                    <Pressable
                      style={styles.starButton}
                      onPress={(event) => {
                        event.stopPropagation();
                        handleToggleFavorite(pharmacy.id);
                      }}
                    >
                      <Ionicons
                        name={isFavorite ? "star" : "star-outline"}
                        size={22}
                        color={isFavorite ? "#d6a22a" : "#66736a"}
                      />
                    </Pressable>
                  </View>

                  <View style={styles.badgeRow}>
                    <View style={styles.softBadge}>
                      <Text style={styles.softBadgeText}>Verified</Text>
                    </View>

                    {pharmacy.is24Hours && (
                      <View style={styles.softBadge}>
                        <Text style={styles.softBadgeText}>24 hours</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}