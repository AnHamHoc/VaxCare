import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { authApi } from "../../services/API";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";

const AddCommunityInjection = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [vaccineList, setVaccineList] = useState([]);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [vaccineInput, setVaccineInput] = useState("");
  const [formCampaign, setFormCampaign] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    vaccine: "",
  });

  const handleChange = (name, value) => {
    setFormCampaign((cam) => ({ ...cam, [name]: value }));
  };

  useEffect(() => {
    fetchCampaigns();
    fetchVaccines();
  }, []);
  // set lại thời gian
    const formatDate = (inputDate) => {
        const [day, month, year] = inputDate.split("-");
        return `${year}-${month}-${day}`; // "2025-01-01"
    };
  // get  vaccine để post
  const fetchVaccines = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get("/vaccines/");
      setVaccineList(res.data.results);
    } catch (err) {
      console.log("Lỗi lấy danh sách vaccine:", err);
    }
  };
  //cập nhật để hiện lên khi tiềm vaccine
  const handleVaccineInput = (text) => {
    setVaccineInput(text);
    const filtered = vaccineList.filter((v) =>
      v.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredVaccines(filtered);
  };
  // get các chiến dịch
  const fetchCampaigns = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get(`/campaign/`);
      setCampaigns(res.data);
    } catch (error) {
      console.log("Lỗi khi lấy danh sách chiến dịch: ", error);
    } finally {
      setLoading(false);
    }
  };
  // post campaign
  const postCampaign = async () => {
    const {name, description, start_date, end_date, vaccine, location} = formCampaign;
    if (!name || !description || !start_date || !end_date || !vaccine || !location) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }
    try {
        const token = await AsyncStorage.getItem('token');
        const form = new FormData();
        form.append("name", formCampaign.name);
        form.append("description", formCampaign.description);
        form.append("start_date", formatDate(formCampaign.start_date));
        form.append("end_date", formatDate(formCampaign.end_date));
        form.append("location", formCampaign.location);
        form.append("vaccine", formCampaign.vaccine);
        console.log( formatDate(formCampaign.end_date))

        await authApi(token).post('/campaign/', form, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
        setModalVisible(false);
        fetchCampaigns();
    } catch (error) {
        console.log("Lỗi chiến dịch : ", error);
    }
  }

  const handleDelete = async (id) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa chiến dịch này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("token");
            await authApi(token).delete(`/campaign/${id}/`);
            fetchCampaigns();
          } catch (error) {
            console.log("Lỗi khi xóa chiến dịch: ", error);
            fetchCampaigns();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleEdit = (item) => {
    // Navigate to edit screen or open modal (tuỳ logic của bạn)
    console.log("Chỉnh sửa:", item);
    Alert.alert("Chức năng chỉnh sửa đang phát triển");
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📌 {item.name}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardVaccine}>💉 Vắc xin: {item.vaccine_name}</Text>
      <Text style={styles.cardDate}>
        🗓 {item.start_date} ➝ {item.end_date}
      </Text>
      <Text style={styles.cardLocation}>📍 {item.location}</Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>✏️ Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>🗑️ Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f8f9fa" barStyle="dark-content" />
      <Text style={styles.header}>📋 Danh sách chiến dịch tiêm chủng</Text>
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Thêm Vắc Xin</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Thêm chiến dịch tiêm chủng</Text>
            <Text style={{ fontSize: 15, marginBottom: 10 }}>
              Tên chiến dịch
            </Text>
            <TextInput
              placeholder="Tên chiến dịch"
              value={formCampaign.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Thông tin</Text>
            <TextInput
              placeholder="Thông tin"
              value={formCampaign.description}
              onChangeText={(text) => handleChange("description", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>
              Thời gian bắt đầu
            </Text>
            <TextInput
              placeholder="01-01-2025"
              value={formCampaign.start_date}
              onChangeText={(text) => handleChange("start_date", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>
              Thời gian kết thúc
            </Text>
            <TextInput
              placeholder="10-01-2025"
              value={formCampaign.end_date}
              onChangeText={(text) => handleChange("end_date", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Địa chỉ</Text>
            <TextInput
              placeholder="TPHCM"
              value={formCampaign.location}
              onChangeText={(text) => handleChange("location", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Vắc xin</Text>
            <TextInput
              placeholder="Nhập tên vắc xin"
              value={vaccineInput}
              onChangeText={handleVaccineInput}
              style={styles.input}
            />

            {filteredVaccines.length > 0 && (
              <View style={styles.suggestions}>
                {filteredVaccines.map((vaccine) => (
                  <TouchableOpacity
                    key={vaccine.id}
                    onPress={() => {
                      setFormCampaign((prev) => ({
                        ...prev,
                        vaccine: vaccine.id,
                      }));
                      setVaccineInput(vaccine.name);
                      setFilteredVaccines([]);
                    }}
                    style={styles.suggestionItem}
                  >
                    <Text>{vaccine.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={postCampaign}>
                <Text style={styles.buttonText}>Lưu</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ccc" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AddCommunityInjection;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    padding: 5,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 16,
    color: "#333",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#007AFF",
  },
  cardDescription: {
    fontSize: 14,
    color: "#444",
    marginBottom: 8,
  },
  cardVaccine: {
    fontSize: 14,
    color: "#008000",
    fontWeight: "500",
    marginBottom: 6,
  },
  cardDate: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 13,
    color: "#777",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 10,
  },
  editButton: {
    backgroundColor: "#FFA500",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#FFA500",
    width: "100%",
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    borderRadius: 10,
  },
  addButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
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
  suggestions: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    maxHeight: 150,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
