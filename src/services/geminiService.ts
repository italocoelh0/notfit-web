
// src/services/geminiService.ts

import { GoogleGenAI } from '@google/genai';
import { UserData, GeneratedPlan } from '../types';

const createAiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY não encontrada. Coach IA será desabilitado.');
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export async function getDailyPlan(userData: UserData): Promise<GeneratedPlan> {
  const ai = createAiClient();
  if (!ai) {
    throw new Error('Serviço de IA não está configurado. Verifique a chave da API.');
  }

  try {
    const prompt = `
      Você é um coach fitness profissional. Crie um plano diário personalizado para:

      Nome: ${userData.name}
      Idade: ${userData.age} anos
      Peso: ${userData.weight} kg
      Objetivos: ${userData.goals.join(', ')}

      Gere um plano no formato JSON com:
      - motivation: uma frase motivacional curta (máx 100 caracteres)
      - mealPlan: objeto com breakfast, lunch, dinner (sugestões de refeições simples)
      - workout: array de 3-5 objetos de exercício com "name" e "duration" (ex: "4x12").
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;

    if (!text) {
      throw new Error('Resposta vazia da IA. Tente novamente.');
    }
    
    try {
      const plan = JSON.parse(text);
      if (plan.motivation && plan.mealPlan && plan.workout) {
        return plan;
      }
      throw new Error('Resposta da IA em formato JSON inválido.');
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON da IA:', parseError, 'Raw text:', text);
      throw new Error('Resposta da IA em formato inesperado.');
    }
  } catch (error: any) {
    console.error('❌ Erro na API do Gemini:', error);
    if (error.message?.includes('API key not valid')) {
      throw new Error('Chave da API inválida. Contate o administrador.');
    }
    if (error.status >= 500) {
      throw new Error('Serviço da IA temporariamente indisponível. Tente novamente.');
    }
    if (error.message?.includes('network')) {
      throw new Error('Problema de conexão. Verifique sua internet.');
    }
    throw new Error('Não foi possível gerar o plano do Coach IA. Tente novamente.');
  }
}

// Função para testar se a API está funcionando
export async function testGeminiConnection(): Promise<boolean> {
  const ai = createAiClient();
  if (!ai) return false;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Teste'
    });
    return !!response.text;
  } catch (e) {
    console.error("Falha no teste de conexão com a API Gemini:", e);
    return false;
  }
}