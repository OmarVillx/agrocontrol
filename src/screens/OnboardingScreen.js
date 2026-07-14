// src/screens/OnboardingScreen.js
import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../ThemeContext';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: '🌱',
    titulo: 'Bienvenido a AgroControl',
    desc: 'La app para gestionar tu empresa agrícola de forma simple, rápida y profesional.',
    bg: '#2d5a3d',
  },
  {
    id: '2',
    icon: '📍',
    titulo: 'Gestiona tus Campos',
    desc: 'Registra tus campos, cultivos y hectáreas. Ten toda tu tierra organizada en un solo lugar.',
    bg: '#4a7c59',
  },
  {
    id: '3',
    icon: '📦',
    titulo: 'Controla tu Almacén',
    desc: 'Lleva el stock de insumos en tiempo real. Recibe alertas cuando el stock esté bajo.',
    bg: '#6a9e75',
  },
  {
    id: '4',
    icon: '👥',
    titulo: 'Trabaja en Equipo',
    desc: 'Conecta a tus trabajadores con un código de invitación. Ve todo lo que hacen en tiempo real.',
    bg: '#1a2234',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const T = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  async function finish() {
    await AsyncStorage.setItem('onboarding_visto', 'true');
    onFinish();
  }

  function siguiente() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  }

  function onViewableItemsChanged({ viewableItems }) {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  return (
    <View style={s.root}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        renderItem={({ item }) => (
          <View style={[s.slide, { backgroundColor: item.bg }]}>
            {/* Círculo decorativo de fondo */}
            <View style={s.circleBig} />
            <View style={s.circleSmall} />

            {/* Contenido */}
            <View style={s.content}>
              <View style={s.iconWrap}>
                <Text style={s.icon}>{item.icon}</Text>
              </View>
              <Text style={s.titulo}>{item.titulo}</Text>
              <Text style={s.desc}>{item.desc}</Text>
            </View>
          </View>
        )}
      />

      {/* Footer */}
      <View style={[s.footer, { backgroundColor: SLIDES[currentIndex].bg }]}>
        {/* Dots */}
        <View style={s.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View key={i} style={[s.dot, { width: dotWidth, opacity }]} />
            );
          })}
        </View>

        {/* Botones */}
        <View style={s.btnRow}>
          {currentIndex < SLIDES.length - 1 ? (
            <>
              <TouchableOpacity onPress={finish} style={s.btnSkip}>
                <Text style={s.btnSkipTxt}>Saltar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={siguiente} style={s.btnNext}>
                <Text style={s.btnNextTxt}>Siguiente →</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={finish} style={s.btnStart}>
              <Text style={s.btnStartTxt}>🚀  Comenzar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1 },
  slide:       { width, height, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },

  // Círculos decorativos de fondo
  circleBig:   { position: 'absolute', width: 400, height: 400, borderRadius: 200, backgroundColor: 'rgba(255,255,255,0.06)', top: -80, right: -80 },
  circleSmall: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,255,255,0.06)', bottom: 120, left: -60 },

  content:     { alignItems: 'center', paddingHorizontal: 40 },
  iconWrap:    { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  icon:        { fontSize: 56 },
  titulo:      { fontSize: 26, fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: 16 },
  desc:        { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },

  footer:      { paddingBottom: 48, paddingHorizontal: 32, paddingTop: 24 },
  dots:        { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 28 },
  dot:         { height: 8, borderRadius: 4, backgroundColor: '#fff' },

  btnRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnSkip:     { padding: 12 },
  btnSkipTxt:  { fontSize: 15, color: 'rgba(255,255,255,0.65)', fontWeight: '600' },
  btnNext:     { backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30 },
  btnNextTxt:  { fontSize: 15, color: '#fff', fontWeight: '700' },
  btnStart:    { flex: 1, backgroundColor: '#fff', paddingVertical: 16, borderRadius: 30, alignItems: 'center' },
  btnStartTxt: { fontSize: 16, fontWeight: '700', color: '#2d5a3d' },
});
