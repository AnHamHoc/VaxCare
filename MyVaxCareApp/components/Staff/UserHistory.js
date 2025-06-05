import AsyncStorage from "@react-native-async-storage/async-storage";
import { useContext, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { authApi } from "../../services/API";
import { MyUserContext } from "../../services/Context";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const UserHistory = () => {
  const [appointment, setAppointment] = useState([]);
  const navigantion = useNavigation();
  const [nameFilter, setNameFilter] = useState("");
  const [vaccineFilter, setVaccineFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filData, setFilData] = useState([]);

  useEffect(() => {
    fetchAppointment();
  }, []);

  useEffect(() => {
    fetchFilter();
  }, [nameFilter, vaccineFilter, statusFilter, appointment]);

  const fetchAppointment = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get("/appointment/");
      setAppointment(res.data);
      setFilData(res.data);
    } catch (error) {
      console.log("Lỗi ", error);
    }
  };

  const fetchFilter = () => {
    let filter = appointment;

    if (nameFilter) {
      const name = nameFilter.toLowerCase();
      filter = filter.filter((item) =>
        `${item.user.first_name} ${item.user.last_name}`
          .toLowerCase()
          .includes(name)
      );
    }

    if (vaccineFilter) {
      const vaccine = vaccineFilter.toLowerCase();
      filter = filter.filter((item) =>
        item.vaccine_name?.toLowerCase().includes(vaccine)
      );
    }

    if (statusFilter) {
      filter = filter.filter(
        (item) =>
          (statusFilter === "done" && item.status === "Pending") ||
          (statusFilter === "notyet" && item.status !== "Pending")
      );
    }
    setFilData(filter);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigantion.navigate("UserHistoryDetail", { appointmentID: item.id })
      }
    >
      <Text style={styles.username}>
        👤 Người dùng: {item.user.first_name} {item.user.last_name}
      </Text>
      <Text style={styles.vaccine}>
        💉 Vắc-xin: {item.vaccine_name || "Chưa có"}
      </Text>
      <Text style={styles.status}>
        📌 Trạng thái: {item.status === "Pending" ? "Hoàn thành" : "Chờ tiêm"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ marginBottom: 10 }}>
        <TextInput
          placeholder="🔍 Tên công dân..."
          value={nameFilter}
          onChangeText={setNameFilter}
          style={styles.input}
        />
        <TextInput
          placeholder="💉 Tên vắc-xin..."
          value={vaccineFilter}
          onChangeText={setVaccineFilter}
          style={styles.input}
        />
        <Picker
          selectedValue={statusFilter}
          onValueChange={setStatusFilter}
          style={styles.input}
        >
          <Picker.Item label="-- Trạng thái --" value="" />
          <Picker.Item label=" Hoàn thành" value="done" />
          <Picker.Item label=" Chưa hoàn thành" value="notyet" />
        </Picker>
      </View>
      {appointment && appointment.length > 0 ? (
        <FlatList
          data={filData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.noData}>Không có lịch sử đặt lịch</Text>
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
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default UserHistory;
