// src/screens/HistorialScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C, shadow } from '../theme';
import { api, fmt, fmtFecha } from '../api';
import { Header, EmptyState, LoadingOverlay } from '../components/UI';

export default function HistorialScreen({ navigation }) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try { setItems(await api('GET', '/historial')); }
    catch {}
    finally { setLoading(false); }
  }

  async function del(tipo, id) {
    Alert.alert('Eliminar', '¿Eliminar este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar', style: 'destructive',
        onPress: async () => {
          try {
            await api('DELETE', '/' + (tipo === 'gasto' ? 'gastos' : 'ventas') + '/' + id);
            load();
          } catch (e) { Alert.alert('Error', e.message); }
        },
      },
    ]);
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Historial" color={C.brown} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {items.length === 0
          ? <EmptyState icon="🕐" text="No hay movimientos registrados" />
          : items.map(m => {
            const esGasto = m.tipo === 'gasto';
            return (
              <View key={`${m.tipo}-${m.id}`} style={s.item}>
                <View style={[s.ico, esGasto ? s.icoR : s.icoG]}>
                  <Text style={{ fontSize: 20 }}>{esGasto ? '📉' : '📈'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.iTitle}>{m.desc}</Text>
                  <Text style={s.iSub}>{m.campoNombre ? m.campoNombre + ' · ' : ''}{fmtFecha(m.fecha)}</Text>
                </View>
                <Text style={[s.monto, esGasto ? s.neg : s.pos]}>
                  {esGasto ? '−' : '+'} {fmt(m.monto)}
                </Text>
                <TouchableOpacity onPress={() => del(m.tipo, m.id)} style={{ padding: 4 }}>
                  <Text style={{ color: '#ccc', fontSize: 14 }}>✕</Text>
                </TouchableOpacity>
              </View>
            );
          })
        }
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 16 },
  item:   { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 8, ...shadow },
  ico:    { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  icoR:   { backgroundColor: '#fce8e6' },
  icoG:   { backgroundColor: '#e6f5ea' },
  iTitle: { fontSize: 13, fontWeight: '700', color: C.text },
  iSub:   { fontSize: 12, color: C.muted },
  monto:  { fontSize: 14, fontWeight: '700' },
  neg:    { color: C.red },
  pos:    { color: C.green },
});
