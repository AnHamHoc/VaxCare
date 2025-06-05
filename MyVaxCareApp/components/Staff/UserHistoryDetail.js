import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useContext, useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { authApi } from "../../services/API";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyUserContext } from "../../services/Context";
import QRCode from "react-native-qrcode-svg";

const UserHistoryDetail = () => {
  const route = useRoute();
  const { appointmentID } = route.params;
  const [detail, setDetail] = useState([]);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const re = await authApi(token).get(
        `/appointment/${appointmentID}/appointmentdetail/`
      );
      setDetail(re.data);
      console.log("Chi tiết:", re.data);
    } catch (error) {
      console.log("Lỗi lấy chi tiết:", error);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {detail.map((item) => (
          <View key={item.id} style={styles.card}>
            <Text style={styles.doseName}>{item.dose_name}</Text>
            <Text style={styles.dateLabel}>
              Ngày hẹn tiêm:{" "}
              <Text style={styles.dateValue}>{item.schedule_date}</Text>
            </Text>
            <Text
              style={[
                styles.status,
                item.status === "pending" ? styles.pending : styles.completed,
              ]}
            >
              {item.status === "pending" ? "Chưa tiêm" : "Đã tiêm"}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
  },
  scrollView: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  doseName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
  },
  dateValue: {
    color: "#000",
    fontWeight: "500",
  },
  status: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    fontSize: 13,
    fontWeight: "bold",
  },
  pending: {
    backgroundColor: "#fdecea",
    color: "#d32f2f",
  },
  completed: {
    backgroundColor: "#e6f4ea",
    color: "#388e3c",
  },
   modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 280,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  closeButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1E88E5',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default UserHistoryDetail;
