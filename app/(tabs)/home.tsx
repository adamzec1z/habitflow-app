import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect } from 'expo-router';
import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  PixelifySans_400Regular,
} from '@expo-google-fonts/pixelify-sans';
import {
  useFonts,
} from 'expo-font';

import { auth } from '../../services/firebase';
import {
  deleteHabit as deleteHabitFromFirestore,
  getUserHabits,
} from '../../services/habitService';

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
  firestoreId?: string;
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

  const [fontsLoaded] = useFonts({
    PixelifySans_400Regular,
  });

  const moods = [
    {
      id: 'happy',
      image: require('../../assets/images/moods/happy.png'),
    },
    {
      id: 'neutral',
      image: require('../../assets/images/moods/neutral.png'),
    },
    {
      id: 'sad',
      image: require('../../assets/images/moods/sad.png'),
    },
    {
      id: 'sleepy',
      image: require('../../assets/images/moods/sleepy.png'),
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadHabits();
    }, [])
  );

  if (!fontsLoaded) {
    return null;
  }

  async function loadHabits() {
    const storedMood = await AsyncStorage.getItem('todayMood');
    const storedDarkMode = await AsyncStorage.getItem('darkMode');
    const storedDemoMode = await AsyncStorage.getItem('demoMode');

    if (storedMood) {
      setSelectedMood(storedMood);
    }

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }

    try {
      const userId = auth.currentUser?.uid;
      const isDemoMode = storedDemoMode === 'true';

      if (userId && !isDemoMode) {
        const firestoreHabits = await getUserHabits(userId);

        const mappedHabits = firestoreHabits.map((habit) => ({
          id: habit.id,
          firestoreId: habit.id,
          name: habit.name,
          category: habit.category,
          reminderTime: habit.reminderTime || '',
          completed: habit.completedToday || false,
          streak: 0,
        }));

        setHabits(mappedHabits);

        await AsyncStorage.setItem(
          'habits',
          JSON.stringify(mappedHabits)
        );

        console.log('Habits fetched from Firestore');
        return;
      }

      const storedHabits = await AsyncStorage.getItem('habits');
      const savedHabits = storedHabits ? JSON.parse(storedHabits) : [];

      setHabits(savedHabits);
      console.log('Demo/local habits loaded from AsyncStorage');
    } catch (error) {
      console.log('Firestore fetch failed, loading local habits:', error);

      const storedHabits = await AsyncStorage.getItem('habits');
      const savedHabits = storedHabits ? JSON.parse(storedHabits) : [];

      setHabits(savedHabits);
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
    const habitToDelete = habits.find((habit) => habit.id === id);
    const storedDemoMode = await AsyncStorage.getItem('demoMode');
    const isDemoMode = storedDemoMode === 'true';

    if (habitToDelete?.firestoreId && !isDemoMode) {
      try {
        await deleteHabitFromFirestore(habitToDelete.firestoreId);
        console.log('Habit deleted from Firestore');
      } catch (error) {
        console.log('Firestore delete failed:', error);
      }
    }

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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'HabitFlow Reminder',
          body: `${message} at ${reminderTime || 'your selected time'}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 5,
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
        Build habits. Keep streaks. Level up.
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
          <Text style={[styles.statNumber, darkMode && styles.darkStatNumber]}>
            {progress}%
          </Text>
          <Text style={[styles.statLabel, darkMode && styles.darkStatLabel]}>
            Progress
          </Text>
        </View>

        <View style={[styles.statCard, darkMode && styles.darkCard]}>
          <Text style={[styles.statNumber, darkMode && styles.darkStatNumber]}>
            {habits.length}
          </Text>
          <Text style={[styles.statLabel, darkMode && styles.darkStatLabel]}>
            Habits
          </Text>
        </View>

        <View style={[styles.statCard, darkMode && styles.darkCard]}>
          <Text style={[styles.statNumber, darkMode && styles.darkStatNumber]}>
            {completedCount}
          </Text>
          <Text style={[styles.statLabel, darkMode && styles.darkStatLabel]}>
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
                  <Image
                    source={
                      habit.completed
                        ? require('../../assets/images/tick.png')
                        : require('../../assets/images/cross.png')
                    }
                    style={styles.pixelCheck}
                  />
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
          {moods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              onPress={() => saveMood(mood.id)}
              style={[
                styles.moodButton,
                selectedMood === mood.id && styles.selectedMood,
              ]}
            >
              <Image
                source={mood.image}
                style={styles.moodIcon}
              />
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
    backgroundColor: '#ffffff',
  },

  darkContainer: {
    backgroundColor: '#121212',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 40,
    color: '#1A1C2C',
    textAlign: 'center',
    letterSpacing: 1,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkTitle: {
    color: '#F4F4F4',
  },

  subtitle: {
    fontSize: 12,
    color: '#5A5A5A',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkText: {
    color: '#9BADB7',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFF4C7',
    padding: 14,
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    alignItems: 'center',
    shadowColor: '#2B2B2B',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },

  darkCard: {
    backgroundColor: '#252736',
    borderColor: '#414361',
  },

  statNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },

  darkStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#7DEBFF',
  },

  statLabel: {
    fontSize: 12,
    color: '#5e5d5d',
    textTransform: 'uppercase',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkStatLabel: {
    fontSize: 12,
    color: '#DDE5FF',
    textTransform: 'uppercase',
    fontFamily: 'PixelifySans_400Regular',
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
    backgroundColor: '#FFF4C7',
    padding: 18,
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    marginBottom: 16,
    shadowColor: '#2B2B2B',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
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
    fontFamily: 'PixelifySans_400Regular',
  },

  habitDetails: {
    color: '#666',
    marginTop: 4,
    fontFamily: 'PixelifySans_400Regular',
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
    fontFamily: 'PixelifySans_400Regular',
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
    fontFamily: 'PixelifySans_400Regular',
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
    fontFamily: 'PixelifySans_400Regular',
    fontSize: 13,
  },

  deleteText: {
    color: '#FF4D4D',
    fontWeight: 'bold',
    fontFamily: 'PixelifySans_400Regular',
    fontSize: 15,
  },

  moodCard: {
    backgroundColor: '#FFF4C7',
    padding: 20,
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    marginBottom: 20,
    shadowColor: '#2B2B2B',
    shadowOffset: {
      width: 4,
      height: 4,
    },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
    fontFamily: 'PixelifySans_400Regular',
  },

  moodRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
  },

  moodButton: {
    padding: 10,
    borderRadius: 14,
  },

  moodIcon: {
    width: 65,
    height: 70,
    resizeMode: 'contain',
  },

  selectedMood: {
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
    fontFamily: 'PixelifySans_400Regular',
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
    fontFamily: 'PixelifySans_400Regular',
  },

  darkButtonText: {
    color: '#FFFFFF',
    fontFamily: 'PixelifySans_400Regular',
  },

  pixelCheck: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
});