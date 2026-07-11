// src/navigation/AppNavigator.js
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../api';

import LoginScreen                  from '../screens/LoginScreen';
import DashboardScreen              from '../screens/DashboardScreen';
import CamposScreen                 from '../screens/CamposScreen';
import AddCampoScreen               from '../screens/AddCampoScreen';
import AlmacenScreen                from '../screens/AlmacenScreen';
import AddInsumoScreen              from '../screens/AddInsumoScreen';
import ReportesScreen               from '../screens/ReportesScreen';
import MasScreen                    from '../screens/MasScreen';
import HistorialScreen              from '../screens/HistorialScreen';
import UseInsumoScreen              from '../screens/UseInsumoScreen';
import AddGastoScreen               from '../screens/AddGastoScreen';
import AddVentaScreen               from '../screens/AddVentaScreen';
import EquipoScreen                 from '../screens/EquipoScreen';
import HistorialTrabajadoresScreen  from '../screens/HistorialTrabajadoresScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

function CamposStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CamposList" component={CamposScreen} />
      <Stack.Screen name="AddCampo"   component={AddCampoScreen} />
    </Stack.Navigator>
  );
}

function AlmacenStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlmacenList" component={AlmacenScreen} />
      <Stack.Screen name="AddInsumo"   component={AddInsumoScreen} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="AddGasto"  component={AddGastoScreen} />
      <Stack.Screen name="AddVenta"  component={AddVentaScreen} />
    </Stack.Navigator>
  );
}

function MasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MasList"                component={MasScreen} />
      <Stack.Screen name="Historial"              component={HistorialScreen} />
      <Stack.Screen name="UseInsumo"              component={UseInsumoScreen} />
      <Stack.Screen name="Equipo"                 component={EquipoScreen} />
      <Stack.Screen name="HistorialTrabajadores"  component={HistorialTrabajadoresScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const T = useTheme();
  const { user } = useAuth();
  const esDueno = user?.rol === 'dueno';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   T.green,
        tabBarInactiveTintColor: T.muted,
        tabBarStyle: { backgroundColor: T.card, borderTopColor: T.border, borderTopWidth: 1 },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        tabBarIcon: () => {
          const icons = { Inicio: '🏠', CamposTab: '📍', AlmacenTab: '📦', Reportes: '📊', Mas: '☰' };
          return <Text style={{ fontSize: 22 }}>{icons[route.name]}</Text>;
        },
      })}
    >
      <Tab.Screen name="Inicio"     component={DashboardStack} options={{ title: 'Inicio' }} />
      <Tab.Screen name="CamposTab"  component={CamposStack}    options={{ title: 'Campos' }} />
      <Tab.Screen name="AlmacenTab" component={AlmacenStack}   options={{ title: 'Almacén' }} />
      {esDueno && <Tab.Screen name="Reportes" component={ReportesScreen} options={{ title: 'Reportes' }} />}
      <Tab.Screen name="Mas" component={MasStack} options={{ title: 'Más' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  const T = useTheme();

  const navTheme = {
    ...(T.darkMode ? DarkTheme : DefaultTheme),
    colors: {
      ...(T.darkMode ? DarkTheme : DefaultTheme).colors,
      background: T.bg, card: T.card, text: T.text, border: T.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user
          ? <Stack.Screen name="Main"  component={MainTabs} />
          : <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}