import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../services/Context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const HomeStaff = () => {
  const navigation = useNavigation();
  const dispatch = useContext(MyDispatchContext);
  const users = useContext(MyUserContext);

  const buttons = [
    { title: "Xác nhận tiêm", icon: "checkmark-done-circle-outline", navigateTo: "Confirm" },
    { title: "Quản lý lịch hẹn", icon: "calendar-outline", navigateTo: "AppointmentManagement" },
    { title: "Lịch sử tiêm", icon: "time-outline", navigateTo: "UserHistory" },
    { title: "Gửi thông báo", icon: "notifications-outline", navigateTo: "SendNotification" },
  ];

  const handleLogout = () => {
    Alert.alert("Xác nhận", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        onPress: () => {
          dispatch({ type: "logout" });
          console.log("Đăng xuất thành công");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Xin chào, {users?.first_name} 👋</Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{
              uri: "https://res.cloudinary.com/dwpyfpdyr/" + users?.avatar,
            }}
            style={styles.avatar}
          />
          <View>
            <Text style={styles.name}>{users?.first_name} {users?.last_name}</Text>
            <TouchableOpacity style={styles.qrButton}>
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text style={styles.qrText}>Xem mã QR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.grid}>
          {buttons.map((btn, index) => (
            <TouchableOpacity
              key={index}
              style={styles.buttonCard}
              onPress={() => navigation.navigate(btn.navigateTo)}
            >
              <Ionicons name={btn.icon} size={28} color="#1E88E5" />
              <Text style={styles.buttonText}>{btn.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeStaff;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fa",
    paddingHorizontal: 16,
  },
  header: {
    backgroundColor: "#1E88E5",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "600",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
  },
  qrButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E88E5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  qrText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 24,
  },
  buttonCard: {
    width: "47%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: "#e53935",
    padding: 14,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 24,
  },
  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
    fontSize: 15,
  },
});
