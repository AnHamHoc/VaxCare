import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../../services/API";
import { MyUserContext } from "../../services/Context";

export default function Confirm() {
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  const route = useRoute();
  const { qrData } = route.params || {};
  const [refresh, setRefresh] = useState(0);
  const [data, setData] = useState({
    schedule: "",
    user_id: "",
  });
  const [users, setUsers] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
  });

  const [vaccine, setVaccine] = useState({
    name: "",
    date: "",
  });
  const [isDataValid, setIsDataValid] = useState(false);
  const user = useContext(MyUserContext);
  const [healthNote, setHealthNote] = useState("");

  useEffect(() => {
    if (qrData) {
      try {
        const parsed = JSON.parse(qrData);
        setData({
          schedule: parsed.schedule?.toString() || "",
          user_id: parsed.user_id?.toString() || "",
        });
      } catch (error) {
        console.error("Lỗi khi phân tích qrData:", error);
      }
    }
  }, [qrData]);

  useEffect(() => {
    if (data.user_id) {
      setIsDataValid(true);
      fetchUser();
      fetchVaccine();
    }
  }, [data.user_id, refresh]);

  const handleCameraPress = async () => {
    const { granted } = await requestPermission();
    if (granted) {
      navigation.navigate("Camera");
    } else {
      alert("Bạn cần cấp quyền camera để tiếp tục.");
    }
  };

  const fetchUser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get(`/user/${data.user_id}/`);
      setUsers({
        first_name: res.data.first_name,
        last_name: res.data.last_name,
        phone: res.data.phone,
        email: res.data.email,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
    }
  };

  const fetchVaccine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get(`/doseschedules/${data.schedule}/`);
      setVaccine({
        name: res.data.vaccine_name,
        date: res.data.date,
      });
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vắc xin:", error);
    }
  };

  const postRecord = async () => {
    Alert.alert("Xác nhận", "Bạn có chắc xác nhận thông tin", [
      { text: "Hủy", style: "cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            const form = new FormData();
            form.append("staff", user.id),
              form.append("user", data.user_id),
              form.append("schedule", data.schedule),
              form.append("health_note", healthNote),
              form.append("date", new Date().toISOString().split("T")[0]),
              await authApi(token).post('/vaccinationrecords/',
                form,
                {
                  headers: {
                    "Content-Type": "multipart/form-data",
                  },
                }
              );
              setData({ schedule: "", user_id: "" });
              setRefresh(prev => prev + 1);
              navigation.replace('Confirm')
          } catch (error) {
            console.log("Lỗi khi record" , error)
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header và nút Camera */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xác nhận tiêm chủng</Text>
        <TouchableOpacity
          style={styles.cameraButton}
          onPress={handleCameraPress}
        >
          <Text style={styles.cameraText}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Thông tin người tiêm */}
      <View style={styles.userInfoCard}>
        <Text style={styles.sectionTitle}>👤 Thông tin người tiêm</Text>
        {isDataValid && (
          <View>
            <Text style={styles.userText}>
              Họ tên: {users.first_name} {users.last_name}
            </Text>
            <Text style={styles.userText}>📞 SĐT: {users.phone}</Text>
            <Text style={styles.userText}>📧 Email: {users.email}</Text>
          </View>
        )}
      </View>

      {/* Thông tin vắc xin */}
      <View style={styles.userInfoCard}>
        <Text style={styles.sectionTitle}>💉 Thông tin vắc xin</Text>
        {isDataValid && (
          <View>
            <Text style={styles.userText}>Tên vắc xin: {vaccine.name}</Text>
            <Text style={styles.userText}>Ngày tiêm: {vaccine.date}</Text>
          </View>
        )}
      </View>
      {isDataValid && (
        <View style={styles.userInfoCard}>
          <Text style={styles.noteLabel}>📝 Ghi chú sức khỏe</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập ghi chú sức khỏe..."
            value={healthNote}
            onChangeText={setHealthNote}
            multiline
            numberOfLines={4}
          />
        </View>
      )}

      <TouchableOpacity
        style={[styles.confirmButton, !isDataValid && styles.disabledButton]}
        onPress={postRecord}
        disabled={!isDataValid}
      >
        <Text style={styles.confirmButtonText}>Xác nhận</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0f172a",
  },
  cameraButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 10,
  },
  cameraText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfoCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#1e293b",
  },
  userText: {
    fontSize: 16,
    color: "#334155",
    marginBottom: 6,
  },
  confirmButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  disabledButton: {
    backgroundColor: "#cbd5e1",
  },
  confirmButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noteContainer: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },

  noteLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 8,
  },

  textInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: "top",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
});
