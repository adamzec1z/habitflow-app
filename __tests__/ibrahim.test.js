function isValidHabitName(name) {
  return name.trim().length > 0;
}

function getHabitStorageMode(isDemoMode, userId) {
  if (isDemoMode) {
    return 'local';
  }

  if (userId) {
    return 'firestore';
  }

  return 'local';
}

function getSecondsUntilReminder(reminderTime, currentDate) {
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

  const reminderDate = new Date(currentDate);
  reminderDate.setHours(hour);
  reminderDate.setMinutes(minute);
  reminderDate.setSeconds(0);
  reminderDate.setMilliseconds(0);

  if (reminderDate <= currentDate) {
    reminderDate.setDate(reminderDate.getDate() + 1);
  }

  return Math.round(
    (reminderDate.getTime() - currentDate.getTime()) / 1000
  );
}

test('validates that a habit name is required', () => {
  expect(isValidHabitName('Drink water')).toBe(true);
  expect(isValidHabitName('Study')).toBe(true);
  expect(isValidHabitName('   ')).toBe(false);
});

test('uses Firestore for logged-in users and local storage for demo users', () => {
  expect(getHabitStorageMode(false, 'user123')).toBe('firestore');
  expect(getHabitStorageMode(true, 'user123')).toBe('local');
  expect(getHabitStorageMode(false, null)).toBe('local');
});

test('calculates seconds until the selected reminder time', () => {
  const currentDate = new Date('2026-06-02T10:00:00');

  expect(getSecondsUntilReminder('10:05 AM', currentDate)).toBe(300);
});