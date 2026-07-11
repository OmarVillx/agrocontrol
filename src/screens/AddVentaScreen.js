// src/screens/AddVentaScreen.js
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { C } from '../theme';
import { api, hoy, fmt } from '../api';
import { Header, Field, Input, Btn, TotalBox, LoadingOverlay } from '../components/UI';

const PRODUCTOS = ['Palta','Mango','Maíz','Arroz','Papa','Espárrago','Otros'];

export default function AddVentaScreen({ navigation }) {
  const [prod,    setProd]    = useState('');
  const [kg,      setKg]      = useState('');
  const [precio,  setPrecio]  = useState('');
  const [fecha,   setFecha]   = useState(hoy());
  const [loading, setLoading] = useState(false);

  const total = (parseFloat(kg)||0) * (parseFloat(precio)||0);

  async function save() {
    if (!prod)   { Alert.alert('', 'Selecciona el producto'); return; }
    if (!kg)     { Alert.alert('', 'Ingresa la cantidad'); return; }
    if (!precio) { Alert.alert('', 'Ingresa el precio por kg'); return; }
    setLoading(true);
    try {
      await api('POST', '/ventas', { prod, kg: parseFloat(kg), precio: parseFloat(precio), total, fecha });
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Registrar Venta" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <Field label="Producto">
          <View style={s.pick}><RNPickerSelect onValueChange={setProd} value={prod}
            placeholder={{ label: 'Seleccionar...', value: '' }}
            items={PRODUCTOS.map(p => ({ label: p, value: p }))}
            style={{ inputIOS: s.pickTxt, inputAndroid: s.pickTxt }} /></View>
        </Field>
        <Field label="Cantidad (kg)">
          <Input placeholder="0" value={kg} onChangeText={setKg} keyboardType="decimal-pad" />
        </Field>
        <Field label="Precio por kg (S/)">
          <Input placeholder="0.00" value={precio} onChangeText={setPrecio} keyboardType="decimal-pad" />
        </Field>
        <TotalBox label="Total de la venta" value={fmt(total)} />
        <Field label="Fecha">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>
        <Btn label="💾  Guardar Venta" color={C.green} onPress={save} loading={loading} />
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
