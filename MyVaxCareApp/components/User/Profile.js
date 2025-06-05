import { StatusBar } from "expo-status-bar";
import React, { useContext } from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MyDispatchContext, MyUserContext } from "../../services/Context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../../services/API";

const Profile = () => {
  const user = useContext(MyUserContext);
  const dispatch = useContext(MyDispatchContext);
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      "Xác nhận đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        { text: "Hủy", style: "cancel" },
        { text: "Đăng xuất", onPress: () => {
          dispatch({
            "type" : "logout"
          })
          console.log("Đăng xuất thành công");
        } }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileContainer}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/dwpyfpdyr/" + user.avatar
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>
          {user.first_name} {user.last_name}
        </Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("ProfileDetail")}>
        <Text style={styles.buttonText}>Chỉnh sửa thông tin cá nhân</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
        <Text style={[styles.buttonText, styles.logoutButtonText]}>Đăng xuất</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f4f7",
    alignItems: "center",
    paddingTop: 40,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#ccc",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
  },
  button: {
    width: "80%",
    paddingVertical: 14,
    backgroundColor: "#1E88E5",
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#e53935",
  },
  logoutButtonText: {
    fontWeight: "700",
  },
});

export default Profile;
