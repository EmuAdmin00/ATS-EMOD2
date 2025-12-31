
import { GoogleGenAI } from "@google/genai";
import { Item, ProductionBatch } from "../types";

export const getProductionInsights = async (items: Item[], batches: ProductionBatch[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';

  const inventorySummary = items.map(i => `${i.name}: ${i.stock}${i.unit}`).join(', ');
  const recentProduction = batches.slice(-5).map(b => `${b.productId} at ${b.outputQuantity}`).join(', ');

  const prompt = `
    You are an industrial expert for Asphalt Emulsion and Modified Bitumen (PG).
    Current Inventory: ${inventorySummary}
    Recent Production Activity: ${recentProduction}

    Please provide:
    1. Critical stock alerts (if any).
    2. Suggest a production plan based on stock levels (prioritize what is low).
    3. Technical tip for Asphalt Emulsion quality control.
    4. One optimization suggestion for cost reduction.

    Format the response in clear Markdown with headers. Keep it professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating insights. Please check your network or API key.";
  }
};
