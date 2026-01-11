import { parseDraftReply } from '../workoutDraftIntent';

describe('parseDraftReply', () => {
  it('detects resolution selection when awaiting resolution', () => {
    const result = parseDraftReply('2', { awaitingResolution: true, maxOptions: 3 });
    expect(result.type).toBe('resolve');
    if (result.type === 'resolve') {
      expect(result.selectionIndex).toBe(1);
    }
  });

  it('detects confirmations', () => {
    const result = parseDraftReply('Looks good', { awaitingResolution: false, maxOptions: 0 });
    expect(result.type).toBe('confirm');
  });

  it('detects save-as confirmations', () => {
    const result = parseDraftReply('Save as: Push Day', { awaitingResolution: false, maxOptions: 0 });
    expect(result.type).toBe('confirm');
    if (result.type === 'confirm') {
      expect(result.saveAsTitle).toBe('Push Day');
    }
  });

  it('detects cancels', () => {
    const result = parseDraftReply('Never mind', { awaitingResolution: false, maxOptions: 0 });
    expect(result.type).toBe('cancel');
  });

  it('treats change requests as edits', () => {
    const result = parseDraftReply('Looks good, but swap bench for incline', {
      awaitingResolution: false,
      maxOptions: 0,
    });
    expect(result.type).toBe('edit');
  });
});
