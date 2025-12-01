// lib/routineService.ts

import { UserData, Recipe, Exercise, UserRoutine, DailyRoutine, MuscleGroup } from '../types';

export const calculateIMC = (weightKg: number, heightCm: number): number => {
  const h = heightCm / 100;
  if (!h) return 0;
  return weightKg / (h * h);
};

export const calculateIdealWeight = (heightCm: number): number => {
  const h = heightCm / 100;
  const idealIMC = 22;
  return idealIMC * h * h;
};

const determineNutritionalGoal = (
  currentIMC: number,
  targetIMC: number,
  goals: string[],
): 'deficit' | 'surplus' | 'maintenance' => {
  const text = goals.join(' ').toLowerCase();
  if (currentIMC > 25 || text.includes('emag') || text.includes('perder')) return 'deficit';
  if (currentIMC < 18.5 || text.includes('ganho') || text.includes('massa')) return 'surplus';
  return 'maintenance';
};

const selectDailyMeals = (
  recipes: Recipe[],
  _goal: 'deficit' | 'surplus' | 'maintenance',
  dayIndex: number,
) => {
  const salgadas = recipes.filter(r => r.tipo === 'salgada');
  const doces = recipes.filter(r => r.tipo === 'doce');

  if (!salgadas.length && !doces.length) {
    return { breakfast: null, lunch: null, dinner: null, snack: null };
  }

  const breakfastIndex = doces.length ? dayIndex % doces.length : 0;
  const lunchIndex = salgadas.length ? dayIndex % salgadas.length : 0;
  const dinnerIndex = salgadas.length ? (dayIndex + 1) % salgadas.length : 0;
  const snackIndex = doces.length ? (dayIndex + 1) % doces.length : 0;

  return {
    breakfast: doces[breakfastIndex] || null,
    lunch: salgadas[lunchIndex] || null,
    dinner: salgadas[dinnerIndex] || null,
    snack: doces[snackIndex] || null,
  };
};

const selectDailyExercises = (exercises: Exercise[], dayIndex: number): Exercise[] => {
  if (!exercises.length) return [];

  const splits: MuscleGroup[][] = [
    ['Peito', 'Tríceps'],
    ['Costas', 'Bíceps'],
    ['Pernas'],
    ['Ombros', 'Abdômen'],
    ['Cardio', 'Abdômen'],
    ['Cardio'],
    [],
  ];

  const splitIndex = dayIndex % 7;
  const groups = splits[splitIndex];
  if (!groups.length) return [];
  return exercises.filter(ex => groups.includes(ex.grupoMuscular));
};

export const generateAIRoutine = async (
  userData: UserData,
  recipes: Recipe[],
  exercises: Exercise[],
): Promise<UserRoutine> => {
  if (!userData.height) {
    console.warn("Altura do usuário não encontrada, usando uma aproximação para o cálculo do IMC.");
  }
  const heightToUse = userData.height || 170; // Usa a altura do usuário ou uma aproximação
  
  const currentIMC = calculateIMC(userData.weight, heightToUse);
  const targetWeight = calculateIdealWeight(heightToUse);
  const targetIMC = calculateIMC(targetWeight, heightToUse);
  const goal = determineNutritionalGoal(currentIMC, targetIMC, userData.goals || []);

  const duration = 30;
  const dailyRoutines: DailyRoutine[] = [];

  for (let day = 1; day <= duration; day++) {
    const meals = selectDailyMeals(recipes, goal, day - 1);
    const dayExercises = selectDailyExercises(exercises, day - 1);
    dailyRoutines.push({
      day,
      breakfast: meals.breakfast,
      lunch: meals.lunch,
      dinner: meals.dinner,
      snack: meals.snack,
      exercises: dayExercises,
    });
  }

  return {
    type: 'ai',
    startDate: new Date().toISOString(),
    duration,
    dailyRoutines,
    targetWeight,
    currentIMC,
    targetIMC,
  };
};

export const createManualRoutine = (
  selectedRecipes: Recipe[],
  selectedExercises: Exercise[],
  duration = 30,
): UserRoutine => {
  const dailyRoutines: DailyRoutine[] = [];

  for (let day = 1; day <= duration; day++) {
    const meals = selectDailyMeals(selectedRecipes, 'maintenance', day - 1);
    const dayExercises = selectDailyExercises(selectedExercises, day - 1);
    dailyRoutines.push({
      day,
      breakfast: meals.breakfast,
      lunch: meals.lunch,
      dinner: meals.dinner,
      snack: meals.snack,
      exercises: dayExercises,
    });
  }

  return {
    type: 'manual',
    startDate: new Date().toISOString(),
    duration,
    dailyRoutines,
  };
};