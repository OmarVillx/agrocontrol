// src/screens/AddGastoScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { C } from '../theme';
import { api, cache, hoy, fmt } from '../api';
import { Header, Field, Input, Btn, TotalBox, LoadingOverlay } from '../components/UI';

const CATS = ['Insumos','Mano de obra','Transporte','Otros gastos'];

export default function AddGastoScreen({ navigation }) {
  const [cat,      setCat]      = useState('');
  const [campoId,  setCampoId]  = useState('');
  const [insumoId, setInsumoId] = useState('');
  const [cant,     setCant]     = useState('');
  const [desc,     setDesc]     = useState('');
  const [monto,    setMonto]    = useState('');
  const [nota,     setNota]     = useState('');
  const [fecha,    setFecha]    = useState(hoy());
  const [campos,   setCampos]   = useState([]);
  const [insumos,  setInsumos]  = useState([]);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    async function load() {
      const c = cache.campos  || await api('GET', '/campos');
      const i = cache.insumos || await api('GET', '/insumos');
      cache.campos  = c; cache.insumos = i;
      setCampos(c); setInsumos(i);
    }
    load();
  }, []);

  // Auto-calcular monto si insumo + cant
  useEffect(() => {
    if (cat === 'Insumos' && insumoId && cant) {
      const ins = insumos.find(i => String(i.id) === String(insumoId));
      if (ins) setMonto(String((ins.costo * parseFloat(cant)).toFixed(2)));
    }
  }, [insumoId, cant]);

  async function save() {
    if (!cat)    { Alert.alert('', 'Selecciona una categoría'); return; }
    if (!campoId){ Alert.alert('', 'Selecciona un campo'); return; }
    if (!monto)  { Alert.alert('', 'Ingresa el monto'); return; }
    if (cat === 'Insumos' && !insumoId) { Alert.alert('', 'Selecciona un insumo'); return; }
    setLoading(true);
    try {
      await api('POST', '/gastos', {
        cat, campoId: parseInt(campoId), monto: parseFloat(monto),
        fecha, nota, desc,
        insumoId: cat === 'Insumos' ? parseInt(insumoId) : null,
        cant:     cat === 'Insumos' ? parseFloat(cant) : 0,
      });
      cache.insumos = null;
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Registrar Gasto" color="#c0574a" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Categoría">
          <View style={s.pick}><RNPickerSelect onValueChange={setCat} value={cat}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={CATS.map(c => ({ label: c, value: c }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        <Field label="Campo / Cultivo">
          <View style={s.pick}><RNPickerSelect onValueChange={v => setCampoId(v)} value={campoId}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={campos.map(c => ({ label: c.nombre, value: String(c.id) }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        {cat === 'Insumos' && <>
          <Field label="Insumo del Almacén">
            <View style={s.pick}><RNPickerSelect onValueChange={setInsumoId} value={insumoId}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={insumos.map(i => ({ label: `${i.nombre} (${i.stock} ${i.unidad})`, value: String(i.id) }))}
              style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
          </Field>
          <Field label="Cantidad utilizada">
            <Input placeholder="0" value={cant} onChangeText={setCant} keyboardType="decimal-pad" />
          </Field>
        </>}
        {cat !== 'Insumos' && <Field label="Descripción">
          <Input placeholder="Ej: Pago a jornaleros" value={desc} onChangeText={setDesc} />
        </Field>}
        {cat === 'Insumos'
          ? <TotalBox label="Monto (calculado automáticamente)" value={fmt(monto || 0)} />
          : <Field label="Monto (S/)">
              <Input placeholder="0.00" value={monto} onChangeText={setMonto} keyboardType="decimal-pad" />
            </Field>
        }
        <Field label="Fecha">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>
        <Field label="Nota (opcional)">
          <Input placeholder="Nota adicional" value={nota} onChangeText={setNota} multiline style={{ height: 84 }} />
        </Field>
        <Btn label="💾  Guardar Gasto" color={C.red} onPress={save} loading={loading} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: C.bg },
  scroll:  { padding: 16 },
  pick:    { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  pickTxt: { fontSize: 14, color: C.text, paddingVertical: 9 },
});