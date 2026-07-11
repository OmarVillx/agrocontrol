// src/screens/ReportesScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  StyleSheet, TouchableOpacity,
} from 'react-native';
import { C, shadow } from '../theme';
import { api, fmt } from '../api';
import { Header, Btn, LoadingOverlay } from '../components/UI';

export default function ReportesScreen({ navigation }) {
  const [pass,     setPass]     = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [data,     setData]     = useState(null);

  async function verify() {
    if (!pass) { setError('Ingresa tu contraseña'); return; }
    setLoading(true); setError('');
    try {
      await api('POST', '/auth/verify', { password: pass });
      const rep = await api('GET', '/reportes');
      setData(rep);
      setUnlocked(true);
    } catch (e) { setError('Credenciales incorrectas'); }
    finally { setLoading(false); }
  }

  function lock() { setUnlocked(false); setPass(''); setData(null); }

  if (!unlocked) {
    return (
      <View style={s.root}>
        <LoadingOverlay visible={loading} />
        <Header title="Reportes" subtitle="Acceso Restringido" />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.shield}><Text style={{ fontSize: 32 }}>🛡️</Text></View>
          <Text style={s.privTitle}>Área Privada</Text>
          <Text style={s.privSub}>Ingresa tu contraseña para ver los reportes financieros</Text>
          <View style={s.inputWrap}>
            <Text style={s.ico}>🔒</Text>
            <TextInput
              style={s.input} placeholder="••••••" secureTextEntry
              placeholderTextColor={C.muted}
              value={pass} onChangeText={setPass}
            />
          </View>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={{ height: 16 }} />
          <Btn label="✓  Verificar Identidad" color={C.green} onPress={verify} loading={loading} />
          <View style={s.note}><Text style={s.noteTxt}>Los reportes contienen información financiera sensible y están protegidos</Text></View>
        </ScrollView>
      </View>
    );
  }

  const neta  = (data?.ingresos || 0) - (data?.gastos || 0);
  const max   = Math.max(data?.gastos || 0, data?.ingresos || 0, 1);
  const hG    = Math.max(4, Math.round((data?.gastos || 0)   / max * 110));
  const hI    = Math.max(4, Math.round((data?.ingresos || 0) / max * 110));

  return (
    <View style={s.root}>
      <Header title="Reportes Financieros" subtitle="Análisis administrativo" color={C.navy} onLock={lock} />
      <ScrollView contentContainerStyle={s.scroll}>
        <StatCard color="#fce8e6" icoStyle={s.siR} ico="📉" label="Gastos Totales"   value={fmt(data?.gastos || 0)} />
        <StatCard color="#e6f5ea" icoStyle={s.siG} ico="📈" label="Ingresos Totales" value={fmt(data?.ingresos || 0)} />
        <StatCard color={neta<0?"#fef3e6":"#e6eef8"} icoStyle={neta<0?s.siO:s.siB} ico={neta<0?"📉":"💵"} label="Ganancia Neta" value={fmt(neta)} />

        <View style={s.chartWrap}>
          <Text style={s.chartTitle}>Comparación Visual</Text>
          <View style={s.bars}>
            <View style={s.barCol}>
              <View style={[s.bar, { height: hG, backgroundColor: '#e24b4a' }]} />
              <Text style={s.barLbl}>Gastos</Text>
            </View>
            <View style={s.barCol}>
              <View style={[s.bar, { height: hI, backgroundColor: '#4a9c5a' }]} />
              <Text style={s.barLbl}>Ingresos</Text>
            </View>
          </View>
        </View>
        <View style={s.conf}><Text style={s.confTxt}>🔐 Información financiera confidencial</Text></View>
      </ScrollView>
    </View>
  );
}

function StatCard({ color, icoStyle, ico, label, value }) {
  return (
    <View style={[s.statCard, { backgroundColor: color }]}>
      <View style={[s.sIco, icoStyle]}><Text style={{ fontSize: 22 }}>{ico}</Text></View>
      <View>
        <Text style={s.statLbl}>{label}</Text>
        <Text style={s.statVal}>{value}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16 },
  shield:    { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e6f5ea', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14, marginTop: 16 },
  privTitle: { fontSize: 18, fontWeight: '700', color: C.text, textAlign: 'center' },
  privSub:   { fontSize: 13, color: C.muted, textAlign: 'center', marginVertical: 8, lineHeight: 20 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: C.border, borderRadius: 10, marginTop: 16 },
  ico:       { fontSize: 18, paddingHorizontal: 12 },
  input:     { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 14, color: C.text },
  error:     { color: C.red, fontSize: 13, marginTop: 8, textAlign: 'center' },
  note:      { backgroundColor: '#f5f3ee', borderRadius: 10, padding: 14, marginTop: 16 },
  noteTxt:   { fontSize: 12, color: C.muted, textAlign: 'center' },

  statCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, marginBottom: 10 },
  sIco:      { width: 44, height: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  siR:       { backgroundColor: '#f5c4ba' },
  siG:       { backgroundColor: '#b5d69e' },
  siB:       { backgroundColor: '#b5ccf0' },
  siO:       { backgroundColor: '#f5d5a0' },
  statLbl:   { fontSize: 10, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1 },
  statVal:   { fontSize: 22, fontWeight: '700', color: C.text },

  chartWrap:  { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 10 },
  chartTitle: { fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 16 },
  bars:       { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 40, height: 120 },
  barCol:     { alignItems: 'center', gap: 6 },
  bar:        { width: 40, borderRadius: 6, minHeight: 4 },
  barLbl:     { fontSize: 11, color: C.muted, fontWeight: '600' },

  conf:    { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14, alignItems: 'center' },
  confTxt: { fontSize: 12, color: C.muted },
});
