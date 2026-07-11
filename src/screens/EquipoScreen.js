// src/screens/EquipoScreen.js — solo dueño
import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Share,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { api } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, LoadingOverlay } from '../components/UI';

export default function EquipoScreen({ navigation }) {
  const T = useTheme();
  const [equipo,   setEquipo]   = useState([]);
  const [codigo,   setCodigo]   = useState('');
  const [loading,  setLoading]  = useState(false);

  useFocusEffect(useCallback(() => { load(); }, []));

  async function load() {
    setLoading(true);
    try {
      const data = await api('GET', '/equipo');
      setEquipo(data.trabajadores);
      setCodigo(data.codigoInvite);
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  async function compartirCodigo() {
    try {
      await Share.share({
        message: `Únete a mi empresa en AgroControl con este código: ${codigo}\n\nDescarga AgroControl y regístrate como Trabajador.`,
      });
    } catch {}
  }

  async function regenerarCodigo() {
    Alert.alert('Regenerar código', 'El código anterior dejará de funcionar. ¿Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Regenerar', onPress: async () => {
        try {
          const data = await api('POST', '/equipo/regenerar-codigo');
          setCodigo(data.codigoInvite);
        } catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  async function desvincular(id, nombre) {
    Alert.alert('Desvincular trabajador', `¿Desvincular a ${nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Desvincular', style: 'destructive', onPress: async () => {
        try { await api('DELETE', '/equipo/' + id); load(); }
        catch (e) { Alert.alert('Error', e.message); }
      }},
    ]);
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Gestionar Equipo" color={T.navy} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Código de invitación */}
        <View style={s.codigoCard}>
          <Text style={s.codigoLbl}>Código de invitación</Text>
          <Text style={s.codigoBig}>{codigo || '------'}</Text>
          <Text style={s.codigoSub}>Comparte este código con tus trabajadores para que puedan unirse</Text>
          <View style={s.codigoBtns}>
            <TouchableOpacity style={s.codigoBtn} onPress={compartirCodigo}>
              <Text style={s.codBtnTxt}>📤 Compartir</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.codigoBtn, s.codBtnSecondary]} onPress={regenerarCodigo}>
              <Text style={[s.codBtnTxt, { color: T.muted }]}>🔄 Regenerar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Lista de trabajadores */}
        <Text style={s.sectionTitle}>Trabajadores vinculados ({equipo.length})</Text>

        {equipo.length === 0 ? (
          <View style={s.emptyWrap}>
            <Text style={{ fontSize: 32, marginBottom: 10 }}>👷</Text>
            <Text style={s.emptyTxt}>Aún no tienes trabajadores vinculados</Text>
            <Text style={s.emptyHint}>Comparte el código de invitación para que se unan</Text>
          </View>
        ) : equipo.map(t => (
          <View key={t.id} style={s.trabajadorCard}>
            <View style={s.tIco}><Text style={{ fontSize: 22 }}>👷</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.tNombre}>{t.username}</Text>
              <Text style={s.tSub}>Vinculado desde {fmtFecha(t.vinculado_desde?.slice(0,10))}</Text>
            </View>
            <TouchableOpacity onPress={() => desvincular(t.id, t.username)}>
              <Text style={{ fontSize: 18, color: '#ccc' }}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Botón ver historial de trabajadores */}
        {equipo.length > 0 && (
          <TouchableOpacity style={s.histBtn} onPress={() => navigation.navigate('HistorialTrabajadores')}>
            <Text style={s.histBtnTxt}>📋 Ver historial de actividades del equipo</Text>
          </TouchableOpacity>
        )}

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
  root:   { flex: 1, backgroundColor: T.bg },
  scroll: { padding: 16 },

  codigoCard:    { backgroundColor: T.navy, borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 },
  codigoLbl:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  codigoBig:     { fontSize: 36, fontWeight: '700', color: '#fff', letterSpacing: 8, marginVertical: 8 },
  codigoSub:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16 },
  codigoBtns:    { flexDirection: 'row', gap: 10, width: '100%' },
  codigoBtn:     { flex: 1, backgroundColor: T.green, borderRadius: 10, padding: 12, alignItems: 'center' },
  codBtnSecondary:{ backgroundColor: 'rgba(255,255,255,0.1)' },
  codBtnTxt:     { fontSize: 13, fontWeight: '700', color: '#fff' },

  sectionTitle:  { fontSize: 13, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },

  trabajadorCard:{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  tIco:          { width: 44, height: 44, borderRadius: 11, backgroundColor: T.darkMode ? '#1a2020' : '#e6f0f0', alignItems: 'center', justifyContent: 'center' },
  tNombre:       { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  tSub:          { fontSize: T.fontSize - 2, color: T.muted, marginTop: 1 },

  emptyWrap:     { alignItems: 'center', padding: 32 },
  emptyTxt:      { fontSize: T.fontSize, fontWeight: '600', color: T.text, textAlign: 'center' },
  emptyHint:     { fontSize: T.fontSize - 2, color: T.muted, textAlign: 'center', marginTop: 6 },

  histBtn:       { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, alignItems: 'center', marginTop: 8 },
  histBtnTxt:    { fontSize: T.fontSize, fontWeight: '700', color: T.green },
});