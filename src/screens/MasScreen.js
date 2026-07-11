// src/screens/MasScreen.js
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useAuth } from '../api';
import { useTheme } from '../ThemeContext';
import { Header } from '../components/UI';

const FONT_SIZES = [
  { label: 'A', size: 12, desc: 'Pequeño' },
  { label: 'A', size: 14, desc: 'Normal' },
  { label: 'A', size: 16, desc: 'Grande' },
  { label: 'A', size: 18, desc: 'Muy grande' },
];

export default function MasScreen({ navigation }) {
  const { logout, user } = useAuth();
  const T = useTheme();
  const esDueno = user?.rol === 'dueno';
  const s = styles(T);

  return (
    <View style={s.root}>
      <Header title="Más Opciones" subtitle="Configuración y ajustes" />
      <ScrollView contentContainerStyle={s.scroll}>

        {/* Info del usuario */}
        <View style={s.userCard}>
          <View style={s.userIco}>
            <Text style={{ fontSize: 28 }}>{esDueno ? '👨‍🌾' : '👷'}</Text>
          </View>
          <View>
            <Text style={s.userName}>{user?.username}</Text>
            <View style={s.rolBadge}>
              <Text style={s.rolBadgeTxt}>{esDueno ? 'Dueño' : 'Trabajador'}</Text>
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Opciones</Text>
        <MoreItem T={T} ico="🕐" bg={T.darkMode?'#1a2525':'#e6f0f0'} title="Historial Completo" sub="Ver todos los movimientos" onPress={() => navigation.navigate('Historial')} />
        <MoreItem T={T} ico="🌿" bg={T.darkMode?'#1a2a1a':'#e6f5ea'} title="Registrar Uso de Insumo" sub="Vincular insumo a un campo" onPress={() => navigation.navigate('UseInsumo')} />

        {/* Solo dueño ve gestión de equipo */}
        {esDueno && (
          <MoreItem T={T} ico="👥" bg={T.darkMode?'#1a1a2e':'#e6eef8'} title="Gestionar Equipo" sub="Código de invitación y trabajadores" onPress={() => navigation.navigate('Equipo')} />
        )}

        <Text style={s.sectionTitle}>Apariencia</Text>

        {/* Modo oscuro */}
        <View style={s.settingCard}>
          <View style={s.settingRow}>
            <View style={s.settingLeft}>
              <Text style={{ fontSize: 22 }}>{T.darkMode ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={s.settingTitle}>Modo oscuro</Text>
                <Text style={s.settingSub}>{T.darkMode ? 'Fondo negro' : 'Fondo claro'}</Text>
              </View>
            </View>
            <Switch value={T.darkMode} onValueChange={T.toggleDark}
              trackColor={{ false: T.border, true: T.green }} thumbColor="#fff" />
          </View>
        </View>

        {/* Tamaño de letra */}
        <View style={s.settingCard}>
          <Text style={s.settingTitle}>Tamaño de letra</Text>
          <Text style={[s.settingSub, { marginBottom: 12 }]}>Actual: {T.fontSize}px</Text>
          <View style={s.fontRow}>
            {FONT_SIZES.map(f => (
              <TouchableOpacity key={f.size}
                style={[s.fontBtn, T.fontSize === f.size && s.fontBtnActive]}
                onPress={() => T.changeFontSize(f.size)}
              >
                <Text style={[{ fontSize: f.size, fontWeight: '700', color: T.text }, T.fontSize === f.size && { color: T.green }]}>{f.label}</Text>
                <Text style={[s.fontBtnDesc, T.fontSize === f.size && { color: T.green }]}>{f.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.previewCard}>
          <Text style={s.previewLbl}>Vista previa</Text>
          <Text style={[{ color: T.text, lineHeight: 22 }, { fontSize: T.fontSize }]}>
            Este es el tamaño de letra actual en la app.
          </Text>
        </View>

        <TouchableOpacity style={s.logout} onPress={logout} activeOpacity={0.8}>
          <View style={s.logoutIco}><Text style={{ fontSize: 20 }}>🚪</Text></View>
          <View>
            <Text style={s.logoutTitle}>Cerrar Sesión</Text>
            <Text style={s.logoutSub}>Salir de la aplicación</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function MoreItem({ T, ico, bg, title, sub, onPress }) {
  const s = styles(T);
  return (
    <TouchableOpacity style={s.item} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.ico, { backgroundColor: bg }]}><Text style={{ fontSize: 20 }}>{ico}</Text></View>
      <View>
        <Text style={s.itemTitle}>{title}</Text>
        <Text style={s.itemSub}>{sub}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = (T) => StyleSheet.create({
  root:          { flex: 1, backgroundColor: T.bg },
  scroll:        { padding: 16 },
  userCard:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  userIco:       { width: 56, height: 56, borderRadius: 28, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', alignItems: 'center', justifyContent: 'center' },
  userName:      { fontSize: T.fontSize + 2, fontWeight: '700', color: T.text },
  rolBadge:      { backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginTop: 3 },
  rolBadgeTxt:   { fontSize: 11, fontWeight: '700', color: T.green },
  sectionTitle:  { fontSize: 13, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, marginTop: 4 },
  item:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  ico:           { width: 42, height: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  itemTitle:     { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  itemSub:       { fontSize: T.fontSize - 2, color: T.muted, marginTop: 1 },
  settingCard:   { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  settingRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingTitle:  { fontSize: T.fontSize, fontWeight: '700', color: T.text },
  settingSub:    { fontSize: T.fontSize - 2, color: T.muted, marginTop: 1 },
  fontRow:       { flexDirection: 'row', gap: 8 },
  fontBtn:       { flex: 1, backgroundColor: T.inputBg, borderRadius: 10, borderWidth: 1, borderColor: T.border, padding: 10, alignItems: 'center', gap: 3 },
  fontBtnActive: { borderColor: T.green, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea' },
  fontBtnDesc:   { fontSize: 10, color: T.muted },
  previewCard:   { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 16 },
  previewLbl:    { fontSize: 11, fontWeight: '700', color: T.muted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  logout:        { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, backgroundColor: T.green, borderRadius: 14, marginTop: 4 },
  logoutIco:     { width: 42, height: 42, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  logoutTitle:   { fontSize: T.fontSize, fontWeight: '700', color: '#fff' },
  logoutSub:     { fontSize: T.fontSize - 2, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
});