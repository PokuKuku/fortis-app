import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { WorkoutSession } from '@/src/types/workout';

const WORKOUT_COMPLETION_CHANNEL_ID = 'workout-completion';
const WORKOUT_COMPLETION_KIND = 'workout-completion-celebration';
const WORKOUT_COMPLETION_DELAY_MS = 30 * 60 * 1000;

const COMPLETION_MESSAGES = [
  {
    title: 'Workout complete!',
    body: 'Strong work today. You showed up, put in the reps, and kept the momentum moving!',
  },
  {
    title: 'That session counts!',
    body: 'Nice work getting it done. Recover, refuel, and be proud of the effort you just put in!',
  },
  {
    title: 'That’s a wrap!',
    body: 'Nice work finishing your session. Your future self will thank you.',
  },
  {
    title: 'You got it done!',
    body: 'That workout is in the books. Small wins stack fast when you keep showing up!',
  },
  {
    title: 'Momentum secured!',
    body: 'Great session. You just gave your streak another reason to stay alive!',
  },
  {
    title: 'Strong finish!',
    body: 'You showed up and finished. That is the kind of effort that moves the needle!',
  },
  {
    title: 'Another one logged!',
    body: 'Nice work. Your future self is going to appreciate this session!',
  },
  {
    title: 'That was earned!',
    body: 'Workout done. Take the win, recover well, and keep building!',
  },
  {
    title: 'Streak energy!',
    body: 'You kept the rhythm going today. That is how training becomes a habit!',
  },
  {
    title: 'Session complete!',
    body: 'Great job finishing strong. One more workout closer to where you want to be!',
  },
  {
    title: 'You showed up!',
    body: 'That matters. Consistency is built one completed workout at a time!',
  },
  {
    title: 'Progress logged!',
    body: 'Nice work today. The streak, the strength, the confidence - it all starts here!',
  },
  {
    title: 'Workout crushed!',
    body: 'You put in the work. Now let your body recover and adapt!',
  },
  {
    title: 'Keep that streak warm!',
    body: 'Another workout finished. You are making consistency a lot easier to repeat!',
  },
  {
    title: 'Solid work today!',
    body: 'That session counts. Stack enough of these and the results have no choice but to show up!',
  },
  {
    title: 'Training win!',
    body: 'You completed the workout. That is a real deposit into your goals!',
  },
  {
    title: 'Done and logged!',
    body: 'Great effort. Keep this pace and your streak will take care of itself!',
  },
  {
    title: 'One more win!',
    body: 'You finished what you started. That is the habit Fortify is built for!',
  },
  {
    title: 'Nice session!',
    body: 'The workout is done, the momentum is real, and you are still on track!',
  },
  {
    title: 'Consistency point earned!',
    body: 'That completed workout keeps the habit moving. Strong work!',
  },
] as const;

const ensureWorkoutCompletionChannel = async () => {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(WORKOUT_COMPLETION_CHANNEL_ID, {
    name: 'Workout celebrations',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
};

function getCompletionMessage(session: WorkoutSession) {
  const completedAtMs = session.completedAt?.getTime?.() ?? Date.now();
  const index = Math.abs(Math.floor(completedAtMs / 1000)) % COMPLETION_MESSAGES.length;
  return COMPLETION_MESSAGES[index];
}

export async function scheduleWorkoutCompletionNotification(session: WorkoutSession): Promise<string | null> {
  const completedAt = session.completedAt instanceof Date ? session.completedAt : new Date();
  const fireDate = new Date(completedAt.getTime() + WORKOUT_COMPLETION_DELAY_MS);

  if (fireDate.getTime() <= Date.now()) {
    return null;
  }

  let permissions: { status: string; granted: boolean } | null = null;
  try {
    permissions = await Notifications.getPermissionsAsync();
  } catch {
    return null;
  }

  if (!permissions || (!permissions.granted && permissions.status !== 'granted')) {
    return null;
  }

  try {
    await ensureWorkoutCompletionChannel();
    const message = getCompletionMessage(session);
    return await Notifications.scheduleNotificationAsync({
      content: {
        ...message,
        sound: 'default',
        data: {
          kind: WORKOUT_COMPLETION_KIND,
          workoutId: session.localId,
        },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
        channelId: WORKOUT_COMPLETION_CHANNEL_ID,
      },
    });
  } catch {
    return null;
  }
}
