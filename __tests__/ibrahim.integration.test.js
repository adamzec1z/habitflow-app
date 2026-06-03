function deleteHabit(habits, id) {
  return habits.filter(habit => habit.id !== id);
}

function updateHabitReminder(habits, id, newReminderTime) {
  return habits.map(habit =>
    habit.id === id
      ? {
          ...habit,
          reminderTime: newReminderTime,
          notificationId: `reminder-${id}`,
        }
      : habit
  );
}

function saveAndRetrieveLocalHabits(existingHabits, newHabit) {
  const savedHabits = [...existingHabits, newHabit];

  return JSON.parse(JSON.stringify(savedHabits));
}

test('deletes the selected habit and keeps other habits', () => {
  const habits = [
    { id: 1, name: 'Gym' },
    { id: 2, name: 'Drink water' },
    { id: 3, name: 'Study' },
  ];

  const updated = deleteHabit(habits, 2);

  expect(updated.length).toBe(2);
  expect(updated).toEqual([
    { id: 1, name: 'Gym' },
    { id: 3, name: 'Study' },
  ]);
});

test('updates a habit reminder time and stores a notification id', () => {
  const habits = [
    {
      id: 1,
      name: 'Drink water',
      reminderTime: '8:00 AM',
      notificationId: '',
    },
  ];

  const updated = updateHabitReminder(
    habits,
    1,
    '9:30 AM'
  );

  expect(updated[0].reminderTime).toBe('9:30 AM');
  expect(updated[0].notificationId).toBe('reminder-1');
});

test('saves and retrieves demo user habits from local storage structure', () => {
  const habits = [];

  const retrievedHabits = saveAndRetrieveLocalHabits(
    habits,
    {
      id: 1,
      name: 'Read Quran',
      category: 'Spiritual',
      reminderTime: '8:00 PM',
      completed: false,
    }
  );

  expect(retrievedHabits.length).toBe(1);
  expect(retrievedHabits[0].name).toBe('Read Quran');
  expect(retrievedHabits[0].category).toBe('Spiritual');
  expect(retrievedHabits[0].reminderTime).toBe('8:00 PM');
  expect(retrievedHabits[0].completed).toBe(false);
});