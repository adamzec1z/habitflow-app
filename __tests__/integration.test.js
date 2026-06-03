function addHabit(habits, newHabit) {
  return [...habits, newHabit];
}

function editHabit(habits, id, newName) {
  return habits.map(habit =>
    habit.id === id
      ? { ...habit, name: newName }
      : habit
  );
}

test('adds a habit', () => {
  const habits = [];

  const updated = addHabit(habits, {
    id: 1,
    name: 'Gym',
  });

  expect(updated.length).toBe(1);
});

test('edits a habit name', () => {
  const habits = [
    { id: 1, name: 'Gym' }
  ];

  const updated = editHabit(
    habits,
    1,
    'Workout'
  );

  expect(updated[0].name).toBe('Workout');
});

test('preserves habit count after edit', () => {
  const habits = [
    { id: 1, name: 'Gym' }
  ];

  const updated = editHabit(
    habits,
    1,
    'Workout'
  );

  expect(updated.length).toBe(1);
});