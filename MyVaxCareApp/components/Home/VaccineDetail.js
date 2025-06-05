import { useNavigation } from "@react-navigation/native";
import { Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import { Image, Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const screenWidth = Dimensions.get("window").width;

const VaccineDetail = ({ route }) => {
  const { vaccine } = route.params;
  const navigation = useNavigation();

  const handleBooking = () => {
    navigation.navigate("Booking", { vaccineId: vaccine.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: "https://res.cloudinary.com/dwpyfpdyr/" + vaccine.image }}
          resizeMode="cover"
          style={styles.image}
        />

        <View style={styles.infoCard}>
          <Text style={styles.title}>{vaccine.name}</Text>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Nguồn gốc:</Text>
            <Text style={styles.value}>{vaccine.manufacturer}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.label}>Số liều:</Text>
            <Text style={styles.value}>{vaccine.quantity_dose}</Text>
          </View>

          <Text style={styles.descriptionLabel}>Mô tả:</Text>
          <Text style={styles.description}>{vaccine.description}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleBooking}>
          <Text style={styles.buttonText}>Đặt lịch tiêm</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default VaccineDetail;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F8",
    padding: 10,
  },

  image: {
    width: screenWidth - 20,
    height: 200,
    borderRadius: 16,
    marginBottom: 16,
  },

  infoCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#1E1E1E",
    textAlign: "center",
  },

  detailRow: {
    flexDirection: "row",
    marginBottom: 10,
  },

  label: {
    fontWeight: "600",
    width: 110,
    color: "#555",
  },

  value: {
    color: "#444",
    flex: 1,
  },

  descriptionLabel: {
    marginTop: 16,
    fontWeight: "bold",
    fontSize: 16,
    color: "#555",
  },

  description: {
    color: "#444",
    marginTop: 6,
    lineHeight: 20,
    fontSize: 14,
  },

  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginHorizontal: 10,
    marginBottom: 24,
    shadowColor: "#1e90ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
