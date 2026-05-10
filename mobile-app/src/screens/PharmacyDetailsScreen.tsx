import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import type {
  DailyOperatingHours,
  Pharmacy,
  PharmacyPhone,
} from "../../../shared/types/pharmacy";
import {
  getPharmacyPhones,
  listenToFavoritePharmacyIds,
  listenToPharmacyById,
  toggleFavoritePharmacy,
} from "../services/pharmacyService";
import { pharmacyStyles as styles } from "../styles/pharmacyStyles";

type RouteParams = {
  pharmacy: Pharmacy;
};

const DAYS: { key: keyof Pharmacy["operatingHours"]; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

const getPharmacyName = (pharmacy: Pharmacy) => {
  return (
    pharmacy.pharmacyNameEnglish ||
    pharmacy.pharmacyNameArabic ||
    "Pharmacy"
  );
};

const getLocationText = (pharmacy: Pharmacy) => {
  const address = pharmacy.address;

  const parts = [
    address?.region,
    address?.city,
    address?.street,
    address?.additionalDetails,
  ].filter(Boolean);

  if (parts.length === 0) return "Location not specified";

  return parts.join(", ");
};

const getHoursText = (hours: DailyOperatingHours | undefined) => {
  if (!hours) return "Not specified";
  if (hours.isClosed) return "Closed";
  if (!hours.open || !hours.close) return "Not specified";
  return `${hours.open} - ${hours.close}`;
};

export default function PharmacyDetailsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pharmacy } = route.params as RouteParams;

  const [currentPharmacy, setCurrentPharmacy] = useState<Pharmacy>(pharmacy);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [phones, setPhones] = useState<PharmacyPhone[]>([]);

  const isFavorite = favoriteIds.includes(currentPharmacy.id);

  useEffect(() => {
    const unsubscribe = listenToPharmacyById(
      pharmacy.id,
      (updatedPharmacy) => {
        if (updatedPharmacy) {
          setCurrentPharmacy(updatedPharmacy);
        }
      },
      (error) => console.error("Failed to listen to pharmacy:", error)
    );

    return unsubscribe;
  }, [pharmacy.id]);

  useEffect(() => {
    const unsubscribeFavorites = listenToFavoritePharmacyIds(
      setFavoriteIds,
      (error) => console.error("Failed to listen to favorites:", error)
    );

    getPharmacyPhones(pharmacy.id)
      .then(setPhones)
      .catch((error) => console.error("Failed to load phones:", error));

    return unsubscribeFavorites;
  }, [pharmacy.id]);

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoritePharmacy(currentPharmacy.id, isFavorite);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update favorite.";
      Alert.alert("Error", message);
    }
  };

  const openMap = async () => {
    if (currentPharmacy.address?.locationUrl) {
      await Linking.openURL(currentPharmacy.address.locationUrl);
      return;
    }

    const lat = currentPharmacy.address?.mapLat;
    const lng = currentPharmacy.address?.mapLng;

    if (typeof lat === "number" && typeof lng === "number") {
      await Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`);
      return;
    }

    Alert.alert("No map location", "This pharmacy has no map link.");
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.titleBox}>
          <Text style={styles.title}>Pharmacy Details</Text>
          <Text style={styles.subtitle}>View pharmacy information.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.detailsHeroCard}>
          <View style={styles.detailsHeaderRow}>
            <View style={styles.detailsIcon}>
              <Ionicons name="medical-outline" size={28} color="#4e7e5d" />
            </View>

            <View style={styles.detailsMain}>
              <Text style={styles.detailsName}>
                {getPharmacyName(currentPharmacy)}
              </Text>

              {currentPharmacy.pharmacyNameArabic && (
                <Text style={styles.detailsMeta}>
                  {currentPharmacy.pharmacyNameArabic}
                </Text>
              )}

              <Text style={styles.detailsMeta}>
                {getLocationText(currentPharmacy)}
              </Text>
            </View>

            <Pressable style={styles.starButton} onPress={handleToggleFavorite}>
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={23}
                color={isFavorite ? "#d6a22a" : "#66736a"}
              />
            </Pressable>
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.softBadge}>
              <Text style={styles.softBadgeText}>Verified</Text>
            </View>

            {currentPharmacy.is24Hours && (
              <View style={styles.softBadge}>
                <Text style={styles.softBadgeText}>24 hours</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Address</Text>
          <Text style={styles.detailValue}>
            {getLocationText(currentPharmacy)}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>Region</Text>
              <Text style={styles.infoValue}>
                {currentPharmacy.address?.region ?? "Not specified"}
              </Text>
            </View>

            <View style={styles.infoPill}>
              <Text style={styles.infoLabel}>City</Text>
              <Text style={styles.infoValue}>
                {currentPharmacy.address?.city ?? "Not specified"}
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.filterButton, { marginTop: 14 }]}
            onPress={openMap}
          >
            <Text style={styles.filterButtonText}>Open in Maps</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Phone numbers</Text>

          {phones.length === 0 ? (
            <Text style={styles.detailMuted}>No phone numbers added.</Text>
          ) : (
            phones.map((phone) => (
              <Pressable
                key={phone.id}
                style={styles.phoneRow}
                onPress={() => Linking.openURL(`tel:${phone.phoneNumber}`)}
              >
                <Ionicons name="call-outline" size={17} color="#4e7e5d" />
                <Text style={styles.phoneText}>{phone.phoneNumber}</Text>

                {phone.isWhatsapp && (
                  <Text style={styles.detailMuted}>WhatsApp</Text>
                )}

                {phone.isLandline && (
                  <Text style={styles.detailMuted}>Landline</Text>
                )}
              </Pressable>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.detailLabel}>Operating hours</Text>

          {currentPharmacy.is24Hours ? (
            <Text style={styles.detailValue}>Open 24 hours</Text>
          ) : (
            DAYS.map((day) => (
              <View key={day.key} style={styles.infoGrid}>
                <View style={styles.infoPill}>
                  <Text style={styles.infoLabel}>{day.label}</Text>
                  <Text style={styles.infoValue}>
                    {getHoursText(currentPharmacy.operatingHours?.[day.key])}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}