// src/api.js
import React, { createContext, useContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

export const API_BASE = 'https://basededatos-production-1fc9.up.railway.app/api';

let _token = null;
export function setToken(t) { _token = t; }
export function getToken()  { return _token; }

export async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (_token) opts.headers['Authorization'] = 'Bearer ' + _token;
  if (body)   opts.body = JSON.stringify(body);
  const res  = await fetch(API_BASE + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Error ' + res.status);
  return data;
}

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(username, password) {
    const data = await api('POST', '/auth/login', { username, password });
    _token = data.token;
    await SecureStore.setItemAsync('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(username, password, rol = 'dueno', codigoInvite = '') {
    const data = await api('POST', '/auth/register', { username, password, rol, codigoInvite });
    _token = data.token;
    await SecureStore.setItemAsync('token', data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    _token = null;
    await SecureStore.deleteItemAsync('token');
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