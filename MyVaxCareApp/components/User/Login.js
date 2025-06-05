import { StatusBar } from 'expo-status-bar';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import React, { useContext } from 'react';
import API, { authApi } from '../../services/API';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MyDispatchContext } from '../../services/Context';

const Login = () => {
  const [user, setUser] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const dispatch = useContext(MyDispatchContext);
  const navigation = useNavigation();

  const fields = [
    {
      label: 'Tên đăng nhập',
      icon: 'account',
      name: 'username',
    },
    {
      label: 'Mật khẩu',
      icon: 'lock',
      name: 'password',
      secureTextEntry: true,
    },
  ];

  const updateState = (field, value) => {
    setUser((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const login = async () => {
    setLoading(true);
    try {
      const { username, password } = user;
      if (!username || !password) {
        Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập và mật khẩu');
        setLoading(false);
        return;
      }

      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('client_id', 't5boWvzPhOYbbeQaXQYJEiJ2lwJIYMYAjwXHFoY5');
      formData.append(
        'client_secret',
        'mP3ArW6CPDfQnY27gOzhzkwqMtSwXA4BEeNN4mPEGhXLWuJgpQz8k4qiO7DECSGi1MzYE10XJxeAcNJAwGtH1BmzxnfvWk5xmsNXzCeIA9yd3zu2VSIvI8OcRDU06mHH'
      );
      formData.append('grant_type', 'password');

      const res = await API.post('/o/token/', formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
      });

      await AsyncStorage.setItem('token', res.data.access_token);
      let userData = await authApi(res.data.access_token).get('/user/current-user/');
      dispatch({
        type: 'login',
        payload: userData.data,
      });

    } catch (ex) {
      if (ex.response) {
        Alert.alert('Lỗi đăng nhập', ex.response.data.error_description || 'Thông tin đăng nhập không hợp lệ');
      } else if (ex.request) {
        Alert.alert('Lỗi mạng', 'Vui lòng kiểm tra kết nối internet và thử lại');
      } else {
        Alert.alert('Lỗi', ex.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* <Image
          source={require('../../assets/healthcare-logo.png')}
          style={styles.logo}
        /> */}
        <Text style={styles.title}>Chào mừng bạn quay lại!</Text>

        {fields.map((field) => (
          <TextInput
            key={field.name}
            label={field.label}
            value={user[field.name]}
            onChangeText={(text) => updateState(field.name, text)}
            style={styles.input}
            secureTextEntry={field.secureTextEntry}
            mode="outlined"
            left={field.icon ? <TextInput.Icon icon={field.icon} /> : null}
          />
        ))}

        <Button
          icon="login"
          loading={loading}
          mode="contained"
          onPress={login}
          style={styles.button}
          contentStyle={{ paddingVertical: 8 }}
        >
          ĐĂNG NHẬP
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 10 }}
        >
          Bạn chưa có tài khoản? Đăng ký
        </Button>
      </View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inner: {
    padding: 20,
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    borderRadius: 6,
    backgroundColor: '#FFA500',
  },
});

export default Login;
