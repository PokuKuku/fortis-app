const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value?: string | null): boolean {
  return !!value && DATE_ONLY_REGEX.test(value);
}

export function parseDateInput(value?: string | null): Date | null {
  if (!value) return null;
  if (isDateOnly(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
