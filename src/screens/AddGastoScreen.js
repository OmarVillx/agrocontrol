// src/screens/AddGastoScreen.js
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { api, cache, hoy } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, Field, Input, Btn, LoadingOverlay } from '../components/UI';

// Insumos eliminado de aquí — ahora se maneja desde Almacén
const CATS = ['Mano de obra', 'Transporte', 'Otros gastos'];

export default function AddGastoScreen({ navigation }) {
  const T = useTheme();
  const [cat,     setCat]     = useState('');
  const [campoId, setCampoId] = useState('');
  const [desc,    setDesc]    = useState('');
  const [monto,   setMonto]   = useState('');
  const [nota,    setNota]    = useState('');
  const [fecha,   setFecha]   = useState(hoy());
  const [campos,  setCampos]  = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const c = cache.campos || await api('GET', '/campos');
      cache.campos = c;
      setCampos(c);
    }
    load();
  }, []);

  async function save() {
    if (!cat)     { Alert.alert('', 'Selecciona una categoría'); return; }
    if (!campoId) { Alert.alert('', 'Selecciona un campo'); return; }
    if (!monto)   { Alert.alert('', 'Ingresa el monto'); return; }

    setLoading(true);
    try {
      await api('POST', '/gastos', {
        cat,
        campoId: parseInt(campoId),
        monto:   parseFloat(monto),
        fecha,
        nota,
        desc,
      });
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Registrar Gasto" color={T.red} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Field label="Categoría">
          <View style={s.pick}>
            <RNPickerSelect onValueChange={setCat} value={cat}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={CATS.map(c => ({ label: c, value: c }))}
              style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} />
          </View>
        </Field>

        <Field label="Campo / Cultivo">
          <View style={s.pick}>
            <RNPickerSelect onValueChange={setCampoId} value={campoId}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={campos.map(c => ({ label: c.nombre, value: String(c.id) }))}
              style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} />
          </View>
        </Field>

        <Field label="Descripción">
          <Input placeholder="Ej: Pago a jornaleros" value={desc} onChangeText={setDesc} />
        </Field>

        <Field label="Monto (S/)">
          <Input placeholder="0.00" value={monto} onChangeText={setMonto} keyboardType="decimal-pad" />
        </Field>

        <Field label="Fecha">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>

        <Field label="Nota (opcional)">
          <Input placeholder="Nota adicional" value={nota} onChangeText={setNota}
            multiline style={{ height: 84 }} />
        </Field>

        <Btn label="💾  Guardar Gasto" color={T.red} onPress={save} loading={loading} />
      </ScrollView>
    </View>
  );
}

const styles = (T) => StyleSheet.create({
  root:    { flex: 1, backgroundColor: T.bg },
  scroll:  { padding: 16 },
  pick:    { backgroundColor: T.inputBg, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  pickTxt: { fontSize: T.fontSize, color: T.text, paddingVertical: 9 },
});