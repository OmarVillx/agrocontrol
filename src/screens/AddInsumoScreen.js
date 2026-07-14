// src/screens/AddInsumoScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Alert, TouchableOpacity,
} from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { C } from '../theme';
import { api, cache, hoy, fmt } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, Field, Input, Btn, TotalBox, LoadingOverlay } from '../components/UI';

const UNIDADES = ['kg','litros','sacos','unidades','cajas'];

export default function AddInsumoScreen({ navigation }) {
  const T = useTheme();
  const [nombre,   setNombre]   = useState('');
  const [unidad,   setUnidad]   = useState('');
  const [stock,    setStock]    = useState('');
  const [costo,    setCosto]    = useState('');
  const [prov,     setProv]     = useState('');
  const [fecha,    setFecha]    = useState(hoy());
  const [origen,   setOrigen]   = useState(''); // 'almacen' | 'compra'
  const [loading,  setLoading]  = useState(false);

  const total = (parseFloat(stock)||0) * (parseFloat(costo)||0);

  async function save() {
    if (!nombre.trim()) { Alert.alert('', 'Escribe el nombre del insumo'); return; }
    if (!unidad)        { Alert.alert('', 'Selecciona la unidad de medida'); return; }
    if (!stock)         { Alert.alert('', 'Ingresa la cantidad'); return; }
    if (!origen)        { Alert.alert('', 'Indica si lo compraste o ya lo tenías'); return; }
    if (origen === 'compra' && !costo) { Alert.alert('', 'Ingresa el costo unitario'); return; }

    setLoading(true);
    try {
      await api('POST', '/insumos', {
        nombre:  nombre.trim(),
        unidad,
        stock:   parseFloat(stock)  || 0,
        costo:   parseFloat(costo)  || 0,
        prov:    prov.trim(),
        fecha,
        origen, // 'almacen' o 'compra' — el backend decide si genera gasto
      });
      cache.insumos = null;
      navigation.goBack();
    } catch (e) { Alert.alert('Error', e.message); }
    finally { setLoading(false); }
  }

  const s = styles(T);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={loading} />
      <Header title="Agregar Insumo" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

        <Field label="Nombre del Insumo">
          <Input placeholder="Ej: Fertilizante NPK" value={nombre} onChangeText={setNombre} />
        </Field>

        <Field label="Unidad de Medida">
          <View style={s.picker}>
            <RNPickerSelect onValueChange={setUnidad} value={unidad}
              placeholder={{ label: 'Seleccionar...', value: '' }}
              items={UNIDADES.map(u => ({ label: u, value: u }))}
              style={{ inputIOS: s.pickerTxt, inputAndroid: s.pickerTxt }} />
          </View>
        </Field>

        <Field label="Cantidad">
          <Input placeholder="0" value={stock} onChangeText={setStock} keyboardType="decimal-pad" />
        </Field>

        {/* Selector de origen */}
        <Field label="¿Cómo ingresa este insumo?">
          <View style={s.origenRow}>
            <TouchableOpacity
              style={[s.origenBtn, origen === 'almacen' && s.origenActive]}
              onPress={() => setOrigen('almacen')}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>🏠</Text>
              <Text style={[s.origenTxt, origen === 'almacen' && { color: T.green }]}>
                Ya lo tenía
              </Text>
              <Text style={s.origenDesc}>Stock existente{'\n'}No afecta reportes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.origenBtn, origen === 'compra' && s.origenActive]}
              onPress={() => setOrigen('compra')}
            >
              <Text style={{ fontSize: 28, marginBottom: 6 }}>🛒</Text>
              <Text style={[s.origenTxt, origen === 'compra' && { color: T.green }]}>
                Lo compré
              </Text>
              <Text style={s.origenDesc}>Compra nueva{'\n'}Se registra como gasto</Text>
            </TouchableOpacity>
          </View>
        </Field>

        {/* Costo — solo si es compra */}
        {origen === 'compra' && (
          <>
            <Field label="Costo Unitario (S/)">
              <Input placeholder="0.00" value={costo} onChangeText={setCosto} keyboardType="decimal-pad" />
            </Field>
            {costo && stock ? (
              <TotalBox label="Gasto total a registrar" value={fmt(total)} />
            ) : null}
          </>
        )}

        {/* Si ya lo tenía, costo es opcional para referencia */}
        {origen === 'almacen' && (
          <Field label="Costo de referencia (S/) — opcional">
            <Input placeholder="0.00" value={costo} onChangeText={setCosto} keyboardType="decimal-pad" />
          </Field>
        )}

        <Field label="Proveedor">
          <Input placeholder="Nombre del proveedor" value={prov} onChangeText={setProv} />
        </Field>

        <Field label="Fecha">
          <Input placeholder="YYYY-MM-DD" value={fecha} onChangeText={setFecha} />
        </Field>

        {/* Info según origen */}
        {origen === 'compra' && (
          <View style={s.infoBox}>
            <Text style={s.infoTxt}>
              💡 Se agregará al almacén y se registrará automáticamente como gasto en tus reportes.
            </Text>
          </View>
        )}
        {origen === 'almacen' && (
          <View style={[s.infoBox, { backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', borderColor: T.green }]}>
            <Text style={[s.infoTxt, { color: T.green }]}>
              ✓ Se agregará al almacén sin afectar tus reportes financieros.
            </Text>
          </View>
        )}

        <Btn
          label={origen === 'compra' ? '💾  Guardar y Registrar Gasto' : '💾  Guardar en Almacén'}
          color={T.green}
          onPress={save}
          loading={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = (T) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  scroll:      { padding: 16 },
  picker:      { backgroundColor: T.inputBg, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 4 },
  pickerTxt:   { fontSize: T.fontSize, color: T.text, paddingVertical: 9 },

  origenRow:   { flexDirection: 'row', gap: 12 },
  origenBtn:   { flex: 1, backgroundColor: T.card, borderWidth: 2, borderColor: T.border, borderRadius: 14, padding: 16, alignItems: 'center' },
  origenActive:{ borderColor: T.green, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea' },
  origenTxt:   { fontSize: T.fontSize, fontWeight: '700', color: T.muted, marginBottom: 4 },
  origenDesc:  { fontSize: 11, color: T.muted, textAlign: 'center', lineHeight: 16 },

  infoBox:     { backgroundColor: T.darkMode ? '#2a1a1a' : '#fff3e6', borderWidth: 1, borderColor: '#f5a623', borderRadius: 10, padding: 14, marginBottom: 16 },
  infoTxt:     { fontSize: T.fontSize - 1, color: T.darkMode ? '#f5a623' : '#8c5a00', lineHeight: 20 },
});