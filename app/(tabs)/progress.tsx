import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Habit = {
  id: string;
  name: string;
  category: string;
  reminderTime: string;
  completed: boolean;
  streak?: number;
};

export default function ProgressScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedMood, setSelectedMood] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const storedHabits = await AsyncStorage.getItem('habits');
    const storedMood = await AsyncStorage.getItem('todayMood');
    const storedDarkMode = await AsyncStorage.getItem('darkMode');

    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }

    if (storedMood) {
      setSelectedMood(storedMood);
    }

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    }
  }

  const completedCount = habits.filter((habit) => habit.completed).length;

  const progress =
    habits.length === 0
      ? 0
      : Math.round((completedCount / habits.length) * 100);

  const bestStreak =
    habits.length === 0
      ? 0
      : Math.max(...habits.map((habit) => habit.streak || 0));

  return (
    <ScrollView
      style={[
        styles.container,
        darkMode && styles.darkContainer,
      ]}
    >
      <Text style={[styles.title, darkMode && styles.darkTitle]}>
        Progress
      </Text>

      <Text style={[styles.subtitle, darkMode && styles.darkText]}>
        Track your overall habit journey
      </Text>

      <View style={styles.statsGrid}>
        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.number, darkMode && styles.darkNumber]}>
            {habits.length}
          </Text>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Total Habits
          </Text>
        </View>

        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.number, darkMode && styles.darkNumber]}>
            {completedCount}
          </Text>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Completed
          </Text>
        </View>

        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.number, darkMode && styles.darkNumber]}>
            {progress}%
          </Text>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Progress
          </Text>
        </View>

        <View style={[styles.card, darkMode && styles.darkCard]}>
          <Text style={[styles.number, darkMode && styles.darkNumber]}>
            {bestStreak}
          </Text>
          <Text style={[styles.label, darkMode && styles.darkText]}>
            Best Streak
          </Text>
        </View>
      </View>

      <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
        <Text style={[styles.summaryTitle, darkMode && styles.darkTitle]}>
          Today&apos;s Summary
        </Text>

        <Text style={[styles.summaryText, darkMode && styles.darkText]}>
          You completed {completedCount} out of {habits.length} habits today.
        </Text>

        <Text style={[styles.summaryText, darkMode && styles.darkText]}>
          Current mood: {selectedMood || 'Not logged'}
        </Text>
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
    fontSize: 32,
    color: '#2B2B2B',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkTitle: {
    color: '#FFFFFF',
  },

  subtitle: {
    color: '#2B2B2B',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'PixelifySans_400Regular',
  },

  darkText: {
    color: '#9BADB7',
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },

  card: {
    width: '47%',
    backgroundColor: '#FFF4C7',
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    padding: 16,
    alignItems: 'center',
  },

  darkCard: {
    backgroundColor: '#252736',
    borderColor: '#414361',
  },

  number: {
    fontSize: 28,
    color: '#2B2B2B',
    fontFamily: 'PixelifySans_400Regular',
  },

  darkNumber: {
    color: '#5FCDE4',
  },

  label: {
    fontSize: 12,
    color: '#2B2B2B',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'PixelifySans_400Regular',
  },

  summaryCard: {
    backgroundColor: '#FFF4C7',
    borderWidth: 4,
    borderColor: '#2B2B2B',
    borderRadius: 0,
    padding: 20,
    marginBottom: 30,
  },

  summaryTitle: {
    fontSize: 20,
    color: '#2B2B2B',
    marginBottom: 12,
    fontFamily: 'PixelifySans_400Regular',
  },

  summaryText: {
    color: '#2B2B2B',
    marginBottom: 8,
    fontFamily: 'PixelifySans_400Regular',
  },
});