import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MyDispatchContext } from '../../services/Context';
import { Ionicons } from '@expo/vector-icons';

const HomeAdmin = ({ navigation }) => {
  const dispatch = useContext(MyDispatchContext);

  const buttons = [
    { title: '➕ Thêm vaccine', navigateTo: 'AddVaccine' },
    { title: '🏥 Thêm tiêm chủng cộng đồng', navigateTo: 'AddCommunityInjection' },
    { title: '📊 Thống kê', navigateTo: 'Statistics' },
    { title: '🧑‍⚕️ Quản lý tài khoản nhân viên', navigateTo: 'ManageStaff' },
    { title: '🧍‍♂️ Quản lý tài khoản công dân', navigateTo: 'ManageCitizens' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          onPress: () => {
            dispatch({ type: 'logout' });
            console.log('Đăng xuất thành công');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.pageTitle}>Trang Quản Trị</Text>

      <View style={styles.cardContainer}>
        <View style={styles.headerRow}>
          <Ionicons name="shield-checkmark-outline" size={28} color="#fff" />
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.adminLabel}>Xin chào, Admin 👋</Text>
          <Text style={styles.adminDesc}>Bạn đang ở giao diện quản trị</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Đăng xuất</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {buttons.map((btn, index) => (
          <TouchableOpacity
            key={index}
            style={styles.actionButton}
            onPress={() => navigation.navigate(btn.navigateTo)}
          >
            <Text style={styles.actionText}>{btn.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  cardContainer: {
    backgroundColor: '#0077CC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  adminLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  adminDesc: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#e74c3c',
    borderRadius: 6,
    width: 100,
    alignItems: 'center',
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});
