import type { AppData, Goal, Habit, Milestone, Priority, Category, ActivityItem } from '../types';
import { isoAddDays, mulberry32, toISO, uid } from './utils';

/** ISO date of the upcoming Sunday (today if today is Sunday). */
function endOfWeekISO(): string {
  const now = new Date();
  const dow = now.getDay();
  const add = dow === 0 ? 0 : 7 - dow;
  return toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() + add));
}

function yearEndISO(): string {
  const now = new Date();
  let end = new Date(now.getFullYear(), 11, 31);
  if ((end.getTime() - now.getTime()) / 86_400_000 < 60) {
    end = new Date(now.getFullYear() + 1, 11, 31);
  }
  return toISO(end);
}

const isoDaysAgo = (d: number) => isoAddDays(-d);
const stamp = (daysAgo: number, hour = 10, min = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, min, 0, 0);
  return d.toISOString();
};

const ms = (title: string, doneDaysAgo?: number, dueInDays?: number): Milestone => ({
  id: uid(),
  title,
  done: doneDaysAgo !== undefined,
  completedAt: doneDaysAgo !== undefined ? stamp(doneDaysAgo, 17) : undefined,
  dueDate: dueInDays !== undefined ? isoAddDays(dueInDays) : undefined,
});

interface GoalSpec {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  deadline: string;
  milestones?: Milestone[];
  progress?: number;
  favorite?: boolean;
  reminder?: [boolean, string];
  createdAgo: number;
  completedAgo?: number;
  archived?: boolean;
}

function g(spec: GoalSpec): Goal {
  return {
    id: uid(),
    title: spec.title,
    description: spec.description,
    category: spec.category,
    priority: spec.priority,
    deadline: spec.deadline,
    milestones: spec.milestones ?? [],
    progress: spec.progress ?? 0,
    favorite: spec.favorite ?? false,
    reminder: { enabled: spec.reminder?.[0] ?? false, time: spec.reminder?.[1] ?? '09:00' },
    createdAt: stamp(spec.createdAgo, 9),
    completedAt: spec.completedAgo !== undefined ? stamp(spec.completedAgo, 18) : null,
    archived: spec.archived ?? false,
  };
}

function buildGoals(): Goal[] {
  return [
    g({
      title: 'Complete Final Year Project',
      description:
        'Design, build and defend my final year project — a campus marketplace app with a working prototype, full documentation and the final report.',
      category: 'Education',
      priority: 'high',
      deadline: isoAddDays(45),
      milestones: [
        ms('Get project topic approved', 34),
        ms('Complete literature review', 20),
        ms('Finish chapters 1–3 draft', 6),
        ms('Build & test the application', undefined, 12),
        ms('Write the final report', undefined, 30),
        ms('Submit & defend the project', undefined, 42),
      ],
      favorite: true,
      reminder: [true, '09:00'],
      createdAgo: 38,
    }),
    g({
      title: 'Exercise 4 Times This Week',
      description:
        'Hit four workout sessions this week — a mix of strength training and cardio. Consistency over intensity!',
      category: 'Fitness',
      priority: 'medium',
      deadline: endOfWeekISO(),
      milestones: [ms('Workout session 1', 5), ms('Workout session 2', 3), ms('Workout session 3'), ms('Workout session 4')],
      reminder: [true, '06:30'],
      createdAgo: 6,
    }),
    g({
      title: 'Read 12 Books This Year',
      description:
        'One book a month across fiction, business and personal development. Currently reading "Atomic Habits".',
      category: 'Personal Development',
      priority: 'low',
      deadline: yearEndISO(),
      milestones: Array.from({ length: 12 }, (_, i) =>
        i < 5 ? ms(`Finish book #${i + 1}`, 150 - i * 26) : ms(`Finish book #${i + 1}`),
      ),
      reminder: [true, '21:00'],
      createdAgo: 175,
    }),
    g({
      title: 'Save ₦500,000',
      description:
        'Build an emergency fund of ₦500k. Automatic transfer of ₦25,000 every week into a high-yield savings plan.',
      category: 'Finance',
      priority: 'high',
      deadline: isoAddDays(180),
      milestones: [
        ms('Save the first ₦100,000', 55),
        ms('Reach ₦250,000 saved', 18),
        ms('Reach ₦400,000 saved', undefined, 80),
        ms('Hit the ₦500,000 target', undefined, 170),
      ],
      favorite: true,
      createdAgo: 72,
    }),
    g({
      title: 'Learn React Native',
      description:
        'Go from React to shipping real mobile apps. Follow a course, build practice apps and publish one to the stores.',
      category: 'Career',
      priority: 'medium',
      deadline: isoAddDays(90),
      milestones: [
        ms('Complete React Native fundamentals course', 12),
        ms('Build first practice app (todo + notes)', 4),
        ms('Master navigation & state management', undefined, 20),
        ms('Add native features (camera, push, storage)', undefined, 55),
        ms('Publish an app to TestFlight / Play Console', undefined, 85),
      ],
      createdAgo: 21,
    }),
    g({
      title: 'Wake Up at 6:00 AM',
      description:
        'The 30-day early riser challenge. Alarm at 6:00, no snooze, water first, then quick stretches.',
      category: 'Health',
      priority: 'low',
      deadline: isoAddDays(22),
      milestones: [ms('7 days in a row', 1), ms('21 days in a row', undefined, 13), ms('Full 30-day streak', undefined, 22)],
      reminder: [true, '06:00'],
      createdAgo: 8,
    }),
    g({
      title: 'Complete AWS Certification',
      description:
        'Pass the AWS Certified Solutions Architect – Associate exam. Study 45 minutes daily and take practice exams on weekends.',
      category: 'Education',
      priority: 'high',
      deadline: isoAddDays(75),
      milestones: [
        ms('Finish the Cloud Practitioner course', 9),
        ms('Score 80%+ on 3 practice exams', undefined, 48),
        ms('Schedule & sit the exam', undefined, 70),
      ],
      reminder: [true, '19:00'],
      createdAgo: 24,
    }),
    g({
      title: 'Practice Coding Daily',
      description:
        'At least one hour of deliberate coding practice every day — algorithms, side projects or open source contributions.',
      category: 'Career',
      priority: 'medium',
      deadline: isoAddDays(60),
      progress: 45,
      createdAgo: 30,
    }),
    g({
      title: 'Meditate Every Morning',
      description:
        'Ten minutes of mindfulness each morning before touching the phone. Protect the first hour of the day.',
      category: 'Health',
      priority: 'low',
      deadline: isoAddDays(60),
      milestones: [ms('7-day streak', 3), ms('30-day streak', undefined, 26), ms('90-day streak', undefined, 60)],
      createdAgo: 10,
    }),
    g({
      title: 'Build a Portfolio Website',
      description:
        'Design and ship a personal portfolio with selected projects, case studies, a blog section and contact form.',
      category: 'Career',
      priority: 'medium',
      deadline: isoAddDays(25),
      milestones: [
        ms('Design the layout in Figma', 11),
        ms('Build with React & Tailwind CSS', 2),
        ms('Add projects & case studies', undefined, 10),
        ms('Deploy to Vercel with custom domain', undefined, 22),
      ],
      favorite: true,
      createdAgo: 18,
    }),
    g({
      title: 'Plan the Zanzibar Getaway',
      description:
        'A one-week beach escape after the exams: flights, hotel, itinerary and a ₦350k travel budget.',
      category: 'Travel',
      priority: 'low',
      deadline: isoAddDays(120),
      milestones: [
        ms('Save travel budget (₦350,000)', undefined, 80),
        ms('Book flights & hotel', undefined, 95),
        ms('Plan daily itinerary', undefined, 110),
      ],
      createdAgo: 5,
    }),
    g({
      title: 'Submit Scholarship Application',
      description: 'Mastercard Foundation scholarship — essays, transcripts and two recommendation letters.',
      category: 'Education',
      priority: 'high',
      deadline: isoAddDays(-3),
      milestones: [ms('Draft personal statement', 9), ms('Collect recommendation letters'), ms('Submit the application')],
      reminder: [true, '08:30'],
      createdAgo: 16,
    }),
    g({
      title: 'Run 5K Without Stopping',
      description: 'Couch-to-5K programme completed — from breathless 1K to a comfortable non-stop 5K run!',
      category: 'Fitness',
      priority: 'medium',
      deadline: isoAddDays(-4),
      milestones: [ms('Run 2K comfortably', 26), ms('Run 3.5K without stopping', 12), ms('Complete the full 5K', 6)],
      createdAgo: 40,
      completedAgo: 6,
    }),
    g({
      title: 'Learn Figma Basics',
      description: 'Archived for now — covered the fundamentals needed for the portfolio design.',
      category: 'Lifestyle',
      priority: 'low',
      deadline: isoAddDays(-30),
      milestones: [ms('Master auto-layout & components', 45), ms('Design a sample landing page', 38)],
      createdAgo: 60,
      archived: true,
    }),
  ];
}

function buildHabits(goals: Goal[]): Habit[] {
  const byTitle = (t: string) => goals.find((g) => g.title === t)?.id ?? null;

  const habits: Array<Omit<Habit, 'log' | 'id' | 'createdAt'> & { createdAgo: number; seed: number; p: number }> = [
    { title: 'Morning Workout', icon: 'dumbbell', color: 'emerald', goalId: byTitle('Exercise 4 Times This Week'), reminderTime: '06:30', createdAgo: 28, seed: 101, p: 0.55 },
    { title: 'Read 30 Minutes', icon: 'book', color: 'blue', goalId: byTitle('Read 12 Books This Year'), reminderTime: '21:00', createdAgo: 28, seed: 202, p: 0.75 },
    { title: 'Code 1 Hour', icon: 'code', color: 'violet', goalId: byTitle('Practice Coding Daily'), reminderTime: '20:00', createdAgo: 28, seed: 303, p: 0.85 },
    { title: 'Meditate 10 Minutes', icon: 'lotus', color: 'teal', goalId: byTitle('Meditate Every Morning'), reminderTime: '06:45', createdAgo: 28, seed: 404, p: 0.7 },
    { title: 'Wake Up at 6:00 AM', icon: 'alarm', color: 'amber', goalId: byTitle('Wake Up at 6:00 AM'), reminderTime: '06:00', createdAgo: 28, seed: 505, p: 0.65 },
  ];

  return habits.map((h, idx) => {
    const rand = mulberry32(h.seed * 7919);
    const log: string[] = [];
    // Last 28 days, with a guaranteed strong recent streak.
    for (let d = 28; d >= 1; d--) {
      const momentum = d <= 9 ? 0.22 : 0; // recent consistency boost
      if (rand() < h.p + momentum) log.push(isoDaysAgo(d));
    }
    // Guarantee each of the last 3 days for streak demos.
    for (const d of [3, 2, 1]) {
      const iso = isoDaysAgo(d);
      if (!log.includes(iso)) log.push(iso);
    }
    log.sort();
    return {
      id: uid(),
      title: h.title,
      icon: h.icon,
      color: h.color,
      goalId: h.goalId,
      reminderTime: h.reminderTime,
      createdAt: stamp(h.createdAgo, 7),
      log,
    };
  });
}

function polishHabitLogs(habits: Habit[], goals: Goal[]) {
  // Today: pre-complete two habits so there is something to play with.
  const today = toISO(new Date());
  for (const title of ['Read 30 Minutes', 'Meditate 10 Minutes']) {
    const h = habits.find((x) => x.title === title);
    if (h && !h.log.includes(today)) h.log.push(today);
  }
  // Avoid any historical *perfect day* so the user can earn it live.
  for (let d = 28; d >= 1; d--) {
    const iso = isoDaysAgo(d);
    const all = habits.every((h) => h.log.includes(iso));
    if (all) {
      const idx = habits.findIndex((h) => h.title === 'Morning Workout');
      const h = habits[Math.max(idx, 0)];
      h.log = h.log.filter((x) => x !== iso);
    }
  }
  void goals;
}

function buildActivity(goals: Goal[]): ActivityItem[] {
  const find = (t: string) => goals.find((g) => g.title === t);
  const items: ActivityItem[] = [
    { id: uid(), type: 'goal-created', text: 'Created goal “Complete Final Year Project”', at: Date.parse(stamp(21, 9, 12)) },
    { id: uid(), type: 'milestone-completed', text: 'Completed milestone “Complete literature review”', at: Date.parse(stamp(20, 16, 40)) },
    { id: uid(), type: 'achievement-unlocked', text: 'Unlocked the “Warming Up” badge', at: Date.parse(stamp(14, 8, 5)) },
    { id: uid(), type: 'milestone-completed', text: 'Completed milestone “Finish Cloud Practitioner course”', at: Date.parse(stamp(9, 18, 20)) },
    { id: uid(), type: 'goal-completed', text: 'Goal completed: “Run 5K Without Stopping” 🎉', at: Date.parse(stamp(6, 17, 30)) },
    { id: uid(), type: 'milestone-completed', text: 'Completed milestone “Reach ₦250,000 saved”', at: Date.parse(stamp(4, 12, 10)) },
    { id: uid(), type: 'goal-created', text: 'Created goal “Plan the Zanzibar Getaway”', at: Date.parse(stamp(5, 11, 45)) },
    { id: uid(), type: 'achievement-unlocked', text: 'Unlocked the “Week Warrior” badge', at: Date.parse(stamp(2, 7, 50)) },
    { id: uid(), type: 'habit-completed', text: 'Checked off “Code 1 Hour”', at: Date.parse(stamp(1, 21, 15)) },
    { id: uid(), type: 'milestone-completed', text: 'Completed milestone “Build with React & Tailwind CSS”', at: Date.now() - 2 * 3_600_000 },
  ];
  const fyp = find('Complete Final Year Project');
  if (fyp) items[0].text = `Created goal “${fyp.title}”`;
  return items.sort((a, b) => a.at - b.at);
}

export function buildSeedData(): AppData {
  const goals = buildGoals();
  const habits = buildHabits(goals);
  polishHabitLogs(habits, goals);

  const unlocked: Record<string, string> = {
    'goal-setter': isoDaysAgo(21),
    'first-victory': isoDaysAgo(6),
    'milestone-maker': isoDaysAgo(20),
    'milestone-crusher': isoDaysAgo(4),
    'warming-up': isoDaysAgo(14),
    'week-warrior': isoDaysAgo(2),
    'habit-hero': isoDaysAgo(2),
  };

  return {
    goals,
    habits,
    activity: buildActivity(goals),
    unlocked,
    meta: { seededAt: Date.now(), notified: {} },
  };
}
