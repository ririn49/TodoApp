import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
// --- 1. IMPORT IKON ---
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  // --- 2. STATE BARU UNTUK SHOW/HIDE PASSWORD ---
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const router = useRouter();

  // Fungsi handleLogin (tidak berubah)
  const handleLogin = async () => {
    if (!email && !password) {
      Alert.alert('Error', 'Email dan Password tidak boleh kosong.');
      return;
    }
    if (!email) {
      Alert.alert('Error', 'Email tidak boleh kosong.');
      return;
    }
    if (!password) {
      Alert.alert('Error', 'Password tidak boleh kosong.');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log('Login berhasil:', userCredential.user.uid);
      router.replace('/home'); 
    } catch (error: any) {
      if (
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        Alert.alert('Error', 'Email atau Password yang Anda masukkan salah.');
      } else {
        Alert.alert('Error', 'Terjadi kesalahan. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN (RENDER) ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          <Image
            source={require('../assets/images/login-hero.png')}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.title}>Do-It Now</Text>

          {/* Input Email (Tidak berubah) */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8A7DAB"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* --- 3. INPUT PASSWORD (DIPERBARUI) --- */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor="#8A7DAB"
              value={password}
              onChangeText={setPassword}
              // secureTextEntry di-toggle oleh state
              secureTextEntry={!isPasswordVisible} 
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#6A5C8A"
              />
            </TouchableOpacity>
          </View>
          {/* ----------------------------------- */}

          {/* Tombol Login (Tidak berubah) */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Link Register (Tidak berubah) */}
          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={styles.registerLink}>Register here!</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- 4. STYLING (DIPERBARUI) ---
const styles = StyleSheet.create({
  // ... (container, scrollContainer, innerContainer, heroImage, title tidak berubah)
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: { width: '85%', alignItems: 'center', paddingVertical: 40 },
  heroImage: { width: 300, height: 250, marginBottom: 20 },
  title: { fontSize: 42, fontWeight: 'bold', color: '#6A5C8A', marginBottom: 30 },

  // Style input biasa (untuk Email)
  input: {
    width: '100%',
    backgroundColor: '#E6E0FF',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },

  // --- STYLE BARU UNTUK PASSWORD ---
  passwordContainer: {
    width: '100%',
    backgroundColor: '#E6E0FF',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20, // Padding horizontal di container
  },
  passwordInput: {
    flex: 1, // Input mengambil sisa ruang
    paddingVertical: 15, // Padding vertical di input
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    marginLeft: 10, // Jarak antara input dan ikon
  },
  // --------------------------------

  // ... (sisa style tidak berubah)
  loginButton: {
    width: '100%',
    backgroundColor: '#6D47FF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonDisabled: {
    backgroundColor: '#BCA9FF',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: '#6A5C8A',
  },
  registerLink: {
    fontSize: 14,
    color: '#6D47FF',
    fontWeight: 'bold',
  },
});

export default LoginScreen;