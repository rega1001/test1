import { clearAuth, getToken, isTokenValid } from '@/auth/token';
import DeviceCard from '@/components/DeviceCard';
import { AuthContext } from '@/context/AuthContext';
import { router } from 'expo-router';
import { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PlantScreen() {
  const { user, setSelectedDevice } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [plantList, setPlantList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const token = await getToken();
      if (!token || !isTokenValid(token)) {
        await clearAuth();
        Alert.alert('Error', 'Sesi Anda telah habis atau token tidak valid. Silakan login kembali.');
        setIsLoading(false);
        router.replace('/(auth)/login');
        return;
      }

      const BASE_URL = 'http://localhost:3000';
      const endpoint = `${BASE_URL}/api/plant/`;

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Otentikasi masuk di sini
        },
      });

      const jsonResponse = await response.json();
      if (response.ok) {
        setPlantList(jsonResponse.data);
      } else {
        Alert.alert('Gagal', jsonResponse.message || 'Gagal mengambil data perangkat');
      }
    } catch (error) {
      Alert.alert('Error', 'Terjadi masalah jaringan atau server mati.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDevices = useMemo(() => {
    return plantList.filter((item) => {
      const keyword = search.toLowerCase();

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.system_type?.toLowerCase().includes(keyword) ||
        item.location?.toLowerCase().includes(keyword)
      );
    });
  }, [search, plantList]);

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    router.push(`/plant/${device.name}/overview`);
  };

  const handleAddDevice = () => {
    router.push('/(main)/add-device');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Plant</Text>

        {user?.role === 'admin' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddDevice}>
            <Text style={styles.addText}>＋</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.searchBox}>
        <TextInput
          placeholder="Cari nama plant / SN / lokasi"
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Memuat data plant...</Text>
        </View>
      ) : (
        <FlatList
        data={filteredDevices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DeviceCard
            device={item}
            onPress={() => handleSelectDevice(item)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada plant.</Text>
        }
      />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  addText: {
    fontSize: 32,
    color: '#111827',
    lineHeight: 36,
  },
  searchBox: {
    marginTop: 14,
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 24,
    fontSize: 15,
  },
});