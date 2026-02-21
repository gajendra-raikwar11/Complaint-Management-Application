
import { GoogleGenAI, Type } from "@google/genai";
import { Complaint, Sentiment, AnalyticsReport, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Predicts priority based on complaint description
  predictPriority: async (description: string): Promise<Priority> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evaluate the urgency of this college complaint. Return ONLY one word: [Low, Medium, High].
        Complaint: "${description}"`,
      });
      const text = response.text?.trim() as Priority;
      return Object.values(Priority).includes(text) ? text : Priority.MEDIUM;
    } catch (error) {
      return Priority.MEDIUM;
    }
  },

  summarizeComplaint: async (complaint: Complaint): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Summarize this college complaint into 1 short sentence:
        Title: ${complaint.title}
        Category: ${complaint.category}
        Description: ${complaint.description}`,
      });
      return response.text?.trim() || "Summary unavailable.";
    } catch (error) {
      return "Unable to generate summary.";
    }
  },

  analyzeSentiment: async (complaint: Complaint): Promise<Sentiment> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the sentiment of this complaint and return exactly one word: [Urgent, Frustrated, Neutral, Constructive].
        Complaint: ${complaint.description}`,
      });
      const text = response.text?.trim() as Sentiment;
      return Object.values(Sentiment).includes(text) ? text : Sentiment.NEUTRAL;
    } catch (error) {
      return Sentiment.NEUTRAL;
    }
  },

  suggestResponse: async (complaint: Complaint): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `As a college admin, suggest an empathetic 2-sentence response for: "${complaint.title}".`,
      });
      return response.text?.trim() || "No suggestion available.";
    } catch (error) {
      return "Unable to suggest response.";
    }
  },

  generateAnalytics: async (complaints: Complaint[]): Promise<AnalyticsReport> => {
    const dataString = complaints.map(c => `${c.category}: ${c.title}`).join('\n');
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Analyze these recent college complaints and provide a report in JSON format.
        Data:\n${dataString}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trendSummary: { type: Type.STRING },
              keyInsights: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sentimentScore: { type: Type.NUMBER }
            },
            required: ["trendSummary", "keyInsights", "sentimentScore"]
          }
        }
      });
      return JSON.parse(response.text || '{}') as AnalyticsReport;
    } catch (error) {
      return {
        trendSummary: "Analytics temporarily unavailable.",
        keyInsights: ["Ensure API key is valid"],
        sentimentScore: 50
      };
    }
  }
};
