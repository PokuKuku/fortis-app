import { generateUniqueName } from '../nameUtils';

describe('generateUniqueName', () => {
  describe('when no duplicates exist', () => {
    it('returns original name with empty array', () => {
      expect(generateUniqueName('KB Pull', [])).toBe('KB Pull');
    });

    it('returns original name when no match found', () => {
      expect(generateUniqueName('KB Pull', ['Push Day', 'Leg Day'])).toBe(
        'KB Pull'
      );
    });
  });

  describe('when duplicates exist', () => {
    it('appends 2 when exact duplicate exists', () => {
      expect(generateUniqueName('KB Pull', ['KB Pull'])).toBe('KB Pull 2');
    });

    it('finds next available number', () => {
      expect(generateUniqueName('KB Pull', ['KB Pull', 'KB Pull 2'])).toBe(
        'KB Pull 3'
      );
      expect(
        generateUniqueName('KB Pull', ['KB Pull', 'KB Pull 2', 'KB Pull 3'])
      ).toBe('KB Pull 4');
    });

    it('handles gaps in numbering by using max + 1', () => {
      expect(generateUniqueName('KB Pull', ['KB Pull', 'KB Pull 5'])).toBe(
        'KB Pull 6'
      );
    });
  });

  describe('when input has existing suffix', () => {
    it('strips existing suffix and generates new one', () => {
      expect(generateUniqueName('KB Pull 2', ['KB Pull', 'KB Pull 2'])).toBe(
        'KB Pull 3'
      );
    });

    it('returns input as-is when it does not exist (even with suffix)', () => {
      // "KB Pull 10" doesn't exist in the list, so it's returned unchanged
      expect(generateUniqueName('KB Pull 10', ['KB Pull', 'KB Pull 2'])).toBe(
        'KB Pull 10'
      );
    });

    it('increments when input with suffix already exists', () => {
      // "KB Pull 10" DOES exist, so we need to find the next number
      expect(
        generateUniqueName('KB Pull 10', ['KB Pull', 'KB Pull 2', 'KB Pull 10'])
      ).toBe('KB Pull 11');
    });
  });

  describe('case sensitivity', () => {
    it('treats different cases as duplicates', () => {
      expect(generateUniqueName('KB Pull', ['kb pull'])).toBe('KB Pull 2');
      expect(generateUniqueName('kb pull', ['KB Pull'])).toBe('kb pull 2');
    });

    it('preserves original case in output', () => {
      expect(generateUniqueName('KB PULL', ['kb pull', 'KB Pull 2'])).toBe(
        'KB PULL 3'
      );
    });
  });

  describe('whitespace handling', () => {
    it('trims leading and trailing whitespace', () => {
      expect(generateUniqueName('  KB Pull  ', ['KB Pull'])).toBe('KB Pull 2');
    });

    it('returns original without duplicates after trimming', () => {
      expect(generateUniqueName('  KB Pull  ', [])).toBe('KB Pull');
    });
  });

  describe('special characters', () => {
    it('handles parentheses in names', () => {
      expect(generateUniqueName('Pull (Back)', ['Pull (Back)'])).toBe(
        'Pull (Back) 2'
      );
    });

    it('handles colons in names', () => {
      expect(generateUniqueName('Day 1: Push', ['Day 1: Push'])).toBe(
        'Day 1: Push 2'
      );
    });

    it('handles names with dots', () => {
      expect(generateUniqueName('A.M. Workout', ['A.M. Workout'])).toBe(
        'A.M. Workout 2'
      );
    });
  });

  describe('edge cases', () => {
    it('handles empty string by returning Untitled', () => {
      expect(generateUniqueName('', [])).toBe('Untitled');
      expect(generateUniqueName('   ', [])).toBe('Untitled');
    });

    it('handles numeric-only names', () => {
      expect(generateUniqueName('123', ['123'])).toBe('123 2');
    });

    it('handles single character names', () => {
      expect(generateUniqueName('A', ['A'])).toBe('A 2');
    });

    it('does not confuse similar names', () => {
      // "KB Pull" should not match "KB Pullover"
      expect(generateUniqueName('KB Pull', ['KB Pullover'])).toBe('KB Pull');
    });
  });
});
