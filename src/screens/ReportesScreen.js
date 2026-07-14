// src/screens/ReportesScreen.js
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TextInput,
  StyleSheet, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { api, fmt, useAuth } from '../api';
import { useTheme } from '../ThemeContext';
import { Header, Btn, LoadingOverlay } from '../components/UI';

const { width } = Dimensions.get('window');
const CHART_W = width - 64;

const MESES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

function fmtMes(str) {
  if (!str) return '';
  const [y, m] = str.split('-');
  return `${MESES[+m - 1]} ${y.slice(2)}`;
}

// ── Barra simple ─────────────────────────────────────
function BarChart({ data, colorA, colorB, labelA, labelB }) {
  const max = Math.max(...data.map(d => Math.max(d.gastos || 0, d.ingresos || 0)), 1);
  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 6, paddingHorizontal: 4 }}>
        {data.map((d, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 110 }}>
              <View style={{ width: 10, height: Math.max(3, Math.round((d.gastos||0)/max*110)), backgroundColor: colorA, borderRadius: 3 }} />
              <View style={{ width: 10, height: Math.max(3, Math.round((d.ingresos||0)/max*110)), backgroundColor: colorB, borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 9, color: '#888', textAlign: 'center' }}>{fmtMes(d.mes)}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 16, justifyContent: 'center', marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colorA }} />
          <Text style={{ fontSize: 11, color: '#888' }}>{labelA}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: colorB }} />
          <Text style={{ fontSize: 11, color: '#888' }}>{labelB}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Barra horizontal ─────────────────────────────────
function HBar({ label, value, max, color, suffix = '' }) {
  const pct = max > 0 ? value / max : 0;
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: '#555', flex: 1 }} numberOfLines={1}>{label}</Text>
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#333' }}>{suffix}{fmt(value)}</Text>
      </View>
      <View style={{ height: 8, backgroundColor: '#eee', borderRadius: 4 }}>
        <View style={{ height: 8, width: `${Math.round(pct * 100)}%`, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}

// ── Pantalla principal ───────────────────────────────
export default function ReportesScreen() {
  const T = useTheme();
  const [pass,     setPass]     = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [exporting,setExporting]= useState(false);
  const [error,    setError]    = useState('');
  const [data,     setData]     = useState(null);

  async function verify() {
    if (!pass) { setError('Ingresa tu contraseña'); return; }
    setLoading(true); setError('');
    try {
      await api('POST', '/auth/verify', { password: pass });
      const rep = await api('GET', '/reportes/avanzados');
      setData(rep);
      setUnlocked(true);
    } catch (e) { setError('Credenciales incorrectas'); }
    finally { setLoading(false); }
  }

  function lock() { setUnlocked(false); setPass(''); setData(null); }

  async function exportarPDF() {
    if (!data) return;
    setExporting(true);
    try {
      const html = generarHTML(data);
      const { uri } = await Print.printToFileAsync({ html, base64: false });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Exportar Reporte' });
    } catch (e) { console.log(e); }
    finally { setExporting(false); }
  }

  const s = styles(T);

  if (!unlocked) {
    return (
      <View style={s.root}>
        <LoadingOverlay visible={loading} />
        <Header title="Reportes" subtitle="Acceso Restringido" />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={s.shield}><Text style={{ fontSize: 32 }}>🛡️</Text></View>
          <Text style={s.privTitle}>Área Privada</Text>
          <Text style={s.privSub}>Ingresa tu contraseña para ver los reportes financieros</Text>
          <View style={s.inputWrap}>
            <Text style={s.ico}>🔒</Text>
            <TextInput style={s.input} placeholder="••••••" secureTextEntry
              placeholderTextColor={T.muted} value={pass} onChangeText={setPass} />
          </View>
          {error ? <Text style={s.error}>{error}</Text> : null}
          <View style={{ height: 16 }} />
          <Btn label="✓  Verificar Identidad" color={T.green} onPress={verify} loading={loading} />
          <View style={s.note}><Text style={s.noteTxt}>Los reportes contienen información financiera sensible</Text></View>
        </ScrollView>
      </View>
    );
  }

  const { totales, porMes, porCategoria, insumosMasUsados, ventasPorProducto } = data;
  const maxCat = Math.max(...(porCategoria?.map(c => c.total) || [1]), 1);
  const maxIns = Math.max(...(insumosMasUsados?.map(i => i.total_usado) || [1]), 1);
  const maxVta = Math.max(...(ventasPorProducto?.map(v => v.total) || [1]), 1);

  return (
    <View style={s.root}>
      <LoadingOverlay visible={exporting} />
      <Header title="Reportes Financieros" subtitle="Análisis administrativo" color={T.navy} onLock={lock} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Totales */}
        <View style={s.totalesRow}>
          <View style={[s.totalCard, { backgroundColor: '#fce8e6' }]}>
            <Text style={s.totalIco}>📉</Text>
            <Text style={s.totalLbl}>Gastos</Text>
            <Text style={[s.totalVal, { color: T.red }]}>{fmt(totales.gastos)}</Text>
          </View>
          <View style={[s.totalCard, { backgroundColor: '#e6f5ea' }]}>
            <Text style={s.totalIco}>📈</Text>
            <Text style={s.totalLbl}>Ingresos</Text>
            <Text style={[s.totalVal, { color: T.green }]}>{fmt(totales.ingresos)}</Text>
          </View>
          <View style={[s.totalCard, { backgroundColor: totales.neta >= 0 ? '#e6eef8' : '#fef3e6' }]}>
            <Text style={s.totalIco}>{totales.neta >= 0 ? '💵' : '📉'}</Text>
            <Text style={s.totalLbl}>Neta</Text>
            <Text style={[s.totalVal, { color: totales.neta >= 0 ? '#1a3a7a' : '#8c5a00' }]}>{fmt(totales.neta)}</Text>
          </View>
        </View>

        {/* Gastos vs Ingresos por mes */}
        {porMes?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📊 Gastos vs Ingresos por Mes</Text>
            <BarChart data={porMes} colorA={T.red} colorB={T.green} labelA="Gastos" labelB="Ingresos" />
          </View>
        )}

        {/* Distribución por categoría */}
        {porCategoria?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🥧 Gastos por Categoría</Text>
            {porCategoria.map((c, i) => (
              <HBar key={i} label={c.cat} value={c.total} max={maxCat} color={T.red} />
            ))}
          </View>
        )}

        {/* Ventas por producto */}
        {ventasPorProducto?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>🛒 Ventas por Producto</Text>
            {ventasPorProducto.map((v, i) => (
              <HBar key={i} label={v.prod} value={v.total} max={maxVta} color={T.green} />
            ))}
          </View>
        )}

        {/* Insumos más usados */}
        {insumosMasUsados?.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>📦 Insumos más Usados</Text>
            {insumosMasUsados.map((ins, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12, color: T.muted, flex: 1 }} numberOfLines={1}>{ins.nombre}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: T.text }}>{ins.total_usado} {ins.unidad}</Text>
                </View>
                <View style={{ height: 8, backgroundColor: T.darkMode ? '#333' : '#eee', borderRadius: 4 }}>
                  <View style={{ height: 8, width: `${Math.round(ins.total_usado/maxIns*100)}%`, backgroundColor: T.brown, borderRadius: 4 }} />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Botón exportar PDF */}
        <TouchableOpacity style={s.pdfBtn} onPress={exportarPDF} disabled={exporting}>
          {exporting
            ? <ActivityIndicator color="#fff" />
            : <Text style={s.pdfBtnTxt}>📄 Exportar Reporte en PDF</Text>
          }
        </TouchableOpacity>

        <View style={s.conf}>
          <Text style={s.confTxt}>🔐 Información financiera confidencial</Text>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Generar HTML para PDF ────────────────────────────
function generarHTML(data) {
  const { totales, porMes, porCategoria, insumosMasUsados, ventasPorProducto } = data;
  const fecha = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

  const filasMes = (porMes || []).map(m => `
    <tr>
      <td>${fmtMes(m.mes)}</td>
      <td style="color:#c0574a">S/ ${Number(m.gastos).toFixed(2)}</td>
      <td style="color:#4a7c59">S/ ${Number(m.ingresos).toFixed(2)}</td>
      <td style="color:${(m.ingresos - m.gastos) >= 0 ? '#4a7c59' : '#c0574a'}">S/ ${(m.ingresos - m.gastos).toFixed(2)}</td>
    </tr>
  `).join('');

  const filasCat = (porCategoria || []).map(c => `
    <tr><td>${c.cat}</td><td>S/ ${Number(c.total).toFixed(2)}</td></tr>
  `).join('');

  const filasVta = (ventasPorProducto || []).map(v => `
    <tr><td>${v.prod}</td><td>${Number(v.kg_total).toFixed(2)} kg</td><td>S/ ${Number(v.total).toFixed(2)}</td></tr>
  `).join('');

  const filasIns = (insumosMasUsados || []).map(i => `
    <tr><td>${i.nombre}</td><td>${Number(i.total_usado).toFixed(2)} ${i.unidad}</td></tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #222; }
        h1 { color: #4a7c59; font-size: 24px; margin-bottom: 4px; }
        .fecha { color: #888; font-size: 13px; margin-bottom: 24px; }
        .totales { display: flex; gap: 16px; margin-bottom: 28px; }
        .total-card { flex: 1; padding: 16px; border-radius: 10px; text-align: center; }
        .total-card.gastos { background: #fce8e6; }
        .total-card.ingresos { background: #e6f5ea; }
        .total-card.neta { background: #e6eef8; }
        .total-card .lbl { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
        .total-card .val { font-size: 22px; font-weight: bold; margin-top: 4px; }
        .gastos .val { color: #c0574a; }
        .ingresos .val { color: #4a7c59; }
        .neta .val { color: #1a3a7a; }
        h2 { font-size: 16px; color: #333; margin: 24px 0 12px; border-bottom: 2px solid #eee; padding-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
        th { background: #f5f5f5; padding: 8px 12px; text-align: left; font-size: 12px; color: #666; }
        td { padding: 8px 12px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; }
      </style>
    </head>
    <body>
      <h1>🌱 AgroControl — Reporte Financiero</h1>
      <div class="fecha">Generado el ${fecha}</div>

      <div class="totales">
        <div class="total-card gastos">
          <div class="lbl">Gastos Totales</div>
          <div class="val">S/ ${Number(totales.gastos).toFixed(2)}</div>
        </div>
        <div class="total-card ingresos">
          <div class="lbl">Ingresos Totales</div>
          <div class="val">S/ ${Number(totales.ingresos).toFixed(2)}</div>
        </div>
        <div class="total-card neta">
          <div class="lbl">Ganancia Neta</div>
          <div class="val">S/ ${Number(totales.neta).toFixed(2)}</div>
        </div>
      </div>

      ${filasMes ? `
      <h2>📊 Gastos vs Ingresos por Mes</h2>
      <table>
        <tr><th>Mes</th><th>Gastos</th><th>Ingresos</th><th>Neta</th></tr>
        ${filasMes}
      </table>` : ''}

      ${filasCat ? `
      <h2>🥧 Gastos por Categoría</h2>
      <table>
        <tr><th>Categoría</th><th>Total</th></tr>
        ${filasCat}
      </table>` : ''}

      ${filasVta ? `
      <h2>🛒 Ventas por Producto</h2>
      <table>
        <tr><th>Producto</th><th>Cantidad</th><th>Total</th></tr>
        ${filasVta}
      </table>` : ''}

      ${filasIns ? `
      <h2>📦 Insumos más Usados</h2>
      <table>
        <tr><th>Insumo</th><th>Total Usado</th></tr>
        ${filasIns}
      </table>` : ''}

      <div class="footer">🔐 Información financiera confidencial — AgroControl</div>
    </body>
    </html>
  `;
}

const styles = (T) => StyleSheet.create({
  root:       { flex: 1, backgroundColor: T.bg },
  scroll:     { padding: 16 },
  shield:     { width: 72, height: 72, borderRadius: 36, backgroundColor: '#e6f5ea', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14, marginTop: 16 },
  privTitle:  { fontSize: 18, fontWeight: '700', color: T.text, textAlign: 'center' },
  privSub:    { fontSize: 13, color: T.muted, textAlign: 'center', marginVertical: 8, lineHeight: 20 },
  inputWrap:  { flexDirection: 'row', alignItems: 'center', backgroundColor: T.card, borderWidth: 1, borderColor: T.border, borderRadius: 10, marginTop: 16 },
  ico:        { fontSize: 18, paddingHorizontal: 12 },
  input:      { flex: 1, paddingVertical: 14, paddingRight: 14, fontSize: 14, color: T.text },
  error:      { color: T.red, fontSize: 13, marginTop: 8, textAlign: 'center' },
  note:       { backgroundColor: T.darkMode ? '#1a1a1a' : '#f5f3ee', borderRadius: 10, padding: 14, marginTop: 16 },
  noteTxt:    { fontSize: 12, color: T.muted, textAlign: 'center' },

  totalesRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  totalCard:  { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  totalIco:   { fontSize: 20, marginBottom: 4 },
  totalLbl:   { fontSize: 10, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5 },
  totalVal:   { fontSize: 14, fontWeight: '700', marginTop: 2 },

  card:       { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardTitle:  { fontSize: 14, fontWeight: '700', color: T.text, marginBottom: 16 },

  pdfBtn:     { backgroundColor: T.navy, borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  pdfBtnTxt:  { color: '#fff', fontSize: 15, fontWeight: '700' },

  conf:       { backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, padding: 14, alignItems: 'center', marginBottom: 8 },
  confTxt:    { fontSize: 12, color: T.muted },
});