// src/api.js
import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { guardarLocal, leerLocal, agregarACola, leerCola, limpiarCola, hayInternet } from './offline';

export const API_BASE = 'https://basededatos-agrocontrol.onrender.com/api';

let _token = null;
export function setToken(t) { _token = t; }
export function getToken()  { return _token; }

// ── Cliente HTTP base ────────────────────────────────
async function fetchAPI(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (_token) opts.headers['Authorization'] = 'Bearer ' + _token;
  if (body)   opts.body = JSON.stringify(body);
  const res  = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    _token = null;
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    throw new Error('SESSION_EXPIRED');
  }
  if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
  return data;
}

// ── API principal con soporte offline ───────────────
export async function api(method, path, body) {
  const online = await hayInternet();

  // ── GET: intentar online, caer a cache ──────────
  if (method === 'GET') {
    if (online) {
      try {
        const data = await fetchAPI(method, path, body);
        // Guardar en cache local
        const key = pathToKey(path);
        if (key) await guardarLocal(key, data);
        return data;
      } catch (e) {
        if (e.message === 'SESSION_EXPIRED') throw e;
        // Sin internet → leer cache
        const key = pathToKey(path);
        const cached = key ? await leerLocal(key) : null;
        if (cached) return cached;
        throw new Error('Sin conexión y sin datos guardados');
      }
    } else {
      // Sin internet → leer cache directamente
      const key = pathToKey(path);
      const cached = key ? await leerLocal(key) : null;
      if (cached !== null) return cached;
      throw new Error('Sin conexión a internet');
    }
  }

  // ── POST/DELETE: intentar online, guardar en cola si no hay internet ──
  if (online) {
    try {
      const data = await fetchAPI(method, path, body);
      return data;
    } catch (e) {
      if (e.message === 'SESSION_EXPIRED') throw e;
      throw e;
    }
  } else {
    // Sin internet → guardar en cola para sincronizar después
    await agregarACola({ method, path, body });
    // Actualizar cache local optimistamente
    await actualizarCacheOptimista(method, path, body);
    return { ok: true, pendiente: true };
  }
}

// ── Sincronizar cola cuando vuelve el internet ───────
export async function sincronizarCola() {
  const online = await hayInternet();
  if (!online) return { sincronizados: 0, fallidos: 0 };

  const cola = await leerCola();
  if (cola.length === 0) return { sincronizados: 0, fallidos: 0 };

  let sincronizados = 0;
  let fallidos = 0;

  for (const op of cola) {
    try {
      await fetchAPI(op.method, op.path, op.body);
      sincronizados++;
    } catch {
      fallidos++;
    }
  }

  await limpiarCola();
  return { sincronizados, fallidos };
}

// ── Helpers ──────────────────────────────────────────
function pathToKey(path) {
  if (path.startsWith('/campos'))    return 'campos';
  if (path.startsWith('/insumos'))   return 'insumos';
  if (path.startsWith('/gastos'))    return 'gastos';
  if (path.startsWith('/ventas'))    return 'ventas';
  if (path.startsWith('/historial')) return 'historial';
  return null;
}

async function actualizarCacheOptimista(method, path, body) {
  try {
    if (method === 'POST' && path === '/usos') {
      // Descontar stock localmente
      const insumos = await leerLocal('insumos');
      if (insumos && body?.insumoId && body?.cant) {
        const idx = insumos.findIndex(i => i.id === body.insumoId);
        if (idx !== -1) {
          insumos[idx].stock -= body.cant;
          await guardarLocal('insumos', insumos);
        }
      }
    }
    if (method === 'POST' && path === '/gastos') {
      const gastos = await leerLocal('gastos') || [];
      gastos.unshift({ ...body, id: Date.now(), pendiente: true });
      await guardarLocal('gastos', gastos);
    }
    if (method === 'POST' && path === '/ventas') {
      const ventas = await leerLocal('ventas') || [];
      ventas.unshift({ ...body, id: Date.now(), pendiente: true });
      await guardarLocal('ventas', ventas);
    }
  } catch {}
}

// ── Auth Context ─────────────────────────────────────
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(username, password) {
    const data = await fetchAPI('POST', '/auth/login', { username, password });
    _token = data.token;
    await SecureStore.setItemAsync('token', data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function register(username, password, rol = 'dueno', codigoInvite = '') {
    const data = await fetchAPI('POST', '/auth/register', { username, password, rol, codigoInvite });
    _token = data.token;
    await SecureStore.setItemAsync('token', data.token);
    await SecureStore.setItemAsync('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    _token = null;
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  }

  return (
    <AuthCtx.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() { return useContext(AuthCtx); }

export const cache = { campos: null, insumos: null };

export function hoy() { return new Date().toISOString().slice(0, 10); }
export function fmt(n) { return 'S/ ' + Number(n).toFixed(2); }
export function fmtFecha(str) {
  if (!str) return '';
  const [y, m, d] = str.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${+d} ${meses[+m - 1]} ${y}`;
}