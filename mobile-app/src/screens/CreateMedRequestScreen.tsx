import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import { useAuth } from "../contexts/AuthContext";
import { createMedicineRequest } from "../services/medicineRequestService";
import { createMedRequestStyles as styles } from "../styles/createMedRequestStyles";

import {
  LEBANON_REGIONS,
  REGION_CITIES,
  type LebanonRegion,
} from "../../../shared/constants/lebanonLocations";

type SearchMode = "nearby" | "area";

export default function CreateMedicineRequestScreen() {
  const navigation = useNavigation<any>();
  const { appUser } = useAuth();

  const [medicineName, setMedicineName] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [searchMode, setSearchMode] = useState<SearchMode>("nearby");
  const [region, setRegion] = useState<LebanonRegion | null>(null);
  const [city, setCity] = useState<string | null>(null);

  const [allowSubstitutes, setAllowSubstitutes] = useState(true);
  const [isUrgent, setIsUrgent] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const chooseNearbyMode = async () => {
  setSearchMode("nearby");
  setRegion(null);
  setCity(null);
};

  const chooseAreaMode = () => {
    setSearchMode("area");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.75,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const getNearbyLocation = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (!permission.granted) {
      throw new Error("Location permission is required for nearby pharmacies.");
    }

    const position = await Location.getCurrentPositionAsync({});

    return {
      locationLat: position.coords.latitude,
      locationLng: position.coords.longitude,
    };
  };

  const handleSubmit = async () => {
    if (!medicineName.trim()) {
      Alert.alert("Missing medicine name", "Please write the medicine name.");
      return;
    }

    if (searchMode === "area" && !region) {
      Alert.alert(
        "Choose pharmacy region",
        "Please choose a pharmacy region or use nearby search."
      );
      return;
    }

    try {
      setSubmitting(true);

      let locationLat: number | null = null;
      let locationLng: number | null = null;

      const selectedRegion = searchMode === "area" ? region : null;
      const selectedCity = searchMode === "area" ? city : null;

      if (searchMode === "nearby") {
        const location = await getNearbyLocation();
        locationLat = location.locationLat;
        locationLng = location.locationLng;
      }

      await createMedicineRequest({
        userName: appUser?.name ?? null,
        medicineName,
        notes: notes.trim() || null,
        localImageUri: imageUri,
        region: selectedRegion,
        city: selectedCity,
        locationLat,
        locationLng,
        urgency: isUrgent ? "urgent" : "normal",
        allowSubstitutes,
      });

      Alert.alert("Request sent", "Your medicine request was created.", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not create medicine request.";

      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.topBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View>
          <Text style={styles.title}>Request Medicine</Text>
          <Text style={styles.subtitle}>Send your request to pharmacies.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            Medicine name <Text style={styles.requiredStar}>*</Text>
          </Text>

          <TextInput
            value={medicineName}
            onChangeText={setMedicineName}
            placeholder="Example: Panadol Extra"
            placeholderTextColor="#8a968d"
            style={styles.input}
          />

          <Text style={styles.label}>Notes</Text>
          <Text style={styles.helperText}>
            You can write any illnesses, allergies, or other medicines you take
            that may relate to buying this medicine or getting a substitute.
          </Text>

          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional notes..."
            placeholderTextColor="#8a968d"
            style={[styles.input, styles.textArea]}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.labelRow}>
            <Text style={styles.labelNoMargin}>Medicine image</Text>
            <Text style={styles.optionalText}>- optional</Text>
          </View>

          {imageUri ? (
            <View style={styles.imagePreviewBox}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />

              <Pressable
                style={styles.removeImageButton}
                onPress={() => setImageUri(null)}
              >
                <Ionicons name="close" size={18} color="#9f2a20" />
                <Text style={styles.removeImageText}>Remove</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.imageButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={22} color="#4e7e5d" />
              <Text style={styles.imageButtonText}>Add image</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pharmacy search location</Text>
          <Text style={styles.sectionNote}>
            Choose one search method. Nearby uses your current location. Area
            lets you choose where pharmacies should be located.
          </Text>

          <View style={styles.searchModeGrid}>
            <Pressable
              style={[
                styles.searchModeCard,
                searchMode === "nearby" && styles.searchModeCardActive,
              ]}
              onPress={chooseNearbyMode}
            >
              <View
                style={[
                  styles.searchModeIcon,
                  searchMode === "nearby" && styles.searchModeIconActive,
                ]}
              >
                <Ionicons
                  name="navigate-outline"
                  size={22}
                  color={searchMode === "nearby" ? "#4e7e5d" : "#66736a"}
                />
              </View>

              <View style={styles.searchModeTextBox}>
                <Text
                  style={[
                    styles.searchModeTitle,
                    searchMode === "nearby" && styles.searchModeTitleActive,
                  ]}
                >
                  Nearby pharmacies
                </Text>
                <Text style={styles.searchModeSubtitle}>
                  Send your request to pharmacies near your current location.
                </Text>
              </View>

              {searchMode === "nearby" && (
                <Ionicons name="checkmark-circle" size={22} color="#4e7e5d" />
              )}
            </Pressable>

            <Pressable
              style={[
                styles.searchModeCard,
                searchMode === "area" && styles.searchModeCardActive,
              ]}
              onPress={chooseAreaMode}
            >
              <View
                style={[
                  styles.searchModeIcon,
                  searchMode === "area" && styles.searchModeIconActive,
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={22}
                  color={searchMode === "area" ? "#4e7e5d" : "#66736a"}
                />
              </View>

              <View style={styles.searchModeTextBox}>
                <Text
                  style={[
                    styles.searchModeTitle,
                    searchMode === "area" && styles.searchModeTitleActive,
                  ]}
                >
                  Choose pharmacy area
                </Text>
                <Text style={styles.searchModeSubtitle}>
                  Select a region and optional city where pharmacies should be
                  located.
                </Text>
              </View>

              {searchMode === "area" && (
                <Ionicons name="checkmark-circle" size={22} color="#4e7e5d" />
              )}
            </Pressable>
          </View>

          {searchMode === "area" && (
            <View style={styles.areaBox}>
              <Text style={styles.label}>
                Pharmacy region <Text style={styles.requiredStar}>*</Text>
              </Text>

              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={region}
                  onValueChange={(value: LebanonRegion | null) => {
                    setRegion(value);
                    setCity(null);
                  }}
                >
                  <Picker.Item label="Choose pharmacy region..." value={null} />
                  {LEBANON_REGIONS.map((item) => (
                    <Picker.Item key={item} label={item} value={item} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Pharmacy city</Text>

              <View
                style={[styles.pickerBox, !region && styles.disabledPickerBox]}
              >
                <Picker
                  selectedValue={city}
                  enabled={!!region}
                  onValueChange={(value: string | null) => setCity(value)}
                >
                  <Picker.Item
                    label={
                      region ? "Choose pharmacy city..." : "Choose region first"
                    }
                    value={null}
                  />

                  {region &&
                    REGION_CITIES[region].map((item) => (
                      <Picker.Item key={item} label={item} value={item} />
                    ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextBox}>
              <Text style={styles.switchTitle}>Allow substitutes</Text>
              <Text style={styles.switchSubtitle}>
                Pharmacies may suggest an alternative with the same active
                ingredient.
              </Text>
            </View>

            <Switch
              value={allowSubstitutes}
              onValueChange={setAllowSubstitutes}
              thumbColor={allowSubstitutes ? "#4e7e5d" : "#f4f4f4"}
              trackColor={{ false: "#d9e4dc", true: "#b9d3c1" }}
            />
          </View>

          <View style={styles.divider} />

          <View style={[styles.urgentBox, isUrgent && styles.urgentBoxActive]}>
            <View style={styles.switchRow}>
              <View style={styles.switchTextBox}>
                <Text
                  style={[
                    styles.switchTitle,
                    isUrgent && styles.urgentTitle,
                  ]}
                >
                  Urgent request
                </Text>
                <Text style={styles.switchSubtitle}>
                  Mark this if you need replies as soon as possible.
                </Text>
              </View>

              <Switch
                value={isUrgent}
                onValueChange={setIsUrgent}
                thumbColor={isUrgent ? "#9f2a20" : "#f4f4f4"}
                trackColor={{ false: "#d9e4dc", true: "#f3b8b2" }}
              />
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.submitButtonPressed,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.submitButtonText}>Send Request</Text>
              <Ionicons name="send-outline" size={19} color="#ffffff" />
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}