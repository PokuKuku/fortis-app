/**
 * components/data/exerciseData.ts
 * 
 * This file contains the static database of default exercises available in the app.
 * It serves as the initial source of truth for the exercise library.
 */
import { Exercise } from "../types/exercise";

export const exerciseData: Record<string, Exercise> = {
  "Bench Press": {
    id: "bench-press",
    name: "Bench Press",
    force: "push",
    level: "intermediate",
    mechanic: "compound",
    equipment: "barbell",
    primaryMuscles: ["chest"],
    secondaryMuscles: ["shoulders", "triceps"],
    instructions: [
      "Lie back on a flat bench. Using a medium width grip (a grip that creates a 90-degree angle in the middle of the movement between the forearms and the upper arms), lift the bar from the rack and hold it straight over you with your arms locked.",
      "From the starting position, breathe in and begin coming down slowly until the bar touches your middle chest.",
      "After a brief pause, push the bar back to the starting position as you breathe out. Focus on pushing the bar using your chest muscles.",
      "Lock your arms and squeeze your chest in the contracted position at the top of the motion, hold for a second and then start coming down slowly again."
    ],
    category: "powerlifting",
    images: ["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop"]
  },
  "Squat": {
    id: "squat",
    name: "Squat",
    force: "push",
    level: "intermediate",
    mechanic: "compound",
    equipment: "barbell",
    primaryMuscles: ["quadriceps"],
    secondaryMuscles: ["glutes", "hamstrings", "lower back"],
    instructions: [
      "Begin with the barbell supported on top of the traps. The chest should be up and the head facing forward. Adopt a hip-width stance with the feet turned out as needed.",
      "Descend by flexing the knees, refraining from moving the hips back as much as possible. This requires that the knees travel forward. Ensure that they stay align with the feet. The goal is to keep the torso as upright as possible.",
      "Continue all the way down, keeping the weight on the front of the heel. At the moment the upper legs contact the lower legs reverse the motion, driving the weight upward."
    ],
    category: "powerlifting",
    images: ["https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=2816&auto=format&fit=crop"]
  },
  "Deadlift": {
    id: "deadlift",
    name: "Deadlift",
    force: "pull",
    level: "expert",
    mechanic: "compound",
    equipment: "barbell",
    primaryMuscles: ["lower back"],
    secondaryMuscles: ["glutes", "hamstrings", "forearms", "traps"],
    instructions: [
      "Stand with feet hip-width apart, toes pointing forward. The barbell should be over the middle of your feet.",
      "Bend at the hips and knees to grasp the bar. Your hands should be just outside your knees.",
      "Keep your back straight and chest up. Engage your core.",
      "Lift the bar by extending your hips and knees. Keep the bar close to your body.",
      "Stand tall at the top, then carefully lower the bar back to the ground."
    ],
    category: "powerlifting",
    images: ["https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=2671&auto=format&fit=crop"]
  },
  "Pull-up": {
    id: "pull-up",
    name: "Pull-up",
    force: "pull",
    level: "intermediate",
    mechanic: "compound",
    equipment: "body only",
    primaryMuscles: ["lats"],
    secondaryMuscles: ["biceps", "middle back"],
    instructions: [
      "Grab the pull-up bar with the palms facing forward using the prescribed grip.",
      "As you have both arms extended in front of you holding the bar at the chosen grip width, bring your torso back around 30 degrees or so while creating a curvature on your lower back and sticking your chest out.",
      "Pull your torso up until the bar touches your upper chest by drawing the shoulders and the upper arms down and back.",
      "After a second on the contracted position, start to inhale and slowly lower your torso back to the starting position when your arms are fully extended and the lats are fully stretched."
    ],
    category: "strength",
    images: ["https://images.unsplash.com/photo-1598971639058-31387d8165bf?q=80&w=2670&auto=format&fit=crop"]
  },
  "Dumbbell Shoulder Press": {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    force: "push",
    level: "intermediate",
    mechanic: "compound",
    equipment: "dumbbell",
    primaryMuscles: ["shoulders"],
    secondaryMuscles: ["triceps"],
    instructions: [
      "Hold a dumbbell in each hand and sit on a bench with back support. Plant your feet firmly on the ground.",
      "Raise the dumbbells to shoulder height with your palms facing forward.",
      "Push the dumbbells up until your arms are fully extended above your head.",
      "Slowly lower the dumbbells back to the starting position."
    ],
    category: "strength",
    images: ["https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=2670&auto=format&fit=crop"]
  },
   "Plank": {
    id: "plank",
    name: "Plank",
    force: "static",
    level: "beginner",
    mechanic: "isolation",
    equipment: "body only",
    primaryMuscles: ["abdominals"],
    secondaryMuscles: ["lower back"],
    instructions: [
      "Get into a pushup position on the floor.",
      "Bend your elbows 90 degrees and rest your weight on your forearms.",
      "Your elbows should be directly beneath your shoulders, and your body should form a straight line from your head to your feet.",
      "Hold the position for as long as you can."
    ],
    category: "strength",
    images: ["https://images.unsplash.com/photo-1566241483322-0a9914010025?q=80&w=2669&auto=format&fit=crop"]
  }
};
