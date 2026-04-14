import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'TODO' || apiKey.includes('YOUR_API_KEY')) {
      return null;
    }
    try {
      aiInstance = new GoogleGenAI({ apiKey });
    } catch (e) {
      console.error("Failed to initialize Gemini AI:", e);
      return null;
    }
  }
  return aiInstance;
}

export async function generateAdminInsights(topSelling: any[], products: any[]) {
  const ai = getAI();
  if (!ai) return "AI insights are currently unavailable. Please check your API key in Settings.";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a senior business analyst for an e-commerce platform.
        Top Selling Products: ${JSON.stringify(topSelling)}
        Product Catalog: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, price: p.price })))}
        
        Provide 3 actionable business insights based on this data.
        Focus on trends, inventory suggestions, and cross-selling opportunities.
        Return a plain text response.
      `,
    });
    return response.text;
  } catch (error: any) {
    console.error("Admin Insights Error:", error);
    if (error?.status === 'INVALID_ARGUMENT' || error?.message?.includes('API key not valid')) {
      return "Invalid API Key. Please check your GEMINI_API_KEY in Settings.";
    }
    return "Unable to generate insights at this time.";
  }
}

export async function getSupportChatResponse(message: string, context: { user: any, orders: any[], products: any[] }) {
  const ai = getAI();
  if (!ai) return "I'm sorry, my AI brain is currently disconnected. Please check the API key configuration.";

  const systemInstruction = `
    You are a helpful, professional customer support assistant for RJ Boutique.
    
    User Info: ${JSON.stringify(context.user)}
    User's Recent Orders: ${JSON.stringify(context.orders)}
    Product Catalog (Sample): ${JSON.stringify(context.products)}
    
    Guidelines:
    - Be concise and friendly.
    - If the user asks about their orders, refer to the provided order history.
    - If they ask about products, suggest items from the catalog.
    - If you can't help, politely suggest they contact human support at support@rjai.com.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: message,
      config: {
        systemInstruction
      }
    });
    return response.text;
  } catch (error: any) {
    console.error("Chat Error:", error);
    if (error?.status === 'INVALID_ARGUMENT' || error?.message?.includes('API key not valid')) {
      return "Invalid API Key. Please check your GEMINI_API_KEY in Settings.";
    }
    return "I'm having trouble responding right now. Please try again later.";
  }
}
