// src/screens/AddInsumoScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { C } from '../theme';
import { api, cache, hoy, fmt } from '../api';
import { Header, Field, Input, Btn, TotalBox, LoadingOverlay } from '../components/UI';
import RNPickerSelect from 'react-native-picker-select';

const UNIDADES = ['kg','litros','sacos','unidades','cajas'];

export default function AddInsumoScreen({ navigation, route }) {
  const editing = route?.params?.insumo || null;

  const [nombre, setNombre] = useState(editing?.nombre || '');
  const [unidad, setUnidad] = useState(editing?.unidad || '');
  const [stock,  setStock]  = useState(editing ? String(editing.stock) : '');
  const [costo,  setCosto]  = useState(editing ? String(editing.costo) : '');
  const [prov,   setProv]   = useState(editing?.prov || '');
  const [fecha,  setFecha]  = useState(editing?.fecha || hoy());
  const [loading, setLoading] = useState(false);

  const total = (parseFloat(stock)||0) * (parseFloat(costo)||0);

  async function save() {
    if (!nombre.trim()) { Alert.alert('', 'Escribe el nombre del insumo'); return; }
    if (!unidad)        { Alert.alert('', 'Selecciona la unidad de medida'); return; }
    setLoading(true);
    try {
      const payload = {
        nombre: nombre.trim(), unidad,
        stock:  parseFloat(stock)  || 0,
        costo:  parseFloat(costo)  || 0,
        prov:   prov.trim(), fecha,
      };
      if (editing) {
        await api('PUT', '/insumos/' + editing.id, payload);
      } else {
        await api('POST', '/insumos', payload);
      }
      cache.insumos = null;
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title={editing ? 'Editar Insumo' : 'Agregar Insumo'} onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Nombre del Insumo">
          <Input placeholder="Ej: Fertilizante NPK" value={nombre} onChangeText={setNombre} />
        </Field>
        <Field label="Unidad de Medida">
          <View style={s.picker}>
            <RNPickerSelect
              onValueChange={setUnidad} value={unidad}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={UNIDADES.map(u => ({ label: u, value: u }))}
              style={{ inputIOS: s.pickerTxt, inputAndroid: s.pickerTxt }}
            />
          </View>
        </Field>
        <Field label="Cantidad">
          <Input placeholder="0" value={stock} onChangeText={setStock} keyboardType="decimal-pad" />
        </Field>
        <Field label="Costo Unitario (S/)">
          <Input placeholder="0.00" value={costo} onChangeText={setCosto} keyboardType="decimal-pad" />
        </Field>
        <TotalBox label="Costo Total" value={fmt(total)} />
        <Field label="Proveedor">
          <Input placeholder="Nombre del proveedor" value={prov} onChangeText={setProv} />
        </Field>
        <Field label="Fecha de Compra">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>
        <Btn label={editing ? '💾  Guardar Cambios' : '💾  Guardar en Almacén'} color={C.green} onPress={save} loading={loading} />
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