// src/screens/AddCampoScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { C } from '../theme';
import { api, cache } from '../api';
import { Header, Field, Input, Btn, LoadingOverlay } from '../components/UI';

const CULTIVOS = ['Palta','Mango','Maíz','Arroz','Papa','Espárrago','Caña de Azúcar'];

export default function AddCampoScreen({ navigation }) {
  const [nombre,  setNombre]  = useState('');
  const [cultivo, setCultivo] = useState('');
  const [area,    setArea]    = useState('');
  const [ubic,    setUbic]    = useState('');
  const [loading, setLoading] = useState(false);

  async function save() {
    if (!nombre.trim()) { Alert.alert('', 'Escribe el nombre del campo'); return; }
    if (!cultivo)       { Alert.alert('', 'Selecciona el tipo de cultivo'); return; }
    setLoading(true);
    try {
      await api('POST', '/campos', { nombre: nombre.trim(), cultivo, area: parseFloat(area) || 0, ubic: ubic.trim() });
      cache.campos = null;
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Agregar Campo" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Nombre del Campo">
          <Input placeholder="Ej: Campo Norte" value={nombre} onChangeText={setNombre} />
        </Field>
        <Field label="Tipo de Cultivo">
          <View style={s.picker}>
            <RNPickerSelect
              onValueChange={setCultivo}
              value={cultivo}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={CULTIVOS.map(c => ({ label: c, value: c }))}
              style={{ inputIOS: s.pickerTxt, inputAndroid: s.pickerTxt }}
            />
          </View>
        </Field>
        <Field label="Área (hectáreas)">
          <Input placeholder="0.00" value={area} onChangeText={setArea} keyboardType="decimal-pad" />
        </Field>
        <Field label="Ubicación">
          <Input placeholder="Ej: Valle de Nepeña" value={ubic} onChangeText={setUbic} />
        </Field>
        <Btn label="💾  Guardar Campo" color={C.green} onPress={save} loading={loading} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:      { flex: 1, backgroundColor: C.bg },
  scroll:    { padding: 16 },
  picker:    { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  pickerTxt: { fontSize: 14, color: C.text, paddingVertical: 9 },
});
