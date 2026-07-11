// src/components/UI.js  — componentes reutilizables
import React from 'react';
import {
  View, Text, TouchableOpacity, TextInput,
  ActivityIndicator, StyleSheet, Modal,
} from 'react-native';
import { C, shadow } from '../theme';

// ── Header ──────────────────────────────────────────
export function Header({ title, subtitle, color = C.green, onBack, onPlus, onLock }) {
  return (
    <View style={[s.hdr, { backgroundColor: color }]}>
      <View style={s.hdrRow}>
        {onBack && (
          <TouchableOpacity style={s.backBtn} onPress={onBack}>
            <Text style={s.backBtnTxt}>‹</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={s.hdrTitle}>{title}</Text>
          {subtitle ? <Text style={s.hdrSub}>{subtitle}</Text> : null}
        </View>
        {onPlus && (
          <TouchableOpacity style={s.plusBtn} onPress={onPlus}>
            <Text style={s.plusBtnTxt}>＋</Text>
          </TouchableOpacity>
        )}
        {onLock && (
          <TouchableOpacity onPress={onLock}>
            <Text style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)' }}>🔒</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Campo de formulario ─────────────────────────────
export function Field({ label, children }) {
  return (
    <View style={s.field}>
      <Text style={s.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input({ style, ...props }) {
  return (
    <TextInput
      style={[s.input, style]}
      placeholderTextColor={C.muted}
      {...props}
    />
  );
}

// ── Botón principal ─────────────────────────────────
export function Btn({ label, color = C.green, onPress, disabled, loading }) {
  return (
    <TouchableOpacity
      style={[s.btn, { backgroundColor: color }, disabled && s.btnDis]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading
        ? <ActivityIndicator color="#fff" />
        : <Text style={s.btnTxt}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

// ── Card ────────────────────────────────────────────
export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ── Toast ───────────────────────────────────────────
export function Toast({ msg }) {
  if (!msg) return null;
  return (
    <View style={s.toast} pointerEvents="none">
      <Text style={s.toastTxt}>{msg}</Text>
    </View>
  );
}

// ── Loading overlay ─────────────────────────────────
export function LoadingOverlay({ visible }) {
  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={s.overlay}>
        <ActivityIndicator size="large" color={C.green} />
      </View>
    </Modal>
  );
}

// ── Empty state ─────────────────────────────────────
export function EmptyState({ icon, text, btnLabel, onBtnPress }) {
  return (
    <View style={s.empty}>
      <View style={s.emptyIco}><Text style={{ fontSize: 28 }}>{icon}</Text></View>
      <Text style={s.emptyTxt}>{text}</Text>
      {btnLabel && (
        <TouchableOpacity style={s.emptyBtn} onPress={onBtnPress}>
          <Text style={s.emptyBtnTxt}>{btnLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Access Item (row con flecha) ────────────────────
export function AccessItem({ icon, title, subtitle, onPress, lowStock }) {
  return (
    <TouchableOpacity
      style={[s.accessItem, lowStock && { borderColor: '#f5c6c1' }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[s.aIcon, lowStock && { backgroundColor: '#fce8e6' }]}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.aTitle}>{title}</Text>
        {subtitle ? <Text style={s.aSub}>{subtitle}</Text> : null}
      </View>
      <Text style={{ color: C.border, fontSize: 20 }}>›</Text>
    </TouchableOpacity>
  );
}

// ── Quick Card (grid) ────────────────────────────────
export function QuickCard({ icon, label, bgColor, onPress }) {
  return (
    <TouchableOpacity style={s.quickCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[s.qIcon, { backgroundColor: bgColor }]}>
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>
      <Text style={s.qLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Total Box ───────────────────────────────────────
export function TotalBox({ label, value }) {
  return (
    <View style={s.totalBox}>
      <Text style={s.totalLabel}>{label}</Text>
      <Text style={s.totalValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  hdr:       { paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20 },
  hdrRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hdrTitle:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  hdrSub:    { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  backBtn:   { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  backBtnTxt:{ fontSize: 22, color: '#fff', lineHeight: 26 },
  plusBtn:   { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  plusBtnTxt:{ fontSize: 22, color: '#fff' },

  field:      { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: C.text, marginBottom: 7 },
  input:      { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, fontSize: 14, color: C.text },

  btn:    { borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  btnDis: { opacity: 0.55 },
  btnTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },

  card: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, ...shadow, marginBottom: 10, overflow: 'hidden' },

  toast:   { position: 'absolute', bottom: 100, alignSelf: 'center', backgroundColor: '#2d3a2e', paddingVertical: 11, paddingHorizontal: 22, borderRadius: 24, ...shadow },
  toastTxt:{ color: '#fff', fontSize: 13, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: 'rgba(237,234,224,0.75)', alignItems: 'center', justifyContent: 'center' },

  empty:      { alignItems: 'center', paddingVertical: 44, paddingHorizontal: 20 },
  emptyIco:   { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e8e5de', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  emptyTxt:   { fontSize: 14, color: C.muted, marginBottom: 18 },
  emptyBtn:   { paddingVertical: 11, paddingHorizontal: 24, borderRadius: 24, backgroundColor: C.green },
  emptyBtnTxt:{ color: '#fff', fontSize: 13, fontWeight: '700' },

  accessItem: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10, ...shadow },
  aIcon:      { width: 44, height: 44, borderRadius: 11, backgroundColor: '#e6f5ea', alignItems: 'center', justifyContent: 'center' },
  aTitle:     { fontSize: 14, fontWeight: '700', color: C.text },
  aSub:       { fontSize: 12, color: C.muted, marginTop: 1 },

  quickCard: { flex: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingVertical: 22, paddingHorizontal: 16, alignItems: 'center', gap: 10, ...shadow },
  qIcon:     { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qLabel:    { fontSize: 13, fontWeight: '600', color: C.text, textAlign: 'center' },

  totalBox:   { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 14, marginBottom: 18 },
  totalLabel: { fontSize: 12, color: C.muted, marginBottom: 2 },
  totalValue: { fontSize: 26, fontWeight: '700', color: C.green },
});
