import { useState } from "react";
import {
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
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

import { auth, storage } from "../config/firebase";
import { createQuestion } from "../services/questionService";
import { questionStyles as styles } from "../styles/questionsStyles";

type LocalImage = {
  uri: string;
};

const uploadQuestionImage = async (uri: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in.");
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const storagePath = `questions/${user.uid}/${fileName}`;
  const imageRef = ref(storage, storagePath);

  await uploadBytes(imageRef, blob);
  const downloadUrl = await getDownloadURL(imageRef);

  return {
    downloadUrl,
    storagePath,
  };
};

export default function AskQuestionScreen() {
  const navigation = useNavigation<any>();

  const [text, setText] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [images, setImages] = useState<LocalImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow image access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.75,
    });

    if (result.canceled) return;

    const picked = result.assets.map((asset) => ({ uri: asset.uri }));
    setImages((current) => [...current, ...picked].slice(0, 4));
  };

  const removeImage = (uri: string) => {
    setImages((current) => current.filter((image) => image.uri !== uri));
  };

  const handleSubmit = async () => {
    const cleanedText = text.trim();

    if (!cleanedText) {
      Alert.alert("Missing question", "Please type your question first.");
      return;
    }

    try {
      setSubmitting(true);

      const uploadedImages = await Promise.all(
        images.map((image) => uploadQuestionImage(image.uri))
      );

      await createQuestion({
        text: cleanedText,
        isAnonymous,
        imageUrls: uploadedImages.map((image) => image.downloadUrl),
        imageStoragePaths: uploadedImages.map((image) => image.storagePath),
      });

      Alert.alert("Question posted", "Pharmacies can now reply to it.");
      navigation.navigate("Questions");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not post question.";

      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.detailsTopBar}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#1f2a22" />
        </Pressable>

        <View style={styles.detailsTitleBox}>
          <Text style={styles.title}>Ask a Pharmacist</Text>
          <Text style={styles.subtitle}>
            Write your question and add images if needed.
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.detailsContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <TextInput
            value={text}
            onChangeText={setText}
            style={[styles.input, styles.textArea]}
            multiline
            placeholder="Type your question here..."
            placeholderTextColor="#8a968d"
            textAlignVertical="top"
          />
        </View>

        <View style={styles.card}>
          <Pressable style={styles.imageButton} onPress={pickImages}>
            <Ionicons name="image-outline" size={20} color="#4e7e5d" />
            <Text style={styles.imageButtonText}>
              Add images {images.length}/4
            </Text>
          </Pressable>

          {images.length > 0 && (
            <View style={[styles.imagePreviewGrid, { marginTop: 14 }]}>
              {images.map((image) => (
                <View key={image.uri} style={styles.imagePreviewBox}>
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.imagePreview}
                  />

                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => removeImage(image.uri)}
                  >
                    <Ionicons name="close" size={16} color="#ffffff" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchTextBox}>
              <Text style={styles.switchTitle}>Post anonymously</Text>
              <Text style={styles.switchSubtitle}>
                Pharmacies will see this as Anonymous User.
              </Text>
            </View>

            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              thumbColor={isAnonymous ? "#4e7e5d" : "#f4f4f4"}
              trackColor={{ false: "#d9e4dc", true: "#b9d3c1" }}
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="send" size={19} color="#ffffff" />
          <Text style={styles.submitButtonText}>
            {submitting ? "Posting..." : "Post question"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}