import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type Habit = {
  id: string;
  name: string;
  category: string;
  reminderTime: string;
  completed: boolean;
  streak?: number;
};

export default function HomeScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  async function loadHabits() {
    const storedHabits = await AsyncStorage.getItem('habits');
    const savedHabits = storedHabits ? JSON.parse(storedHabits) : [];

    setHabits(savedHabits);

    const storedMood = await AsyncStorage.getItem('todayMood');
    const storedDarkMode = await AsyncStorage.getItem('darkMode');

    if (storedMood) {
      setSelectedMood(storedMood);
    }

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }

  async function toggleHabit(id: string) {
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        return {
          ...habit,
          completed: !habit.completed,
        };
      }

      return habit;
    });

    setHabits(updatedHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  }

  async function saveMood(mood: string) {
    setSelectedMood(mood);
    await AsyncStorage.setItem('todayMood', mood);
  }

  async function deleteHabit(id: string) {
    const updatedHabits = habits.filter((habit) => habit.id !== id);

    setHabits(updatedHabits);
    await AsyncStorage.setItem('habits', JSON.stringify(updatedHabits));
  }

async function startVoiceReminder(
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

  const message = `Time to complete your ${habitName} habit`;

  if (voiceEnabled) {
    Speech.speak(message);
  }

  if (notificationsEnabled) {
    const permission =
      await Notifications.requestPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        'Please allow notifications.'
      );
      return;
    }

    if (!reminderTime || reminderTime === 'No reminder') {
      Alert.alert(
        'No reminder time',
        'Please edit this habit and choose a reminder time.'
      );
      return;
    }

    const [time, modifier] = reminderTime.split(' ');
    const [hourText, minuteText] = time.split(':');

    let hour = Number(hourText);
    const minute = Number(minuteText);

    if (modifier === 'PM' && hour !== 12) {
      hour = hour + 12;
    }

    if (modifier === 'AM' && hour === 12) {
      hour = 0;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'HabitFlow Reminder',
        body: `${message} at ${reminderTime || 'your selected time'}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5, // For demo purposes, the notification will trigger after 10 seconds. In a real app, you would calculate the time until the reminderTime and use that value here.
      },
    });
  }

  Alert.alert(
    'Reminder scheduled',
    `Reminder set for ${habitName} at ${reminderTime}`
  );
}

  const completedCount = habits.filter((habit) => habit.completed).length;

  const progress =
    habits.length === 0
      ? 0
      : Math.round((completedCount / habits.length) * 100);
  
  return (
    <ScrollView
      style={[
        styles.container,
        darkMode && styles.darkContainer,
      ]}
    >
      <Text style={[styles.title, darkMode && styles.darkTitle]}>
        HabitFlow
      </Text>

      <Text style={[styles.subtitle, darkMode && styles.darkText]}>
        Today&apos;s Habits
      </Text>

      <TouchableOpacity
        style={[
          styles.settingsButton,
          darkMode && styles.darkSettingsButton,
        ]}
        onPress={() => router.push('/settings')}
      >
        <Text
          style={[
            styles.settingsButtonText,
            darkMode && styles.darkButtonText,
          ]}
        >
          Settings
        </Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, darkMode && styles.darkCard]}>
          <Text style={styles.statNumber}>{progress}%</Text>
          <Text style={[styles.statLabel, darkMode && styles.darkText]}>
            Progress
          </Text>
        </View>

        <View style={[styles.statCard, darkMode && styles.darkCard]}>
          <Text style={styles.statNumber}>{habits.length}</Text>
          <Text style={[styles.statLabel, darkMode && styles.darkText]}>
            Habits
          </Text>
        </View>

        <View style={[styles.statCard, darkMode && styles.darkCard]}>
          <Text style={styles.statNumber}>{completedCount}</Text>
          <Text style={[styles.statLabel, darkMode && styles.darkText]}>
            Completed
          </Text>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%` },
          ]}
        />
      </View>

      {habits.length === 0 ? (
        <View style={[styles.emptyCard, darkMode && styles.darkCard]}>
          <Text style={[styles.emptyTitle, darkMode && styles.darkTitle]}>
            No habits yet
          </Text>

          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            Add your first habit to start tracking your routine.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/add-habit')}
          >
            <Text style={styles.buttonText}>+ Add Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.habitList}>
          {habits.map((habit) => (
            <View
              key={habit.id}
              style={[styles.habitCard, darkMode && styles.darkCard]}
            >
              <View style={styles.habitTopRow}>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, darkMode && styles.darkTitle]}>
                    {habit.name}
                  </Text>

                  <Text style={[styles.habitDetails, darkMode && styles.darkText]}>
                    {habit.category || 'No category'} •{' '}
                    {habit.reminderTime || 'No reminder'}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => toggleHabit(habit.id)}>
                  <Text style={styles.checkMark}>
                    {habit.completed ? '✅' : '⭕'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.habitActionRow}>
                <TouchableOpacity
                  style={styles.reminderButton}
                  onPress={() =>
                    startVoiceReminder(
                      habit.name,
                      habit.reminderTime
                    )
                  }
                >
                  <Text style={styles.reminderButtonText}>
                    Voice Reminder
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() =>
                    router.push({
                      pathname: '/edit-habit',
                      params: { id: habit.id },
                    })
                  }
                >
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => deleteHabit(habit.id)}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/add-habit')}
          >
            <Text style={styles.buttonText}>+ Add Habit</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.moodCard, darkMode && styles.darkCard]}>
        <Text style={[styles.cardTitle, darkMode && styles.darkTitle]}>
          How are you feeling today?
        </Text>

        <View style={styles.moodRow}>
          {['😊', '😐', '😔', '😴'].map((mood) => (
            <TouchableOpacity
              key={mood}
              style={[
                styles.moodButton,
                selectedMood === mood && styles.selectedMoodButton,
              ]}
              onPress={() => saveMood(mood)}
            >
              <Text style={styles.mood}>{mood}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMood !== '' && (
          <Text style={styles.selectedMoodText}>
            Today&apos;s mood: {selectedMood}
          </Text>
        )}
      </View>
    </ScrollView>
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
  },

  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 40,
    color: '#222',
  },

  darkTitle: {
    color: '#FFFFFF',
  },

  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },

  darkText: {
    color: '#CCCCCC',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 16,
    alignItems: 'center',
  },

  darkCard: {
    backgroundColor: '#1E1E1E',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4C6FFF',
  },

  statLabel: {
    fontSize: 12,
    color: '#666',
  },

  progressContainer: {
    height: 14,
    backgroundColor: '#DDE5FF',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4C6FFF',
    borderRadius: 20,
  },

  emptyCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
  },

  emptyText: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },

  habitList: {
    marginBottom: 20,
  },

  habitCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },

  habitTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  habitInfo: {
    flex: 1,
  },

  habitActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  habitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  habitDetails: {
    color: '#666',
    marginTop: 4,
  },

  checkMark: {
    fontSize: 28,
    marginLeft: 12,
  },

  button: {
    backgroundColor: '#4C6FFF',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  reminderButton: {
    backgroundColor: '#4C6FFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  reminderButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },

  editButton: {
    backgroundColor: '#E8ECFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  editButtonText: {
    color: '#4C6FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },

  deleteText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
    fontSize: 15,
  },

  moodCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 18,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  moodButton: {
    padding: 10,
    borderRadius: 14,
  },

  selectedMoodButton: {
    backgroundColor: '#DDE5FF',
    borderWidth: 2,
    borderColor: '#4C6FFF',
  },

  mood: {
    fontSize: 34,
  },

  selectedMoodText: {
    marginTop: 12,
    color: '#4C6FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  settingsButton: {
    backgroundColor: '#E8ECFF',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },

  darkSettingsButton: {
    backgroundColor: '#2A2A2A',
  },

  settingsButtonText: {
    color: '#4C6FFF',
    fontWeight: 'bold',
  },

  darkButtonText: {
    color: '#FFFFFF',
  },
});