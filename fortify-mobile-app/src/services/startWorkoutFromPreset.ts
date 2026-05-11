import type { StartPreset } from '@/src/store/startPresetStore';
import { useProgramsStore } from '@/src/store/programsStore';
import { useProgramProgressStore } from '@/src/store/programProgressStore';
import { useWorkoutStore } from '@/src/store/workoutStore';

export type StartWorkoutFromPresetResult =
  | 'already-active'
  | 'started'
  | 'needs-config';

export async function startWorkoutFromStartPreset(
  preset: StartPreset | null
): Promise<StartWorkoutFromPresetResult> {
  const workoutStore = useWorkoutStore.getState();
  if (workoutStore.isWorkoutActive) {
    return 'already-active';
  }

  if (!preset) {
    return 'needs-config';
  }

  if (preset.type === 'blank') {
    workoutStore.startWorkout();
    return 'started';
  }

  const resolvePrograms = async (targetId?: string) => {
    const programsStore = useProgramsStore.getState();
    const hasTarget = targetId
      ? programsStore.programs.some((program) =>
          program.id === targetId ||
          program.workouts.some((workout) => workout.id === targetId)
        )
      : programsStore.programs.length > 0;

    if (!hasTarget) {
      await programsStore.fetchPrograms({ force: true });
    }

    return useProgramsStore.getState().programs;
  };

  if (preset.type === 'template') {
    const programs = await resolvePrograms(preset.templateWorkoutId ?? preset.templateId);
    const hasTemplateWorkout = Boolean(preset.templateWorkoutId)
      && programs.some((template) =>
        template.isTemplate
        && template.workouts.some((workout) => workout.id === preset.templateWorkoutId)
      );
    const templateId = hasTemplateWorkout
      ? preset.templateWorkoutId
      : preset.templateId;

    if (!templateId) {
      return 'needs-config';
    }

    const success = await useWorkoutStore.getState().startWorkoutFromTemplate(templateId);
    return success ? 'started' : 'needs-config';
  }

  const programs = await resolvePrograms(preset.programId);
  const progressStore = useProgramProgressStore.getState();
  if (!progressStore.isLoaded) {
    await progressStore.loadProgress();
  }

  const program = programs.find((item) => item.id === preset.programId && !item.isTemplate);
  const workouts = program?.workouts ? [...program.workouts] : [];
  workouts.sort((a, b) => a.dayNumber - b.dayNumber);
  const totalDays = workouts.length;
  const nextDayNumber = program && totalDays > 0
    ? useProgramProgressStore.getState().getNextDayNumber(program.id, totalDays)
    : 1;
  const nextWorkout = workouts.find((workout) => workout.dayNumber === nextDayNumber) || workouts[0];

  if (!program || !nextWorkout) {
    return 'needs-config';
  }

  const success = await useWorkoutStore.getState().startWorkoutFromProgram(program.id, nextWorkout.id);
  return success ? 'started' : 'needs-config';
}
