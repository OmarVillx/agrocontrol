// src/screens/AlmacenScreen.js
import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api, cache, fmt, useAuth } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, EmptyState, LoadingOverlay } from '../components/UI';

export default function AlmacenScreen({ navigation }) {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const T = useTheme();
  const esDueno = user?.rol === 'dueno';

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try {
      const data = await api('GET', '/insumos');
      cache.insumos = data;
      setInsumos(data);
    } catch {}
    finally { setLoading(false); }
  }

  async function deleteInsumo(id) {
    Alert.alert('Eliminar insumo', '¿Seguro que quieres eliminarlo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try { await api('DELETE', '/insumos/' + id); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header
        title="Almacén"
        subtitle={`${insumos.length} insumo${insumos.length !== 1 ? 's' : ''}`}
        onPlus={esDueno ? () => navigation.navigate('AddInsumo') : null}
      />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        {insumos.length === 0
          ? <EmptyState icon="📦" text="No hay insumos en el almacén"
              btnLabel={esDueno ? 'Agregar primer insumo' : null}
              onBtnPress={esDueno ? () => navigation.navigate('AddInsumo') : null} />
          : insumos.map(ins => {
            const low = ins.stock < 10;
            return (
              <TouchableOpacity
                key={ins.id}
                activeOpacity={esDueno ? 0.75 : 1}
                style={[s.card, low && { borderColor: '#f5c6c1' }]}
                onPress={esDueno ? () => navigation.navigate('AddInsumo', { insumo: ins }) : undefined}
                disabled={!esDueno}
              >
                <View style={[s.ico, low && { backgroundColor: T.darkMode ? '#2a1a1a' : '#fce8e6' }]}>
                  <Text style={{ fontSize: 22 }}>{low ? '⚠️' : '📦'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.nombre}>{ins.nombre}</Text>
                  <Text style={s.sub}>{ins.stock} {ins.unidad} · {fmt(ins.costo)} c/u</Text>
                  <Text style={[s.sub, { color: T.green, fontWeight: '600' }]}>Total: {fmt(ins.stock * ins.costo)}</Text>
                </View>
                {/* Solo dueño puede eliminar */}
                {esDueno && (
                  <TouchableOpacity
                    onPress={() => deleteInsumo(ins.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={{ fontSize: 18, color: '#ccc' }}>🗑</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })
        }
      </ScrollView>
    </View>
  );
}

const styles = (T) => StyleSheet.create({
  root:   { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16 },
  card:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  ico:    { width: 44, height: 44, borderRadius: 11, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', alignItems: 'center', justifyContent: 'center' },
  nombre: { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  sub:    { fontSize: T.fontSize - 2, color: T.muted, marginTop: 1 },
});