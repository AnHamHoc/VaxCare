import React, { useContext, useEffect, useReducer, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { MyDispatchContext, MyUserContext } from './services/Context';
import { MyUserReducer } from './services/Reducers';


import Login from './components/User/Login';
import Home from './components/Home/Home'
import History from './components/Home/History';
import Profile from './components/User/Profile';
import Register from './components/User/Register';
import VaccineDetail from './components/Home/VaccineDetail';
import Booking from './components/Home/Booking';
import HistoryDetail from './components/Home/HistoryDetail';
import ProfileDetail from './components/User/ProfileDetail';
import HomeAdmin from './components/Admin/HomeAdmin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from './services/API';
import AddVaccine from './components/Admin/AddVaccine';
import AddCommunityInjection from './components/Admin/AddCommunityInjection';
import ManageCitizens from './components/Admin/ManageCitizens';
import ManageStaff from './components/Admin/ManageStaff';
import Statistics from './components/Admin/Statistics';
import AddVaccineDoses from './components/Admin/AddVaccineDoses';
import HomeStaff from './components/Staff/HomeStaff';
import Confirm from './components/Staff/Confirm';
import AppointmentManagement from './components/Staff/AppointmentManagement';
import SendNotification from './components/Staff/SendNotification';
import Camera from './components/Staff/Camera';
import UserHistory from './components/Staff/UserHistory';
import UserHistoryDetail from './components/Staff/UserHistoryDetail';
import ChatBotAi from './components/Home/ChatBotAi';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack =() => {
  return (
    <Stack.Navigator initialRouteName='Home'>
      <Stack.Screen name='Home' component={Home} options={{headerShown: false}}/>
      <Stack.Screen name='VaccineDetail' component={VaccineDetail} options={{headerShown: false}}/>
      <Stack.Screen name='Booking' component={Booking} options={{headerShown: false}}/>
    </Stack.Navigator>
  );
}

const HistoryStack=() => {
  return(
    <Stack.Navigator initialRouteName='History'>
    <Stack.Screen name='History' component={History} options={{headerShown: false}}/>
    <Stack.Screen name='HistoryDetail' component={HistoryDetail} options={{headerShown: false}}/>
  </Stack.Navigator>
  )
  
}

const ProfileStack = () => {
  return (
    <Stack.Navigator initialRouteName='Profile'>
      <Stack.Screen name='Profile' component={Profile} options={{headerShown: false}}/>
      <Stack.Screen name='ProfileDetail' component={ProfileDetail} options={{headerShown: false}}/>
    </Stack.Navigator>
  )
}
const HomeAdminStack =() => {
  return (
    <Stack.Navigator initialRouteName='HomeAdmin'>
      <Stack.Screen name='HomeAdmin' component={HomeAdmin} options={{headerShown: false}}/>
      <Stack.Screen name='AddVaccine' component={AddVaccine} options={{headerShown: false}}/>
      <Stack.Screen name='AddCommunityInjection' component={AddCommunityInjection} options={{headerShown: false}}/>
      <Stack.Screen name='ManageCitizens' component={ManageCitizens} options={{headerShown: false}}/>
      <Stack.Screen name='ManageStaff' component={ManageStaff} options={{headerShown: false}}/>
      <Stack.Screen name='Statistics' component={Statistics} options={{headerShown: false}}/>
      <Stack.Screen name='AddVaccineDoses' component={AddVaccineDoses} options={{headerShown: false}}/>
    </Stack.Navigator>
  )
}
const HomeStaffStack =()=>{
  return(
    <Stack.Navigator initialRouteName='HomeStaff'>
      <Stack.Screen name='HomeStaff' component={HomeStaff} options={{headerShown: false}}/>
      <Stack.Screen name='Confirm' component={Confirm} options={{headerShown: false}}/>
      <Stack.Screen name='Camera' component={Camera} options={{headerShown: false}}/>
      <Stack.Screen name='AppointmentManagement' component={AppointmentManagement} options={{headerShown: false}}/>
      <Stack.Screen name='SendNotification' component={SendNotification} options={{headerShown: false}}/>
      <Stack.Screen name='UserHistory' component={UserHistory} options={{headerShown: false}}/>
      <Stack.Screen name='UserHistoryDetail' component={UserHistoryDetail} options={{headerShown: false}}/>
    </Stack.Navigator>
  )
}

const MyTab = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#FFA500',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'HomeStack') iconName = 'home-outline';
          else if (route.name === 'HistoryStack') iconName = 'reader-outline';
          else if (route.name === 'ProfileStack') iconName = 'person-outline';
          else if (route.name === 'ChatBotAi') iconName = 'chatbubble-ellipses-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeStack} options={{ tabBarLabel: 'Trang chủ', headerShown: false }} />
      <Tab.Screen name="ChatBotAi" component={ChatBotAi} options={{ tabBarLabel: 'Chat Bot', headerShown: false }} />
      <Tab.Screen name="HistoryStack" component={HistoryStack} options={{ tabBarLabel: 'Lịch sử', headerShown: false }} />
      <Tab.Screen name="ProfileStack" component={ProfileStack} options={{ tabBarLabel: 'Hồ sơ',  headerShown: false }} />
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log(token);
        if (token) {
          let userData = await authApi(token).get('/user/current-user/');
                      dispatch({
                          "type": "login",
                          "payload": userData.data
                      });
        }
      } catch (error) {
        console.log("Lỗi đăng nhập : " , error);
        await AsyncStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  },[]);

  if(loading) return null;

  return (
    <MyUserContext.Provider value={user}>
      <MyDispatchContext.Provider value={dispatch}>
        <NavigationContainer>
          {user === null ? (
            // Nếu chưa login thì hiện màn Login
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Register" component={Register}/>
            </Stack.Navigator>
          ) : user.role === 'Admin' ?(
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="HomeAdminSatck" component={HomeAdminStack} />
            </Stack.Navigator>
          ): user.role === 'Staff' ? (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="HomeStaffStack" component={HomeStaffStack} />
            </Stack.Navigator>
          ): (
            <MyTab />
          )}
        </NavigationContainer>
      </MyDispatchContext.Provider>
    </MyUserContext.Provider>
  );
}