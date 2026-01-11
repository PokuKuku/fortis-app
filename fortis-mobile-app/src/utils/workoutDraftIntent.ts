export type DraftReplyIntent =
  | { type: 'resolve'; selectionIndex: number }
  | { type: 'confirm'; saveAsTitle?: string }
  | { type: 'cancel' }
  | { type: 'edit' }
  | { type: 'unknown' };

const CONFIRM_PHRASES = [
  'yes',
  'yep',
  'yeah',
  'ok',
  'okay',
  'sure',
  'sounds good',
  'looks good',
  'go ahead',
  'do it',
  'save it',
  'save',
  'create it',
  'make it',
  'please save',
];

const CANCEL_PHRASES = [
  'no',
  'nope',
  'never mind',
  'nevermind',
  'cancel',
  'stop',
  'dont',
  "don't",
  'do not',
  'not now',
  'abort',
];

const EDIT_KEYWORDS = [
  'change',
  'swap',
  'replace',
  'edit',
  'update',
  'adjust',
  'add',
  'remove',
  'delete',
  'rename',
  'reduce',
  'increase',
  'instead',
  'but',
  'make it',
  'make this',
];

const SAVE_AS_REGEX = /save(?:\s+this)?\s+as[:\s]+(.+)/i;
const CALL_IT_REGEX = /call it[:\s]+(.+)/i;

const normalize = (value: string) => value.toLowerCase().trim();

const includesPhrase = (message: string, phrases: string[]) =>
  phrases.some((phrase) => message.includes(phrase));

export function parseDraftReply(
  message: string,
  options: { awaitingResolution: boolean; maxOptions: number }
): DraftReplyIntent {
  const normalized = normalize(message);
  if (!normalized) return { type: 'unknown' };

  if (options.awaitingResolution) {
    const selection = Number.parseInt(normalized, 10);
    if (Number.isFinite(selection) && selection >= 1 && selection <= options.maxOptions) {
      return { type: 'resolve', selectionIndex: selection - 1 };
    }
  }

  const hasCancel = includesPhrase(normalized, CANCEL_PHRASES);
  if (hasCancel) {
    return { type: 'cancel' };
  }

  const hasEditKeyword = includesPhrase(normalized, EDIT_KEYWORDS);
  if (hasEditKeyword) {
    return { type: 'edit' };
  }

  const saveAsMatch = message.match(SAVE_AS_REGEX) || message.match(CALL_IT_REGEX);
  const saveAsTitle = saveAsMatch?.[1]?.trim();
  const hasConfirm = includesPhrase(normalized, CONFIRM_PHRASES);
  if (hasConfirm || saveAsTitle) {
    return { type: 'confirm', saveAsTitle };
  }

  return { type: 'edit' };
}
