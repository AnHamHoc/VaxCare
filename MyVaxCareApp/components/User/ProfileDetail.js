import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyDispatchContext, MyUserContext } from "../../services/Context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../../services/API";
import { useNavigation } from "@react-navigation/native";

const ProfileDetail = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState(user.first_name);
  const [lastName, setLastName] = useState(user.last_name);
  const [username, setUsername] = useState(user.username);
  const [phone, setPhone] = useState(user.phone);
  const [email, setEmail] = useState(user.email);
  const [birthDate, setBirthDate] = useState(user.birth_date);
  const [address, setAddress] = useState(user.address);
  const updatedUser = {
    first_name: firstName,
    last_name: lastName,
    username: username,
    phone: phone,
    email: email,
    birth_date: birthDate,
    address: address,
  };
  useEffect(() => {}, [updatedUser]);

  const handleSave = async () => {
    console.log("Thông tin đã cập nhật:", updatedUser);
    const token = await AsyncStorage.getItem("token");
    let formProfile = new FormData();
    formProfile.append("first_name", updatedUser.first_name);
    formProfile.append("last_name", updatedUser.last_name);
    formProfile.append("username", updatedUser.username);
    formProfile.append("phone", updatedUser.phone);
    formProfile.append("email", updatedUser.email);
    formProfile.append("birth_date", updatedUser.birth_date);
    formProfile.append("address", updatedUser.address);
    try {
      const re = await authApi(token).patch(
        "/user/current-user/",
        formProfile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      dispatch({ type: "update_user", payload: re.data });
      navigation.navigate("Profile");
    } catch (error) {
      console.log("Lỗi patch", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.label}>Họ</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
        />

        <Text style={styles.label}>Tên</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
        />

        <Text style={styles.label}>Tên đăng nhập</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
        />

        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />

        <Text style={styles.label}>Ngày sinh</Text>
        <TextInput
          style={styles.input}
          value={birthDate}
          onChangeText={setBirthDate}
        />

        <Text style={styles.label}>Địa chỉ</Text>
        <TextInput
          style={styles.input}
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
    marginTop: 4,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#1E88E5",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
