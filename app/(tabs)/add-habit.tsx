import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
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
import { auth } from '../../services/firebase';
import { createHabit } from '../../services/habitService';

export default function AddHabitScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
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

  function handleTimeChange(event: any, date?: Date) {
    if (date) {
      setSelectedTime(date);
    }
  }

  function applySelectedTime() {
    const formattedTime = selectedTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    setReminderTime(formattedTime);
    setShowTimePicker(false);
  }

  async function saveHabit() {
    if (name.trim() === '') {
      Alert.alert(
        'Missing habit name',
        'Please enter a habit name.'
      );
      return;
    }

    const newHabit = {
      id: Date.now().toString(),
      firestoreId: '',
      name: name.trim(),
      category: category.trim(),
      reminderTime: reminderTime,
      completed: false,
      streak: 0,
    };

    try {
      const userId = auth.currentUser?.uid || 'demo-user';

      const firestoreHabit = await createHabit(userId, {
        name: newHabit.name,
        category: newHabit.category || 'General',
        frequency: 'Daily',
        reminderTime: newHabit.reminderTime,
      });

      newHabit.firestoreId = firestoreHabit.id;

      console.log('Habit backup saved to Firestore');
    } catch (error) {
      console.log('Firestore backup failed:', error);
    }

    const storedHabits = await AsyncStorage.getItem('habits');

    const habits = storedHabits
      ? JSON.parse(storedHabits)
      : [];

    habits.push(newHabit);

    await AsyncStorage.setItem(
      'habits',
      JSON.stringify(habits)
    );

    Alert.alert(
      'Habit saved',
      'Your habit has been added.'
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
        Add Habit
      </Text>

      <Text
        style={[
          styles.subtitle,
          darkMode && styles.darkText,
        ]}
      >
        Create a new habit to track daily.
      </Text>

      <Text
        style={[
          styles.label,
          darkMode && styles.darkTitle,
        ]}
      >
        Habit Name
      </Text>

      <TextInput
        style={[
          styles.input,
          darkMode && styles.darkInput,
        ]}
        placeholder="e.g. Drink water"
        placeholderTextColor={darkMode ? '#AAAAAA' : '#777'}
        value={name}
        onChangeText={setName}
      />

      <Text
        style={[
          styles.label,
          darkMode && styles.darkTitle,
        ]}
      >
        Category
      </Text>

      <TextInput
        style={[
          styles.input,
          darkMode && styles.darkInput,
        ]}
        placeholder="e.g. Health, Study, Fitness"
        placeholderTextColor={darkMode ? '#AAAAAA' : '#777'}
        value={category}
        onChangeText={setCategory}
      />

      <Text
        style={[
          styles.label,
          darkMode && styles.darkTitle,
        ]}
      >
        Reminder Time
      </Text>

      <TouchableOpacity
        style={[
          styles.input,
          darkMode && styles.darkInput,
        ]}
        onPress={() => setShowTimePicker(true)}
      >
        <Text
          style={[
            styles.timeText,
            darkMode && styles.darkInputText,
          ]}
        >
          {reminderTime || 'Select reminder time'}
        </Text>
      </TouchableOpacity>

      {showTimePicker && (
        <View
          style={[
            styles.timePickerBox,
            darkMode && styles.darkCard,
          ]}
        >
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="spinner"
            textColor={darkMode ? '#FFFFFF' : '#111'}
            themeVariant={darkMode ? 'dark' : 'light'}
            onChange={handleTimeChange}
            style={styles.timePicker}
          />

          <TouchableOpacity
            style={styles.applyTimeButton}
            onPress={applySelectedTime}
          >
            <Text style={styles.applyTimeButtonText}>
              Apply Time
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={saveHabit}
      >
        <Text style={styles.buttonText}>
          Save Habit
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
  },

  darkContainer: {
    backgroundColor: '#121212',
  },

  title: {
    fontSize: 32,
    color: '#121212',
    textAlign: 'center',
    marginTop: 60,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkTitle: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 12,
    color: '#ffffff',
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
    color: '#FFFFFF',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkInput: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
  },

  darkInputText: {
    color: '#FFFFFF',
  },

  timeText: {
    fontSize: 16,
    color: '#2B2B2B',
    fontFamily: 'PixelifySans_400Regular',
  },

  timePickerBox: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
  },

  darkCard: {
    backgroundColor: '#1E1E1E',
  },

  timePicker: {
    height: 180,
    width: '100%',
  },

  applyTimeButton: {
    backgroundColor: '#4C6FFF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  applyTimeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'PixelifySans_400Regular',
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
});