
import { useCallback, useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  getScanHistory,
  getScanImageUrl,
  PredictionResponse,
  ScanHistoryItem,
} from '@/services/api';

import PredictionResult from '@/components/scanner/PredictionResult';

const HISTORY_CACHE_KEY = '@leafsense_scan_history';

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [selectedScan, setSelectedScan] =
    useState<ScanHistoryItem | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // Fetch latest history and save it locally.
  const fetchHistory = useCallback(async () => {
    try {
      const response = await getScanHistory(50);

      // Update screen.
      setScans(response.scans);
      setError('');

      // Save latest history for offline access.
      await AsyncStorage.setItem(
        HISTORY_CACHE_KEY,
        JSON.stringify(response.scans)
      );
    } catch (err) {
      console.error('History error:', err);

      setError(
        'Unable to refresh scan history. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load locally saved history first, then contact the backend.
  const loadHistory = useCallback(async () => {
    try {
      const cachedHistory = await AsyncStorage.getItem(
        HISTORY_CACHE_KEY
      );

      if (cachedHistory) {
        const parsedHistory = JSON.parse(cachedHistory);

        if (Array.isArray(parsedHistory)) {
          setScans(parsedHistory);
        }
      }
    } catch (err) {
      console.error('Local history loading error:', err);
    } finally {
      // Show cached records without waiting for the server.
      setLoading(false);
    }

    // Refresh cached data from the backend.
    await fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const onRefresh = () => {
    if (refreshing) return;

    setRefreshing(true);
    fetchHistory();
  };

  const formatDiseaseName = (disease: string) => {
    return disease
      .replace(/___/g, ' - ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const createPredictionResponse = (
    scan: ScanHistoryItem
  ): PredictionResponse => {
    return {
      success: true,
      filename: 'Previous scan',
      model: scan.model_name,
      result: {
        predicted_class: scan.predicted_disease,
        confidence: Number(scan.confidence),
        top_predictions: (scan.top_predictions || []).map((item) => ({
          class_name: item.class_name,
          confidence: Number(item.confidence),
        })),
      },
    };
  };

  // Show detailed results when a history card is selected.
  if (selectedScan) {
    return (
      <PredictionResult
        imageUri={getScanImageUrl(selectedScan.id)}
        prediction={createPredictionResponse(selectedScan)}
        onScanAgain={() => setSelectedScan(null)}
        actionLabel="←  Back to History"
      />
    );
  }

  const renderScan = ({ item }: { item: ScanHistoryItem }) => {
    return (
      <Pressable
        style={styles.card}
        onPress={() => setSelectedScan(item)}
      >
        <Image
          source={{ uri: getScanImageUrl(item.id) }}
          style={styles.image}
        />

        <View style={styles.details}>
          <Text style={styles.crop}>
            {item.crop}
          </Text>

          <Text style={styles.disease}>
            {formatDiseaseName(item.predicted_disease)}
          </Text>

          <View style={styles.confidenceContainer}>
            <Text style={styles.confidenceLabel}>
              Model Score
            </Text>

            <Text style={styles.confidence}>
              {Number(item.confidence).toFixed(2)}%
            </Text>
          </View>

          <Text style={styles.date}>
            {formatDate(item.created_at)}
          </Text>

          <Text style={styles.viewDetails}>
            View Details →
          </Text>
        </View>
      </Pressable>
    );
  };

  // Initial loading screen.
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#23834D" />
          <Text style={styles.message}>
            Loading scan history...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Full-screen error only when no cached records are available.
  if (error && scans.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Scan History</Text>
          <Text style={styles.subtitle}>
            Review your previous plant scans
          </Text>
        </View>

        <View style={styles.center}>
          <Text style={styles.error}>
            {error}
          </Text>

          <Pressable
            style={styles.retryButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.retryText}>
                Try Again
              </Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>

        <Text style={styles.subtitle}>
          Review your previous plant scans
        </Text>
      </View>

      {error !== '' && (
        <View style={styles.errorBanner}>
          <View style={styles.errorContent}>
            <Text style={styles.bannerTitle}>
              Connection unavailable
            </Text>

            <Text style={styles.bannerMessage}>
              Your previously saved scans are still available.
            </Text>
          </View>

          <Pressable
            style={styles.bannerRetry}
            onPress={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#1B5E20" size="small" />
            ) : (
              <Text style={styles.bannerRetryText}>
                Retry
              </Text>
            )}
          </Pressable>
        </View>
      )}

      <FlatList
        data={scans}
        keyExtractor={(item) => item.id}
        renderItem={renderScan}
        contentContainerStyle={
          scans.length === 0
            ? styles.emptyContainer
            : styles.list
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#23834D']}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyTitle}>
              No Scans Yet
            </Text>

            <Text style={styles.message}>
              Your plant disease scans will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAF7',
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 15,
    paddingBottom: 18,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 25,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  image: {
    width: 105,
    height: 120,
    borderRadius: 10,
    backgroundColor: '#E8EEE8',
  },
  details: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'center',
  },
  crop: {
    fontSize: 13,
    color: '#23834D',
    fontWeight: '600',
    marginBottom: 4,
  },
  disease: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#26382D',
    marginBottom: 9,
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#777777',
  },
  confidence: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#23834D',
  },
  date: {
    fontSize: 11,
    color: '#888888',
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: '700',
    color: '#23834D',
    marginTop: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  message: {
    fontSize: 14,
    color: '#777777',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#183D2B',
  },
  error: {
    color: '#D94343',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#23834D',
    paddingHorizontal: 25,
    paddingVertical: 11,
    borderRadius: 9,
    marginTop: 18,
    minWidth: 110,
    alignItems: 'center',
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F0',
    borderWidth: 1,
    borderColor: '#F5D0C8',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 13,
  },
  errorContent: {
    flex: 1,
    marginRight: 10,
  },
  bannerTitle: {
    color: '#B83232',
    fontSize: 13,
    fontWeight: '800',
  },
  bannerMessage: {
    color: '#795B55',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  bannerRetry: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    minWidth: 58,
    alignItems: 'center',
  },
  bannerRetryText: {
    color: '#1B5E20',
    fontSize: 12,
    fontWeight: '800',
  },
});
