// src/offline.js — manejo de datos offline y cola de sincronización
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

const KEYS = {
  campos:    'offline_campos',
  insumos:   'offline_insumos',
  gastos:    'offline_gastos',
  ventas:    'offline_ventas',
  historial: 'offline_historial',
  cola:      'offline_cola', // operaciones pendientes
};

// ── Guardar datos localmente ─────────────────────────
export async function guardarLocal(key, data) {
  try {
    await AsyncStorage.setItem(KEYS[key], JSON.stringify(data));
  } catch {}
}

// ── Leer datos locales ───────────────────────────────
export async function leerLocal(key) {
  try {
    const data = await AsyncStorage.getItem(KEYS[key]);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

// ── Agregar operación a la cola ──────────────────────
export async function agregarACola(operacion) {
  try {
    const colaStr = await AsyncStorage.getItem(KEYS.cola);
    const cola = colaStr ? JSON.parse(colaStr) : [];
    cola.push({ ...operacion, id: Date.now(), timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(KEYS.cola, JSON.stringify(cola));
  } catch {}
}

// ── Leer cola pendiente ──────────────────────────────
export async function leerCola() {
  try {
    const colaStr = await AsyncStorage.getItem(KEYS.cola);
    return colaStr ? JSON.parse(colaStr) : [];
  } catch { return []; }
}

// ── Limpiar cola ─────────────────────────────────────
export async function limpiarCola() {
  try { await AsyncStorage.removeItem(KEYS.cola); } catch {}
}

// ── Verificar conexión ───────────────────────────────
export async function hayInternet() {
  const state = await NetInfo.fetch();
  return state.isConnected && state.isInternetReachable;
}
