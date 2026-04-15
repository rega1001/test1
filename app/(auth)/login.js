import {
  getUserFromToken,
  getUserInfo,
  getValidRememberedToken,
  saveToken,
  saveUserInfo,
  setRememberMe,
} from '@/auth/token';
import { AuthContext } from '@/context/AuthContext';
import { router, Stack } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkStoredToken = async () => {
      const token = await getValidRememberedToken();

      if (token) {
        const storedUser = await getUserInfo();
        if (storedUser) {
          setUser(storedUser);
        } else {
          const tokenUser = getUserFromToken(token);
          if (tokenUser?.email) {
            setUser(tokenUser);
          }
        }

        router.replace('/(home)/plant');
      }
    };

    checkStoredToken();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Login gagal', 'Email dan password harus diisi.');
      return;
    }

    const BASE_URL = 'http://localhost:3000';
    const endpoint = `${BASE_URL}/api/auth/login`;

    setLoading(true);
    let loginSuccess = false;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const jsonResponse = await response.json();

      if (response.ok && jsonResponse.status === 'success' && jsonResponse.token) {
        const userToken = jsonResponse.token;
        await saveToken(userToken);
        await setRememberMe(remember);

        const userInfo = jsonResponse.user ?? getUserFromToken(userToken) ?? { email };
        await saveUserInfo(userInfo);
        setUser(userInfo);

        loginSuccess = true;
        console.log('Token tersimpan:', userToken);
      } else {
        Alert.alert('Login gagal', jsonResponse.message || 'Email atau password salah.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Login gagal', 'Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setLoading(false);
      if (loginSuccess) {
        router.replace('/(home)/plant');
      }
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false, title: '' }} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Text style={styles.title}>Login</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="hallo@batari.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRemember(!remember)}
          >
            <View style={[styles.checkbox, remember && styles.checkboxActive]} />
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.linkRow}>
            <Text style={styles.link}>Forgot password</Text>
            <Text style={styles.link}>Create new account</Text>
          </View>

          <Text style={styles.or}>OR</Text>

          <TouchableOpacity style={styles.googleButton}>
            <Text style={styles.googleText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.fbButton}>
            <Text style={styles.fbText}>Continue with Facebook</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    color: '#111827',
    marginBottom: 20,
    fontWeight: '700',
  },
  label: {
    color: '#374151',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    backgroundColor: '#D1D5DB',
    borderRadius: 5,
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: '#22C55E',
  },
  rememberText: {
    color: '#374151',
  },
  loginButton: {
    backgroundColor: '#22C55E',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  link: {
    color: '#22C55E',
    fontWeight: '500',
  },
  or: {
    color: '#9CA3AF',
    textAlign: 'center',
    marginVertical: 10,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleText: {
    color: '#111827',
    fontWeight: '500',
  },
  fbButton: {
    backgroundColor: '#3b5998',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  fbText: {
    color: '#fff',
    fontWeight: '500',
  },
});

export default LoginScreen;