import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi } from "../../services/API";
import DateTimePickerModal from "react-native-modal-datetime-picker";

const AddVaccineDoses = () => {
  const route = useRoute();
  const { vaccine } = route.params;
  const [dose, setDose] = useState([]);
  const [doseSchedules, setDoseSchedules] = useState({});
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDoseId, setSelectedDoseId] = useState(null);
  const [showDoses, setShowDoses] = useState(false);
  const [formDose, setFormDose] = useState({
    name: "",
    dose_number: "",
    interval_days: "",
  });
  const handleChange = (name, value) => {
    setFormDose((dose) => ({ ...dose, [name]: value }));
  };

  useEffect(() => {
    fetchDose();
  }, []);

  const fetchDose = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const re = await authApi(token).get(
        `/vaccines/${vaccine.id}/vaccinedoses/`
      );
      const doseList = re.data;
      setDose(doseList);

      const schedulesMap = {};
      for (const d of doseList) {
        const res = await authApi(token).get(
          `/vaccinedoses/${d.id}/doseschedules/`
        );
        schedulesMap[d.id] = res.data;
      }
      setDoseSchedules(schedulesMap);
    } catch (error) {
      console.log("Lỗi khi lấy mũi hoặc lịch tiêm:", error);
    }
  };
  const showDatePicker = (doseId) => {
    setSelectedDoseId(doseId);
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };
  const handleConfirm = async (date) => {
    hideDatePicker();

    try {
      const token = await AsyncStorage.getItem("token");
      const formattedDate = date.toISOString().split("T")[0]; // Chuyển sang 'YYYY-MM-DD'
      const form = new FormData();
      form.append("date", formattedDate);
      await authApi(token).post(
        `/vaccinedoses/${selectedDoseId}/doseschedules/`,
        form,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      fetchDose();
    } catch (error) {
      console.log("Lỗi khi thêm lịch tiêm:", error);
    }
  };
  // xáo lịch tiêm
  const handleDeleteSchedule = async (schedules) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await authApi(token).delete(`/doseschedules/${schedules}/`);
      fetchDose();
      Alert.alert("Thành công", "Đã xoá lịch tiêm");
    } catch (error) {
      fetchDose();
    }
  };

  // thêm mũi
  const postDoses = async () => {
    const { name, dose_number, interval_days } = formDose;
    if (!name || !dose_number || !interval_days) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const form = new FormData();
      form.append("name", formDose.name),
        form.append("dose_number", formDose.dose_number),
        form.append("interval_days", formDose.interval_days);

      await authApi(token).post(`/vaccines/${vaccine.id}/vaccinedoses/`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setShowDoses(false);
      fetchDose();
    } catch (error) {
        console.log("Lỗi thêm mũi: ", error);
    }
  };

  const renderDoseItem = ({ item }) => {
    const schedules = doseSchedules[item.id] || [];

    return (
      <View style={styles.doseBlock}>
        {/* Mũi tiêm */}
        <View style={styles.doseItem}>
          <Text style={styles.doseName}>💉 {item.name}</Text>
          <Text style={styles.doseInterval}>
            ⏱ Khoảng cách: {item.interval_days} ngày
          </Text>
        </View>

        {/* Lịch tiêm */}
        <View style={styles.scheduleContainer}>
          <Text style={styles.scheduleLabel}>📅 Lịch tiêm:</Text>
          {schedules.length > 0 ? (
            schedules.map((schedule, index) => (
              <View key={index} style={styles.scheduleItemContainer}>
                <Text style={styles.scheduleItem}>• {schedule.date}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSchedule(schedule.id)} // gọi hàm xoá
                >
                  <Text style={styles.deleteButtonText}>Xoá</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.scheduleItemEmpty}>Chưa có lịch tiêm</Text>
          )}

          <TouchableOpacity onPress={() => showDatePicker(item.id)}>
            <Text style={styles.addScheduleButton}>➕ Thêm lịch tiêm</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>💊 Vắc xin: {vaccine.name}</Text>
      <Text style={styles.subtitle}>
        🧬 Số lượng mũi: {vaccine.quantity_dose}
      </Text>

      <FlatList
        data={dose}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDoseItem}
        contentContainerStyle={styles.listContainer}
      />
      {dose.length < vaccine.quantity_dose && (
        <TouchableOpacity
          style={styles.addDoseButton}
          onPress={() => setShowDoses(true)}
        >
          <Text style={styles.addDoseButtonText}>➕ Thêm mũi</Text>
        </TouchableOpacity>
      )}
      <Modal
        visible={showDoses}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDoses(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Thêm mũi tiêm vắc xin</Text>
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Tên vắc xin</Text>
            <TextInput
              placeholder="Mũi A"
              value={formDose.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Mũi</Text>
            <TextInput
              placeholder="1"
              value={formDose.dose_number}
              onChangeText={(text) => handleChange("dose_number", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>
              Mũi tiếp theo
            </Text>
            <TextInput
              placeholder="30 ngày"
              value={formDose.interval_days}
              onChangeText={(text) => handleChange("interval_days", text)}
              style={styles.input}
              keyboardType="number-pad"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={postDoses}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ccc" }]}
                onPress={() => setShowDoses(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirm}
        onCancel={hideDatePicker}
        minimumDate={new Date()}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fbfc",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a73e8",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginBottom: 16,
  },
  listContainer: {
    paddingBottom: 24,
  },
  doseBlock: {
    marginBottom: 20,
  },
  doseItem: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  doseName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  doseInterval: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  scheduleContainer: {
    marginTop: 10,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#1a73e8",
    marginLeft: 4,
  },
  scheduleLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1a73e8",
  },
  scheduleItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  scheduleItem: {
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#ff4d4d",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  scheduleItemEmpty: {
    fontSize: 14,
    color: "#888",
    marginLeft: 8,
    fontStyle: "italic",
  },
  addScheduleButton: {
    marginTop: 8,
    fontSize: 15,
    color: "#1a73e8",
    fontWeight: "500",
    paddingLeft: 8,
  },
  addDoseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a73e8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginTop: 20,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  addDoseButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    backgroundColor: "#FFA500",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AddVaccineDoses;
