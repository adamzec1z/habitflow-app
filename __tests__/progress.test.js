function calculateProgress(completed, total) {
  if (total === 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}

test('calculates progress correctly', () => {
  expect(calculateProgress(2, 4)).toBe(50);
});

test('returns 100 when all habits completed', () => {
  expect(calculateProgress(4, 4)).toBe(100);
});

test('returns 0 when no habits exist', () => {
  expect(calculateProgress(0, 0)).toBe(0);
});