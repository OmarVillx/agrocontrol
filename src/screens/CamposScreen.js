// src/screens/CamposScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, cache, useAuth } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, EmptyState, LoadingOverlay } from '../components/UI';

export default function CamposScreen({ navigation }) {
  const [campos,  setCampos]  = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const T = useTheme();
  const esDueno = user?.rol === 'dueno';

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try {
      const data = await api('GET', '/campos');
      cache.campos = data;
      setCampos(data);
    } catch {}
    finally { setLoading(false); }
  }

  async function deleteCampo(id) {
    Alert.alert('Eliminar campo', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api('DELETE', '/campos/' + id); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header
        title="Mis Campos"
        subtitle={`${campos.length} campo${campos.length !== 1 ? 's' : ''} registrado${campos.length !== 1 ? 's' : ''}`}
        onPlus={esDueno ? () => navigation.navigate('AddCampo') : null}
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {campos.length === 0
          ? <EmptyState icon="📍" text="No hay campos registrados"
              btnLabel={esDueno ? 'Agregar primer campo' : null}
              onBtnPress={esDueno ? () => navigation.navigate('AddCampo') : null} />
          : campos.map(c => (
            <View key={c.id} style={s.card}>
              <View style={s.aIcon}><Text style={{ fontSize: 22 }}>📍</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.nombre}>{c.nombre}</Text>
                <View style={s.badge}><Text style={s.badgeTxt}>{c.cultivo}</Text></View>
                <Text style={s.sub}>{c.area} ha · {c.ubic || 'Sin ubicación'}</Text>
              </View>
              {/* Solo dueño puede eliminar */}
              {esDueno && (
                <TouchableOpacity onPress={() => deleteCampo(c.id)}>
                  <Text style={{ fontSize: 18, color: '#ccc' }}>🗑</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        }
      </ScrollView>
    </View>
  );
}

const styles = (T) => StyleSheet.create({
  root:     { flex: 1, backgroundColor: T.bg },
  scroll:   { padding: 16 },
  card:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  aIcon:    { width: 44, height: 44, borderRadius: 11, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', alignItems: 'center', justifyContent: 'center' },
  nombre:   { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  badge:    { backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: T.green },
  sub:      { fontSize: T.fontSize - 2, color: T.muted, marginTop: 3 },
});