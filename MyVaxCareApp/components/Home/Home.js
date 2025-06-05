import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useContext } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../../services/API";
import { MyUserContext } from "../../services/Context";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { useNavigation } from "@react-navigation/native";

const Home = () => {
  const [vaccines, setVaccines] = useState(null);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [qr, setQr] = useState(false);

  const users = useContext(MyUserContext);
  const navigation = useNavigation();

  useEffect(() => {
    fetchVaccine();
  }, []);

  const fetchVaccine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const re = await authApi(token).get("/vaccines/");
      setVaccines(re.data);
      setFilteredVaccines(re.data);
    } catch (error) {
      console.log("Lỗi lấy vaccine", error);
    }
  };

  const handleSearch = (text) => {
    setSearch(text);
    const filter = vaccines?.filter((vac) =>
      vac.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredVaccines(filter);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.theme1}>
        <View style={styles.headerRow}>
          <Ionicons name="notifications-outline" size={26} color="#fff" />
        </View>
        {users && (
          <View style={styles.userCard}>
            <Image
              source={{ uri: "https://res.cloudinary.com/dwpyfpdyr/" + users.avatar }}
              style={styles.avatarLarge}
            />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {users.first_name} {users.last_name}
              </Text>
              <TouchableOpacity style={styles.qrButton} onPress={() => setQr(true)}>
                <Ionicons name="qr-code-outline" size={22} color="#fff" />
                <Text style={styles.qrButtonText}>Mã QR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm vaccine..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      <FlatList
        data={filteredVaccines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.vaccineCard}
            onPress={() => navigation.navigate("VaccineDetail", { vaccine: item })}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medkit-outline" size={24} color="#1E88E5" />
              <Text style={styles.vaccineTitle}>{item.name}</Text>
            </View>
            <Text style={styles.vaccineDescription} numberOfLines={2}>
              {item.description}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={{ textAlign: "center" }}>Không có dữ liệu vaccine.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <Modal visible={qr} transparent onRequestClose={() => setQr(false)}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Mã QR của bạn</Text>
            <View style={styles.qrBox}>
              <QRCode value={`${users.first_name} ${users.last_name}`} size={200} />
            </View>
            <Text style={styles.modalName}>
              {users.first_name} {users.last_name}
            </Text>
            <TouchableOpacity onPress={() => setQr(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Home;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingTop: 45,
    paddingHorizontal: 10
  },

  theme1: {
    backgroundColor: "#00a6fb",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    marginTop: 12,
  },

  avatarLarge: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#e0e0e0",
  },

  userInfo: {
    flex: 1,
    justifyContent: "center",
  },

  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },

  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E88E5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: "flex-start",
  },

  qrButtonText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },

  vaccineCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#1E88E5",
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  vaccineTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
    color: "#333",
  },

  vaccineDescription: {
    fontSize: 14,
    color: "#666",
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },

  qrBox: {
    borderWidth: 2,
    borderColor: "#1E88E5",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f0f8ff",
  },

  modalName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
  },

  closeButton: {
    marginTop: 20,
    backgroundColor: "#ccc",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },

  closeButtonText: {
    color: "#333",
    fontWeight: "600",
  },
});
