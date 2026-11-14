
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#2E7D32',
  darkGreen: '#1B5E20',
  lightGreen: '#E8F5E9',
  background: '#F7F9F6',
  white: '#FFFFFF',
  text: '#1C2B1D',
  secondary: '#718071',
  border: '#E8EDE6',
};

const crops = [
  { name: 'Tomato', emoji: '🍅' },
  { name: 'Potato', emoji: '🥔' },
  { name: 'Apple', emoji: '🍎' },
  { name: 'Grape', emoji: '🍇' },
  { name: 'Corn', emoji: '🌽' },
  { name: 'Cherry', emoji: '🍒' },
  { name: 'Peach', emoji: '🍑' },
  { name: 'Bell Pepper', emoji: '🫑' },
];

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>WELCOME TO</Text>
            <Text style={styles.appName}>PlantCare AI</Text>
          </View>

          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🌿</Text>
          </View>
        </View>

        {/* Welcome section */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>
            Keep your plants{'\n'}
            <Text style={styles.greenText}>healthy and thriving.</Text>
          </Text>

          <Text style={styles.welcomeDescription}>
            Identify plant diseases with AI and discover
            ways to protect your crops.
          </Text>
        </View>

        {/* Scan card */}
        <Pressable
          style={({ pressed }) => [
            styles.scanCard,
            pressed && { opacity: 0.9 },
          ]}
          onPress={() => {}}
        >
          <View style={styles.scanCardContent}>
            <View style={styles.scanIcon}>
              <Text style={{ fontSize: 28 }}>📷</Text>
            </View>

            <Text style={styles.scanTitle}>Scan a Plant</Text>

            <Text style={styles.scanDescription}>
              Take a photo or select an image to detect
              possible plant diseases.
            </Text>

            <View style={styles.scanButton}>
              <Text style={styles.scanButtonText}>
                Start Scanning  →
              </Text>
            </View>
          </View>

          <Text style={styles.scanDecoration}>🌱</Text>
        </Pressable>

        {/* Supported crops */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Supported Crops</Text>
            <Text style={styles.sectionSubtitle}>
              Currently trained to recognize 8 crops
            </Text>
          </View>

          <Text style={styles.countBadge}>08</Text>
        </View>

        <View style={styles.cropGrid}>
          {crops.map((crop) => (
            <View key={crop.name} style={styles.cropCard}>
              <Text style={styles.cropEmoji}>{crop.emoji}</Text>
              <Text style={styles.cropName}>{crop.name}</Text>
            </View>
          ))}
        </View>

        {/* Information card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Text style={{ fontSize: 22 }}>🤖</Text>
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>AI-powered detection</Text>
            <Text style={styles.infoDescription}>
              Powered by our custom-trained EfficientNet-B0
              model with 31 disease and healthy classes.
            </Text>
          </View>
        </View>

        <Text style={styles.footer}>
          PlantCare AI · Helping plants grow healthier
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    letterSpacing: 2,
  },
  appName: {
    fontSize: 25,
    fontWeight: '800',
    color: COLORS.darkGreen,
    marginTop: 3,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 25,
  },
  welcome: {
    marginTop: 32,
    marginBottom: 22,
  },
  welcomeTitle: {
    fontSize: 29,
    lineHeight: 38,
    fontWeight: '800',
    color: COLORS.text,
  },
  greenText: {
    color: COLORS.primary,
  },
  welcomeDescription: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.secondary,
    marginTop: 12,
  },
  scanCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  scanCardContent: {
    zIndex: 1,
    alignItems: 'flex-start',
  },
  scanIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.white,
  },
  scanDescription: {
    fontSize: 13,
    lineHeight: 21,
    color: '#E4F3E5',
    marginTop: 8,
    maxWidth: '90%',
  },
  scanButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  scanButtonText: {
    color: COLORS.darkGreen,
    fontSize: 13,
    fontWeight: '700',
  },
  scanDecoration: {
    position: 'absolute',
    fontSize: 100,
    right: -8,
    bottom: -15,
    opacity: 0.15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 5,
  },
  countBadge: {
    backgroundColor: COLORS.lightGreen,
    color: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    fontWeight: '800',
    overflow: 'hidden',
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  cropCard: {
    width: '22%',
    minWidth: 68,
    flexGrow: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 27,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginTop: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.lightGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  infoDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: COLORS.secondary,
    marginTop: 5,
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.secondary,
    marginTop: 25,
  },
});
