import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { authApi } from "../../services/API"; // sửa đường dẫn nếu cần
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";

const AddVaccine = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [filteredVaccines, setFilteredVaccines] = useState([]);
  const [search, setSearch] = useState("");
  const [formVaccine, setFormVaccine] = useState({
    name: "",
    quantity_dose: "",
    manufacturer: "",
    description: "",
    image: null,
  });
  const navgation = useNavigation();

  const handleChange = (name, value) => {
    setFormVaccine((vac) => ({ ...vac, [name]: value }));
  };

  const fetchVaccine = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get("/vaccines/");
      setVaccines(res.data);
      setFilteredVaccines(res.data);
    } catch (error) {
      console.log("Lỗi lấy vaccine", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccine();
  }, []);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.granted === false) {
      alert("Permission to access media library is required!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      handleChange("image", result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (permission.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      handleChange("image", result.assets[0].uri);
    }
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        color="#FFA500"
        style={{ marginTop: 20 }}
      />
    );

  const postVaccine = async () => {
    const { name, quantity_dose, manufacturer, description } = formVaccine;
    if (!name || !quantity_dose || !manufacturer || !description) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const form = new FormData();
      form.append("name", formVaccine.name);
      form.append("quantity_dose", formVaccine.quantity_dose);
      form.append("manufacturer", formVaccine.manufacturer);
      form.append("description", formVaccine.description);
      if (formVaccine.image) {
        const filename = formVaccine.image.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const ext = match ? match[1] : "jpg";

        form.append("image", {
          uri: formVaccine.image,
          name: filename,
          type: `image/${ext}`,
        });
      }

      const re = await authApi(token).post("/vaccines/", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setModalVisible(false);
      fetchVaccine();
    } catch (error) {
      console.log("Lỗi thêm : ", error);
    }
  };
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() => navgation.navigate("AddVaccineDoses", { vaccine: item })}
    >
      <Text style={styles.name}>💉 {item.name}</Text>
    </TouchableOpacity>
  );
  // tìm kiếm
  const handleSearch = (text) => {
    setSearch(text);
    const filter = vaccines.filter((vac) =>
      vac.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredVaccines(filter);
  };
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Danh sách vaccine</Text>
      <View style={{ margin: 10 }}>
        <TextInput
          style={{ borderWidth: 1, borderRadius: 5 }}
          placeholder="Tiềm kiếm"
          onChangeText={handleSearch}
        />
      </View>
      <FlatList
        data={filteredVaccines}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
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
            <Text style={styles.modalTitle}>Thêm vaccine mới</Text>
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Tên vắc xin</Text>
            <TextInput
              placeholder="Tên vắc xin"
              value={formVaccine.name}
              onChangeText={(text) => handleChange("name", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Số liều</Text>
            <TextInput
              placeholder="Số liều"
              value={formVaccine.quantity_dose}
              onChangeText={(text) => handleChange("quantity_dose", text)}
              style={styles.input}
              keyboardType="number-pad"
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Nguồn gốc</Text>
            <TextInput
              placeholder="Nguồn gốc"
              value={formVaccine.manufacturer}
              onChangeText={(text) => handleChange("manufacturer", text)}
              style={styles.input}
            />
            <Text style={{ fontSize: 15, marginBottom: 10 }}>Mô tả</Text>
            <TextInput
              placeholder="Mô tả"
              value={formVaccine.description}
              onChangeText={(text) => handleChange("description", text)}
              style={styles.input}
            />
            {formVaccine.image && (
              <Image
                source={{ uri: formVaccine.image }}
                style={styles.avatar}
              />
            )}
            <View style={styles.imageButtons}>
              <Button
                mode="outlined"
                onPress={pickImage}
                style={styles.imageBtn}
              >
                Chọn từ thư viện
              </Button>
              <Button
                mode="outlined"
                onPress={takePhoto}
                style={styles.imageBtn}
              >
                Chụp ảnh
              </Button>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.button} onPress={postVaccine}>
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

export default AddVaccine;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  item: {
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: "600",
  },
  detail: {
    marginTop: 4,
    fontSize: 14,
    color: "#555",
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
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginVertical: 10,
    alignSelf: "center",
  },
  imageButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  imageBtn: {
    marginVertical: 10,
  },
});
