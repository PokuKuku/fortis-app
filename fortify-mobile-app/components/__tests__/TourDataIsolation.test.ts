import fs from 'fs';
import path from 'path';

describe('tour data isolation', () => {
  const homeSource = fs.readFileSync(
    path.join(__dirname, '../../app/(tabs)/index.tsx'),
    'utf8'
  );
  const tabLayoutSource = fs.readFileSync(
    path.join(__dirname, '../../app/(tabs)/_layout.tsx'),
    'utf8'
  );
  const voiceAddSource = fs.readFileSync(
    path.join(__dirname, '../../src/components/workout/ExerciseVoiceAddSheet.tsx'),
    'utf8'
  );

  it('keeps remote Home data deferred while allowing the local schedule to hydrate', () => {
    expect(homeSource).toContain(
      'enabled: Boolean(user) && !isTourActive && hasTourFinished && isDeferredHydrationComplete'
    );
    expect(homeSource).toContain(
      'enabled: Boolean(user) && isAuthResolved && !isTourActive && hasTourFinished'
    );
    expect(homeSource).toContain('if (!hasTourFinished || !isDeferredHydrationComplete) return;');
  });

  it('shows bundled default workout cards during the tour without hydrating stored data', () => {
    expect(homeSource).toContain("import { getDefaultTemplates } from '@/src/data/defaultPrograms';");
    expect(homeSource).toContain('const TOUR_DEFAULT_WORKOUT_ITEMS');
    expect(homeSource).toContain(': TOUR_DEFAULT_WORKOUT_ITEMS,');
  });

  it('hides post-tour cards and uses the requested program-fetching label', () => {
    expect(homeSource).toContain('!isTourActive && hasTourFinished && isNewUserChecklistLoaded');
    expect(homeSource).toContain('hasTourFinished\n    && !isTourActive\n    && onboardingProgramSpec');
    expect(homeSource).toContain("'Fetching your plan...'");
  });

  it('uses the Fortify Challenge entrance for the program preview card', () => {
    expect(homeSource.match(/entering={buildPostTourCardEntrance\(\)}/g)).toHaveLength(2);
  });

  it('does not fetch programs from Quick Start during the tour', () => {
    expect(tabLayoutSource).toContain('if (!isTourActive && !programs.length)');
  });

  it('simulates voice exercise matching without loading the exercise catalog', () => {
    expect(voiceAddSource).toContain('useExercises({ enabled: !isTourActive })');
    expect(voiceAddSource).toContain('TOUR_VOICE_EXERCISE');
    expect(voiceAddSource).toContain("setTranscript('3 sets of barbell bench press')");
  });

  it('routes the paste-workout spotlight tap through its registered tour action', () => {
    const workoutBuilderSource = fs.readFileSync(
      path.join(__dirname, '../../app/workout/create.tsx'),
      'utf8'
    );
    expect(workoutBuilderSource).toContain('id={TOUR_ANCHOR_IDS.pasteWorkout}');
    expect(workoutBuilderSource).toContain('onTourPress={() => {');
    expect(workoutBuilderSource).toContain('setShowPasteWorkoutSheet(true);');
  });
});
