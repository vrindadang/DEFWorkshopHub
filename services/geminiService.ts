import { GoogleGenAI, Type } from "@google/genai";
import { Workshop } from "../types";

export async function processWorkshopReport(rawText: string): Promise<Partial<Workshop>> {
  // Initialize inside the function to ensure process.env.API_KEY is accessed at runtime
  // per SDK assumptions while avoiding top-level ReferenceErrors in browsers.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract workshop details from the following report and structure it according to the schema. 
    Ensure you capture the Title, Theme, Category (choose from: Security Excellence, AI Literacy, Spiritual Curriculum, Teacher Training, Leadership Development, Administrative Excellence), 
    Lead (The person who organized/conducted the workshop), Agenda (list of {particulars, startTime, endTime, speaker, remarks, isActivity}), 
    Speakers (list of {name, designation, takeaways}), Activities, Metrics, Feedback, Action Plan, 
    and Budget (allocated amount and list of incurred expenses with {description, amount}).
    
    REPORT TEXT:
    ${rawText}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          theme: { type: Type.STRING },
          category: { type: Type.STRING },
          lead: { type: Type.STRING },
          date: { type: Type.STRING },
          venue: { type: Type.STRING },
          frequency: { type: Type.STRING },
          agenda: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                particulars: { type: Type.STRING },
                startTime: { type: Type.STRING },
                endTime: { type: Type.STRING },
                speaker: { type: Type.STRING },
                remarks: { type: Type.STRING },
                isActivity: { type: Type.BOOLEAN }
              },
              required: ["particulars", "startTime", "endTime"]
            } 
          },
          speakers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                designation: { type: Type.STRING },
                takeaways: { type: Type.STRING }
              },
              required: ["name", "designation", "takeaways"]
            }
          },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          metrics: {
            type: Type.OBJECT,
            properties: {
              participantCount: { type: Type.NUMBER },
              demographic: { type: Type.STRING }
            }
          },
          feedback: {
            type: Type.OBJECT,
            properties: {
              averageRating: { type: Type.NUMBER },
              qualitativeComments: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          budget: {
            type: Type.OBJECT,
            properties: {
              allocated: { type: Type.NUMBER },
              expenses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING },
                    amount: { type: Type.NUMBER }
                  },
                  required: ["description", "amount"]
                }
              }
            },
            required: ["allocated", "expenses"]
          },
          actionPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["title", "category", "date", "lead", "budget"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text.trim());
    return data;
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Could not process the report into structured data.");
  }
}