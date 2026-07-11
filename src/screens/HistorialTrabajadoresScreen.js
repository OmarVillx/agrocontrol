// src/screens/HistorialTrabajadoresScreen.js — solo dueño
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, EmptyState, LoadingOverlay } from '../components/UI';

export default function HistorialTrabajadoresScreen({ navigation }) {
  const T = useTheme();
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try { setItems(await api('GET', '/historial/trabajadores')); }
    catch {}
    finally { setLoading(false); }
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Actividades del Equipo" color={T.navy} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll}>
        {items.length === 0
          ? <EmptyState icon="👷" text="No hay actividades registradas por trabajadores" />
          : items.map(item => (
            <View key={item.id} style={s.card}>
              <View style={s.ico}><Text style={{ fontSize: 20 }}>📦</Text></View>
              <View style={{ flex: 1 }}>
                <View style={s.topRow}>
                  <Text style={s.desc}>{item.insumo_nombre} x{item.cant} {item.unidad}</Text>
                  <View style={s.badge}>
                    <Text style={s.badgeTxt}>{item.trabajador}</Text>
                  </View>
                </View>
                <Text style={s.sub}>{item.campo_nombre} · {item.etapa}</Text>
                <Text style={s.fecha}>{fmtFecha(item.fecha)}</Text>
              </View>
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}

function fmtFecha(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${+d} ${meses[+m - 1]} ${y}`;
}

const styles = (T) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  scroll:  { padding: 16 },
  card:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  ico:     { width: 40, height: 40, borderRadius: 10, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', alignItems: 'center', justifyContent: 'center' },
  topRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  desc:    { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  badge:   { backgroundColor: T.darkMode ? '#1a2020' : '#e6eef8', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  badgeTxt:{ fontSize: 11, fontWeight: '700', color: T.darkMode ? '#7ab' : '#1a3a7a' },
  sub:     { fontSize: T.fontSize - 2, color: T.muted, marginTop: 3 },
  fecha:   { fontSize: T.fontSize - 2, color: T.muted, marginTop: 1 },
});