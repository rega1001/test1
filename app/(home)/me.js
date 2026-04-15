import { AuthContext } from '@/context/AuthContext';
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MeScreen() {
  const { user, logout } = useContext(AuthContext);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Me</Text>
      <Text style={styles.label}>Email: {user?.email ?? '-'}</Text>
      <Text style={styles.label}>Phone: {user?.phone ?? '-'}</Text>

      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});