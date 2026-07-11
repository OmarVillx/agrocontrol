// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../api';
import { useTheme } from '../ThemeContext';
import { Btn, LoadingOverlay } from '../components/UI';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const T = useTheme();

  const [username, setUsername]     = useState('');
  const [password, setPassword]     = useState('');
  const [rol,      setRol]          = useState('dueno');
  const [codigo,   setCodigo]       = useState('');
  const [modo,     setModo]         = useState('login');
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState('');

  async function doLogin() {
    if (!username.trim() || !password.trim()) { setError('Completa usuario y contraseña'); return; }
    setLoading(true); setError('');
    try { await login(username.trim(), password.trim()); }
    catch (e) { setError(e.message || 'Error al iniciar sesión'); }
    finally { setLoading(false); }
  }

  async function doRegister() {
    if (!username.trim() || !password.trim()) { setError('Completa usuario y contraseña'); return; }
    if (password.length < 4) { setError('Mínimo 4 caracteres en la contraseña'); return; }
    if (rol === 'trabajador' && !codigo.trim()) { setError('Ingresa el código de invitación'); return; }
    setLoading(true); setError('');
    try { await register(username.trim(), password.trim(), rol, codigo.trim().toUpperCase()); }
    catch (e) { setError(e.message || 'Error al crear cuenta'); }
    finally { setLoading(false); }
  }

  const s = styles(T);

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LoadingOverlay visible={loading} />
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <View style={s.logo}><Text style={{ fontSize: 40 }}>🌱</Text></View>
        <Text style={s.title}>AgroControl</Text>
        <Text style={s.sub}>{modo === 'login' ? 'Ingresa para continuar' : 'Crea tu cuenta'}</Text>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Usuario</Text>
          <View style={s.inputWrap}>
            <Text style={s.ico}>👤</Text>
            <TextInput style={s.input} placeholder="Tu nombre de usuario"
              placeholderTextColor={T.muted} value={username}
              onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          </View>
        </View>

        <View style={s.fieldWrap}>
          <Text style={s.label}>Contraseña</Text>
          <View style={s.inputWrap}>
            <Text style={s.ico}>🔒</Text>
            <TextInput style={s.input} placeholder="••••••"
              placeholderTextColor={T.muted} secureTextEntry
              value={password} onChangeText={setPassword} />
          </View>
        </View>

        {/* Solo al registrarse */}
        {modo === 'register' && <>
          <View style={s.fieldWrap}>
            <Text style={s.label}>¿Cuál es tu rol?</Text>
            <View style={s.rolRow}>
              <TouchableOpacity
                style={[s.rolBtn, rol === 'dueno' && s.rolBtnActive]}
                onPress={() => { setRol('dueno'); setCodigo(''); }}
              >
                <Text style={{ fontSize: 26 }}>👨‍🌾</Text>
                <Text style={[s.rolTxt, rol === 'dueno' && { color: T.green }]}>Dueño</Text>
                <Text style={s.rolDesc}>Acceso total</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.rolBtn, rol === 'trabajador' && s.rolBtnActive]}
                onPress={() => setRol('trabajador')}
              >
                <Text style={{ fontSize: 26 }}>👷</Text>
                <Text style={[s.rolTxt, rol === 'trabajador' && { color: T.green }]}>Trabajador</Text>
                <Text style={s.rolDesc}>Registrar actividades</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Código de invitación — solo trabajador */}
          {rol === 'trabajador' && (
            <View style={s.fieldWrap}>
              <Text style={s.label}>Código de invitación</Text>
              <View style={s.inputWrap}>
                <Text style={s.ico}>🔑</Text>
                <TextInput style={s.input}
                  placeholder="Ej: A3F9B2"
                  placeholderTextColor={T.muted}
                  value={codigo} onChangeText={setCodigo}
                  autoCapitalize="characters" autoCorrect={false}
                />
              </View>
              <Text style={s.hint}>Pídele este código al dueño de la empresa</Text>
            </View>
          )}
        </>}

        {error ? <Text style={s.error}>{error}</Text> : null}
        <View style={{ height: 8 }} />

        {modo === 'login' ? <>
          <Btn label="✓  Iniciar Sesión" color={T.green} onPress={doLogin} />
          <TouchableOpacity style={s.switchBtn} onPress={() => { setModo('register'); setError(''); }}>
            <Text style={s.switchTxt}>¿No tienes cuenta? <Text style={{ color: T.green, fontWeight: '700' }}>Crear cuenta</Text></Text>
          </TouchableOpacity>
        </> : <>
          <Btn label="+ Crear Cuenta" color={T.navy} onPress={doRegister} />
          <TouchableOpacity style={s.switchBtn} onPress={() => { setModo('login'); setError(''); }}>
            <Text style={s.switchTxt}>¿Ya tienes cuenta? <Text style={{ color: T.green, fontWeight: '700' }}>Iniciar sesión</Text></Text>
          </TouchableOpacity>
        </>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (T) => StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  inner:       { flexGrow: 1, justifyContent: 'center', padding: 32 },
  logo:        { width: 88, height: 88, borderRadius: 44, backgroundColor: T.green, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  title:       { fontSize: 26, fontWeight: '700', color: T.text, textAlign: 'center' },
  sub:         { fontSize: T.fontSize, color: T.muted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  fieldWrap:   { marginBottom: 16 },
  label:       { fontSize: T.fontSize - 1, fontWeight: '700', color: T.text, marginBottom: 6 },
  inputWrap:   { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 10 },
  ico:         { fontSize: 18, paddingHorizontal: 12 },
  input:       { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: T.fontSize, color: T.text },
  hint:        { fontSize: 11, color: T.muted, marginTop: 5, marginLeft: 2 },
  error:       { color: T.red, fontSize: 13, marginBottom: 8, textAlign: 'center' },
  switchBtn:   { alignItems: 'center', marginTop: 16 },
  switchTxt:   { fontSize: T.fontSize - 1, color: T.muted },
  rolRow:      { flexDirection: 'row', gap: 12 },
  rolBtn:      { flex: 1, backgroundColor: T.card, borderWidth: 2, borderColor: T.border, borderRadius: 14, padding: 16, alignItems: 'center', gap: 6 },
  rolBtnActive:{ borderColor: T.green, backgroundColor: T.darkMode ? '#1a2e1f' : '#e6f5ea' },
  rolTxt:      { fontSize: T.fontSize, fontWeight: '700', color: T.muted },
  rolDesc:     { fontSize: 11, color: T.muted, textAlign: 'center' },
});