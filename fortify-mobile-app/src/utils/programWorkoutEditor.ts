import type { SetType, TemplateSetDetail, WorkoutSet } from '@/src/types/workout';

type ResolveProgramEditorSetTypesOptions = {
  setCount: number;
  setDetails?: TemplateSetDetail[];
  historySets?: WorkoutSet[];
};

export function resolveProgramEditorSetTypes({
  setCount,
  setDetails,
  historySets = [],
}: ResolveProgramEditorSetTypesOptions): SetType[] {
  const orderedHistorySets = [...historySets].sort((a, b) => a.orderIndex - b.orderIndex);

  return Array.from({ length: setCount }, (_, index) => (
    setDetails?.[index]?.setType
    ?? orderedHistorySets[index]?.setType
    ?? 'normal'
  ));
}
