import { useEffect, useState } from "react";
import {
    Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import API, { authApi } from "../../services/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const Booking = ({ route }) => {
  const { vaccineId } = route.params;
  const [doses, setDoses] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchDoses();
  }, []);
  // các mũi tiêm
  const fetchDoses = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const re = await authApi(token).get(
        `/vaccines/${vaccineId}/vaccinedoses/`
      );

      const doseSchedules = await Promise.all(
        re.data.map(async (dose) => {
          const schedules = await fetchSchedules(token, dose.id);
          return { ...dose, schedules };
        })
      );

      setDoses(doseSchedules);
    } catch (error) {
      console.log("Loi", error);
    }
  };
  // dánh sách lịch
  const fetchSchedules = async (token, doseID) => {
    try {
      const res = await authApi(token).get(
        `/vaccinedoses/${doseID}/doseschedules/`
      );
      return res.data;
    } catch (error) {
      console.log("Lỗi lấy lịch ", error);
    }
  };
  // đặt lịch
  const [selectedDates, setSelectedDates] = useState({});
  const handleSelectDate = (doseId, scheduleId) => {
    setSelectedDates((prev) => ({
      ...prev,
      [doseId]: scheduleId,
    }));
  };
  // thong báo xác nhận đặt
  const confirmBooking = () => {
    Alert.alert("Xác nhận đặt lịch","Bạn có chắc muốn đặt lịch !!", [{
        text : "Hủy",
        style:"cancle"
    },{
        text: "Đồng ý",
        onPress: () => handleAppointment()
    }])
  }
  // post appointment
  const handleAppointment = async() => {
    const scheduleIds = Object.values(selectedDates);
    try {
        const token = await AsyncStorage.getItem('token');
        const data ={
            schedule_ids: scheduleIds,
            vaccine : vaccineId,
        }
        const re = await authApi(token).post('/appointment/', data, {
            headers:{
                "Content-Type": "application/json",
            }
        })
        console.log('Thành công')
        navigation.navigate('Home')
    } catch (error) {
        console.log('Lỗi booking : ' , error)
    } 
  }

  const allSelected =
    doses.length > 0 &&
    doses.every((dose) => selectedDates.hasOwnProperty(dose.id));

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>📋 Danh sách mũi tiêm</Text>
      <ScrollView>
        {doses && doses.length > 0 ? (
          doses.map((dose) => (
            <View key={dose.id} style={styles.doseCard}>
              <Text style={styles.doseName}>💉 Mũi: {dose.name}</Text>

              {dose.schedules && dose.schedules.length > 0 ? (
                dose.schedules.map((sch) => {
                  const isSelected = selectedDates[dose.id] === sch.id;
                  return (
                    <TouchableOpacity key={sch.id} style={[styles.scheduleItem, isSelected && {backgroundColor: '#ffbd00'}]} onPress={() => handleSelectDate(dose.id, sch.id)}>
                      <Text style={styles.scheduleText}>
                        📅 Lịch: {sch.date}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <Text style={styles.noScheduleText}>❌ Không có lịch</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>🚫 Không có dữ liệu</Text>
        )}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.bookButton, !allSelected && {backgroundColor: '#ccc5b9'}]} onPress={confirmBooking} disabled={!allSelected}>
          <Text style={styles.bookButtonText}>Đặt lịch</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f6f9ff",
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  doseCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  doseName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#0057a3",
  },
  scheduleItem: {
    backgroundColor: "#e6f0ff",
    padding: 10,
    marginVertical: 4,
    borderRadius: 8,
  },
  scheduleText: {
    color: "#003d80",
    fontSize: 16,
  },
  noScheduleText: {
    fontStyle: "italic",
    color: "#777",
  },
  noDataText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 24,
    color: "#999",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  bookButton: {
    backgroundColor: "#007bff",
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 40,
    elevation: 3,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default Booking;
