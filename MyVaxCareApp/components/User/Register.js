import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, HelperText, RadioButton } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import API from "../../services/API";
import { useNavigation } from "@react-navigation/native";

const Register = () => {
  const [msg, setMsg] = useState("");
  const navigation = useNavigation();
  const [form, setForm] = useState({
    last_name: "",
    first_name: " ",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
    address: "",
    avatar: null,
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

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
      handleChange("avatar", result.assets[0].uri);
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
      handleChange("avatar", result.assets[0]);
    }
  };
  // kiêm tra lỗi
  const validate = () => {
    for (let key in form) {
      if (
        form[key] === "" ||
        form[key] === null ||
        form[key].toString().trim() === ""
      ) {
        let label = {
          last_name: "Họ",
          first_name: "Tên",
          username: "Tên đăng nhập",
          password: "Mật khẩu",
          confirmPassword: "Xác nhận mật khẩu",
          phone: "Số điện thoại",
          email: "Email",
          address: "Địa chỉ",
          avatar: "Ảnh đại diện",
        }[key];

        setMsg(`Vui lòng nhập ${label}!`);
        return false;
      }
    }

    if (form.password !== form.confirmPassword) {
      setMsg("Mật khẩu không khớp!");
      return false;
    }

    return true;
  };
  // đăng kí
  const register = async () => {
    if (validate() === true) {
      try {
        let formUser = new FormData();
        formUser.append("first_name", form.first_name);
        formUser.append("last_name", form.last_name);
        formUser.append("username", form.username);
        formUser.append("password", form.password);
        formUser.append("phone", form.phone);
        formUser.append("email", form.email);
        formUser.append("address", form.address);
        if (form.avatar) {
          const filename = form.avatar.split("/").pop();
          const match = /\.(\w+)$/.exec(filename ?? "");
          const ext = match ? match[1] : "jpg";

          formUser.append("avatar", {
            uri: form.avatar,
            name: filename,
            type: `image/${ext}`,
          });
        }

        await API.post("/user/", formUser, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        navigation.navigate("Login");
      } catch (error) {
        console.log("Lôi đăng kí", error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // điều chỉnh offset nếu cần
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text>Họ</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => handleChange("first_name", text)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text>Tên</Text>
              <TextInput
                style={styles.input}
                onChangeText={(text) => handleChange("last_name", text)}
              />
            </View>
          </View>

          <View>
            <Text>Tên đăng nhập</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("username", text)}
            />
          </View>
          <View>
            <Text>Mật khẩu </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("password", text)}
            />
          </View>
          <View>
            <Text>Nhập lại mật khẩu </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("confirmPassword", text)}
            />
          </View>
          <View>
            <Text>Số điện thoại </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("phone", text)}
            />
          </View>
          <View>
            <Text>Địa chỉ Email </Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("email", text)}
            />
          </View>
          <View>
            <Text>Địa chỉ</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => handleChange("address", text)}
            />
          </View>
          <Text style={styles.label}>Ảnh đại diện:</Text>
          {form.avatar && (
            <Image source={{ uri: form.avatar }} style={styles.avatar} />
          )}
          <View style={styles.imageButtons}>
            <Button mode="outlined" onPress={pickImage} style={styles.imageBtn}>
              Chọn từ thư viện
            </Button>
            <Button mode="outlined" onPress={takePhoto} style={styles.imageBtn}>
              Chụp ảnh
            </Button>
          </View>
          <HelperText type="error" visible={msg}>
            {msg}
          </HelperText>

          <Button
            mode="contained"
            onPress={register}
            style={styles.registerButton}
          >
            ĐĂNG KÝ
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 10,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
    alignSelf: "center",
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    fontWeight: "500",
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radioLabel: {
    marginRight: 20,
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
    marginVertical: 0,
  },
  registerButton: {
    marginTop: 0,
    backgroundColor: "#FFA500",
  },
});
