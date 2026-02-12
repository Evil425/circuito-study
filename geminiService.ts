
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getStudyInsights(performance: any[]) {
  try {
    const prompt = `Analise o seguinte desempenho de estudos e forneça 3 dicas práticas em português para melhorar o rendimento: ${JSON.stringify(performance)}`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um mentor especialista em concursos públicos e produtividade. Forneça conselhos acionáveis baseados em dados.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights do Gemini:", error);
    return "Não foi possível carregar os insights no momento.";
  }
}

export async function getSimuladoAnalysis(simulados: any[]) {
  try {
    const prompt = `Analise estes resultados de simulados: ${JSON.stringify(simulados)}. 
    Calcule uma "Chance de Aprovação" (em porcentagem de 0 a 100) baseada na consistência e evolução. 
    Explique o porquê dessa porcentagem e o que falta para chegar aos 90%+. 
    Retorne em português, sendo motivador mas realista.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "Você é um analista de dados estatísticos especializado em aprovação em grandes concursos (Magistratura, Receita, Polícia Federal). Analise a competitividade do aluno.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro na análise de simulados:", error);
    return "A IA ainda não conseguiu processar sua chance de aprovação. Continue fazendo simulados!";
  }
}
