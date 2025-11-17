import React, { useState } from "react";
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
} from "react-native";
// Di Expo Router, kita pakai 'expo-router' untuk navigasi
import { Link, useRouter } from "expo-router";

const LoginScreen = () => {
  // State untuk menyimpan nilai dari input
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Hook navigasi baru dari Expo Router
  const router = useRouter();

  // --- FUNGSI FUNGSIONAL (VALIDASI 3 TAHAP) ---

  const handleLogin = () => {
    console.log("Attempting login with:", username, password);

    // --- VALIDASI BARU ---
    // 1. Cek jika KEDUANYA kosong
    if (!username && !password) {
      Alert.alert("Error", "Username dan Password tidak boleh kosong.");
      return; // Hentikan fungsi
    }

    // 2. Jika lolos #1, cek username
    if (!username) {
      Alert.alert("Error", "Username tidak boleh kosong.");
      return; // Hentikan fungsi
    }

    // 3. Jika lolos #1 dan #2, cek password
    if (!password) {
      Alert.alert("Error", "Password tidak boleh kosong.");
      return; // Hentikan fungsi
    }
    // --- AKHIR VALIDASI ---

    // Nanti di sini kita akan panggil Firebase
    // Jika berhasil, kita pindah ke halaman 'home'
    // router.replace('/home'); // (Kita akan atur ini nanti)
  };

  // --- TAMPILAN (RENDER) ---

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          {/* 💡 PERHATIAN: Pastikan gambar Anda ada di path ini */}
          <Image
            source={require("../assets/images/login-hero.png")}
            style={styles.heroImage}
            resizeMode="contain"
          />

          <Text style={styles.title}>Do-It Now</Text>

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
            placeholder="Password"
            placeholderTextColor="#8A7DAB"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            {/* Ini akan otomatis mencari file 'register.tsx' 
              yang akan kita buat selanjutnya 
            */}
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

// --- STYLING ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9FF",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    width: "85%",
    alignItems: "center",
    paddingVertical: 40,
  },
  heroImage: {
    width: 300,
    height: 250,
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#6A5C8A",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#E6E0FF",
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#6D47FF",
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: "#6A5C8A",
  },
  registerLink: {
    fontSize: 14,
    color: "#6D47FF",
    fontWeight: "bold",
  },
});

export default LoginScreen;