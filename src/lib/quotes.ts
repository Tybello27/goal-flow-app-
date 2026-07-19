export interface Quote {
  text: string;
  author: string;
}

export const QUOTES: Quote[] = [
  { text: 'Flow with the future, not the past.', author: 'GoalFlow' },
  { text: 'A goal without a plan is just a wish.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Small progress is still progress.', author: 'GoalFlow' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Discipline is choosing what you want most over what you want now.', author: 'Abraham Lincoln' },
  { text: 'Dream big. Start small. Act now.', author: 'Robin Sharma' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela' },
  { text: 'You do not have to be extreme, just consistent.', author: 'GoalFlow' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier' },
  { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
  { text: 'What gets measured gets managed.', author: 'Peter Drucker' },
  { text: 'Motivation gets you going, but discipline keeps you growing.', author: 'John C. Maxwell' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery' },
  { text: 'How we spend our days is, of course, how we spend our lives.', author: 'Annie Dillard' },
  { text: 'Either you run the day or the day runs you.', author: 'Jim Rohn' },
  { text: 'Great things are done by a series of small things brought together.', author: 'Vincent van Gogh' },
  { text: 'Your future is created by what you do today, not tomorrow.', author: 'Robert Kiyosaki' },
  { text: 'The journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Energy flows where attention goes.', author: 'Tony Robbins' },
  { text: 'Well begun is half done.', author: 'Aristotle' },
  { text: 'If you get tired, learn to rest, not to quit.', author: 'Banksy' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Little by little, a little becomes a lot.', author: 'Tanzanian Proverb' },
  { text: 'You will never change your life until you change something you do daily.', author: 'John C. Maxwell' },
  { text: 'Fall in love with the process and the results will come.', author: 'Eric Thomas' },
  { text: 'Focus is a matter of deciding what you are not going to do.', author: 'John Carmack' },
  { text: 'Setting goals is the first step in turning the invisible into the visible.', author: 'Tony Robbins' },
  { text: 'First we make our habits, and then our habits make us.', author: 'John Dryden' },
];

export function quoteOfDay(date = new Date()): Quote {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return QUOTES[dayOfYear % QUOTES.length];
}
