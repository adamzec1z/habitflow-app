import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { registerUser } from '../../services/authService';
export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadDarkMode();
    }, [])
  );

  async function loadDarkMode() {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }

  async function handleSignUp() {
    try {
      await registerUser(email, password);

      Alert.alert(
        'Account created',
        'Your HabitFlow account has been created.'
      );

      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert(
        'Sign-up error',
        error.message || 'Could not create account.'
      );
    }
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.title, darkMode && styles.darkTitle]}>
        HabitFlow
      </Text>

      <Text style={[styles.subtitle, darkMode && styles.darkText]}>
        Create your account
      </Text>

      <Text style={[styles.label, darkMode && styles.darkTitle]}>
        Email
      </Text>

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Enter email"
        placeholderTextColor={darkMode ? '#AAAAAA' : '#777'}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <Text style={[styles.label, darkMode && styles.darkTitle]}>
        Password
      </Text>

      <TextInput
        style={[styles.input, darkMode && styles.darkInput]}
        placeholder="Enter password"
        placeholderTextColor={darkMode ? '#AAAAAA' : '#777'}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>
          Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.secondaryButton, darkMode && styles.darkSecondaryButton]}
        onPress={() => router.push('/login')}
      >
        <Text style={[styles.secondaryButtonText, darkMode && styles.darkButtonText]}>
          Already have an account? Login
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
        <Text style={styles.link}>
          Continue as demo user
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },

  darkContainer: {
    backgroundColor: '#121212',
  },

  title: {
    fontSize: 34,
    color: '#121212',
    textAlign: 'center',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkTitle: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 12,
    color: '#5A5A5A',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkText: {
    color: '#CCCCCC',
  },

  label: {
    color: '#000000',
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'PixelifySans_400Regular',
  },

  input: {
    backgroundColor: '#FFF4C7',
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    padding: 14,
    marginBottom: 18,
    color: '#000000',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },

  button: {
    backgroundColor: '#4C6FFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'PixelifySans_400Regular',
  },

  secondaryButton: {
    backgroundColor: '#E8ECFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 12,
  },

  darkSecondaryButton: {
    backgroundColor: '#2A2A2A',
  },

  secondaryButtonText: {
    color: '#4C6FFF',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkButtonText: {
    color: '#FFFFFF',
  },

  link: {
    color: '#4C6FFF',
    textAlign: 'center',
    marginTop: 18,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans_400Regular',
  },
});