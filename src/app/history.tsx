
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

import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getScanHistory,
    getScanImageUrl,
    ScanHistoryItem,
} from '@/services/api';

export default function HistoryScreen() {
  const [scans, setScans] = useState<ScanHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = useCallback(async () => {
    try {
      setError('');

      const response = await getScanHistory(50);

      setScans(response.scans);
    } catch (err) {
      console.error('History error:', err);
      setError('Unable to load scan history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = () => {
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

  const renderScan = ({ item }: { item: ScanHistoryItem }) => {
    return (
      <View style={styles.card}>
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
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#23834D" />
          <Text style={styles.message}>Loading scan history...</Text>
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

      {error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id}
          renderItem={renderScan}
          contentContainerStyle={
            scans.length === 0 ? styles.emptyContainer : styles.list
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
              <Text style={styles.emptyTitle}>No Scans Yet</Text>
              <Text style={styles.message}>
                Your plant disease scans will appear here.
              </Text>
            </View>
          }
        />
      )}
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
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
