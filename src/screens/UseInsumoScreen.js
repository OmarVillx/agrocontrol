// src/screens/UseInsumoScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { C } from '../theme';
import { api, cache, hoy } from '../api';
import { Header, Field, Input, Btn, LoadingOverlay } from '../components/UI';

const ETAPAS = ['Preparación del suelo','Siembra','Germinación','Crecimiento vegetativo','Floración','Fructificación','Cosecha'];

export default function UseInsumoScreen({ navigation }) {
  const [campos,   setCampos]   = useState([]);
  const [insumos,  setInsumos]  = useState([]);
  const [campoId,  setCampoId]  = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [cant,     setCant]     = useState('');
  const [etapa,    setEtapa]    = useState('');
  const [fecha,    setFecha]    = useState(hoy());
  const [loading,  setLoading]  = useState(false);

  const insSelected = insumos.find(i => String(i.id) === String(insumoId));
  const stockAfter  = insSelected ? insSelected.stock - (parseFloat(cant)||0) : null;

  useEffect(() => {
    async function load() {
      const c = cache.campos  || await api('GET', '/campos');
      const i = cache.insumos || await api('GET', '/insumos');
      cache.campos = c; cache.insumos = i;
      setCampos(c); setInsumos(i);
    }
    load();
  }, []);

  async function save() {
    if (!campoId)  { Alert.alert('', 'Selecciona un campo'); return; }
    if (!insumoId) { Alert.alert('', 'Selecciona un insumo'); return; }
    if (!cant)     { Alert.alert('', 'Ingresa la cantidad'); return; }
    if (!etapa)    { Alert.alert('', 'Selecciona la etapa'); return; }
    setLoading(true);
    try {
      await api('POST', '/usos', { campoId: parseInt(campoId), insumoId: parseInt(insumoId), cant: parseFloat(cant), etapa, fecha });
      cache.insumos = null;
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Registrar Uso de Insumo" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Campo / Cultivo">
          <View style={s.pick}><RNPickerSelect onValueChange={setCampoId} value={campoId}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={campos.map(c => ({ label: c.nombre, value: String(c.id) }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        <Field label="Insumo">
          <View style={s.pick}><RNPickerSelect onValueChange={setInsumoId} value={insumoId}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={insumos.map(i => ({ label: `${i.nombre} (${i.stock} ${i.unidad})`, value: String(i.id) }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        <Field label="Cantidad a usar">
          <Input placeholder="0" value={cant} onChangeText={setCant} keyboardType="decimal-pad" />
        </Field>
        {insSelected && (
          <View style={s.stockRow}>
            <View style={s.stockBox}>
              <Text style={s.stockLbl}>Stock actual</Text>
              <Text style={s.stockVal}>{insSelected.stock} {insSelected.unidad}</Text>
            </View>
            <View style={s.stockBox}>
              <Text style={s.stockLbl}>Quedará</Text>
              <Text style={[s.stockVal, stockAfter < 0 && { color: C.red }]}>
                {stockAfter !== null ? stockAfter.toFixed(2) : '—'} {insSelected.unidad}
              </Text>
            </View>
          </View>
        )}
        <Field label="Etapa del Cultivo">
          <View style={s.pick}><RNPickerSelect onValueChange={setEtapa} value={etapa}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={ETAPAS.map(e => ({ label: e, value: e }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        <Field label="Fecha de Aplicación">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>
        <Btn label="💾  Registrar Uso" color={C.green} onPress={save} loading={loading} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16 },
  pick:      { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  pickTxt:   { fontSize: 14, color: C.text, paddingVertical: 9 },
  stockRow:  { flexDirection: 'row', gap: 10, marginBottom: 18 },
  stockBox:  { flex: 1, backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12 },
  stockLbl:  { fontSize: 11, color: C.muted },
  stockVal:  { fontSize: 18, fontWeight: '700', color: C.text },
});
