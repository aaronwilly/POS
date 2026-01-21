import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login.tsx';
import Location from './screens/Location.tsx';
import Home from './screens/Home.tsx';
import Search from './screens/Search.tsx';
import KlikPass from './screens/KlikPass.tsx';
import Payment from './screens/Payment.tsx';
import ProfileScreen from './screens/Profile.tsx';

const Stack = createNativeStackNavigator();

export const AuthNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const LocationNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="location" component={Location} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export const HomeNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="home">
        <Stack.Screen name="home" component={Home} />
        <Stack.Screen name="search" component={Search} />
        <Stack.Screen name="klikPass" component={KlikPass} />
        <Stack.Screen name="payment" component={Payment} />
        <Stack.Screen name="profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
