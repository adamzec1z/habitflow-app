import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Habit = {
  id: string;
  firestoreId?: string;
  notificationId?: string;
  name: string;
  category: string;
  reminderTime: string;
  completed: boolean;
  streak: number;
};

function getReminderDate(reminderTime: string) {
  if (!reminderTime) {
    return null;
  }

  const cleanedTime = reminderTime
    .replace(/\u202f/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();

  const parts = cleanedTime.split(' ');

  if (parts.length < 2) {
    return null;
  }

  const time = parts[0];
  const modifier = parts[1].toUpperCase();

  const [hourText, minuteText] = time.split(':');

  let hour = Number(hourText);
  const minute = Number(minuteText);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  if (modifier === 'PM' && hour !== 12) {
    hour = hour + 12;
  }

  if (modifier === 'AM' && hour === 12) {
    hour = 0;
  }

  const reminderDate = new Date();
  reminderDate.setHours(hour);
  reminderDate.setMinutes(minute);
  reminderDate.setSeconds(0);
  reminderDate.setMilliseconds(0);

  if (reminderDate <= new Date()) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  return reminderDate;
}

async function scheduleHabitReminder(
  habitName: string,
  reminderTime: string
) {
  const storedVoice = await AsyncStorage.getItem('voiceEnabled');
  const storedNotifications = await AsyncStorage.getItem(
    'notificationsEnabled'
  );

  const voiceEnabled =
    storedVoice === null ? true : storedVoice === 'true';

  const notificationsEnabled =
    storedNotifications === null
      ? true
      : storedNotifications === 'true';

  if (!voiceEnabled || !notificationsEnabled) {
    console.log(
      'Habit reminder not scheduled because reminders are turned off.'
    );
    return '';
  }

  if (!reminderTime) {
    console.log(
      'Habit reminder not scheduled because no reminder time was selected.'
    );
    return '';
  }

  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      'Permission required',
      'Please allow notifications to receive habit reminders.'
    );
    return '';
  }

  const reminderDate = getReminderDate(reminderTime);

  if (!reminderDate) {
    console.log('Invalid reminder time:', reminderTime);
    return '';
  }

  await Notifications.setNotificationChannelAsync('habit-reminders', {
    name: 'Habit reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'HabitFlow Reminder',
      body: `Time to complete your ${habitName} habit`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: reminderDate,
    },
  });

  console.log(
    'Reminder scheduled:',
    habitName,
    reminderTime,
    reminderDate.toString(),
    notificationId
  );

  return notificationId;
}

export default function EditHabitScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);

  const [habitName, setHabitName] = useState('');
  const [category, setCategory] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHabit();
    }, [])
  );

  async function loadHabit() {
    const storedDarkMode = await AsyncStorage.getItem('darkMode');

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }

    const storedHabits = await AsyncStorage.getItem('habits');

    if (!storedHabits) return;

    const habits: Habit[] = JSON.parse(storedHabits);
    const selectedHabit = habits.find((habit) => habit.id === id);

    if (selectedHabit) {
      setHabitName(selectedHabit.name);
      setCategory(selectedHabit.category);
      setReminderTime(selectedHabit.reminderTime);
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

  async function saveChanges() {
    if (habitName.trim() === '') {
      Alert.alert(
        'Missing habit name',
        'Please enter a habit name.'
      );
      return;
    }

    const storedHabits = await AsyncStorage.getItem('habits');

    if (!storedHabits) return;

    const habits: Habit[] = JSON.parse(storedHabits);

    const updatedHabits = await Promise.all(
      habits.map(async (habit) => {
        if (habit.id === id) {
          if (habit.notificationId) {
            await Notifications.cancelScheduledNotificationAsync(
              habit.notificationId
            );
          }

          const newNotificationId = await scheduleHabitReminder(
            habitName.trim(),
            reminderTime
          );

          return {
            ...habit,
            name: habitName.trim(),
            category,
            reminderTime,
            notificationId: newNotificationId,
          };
        }

        return habit;
      })
    );

    await AsyncStorage.setItem(
      'habits',
      JSON.stringify(updatedHabits)
    );

    Alert.alert(
      'Success',
      reminderTime
        ? 'Habit updated and reminder rescheduled.'
        : 'Habit updated successfully.'
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
        Edit Habit
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
        placeholder="Habit Name"
        placeholderTextColor={darkMode ? '#AAAAAA' : '#777'}
        value={habitName}
        onChangeText={setHabitName}
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
        placeholder="Category"
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
        onPress={saveChanges}
      >
        <Text style={styles.buttonText}>
          Save Changes
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F5F9',
    padding: 20,
  },

  darkContainer: {
    backgroundColor: '#121212',
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop: 60,
    color: '#111',
    fontFamily: 'PixelifySans_400Regular',
    textAlign: 'center',
  },

  darkTitle: {
    color: '#FFFFFF',
    fontFamily: 'PixelifySans_400Regular',
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
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
    fontFamily: 'PixelifySans_400Regular',
  },

  darkInputText: {
    color: '#FFFFFF',
    fontFamily: 'PixelifySans_400Regular',
  },

  timeText: {
    color: '#2B2B2B',
    fontFamily: 'PixelifySans_400Regular',
    fontSize: 16,
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
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'PixelifySans_400Regular',
  },
});