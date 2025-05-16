
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getMoodStyles = (mood: string) => {
  switch (mood) {
    case 'hopeful':
      return 'bg-blue-100 text-blue-800';
    case 'motivated':
      return 'bg-green-100 text-green-800';
    case 'grateful':
      return 'bg-purple-100 text-purple-800';
    case 'ambitious':
      return 'bg-amber-100 text-amber-800';
    case 'joyful':
      return 'bg-rose-100 text-rose-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const getTimeUntilUnlock = (date: Date) => {
  const now = new Date();
  const diffTime = Math.abs(date.getTime() - now.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays > 30) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
  }
  
  return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
};
