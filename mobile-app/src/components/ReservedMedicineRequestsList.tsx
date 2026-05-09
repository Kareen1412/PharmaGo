import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { medRequestsStyles as styles } from "../styles/medRequestsStyles";

type Props = {
  onCreateRequest: () => void;
};

export default function ReservedMedicineRequestsList({
  onCreateRequest,
}: Props) {
  return (
    <View style={styles.emptyCard}>
      <Ionicons name="bookmark-outline" size={30} color="#4e7e5d" />
      <Text style={styles.emptyTitle}>No reserved requests</Text>
      <Text style={styles.emptyText}>
        When you reserve medicine from a pharmacy, it will appear here.
      </Text>

      <Pressable style={styles.emptyActionButton} onPress={onCreateRequest}>
        <Text style={styles.emptyActionText}>Create request</Text>
      </Pressable>
    </View>
  );
}