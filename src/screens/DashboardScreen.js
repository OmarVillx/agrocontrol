// src/screens/DashboardScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../theme';
import { api, cache, useAuth } from '../api';
import { Header, QuickCard, AccessItem, LoadingOverlay } from '../components/UI';

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [camposCount,  setCamposCount]  = useState(0);
  const [insumosCount, setInsumosCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => {
    async function load() {
      setLoading(true);
      try {
        const [campos, insumos] = await Promise.all([api('GET','/campos'), api('GET','/insumos')]);
        cache.campos  = campos;
        cache.insumos = insumos;
        setCamposCount(campos.length);
        setInsumosCount(insumos.length);
      } catch {}
      finally { setLoading(false); }
    }
    load();
  }, []));

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="AgroControl" subtitle={`Hola, ${user?.username || ''}`} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>Acciones Rápidas</Text>
        <View style={s.quickGrid}>
          <QuickCard icon="💸" label="Registrar Gasto"  bgColor="#fce8e6" onPress={() => navigation.navigate('AddGasto')} />
          <QuickCard icon="🛒" label="Registrar Venta"  bgColor="#e6f5ea" onPress={() => navigation.navigate('AddVenta')} />
        </View>

        <Text style={s.sectionLabel}>Accesos Principales</Text>
        <AccessItem
          icon="📍" title="Mis Campos"
          subtitle={`${camposCount} campo${camposCount !== 1 ? 's' : ''} registrado${camposCount !== 1 ? 's' : ''}`}
          onPress={() => navigation.navigate('CamposTab')}
        />
        <AccessItem
          icon="📦" title="Almacén"
          subtitle={`${insumosCount} insumo${insumosCount !== 1 ? 's' : ''} en stock`}
          onPress={() => navigation.navigate('AlmacenTab')}
        />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: C.bg },
  scroll:       { padding: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  quickGrid:    { flexDirection: 'row', gap: 12, marginBottom: 22 },
});
