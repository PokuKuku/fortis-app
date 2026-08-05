const EXERCISE_COLLOQUIAL_ALIASES: Record<string, readonly string[]> = {
  // Dumbbell Single Leg Split Squat (rear foot elevated in the instructions)
  '8e1fdc30-4f40-405a-a6fc-0c5495c60c96': [
    'bulgarian split squat',
    'rear foot elevated split squat',
    'rfess',
  ],
  // Barbell Romanian Deadlift
  '20cb5cbb-91a9-4439-a753-0eb8eea32064': ['rdl'],
  // Glute-Ham Raise
  'bc35b061-6583-4bd0-b887-244d294fa6f8': ['ghr', 'glute ham raise'],
  // Dumbbell Bench Press
  'ea36a978-30fd-4f7c-8f70-76e6c50e6a4a': ['db bench'],
  // Dumbbell Seated Shoulder Press
  '44321c23-9411-44cf-ada0-b93238d60962': ['db shoulder press'],
  // Dumbbell One Arm Bent-Over Row
  'db9e1cea-33df-425f-9b83-86371f230cd8': [
    'db row',
    'single arm dumbbell row',
    'one arm dumbbell row',
  ],
  // Dumbbell Biceps Curl
  'a6779992-cb5e-402c-a13e-205aa9b4e39e': ['db curl', 'dumbbell curl'],
  // Trap Bar Deadlift
  '2c41e7d9-5b54-4e49-a65f-194f2d1a03af': ['hex bar deadlift', 'hex deadlift'],
  // Lever T Bar Row
  '437918b1-0d1d-4e81-bc60-3d368f1de96c': ['landmine row', 'tbar row', 't-bar row'],
  // Inverted Row With Straps
  '28c301f4-24dc-47b9-9c1a-a7cf13096f5c': ['trx row', 'ring row', 'suspension row'],
  // Lever Seated Row
  '5b0c0d37-52e3-4c8d-a9bf-10bf13250b2d': [
    'hammer strength row',
    'iso row',
    'iso lateral row',
    'iso-lateral row',
  ],
  // Pull-Up and Chin-Up are intentionally separate movements.
  '05d5b3fb-4210-4017-9546-9cd444fca834': ['pullup'],
  '2c0b5821-950f-46e0-9b1f-532cc51bf9ce': ['chinup'],
  // Assisted Pull-Up
  '3fd7ec63-a2d7-4435-a968-d0faae015ab3': ['assisted pullup', 'machine pull-up'],
  // Lever Seated Leg Curl
  'b32ea811-01f5-4269-ac23-532c16412939': ['hamstring curl', 'machine leg curl'],
  // Cable Triceps Pushdown (V-Bar)
  '2eb5a4c6-492a-450f-bb4d-243204c79816': ['triceps pressdown', 'pressdown'],
  // Lever Seated Hip Abduction / Adduction
  '5b3404e7-21b3-42c0-8e84-fd222a0f6ae1': [
    'hip abductor machine',
    'hip abduction machine',
    'glute med machine',
  ],
  '7fedcec8-76de-4f7d-9d8e-46dfbae34cd7': [
    'hip adductor machine',
    'hip adduction machine',
    'adductor machine',
  ],
  // 3/4 Sit-Up
  '8b508e92-5739-4038-8c1b-9e6d33ede67a': ['situp'],
  // Wheel Rollout
  'b650b2e1-62c5-5252-bde9-6ea8d460b6a3': ['ab wheel', 'ab wheel rollout', 'ab rollout'],
  // Farmers Walk
  '93f87d0f-842f-4c76-abbb-d2b94167d058': [
    "farmer's walk",
    'farmer carry',
    "farmer's carry",
  ],
  // Stationary Bike Run
  '22c8551d-891b-5fc2-865d-6a7aac7ff8bf': ['cycling', 'stationary bike', 'exercise bike'],
};

export function mergeExerciseColloquialAliases(
  exerciseId: string,
  aliases: readonly string[] = [],
): string[] {
  return Array.from(new Set([
    ...aliases,
    ...(EXERCISE_COLLOQUIAL_ALIASES[exerciseId] ?? []),
  ]));
}

export { EXERCISE_COLLOQUIAL_ALIASES };
