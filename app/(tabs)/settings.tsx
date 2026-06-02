import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { logoutUser } from '../../services/authService';

export default function SettingsScreen() {
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const storedVoice = await AsyncStorage.getItem('voiceEnabled');
    const storedNotifications = await AsyncStorage.getItem(
      'notificationsEnabled'
    );
    const storedDarkMode = await AsyncStorage.getItem('darkMode');

    if (storedVoice !== null) {
      setVoiceEnabled(storedVoice === 'true');
    }

    if (storedNotifications !== null) {
      setNotificationsEnabled(storedNotifications === 'true');
    }

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }

  async function saveVoiceSetting(value: boolean) {
    setVoiceEnabled(value);
    await AsyncStorage.setItem('voiceEnabled', String(value));

    if (!value) {
      await Notifications.cancelAllScheduledNotificationsAsync();

      const storedHabits = await AsyncStorage.getItem('habits');

      if (storedHabits) {
        const habits = JSON.parse(storedHabits);

        const updatedHabits = habits.map((habit: any) => ({
          ...habit,
          notificationId: '',
        }));

        await AsyncStorage.setItem(
          'habits',
          JSON.stringify(updatedHabits)
        );
      }

      Alert.alert(
        'Reminders turned off',
        'All scheduled habit reminders have been cancelled.'
      );
    }
  }

  async function saveNotificationSetting(value: boolean) {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(
      'notificationsEnabled',
      String(value)
    );
  }

  async function saveDarkModeSetting(value: boolean) {
    setDarkMode(value);
    await AsyncStorage.setItem('darkMode', String(value));
  }

  async function handleLogout() {
    try {
      await logoutUser();

      Alert.alert(
        'Logged out',
        'You have been logged out.'
      );

      router.replace('/login');
    } catch (error: any) {
      Alert.alert(
        'Logout error',
        error.message || 'Could not log out.'
      );
    }
  }

  async function clearAllData() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.clear();

    Alert.alert(
      'Data cleared',
      'All habits, moods, reminders and settings have been deleted.'
    );

    router.back();
  }

  return (
    <View
      style={[
        styles.container,
        darkMode && styles.darkContainer,
      ]}
    >
      <Text
        style={[
          styles.title,
          darkMode && styles.darkTitle,
        ]}
      >
        Settings
      </Text>

      <View
        style={[
          styles.card,
          darkMode && styles.darkCard,
        ]}
      >
        <View style={styles.settingRow}>
          <View>
            <Text
              style={[
                styles.settingTitle,
                darkMode && styles.darkTitle,
              ]}
            >
              Dark mode
            </Text>

            <Text
              style={[
                styles.settingText,
                darkMode && styles.darkText,
              ]}
            >
              Use a darker theme for better viewing comfort.
            </Text>
          </View>

          <Switch
            value={darkMode}
            onValueChange={saveDarkModeSetting}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text
              style={[
                styles.settingTitle,
                darkMode && styles.darkTitle,
              ]}
            >
              Voice reminders
            </Text>

            <Text
              style={[
                styles.settingText,
                darkMode && styles.darkText,
              ]}
            >
              Automatically schedule habit reminders.
            </Text>
          </View>

          <Switch
            value={voiceEnabled}
            onValueChange={saveVoiceSetting}
          />
        </View>

        <View style={styles.settingRow}>
          <View>
            <Text
              style={[
                styles.settingTitle,
                darkMode && styles.darkTitle,
              ]}
            >
              Notifications
            </Text>

            <Text
              style={[
                styles.settingText,
                darkMode && styles.darkText,
              ]}
            >
              Show reminder notifications.
            </Text>
          </View>

          <Switch
            value={notificationsEnabled}
            onValueChange={saveNotificationSetting}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>
          Logout
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={clearAllData}
      >
        <Text style={styles.deleteButtonText}>
          Clear All Data
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.backButton,
          darkMode && styles.darkBackButton,
        ]}
        onPress={() => router.back()}
      >
        <Text
          style={[
            styles.backButtonText,
            darkMode && styles.darkButtonText,
          ]}
        >
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F6F7FB',
  },

  darkContainer: {
    backgroundColor: '#121212',
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 60,
    marginBottom: 24,
    color: '#222',
    textAlign: 'center',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkTitle: {
    color: '#FFFFFF',
    fontFamily: 'PixelifySans_400Regular',
  },

  card: {
    backgroundColor: '#FFF4C7',
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    padding: 20,
    marginBottom: 24,
  },

  darkCard: {
    backgroundColor: '#1E1E1E',
  },

  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    fontFamily: 'PixelifySans_400Regular',
  },

  settingText: {
    color: '#666',
    marginTop: 4,
    maxWidth: 220,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkText: {
    color: '#CCCCCC',
    fontFamily: 'PixelifySans_400Regular',
  },

  logoutButton: {
    backgroundColor: '#4C6FFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans_400Regular',
  },

  deleteButton: {
    backgroundColor: '#FF4D4D',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans_400Regular',
  },

  backButton: {
    backgroundColor: '#E8ECFF',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },

  darkBackButton: {
    backgroundColor: '#2A2A2A',
  },

  backButtonText: {
    color: '#4C6FFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkButtonText: {
    color: '#FFFFFF',
  },
});