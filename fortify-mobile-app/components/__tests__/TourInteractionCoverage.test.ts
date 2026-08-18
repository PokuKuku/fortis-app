import fs from 'fs';
import path from 'path';

const readSource = (relativePath: string) => fs.readFileSync(
  path.join(__dirname, '../..', relativePath),
  'utf8'
);

describe('tour interaction coverage', () => {
  const home = readSource('app/(tabs)/index.tsx');
  const tabs = readSource('app/(tabs)/_layout.tsx');
  const workoutBuilder = readSource('app/workout/create.tsx');
  const aiChat = readSource('app/ai/chat.tsx');
  const chatEmptyState = readSource('src/components/ai/ChatEmptyState.tsx');
  const chatMessage = readSource('src/components/ai/ChatMessage.tsx');
  const setRow = readSource('src/components/workout/SetRow.tsx');
  const numberPad = readSource('src/components/workout/NumberPadModal.tsx');
  const exerciseCard = readSource('src/components/workout/ExerciseCard.tsx');
  const workoutHeader = readSource('src/components/workout/WorkoutHeader.tsx');
  const pasteWorkoutSheet = readSource('src/components/workout/PasteWorkoutSheet.tsx');

  it('registers every navigation and modal-opening spotlight action', () => {
    expect(home).toMatch(/addWorkoutRoutine}[\s\S]{0,160}onTourPress={handleAddWorkoutPress}/);
    expect(workoutBuilder).toMatch(/workoutBuilderCloseButton}[\s\S]{0,160}onTourPress={handleClose}/);
    expect(workoutBuilder).toMatch(/pasteWorkout}[\s\S]{0,160}onTourPress=/);
    expect(tabs).toMatch(/aiChatButton}[\s\S]{0,160}onTourPress=/);
    expect(tabs).toMatch(/quickStartFab}[\s\S]{0,160}onTourPress=/);
    expect(tabs).toMatch(/insightsTab}[\s\S]{0,220}onTourPress=/);
    expect(workoutHeader).toContain('onCancelPress,');
  });

  it('registers every interactive AI tour action', () => {
    expect(chatEmptyState).toMatch(/aiChatBackWorkout}[\s\S]{0,220}onTourPress={onTourBackWorkoutPress}/);
    expect(chatMessage).toMatch(/tourWorkoutTemplateAnchorId}[\s\S]{0,220}onTourPress=/);
    expect(aiChat).toMatch(/aiChatVoiceMode}[\s\S]{0,180}onTourPress=/);
    expect(aiChat).toMatch(/aiChatCloseButton}[\s\S]{0,180}onTourPress={handleClose}/);
  });

  it('registers tap and long-press workout logging actions', () => {
    expect(setRow).toMatch(/activeSetWeight[\s\S]{0,260}onTourLongPress=/);
    expect(setRow).toMatch(/activeSetComplete}[\s\S]{0,220}onTourLongPress=/);
    expect(numberPad).toMatch(/activeSetFillDown}[\s\S]{0,220}onTourPress={handleFillDown}/);
    expect(exerciseCard).toMatch(/setTarget}[\s\S]{0,180}onTourPress={handleOpenTargetSheet}/);
  });

  it('owns the simulated Make Template action above the nested sheet overlay', () => {
    expect(pasteWorkoutSheet).toContain("label: 'Make Template'");
    expect(pasteWorkoutSheet).toContain('onPress: () => importWorkout(true)');
  });
});
