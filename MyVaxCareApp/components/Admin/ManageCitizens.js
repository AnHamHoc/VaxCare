
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text } from "react-native";
import { View } from "react-native";
import { authApi } from "../../services/API";

const ManageCitizens = () => {
  const [alluser, setAlluser] = useState();

  useEffect(() => {
    fetchAlluser();
  }, []);

  const fetchAlluser = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await authApi(token).get("/user/all/");
      const staffUsers = res.data.filter((user) => user.role === "Citizen");
      setAlluser(staffUsers);
    } catch (error) {
      console.log("Lỗi: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quản lý nhân viên</Text>
      <FlatList
        data={alluser}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>Tên đăng nhập: {item.username}</Text>
            <Text style={styles.name}>Tên : {item.first_name} {item.last_name}</Text>
            <Text style={styles.email}>Email: {item.email}</Text>
            <Text style={styles.role}>Chức vụ: {item.role}</Text>
          </View>
        )}
      />
    </View>
  );
};
export default ManageCitizens;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 45,
    paddingHorizontal: 10,
    paddingBottom: 40,
    backgroundColor: '#f4f6f8',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E88E5',
  },
  email: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  role: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

