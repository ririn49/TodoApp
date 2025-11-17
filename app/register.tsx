import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// --- 1. IMPORT FUNGSI FIREBASE (LENGKAPI) ---
import { createUserWithEmailAndPassword } from 'firebase/auth';
// Import 'db' (database) dan 'auth'
import { auth, db } from '../config/firebaseConfig';
// Import fungsi untuk MENULIS ke Firestore
import { setDoc, doc } from 'firebase/firestore';

const RegisterScreen = () => {
  // ... (State tidak berubah) ...
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState<boolean>(false);

  const router = useRouter();

  // --- 2. FUNGSI HANDLE REGISTER (DIPERBARUI) ---
  const handleRegister = async () => {
    // ... (Validasi frontend tidak berubah) ...
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Password dan Confirm Password tidak cocok.');
      return;
    }
    if (!agreed) {
      Alert.alert('Error', 'Anda harus menyetujui Terms & Conditions.');
      return;
    }

    setLoading(true);

    try {
      // --- TAHAP 1: BUAT AKUN DI AUTHENTICATION ---
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Dapatkan User ID (uid) dari pengguna yang baru dibuat
      const user = userCredential.user;
      console.log('User berhasil dibuat di Auth:', user.uid);

      // --- TAHAP 2: SIMPAN DATA PROFIL KE FIRESTORE ---
      // Kita akan membuat dokumen baru di koleksi 'users'
      // Nama dokumennya akan sama dengan UID pengguna
      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        createdAt: new Date(), // Simpan tanggal pendaftaran
      });

      console.log('Data user berhasil disimpan di Firestore');

      // --- TAHAP 3: BERI TAHU PENGGUNA ---
      Alert.alert('Sukses', 'Akun Anda berhasil dibuat!');
      router.replace('/'); // Arahkan kembali ke login
    } catch (error: any) {
      // ... (Penanganan error tidak berubah) ...
      console.error('Error registrasi:', error.code, error.message);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Email ini sudah terdaftar.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Error', 'Password terlalu lemah (minimal 6 karakter).');
      } else {
        Alert.alert('Error', 'Terjadi kesalahan. Coba lagi nanti.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- TAMPILAN (RENDER) ---
  // (Tidak ada yang berubah di bagian tampilan)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          disabled={loading}
        >
          <Ionicons name="arrow-back" size={28} color="#6A5C8A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            {/* Input Full Name */}
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#8A7DAB"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* Input Email */}
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8A7DAB"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Input Password (dengan ikon mata) */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#8A7DAB"
                value={password}
                onChangeText={setPassword}
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

            {/* Input Confirm Password (dengan ikon mata) */}
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm Password"
                placeholderTextColor="#8A7DAB"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!isConfirmPasswordVisible}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() =>
                  setIsConfirmPasswordVisible(!isConfirmPasswordVisible)
                }
              >
                <Ionicons
                  name={
                    isConfirmPasswordVisible
                      ? 'eye-off-outline'
                      : 'eye-outline'
                  }
                  size={24}
                  color="#6A5C8A"
                />
              </TouchableOpacity>
            </View>

            {/* Checkbox */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreed(!agreed)}
                disabled={loading}
              >
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I Agree to Terms & Conditions
              </Text>
            </View>

            {/* Tombol Register */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>Register</Text>
              )}
            </TouchableOpacity>

            {/* Link Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Login here!</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- STYLING (Tidak ada yang berubah) ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9FF' },
  headerContainer: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 15 : 0,
  },
  backButton: { padding: 10, alignSelf: 'flex-start' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingBottom: 20 },
  innerContainer: { width: '85%', alignItems: 'center', alignSelf: 'center' },
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
  passwordContainer: {
    width: '100%',
    backgroundColor: '#E6E0FF',
    borderRadius: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: { marginLeft: 10 },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
    marginBottom: 20,
    paddingLeft: 5,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#E6E0FF',
    borderRadius: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E6E0FF',
  },
  checkmark: { color: '#6D47FF', fontSize: 14, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#6A5C8A' },
  registerButton: {
    width: '100%',
    backgroundColor: '#6D47FF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonDisabled: { backgroundColor: '#BCA9FF' },
  registerButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  loginContainer: { flexDirection: 'row', marginTop: 30 },
  loginText: { fontSize: 14, color: '#6A5C8A' },
  loginLink: { fontSize: 14, color: '#6D47FF', fontWeight: 'bold' },
});

export default RegisterScreen;