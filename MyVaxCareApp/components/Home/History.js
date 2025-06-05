import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { authApi } from "../../services/API";
import { MyUserContext } from "../../services/Context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import WebView from "react-native-webview";

const History = () => {
  const [appointment, setAppointment] = useState([]);
  const users = useContext(MyUserContext);
  const navigantion = useNavigation();
  const [pdf, setPdf] = useState();
  const [showWebView, setShowWebView] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchAppointment();
    }, [])
  );

  const fetchAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get(`/appointment/?user_id=${users.id}`);
      setAppointment(res.data);
      console.log(res.data);
    } catch (error) {
      console.log("Lỗi ", error);
    }
  };
  const handleDownloadCertificate = async (appointmentID) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get(
        `/appointment/${appointmentID}/certificate/`
      );
      console.log(res.data.file_url);
      setPdf(res.data.file_url);
    } catch (error) {
      console.log("Lỗi chứng nhận : ", error);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigantion.navigate("HistoryDetail", { appointmentID: item.id })
      }
    >
      <Text style={styles.username}>
        👤 Người dùng: {users.first_name} {users.last_name}
      </Text>
      <Text style={styles.vaccine}>
        💉 Vắc-xin: {item.vaccine_name || "Chưa có"}
      </Text>
      <Text style={styles.status}>
        📌 Trạng thái: {item.status === "pending" ? "Chờ tiêm" : "Hoàn thành"}
      </Text>
      {item.status === "completed" && (
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => handleDownloadCertificate(item.id)}
        >
          <Text style={styles.downloadText}>⬇️ Tải giấy chứng nhận</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {appointment && appointment.length > 0 ? (
        <FlatList
          data={appointment}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noData}>Không có lịch sử đặt lịch</Text>
      )}
      {!showWebView && pdf && (
        <View >
          <WebView
            source={{ uri: pdf }}
            style={{ flex: 1 }}
            originWhitelist={["*"]}
            scalesPageToFit={true}
            javaScriptEnabled={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  list: {
    paddingBottom: 32,
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  vaccine: {
    fontSize: 15,
    color: "#1E88E5",
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: "#43A047",
  },
  noData: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#888",
  },
  downloadBtn: {
    marginTop: 10,
    backgroundColor: "#1E88E5",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  downloadText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default History;
