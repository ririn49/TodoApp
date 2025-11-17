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
  SafeAreaView, // <-- Sangat penting untuk stabilitas
} from 'react-native';
import { Link, useRouter } from 'expo-router';
// 1. IMPORT IKON (BARU)
import { Ionicons } from '@expo/vector-icons';

const RegisterScreen = () => {
  // State (tidak berubah)
  const [fullName, setFullName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [agreed, setAgreed] = useState<boolean>(false);

  const router = useRouter();

  // Fungsi handleRegister (tidak berubah)
  const handleRegister = () => {
    if (
      !fullName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
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
    console.log('--- DATA REGISTRASI ---');
    console.log('Full Name:', fullName);
    console.log('Username:', username);
    console.log('Email:', email);
    Alert.alert('Sukses', 'Registrasi berhasil! (Placeholder)');
    // router.replace('/');
  };

  // --- TAMPILAN (RENDER) - (LAYOUT DIPERBARUI) ---

  return (
    <SafeAreaView style={styles.container}>
      {/* 2. Tombol Back diletakkan di luar ScrollView agar STABIL */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()} // Fungsi kembali
          style={styles.backButton} // Style baru
        >
          {/* 3. Gunakan Ikon, bukan Teks */}
          <Ionicons name="arrow-back" size={28} color="#6A5C8A" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* Wrapper untuk Form */}
          <View style={styles.innerContainer}>
            {/* Input Full Name */}
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#8A7DAB"
              value={fullName}
              onChangeText={setFullName}
            />

            {/* ... (Semua input lainnya sama persis) ... */}
            <TextInput
              style={styles.input}
              placeholder="Username"
              placeholderTextColor="#8A7DAB"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8A7DAB"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#8A7DAB"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8A7DAB"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Checkbox Terms & Conditions (Sama) */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setAgreed(!agreed)}
              >
                {agreed && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>
                I Agree to Terms & Conditions
              </Text>
            </View>

            {/* Tombol Register (Sama) */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>

            {/* Link ke Halaman Login (Sama) */}
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

// --- STYLING (DIPERBARUI) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9FF',
  },
  // (BARU) Container untuk tombol back
  headerContainer: {
    paddingHorizontal: 15, // Jarak dari pinggir
    paddingTop: Platform.OS === 'android' ? 15 : 0, // Extra padding untuk Android
  },
  // (BARU) Style untuk tombol back (lebih stabil)
  backButton: {
    padding: 10, // Area klik lebih besar
    alignSelf: 'flex-start', // Posisikan di kiri
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  innerContainer: {
    width: '85%',
    alignItems: 'center',
    alignSelf: 'center',
    // Hapus 'marginTop: 20' karena tombol back sudah di luar
  },
  // (LAMA - Hapus style backButton & backButtonText yang lama)
  // ...

  // (Semua style lain di bawah ini SAMA)
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
  checkmark: {
    color: '#6D47FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6A5C8A',
  },
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
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  loginText: {
    fontSize: 14,
    color: '#6A5C8A',
  },
  loginLink: {
    fontSize: 14,
    color: '#6D47FF',
    fontWeight: 'bold',
  },
});

export default RegisterScreen;