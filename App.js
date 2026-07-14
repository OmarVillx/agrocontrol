// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';
import { AuthProvider, useAuth, setToken } from './src/api';
import { sincronizarCola } from './src/api';
import { ThemeProvider } from './src/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { C } from './src/theme';

function SessionRestorer({ children }) {
  const { setUser } = useAuth();
  const [cargando,  setCargando]  = useState(true);
  const [sincrMsg,  setSincrMsg]  = useState('');

  useEffect(() => {
    async function init() {
      try {
        // 1. Restaurar token y usuario guardados
        const token   = await SecureStore.getItemAsync('token');
        const userStr = await SecureStore.getItemAsync('user');

        if (token && userStr) {
          setToken(token);
          try {
            await api('GET', '/campos');
            setUser(JSON.parse(userStr));
          } catch (e) {
            await SecureStore.deleteItemAsync('token');
            await SecureStore.deleteItemAsync('user');
            setToken(null);
          }
        }

        // 2. Sincronizar cola pendiente si hay internet
        setSincrMsg('Sincronizando...');
        const result = await sincronizarCola();
        if (result.sincronizados > 0) {
          setSincrMsg(`✓ ${result.sincronizados} cambio${result.sincronizados > 1 ? 's' : ''} sincronizado${result.sincronizados > 1 ? 's' : ''}`);
          await new Promise(r => setTimeout(r, 1500)); // mostrar mensaje 1.5s
        }
      } catch {}
      finally { setCargando(false); }
    }
    init();

    // 3. Escuchar reconexión para sincronizar automáticamente
    const unsub = NetInfo.addEventListener(state => {
      if (state.isConnected && state.isInternetReachable) {
        sincronizarCola().then(result => {
          if (result.sincronizados > 0) {
            console.log(`Sincronizados ${result.sincronizados} registros pendientes`);
          }
        });
      }
    });
    return () => unsub();
  }, []);

  if (cargando) {
    return (
      <View style={s.splash}>
        <View style={s.logo}><Text style={{ fontSize: 48 }}>🌱</Text></View>
        <Text style={s.logoTxt}>AgroControl</Text>
        {sincrMsg ? (
          <Text style={s.sincrTxt}>{sincrMsg}</Text>
        ) : (
          <ActivityIndicator color={C.green} style={{ marginTop: 32 }} />
        )}
      </View>
    );
  }

  return children;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionRestorer>
            <AppNavigator />
          </SessionRestorer>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  splash:   { flex: 1, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' },
  logo:     { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  logoTxt:  { fontSize: 28, fontWeight: '700', color: '#fff' },
  sincrTxt: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 32 },
});