import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(request) {
  const body = await request.json();
  const { emailContent } = body;

  if (!emailContent) {
    return Response.json({ error: "Email content is required" });
  }

  // OPEN AI --------------
  // try {
  //   const completion = await openai.completions.create({
  //     model: "gpt-3.5-turbo-instruct",
  //     prompt: `Classify the following email into one of the following categories: 1) Important: (Emails that are personal or work-related and require immediate attention) 2) Promotions: Emails related to sales, discounts, and marketing campaigns 3) Social: Emails from social networks, friends, and family 4) Marketing: Emails related to marketing, newsletters, and notifications 5) Spam: Unwanted or unsolicited emails 6) General: If none of the above are matched, use General... Here is the email-content: ${emailContent}`,
  //     max_tokens: 50,
  //   });

  //   const classification = completion.data.choices[0].text.trim();
  //   return Response.json({ classification });
  // } catch (error) {
  //   return Response.json({ error: error.message });
  // }

  const model = genAI.getGenerativeModel({
    model: "gemini-pro",
  });

  const prompt = `Classify the following email into one of the following categories: 
  1) Important: (Emails that are personal or work-related and require immediate attention) 
  2) Promotions: Emails related to sales, discounts, and marketing campaigns 
  3) Social: Emails from social networks, friends, and family 
  4) Marketing: Emails related to marketing, newsletters, and notifications 
  5) Spam: Unwanted or unsolicited emails 
  6) General: If none of the above are matched, use General... Here is the email: ${emailContent}...JUST RETURN THE TYPE OF CLASS..NO NEED TO RETURN NUMBER, INDEX`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    return Response.json({ answer });
  } catch (error) {
    // console.log(error);
    return Response.json({ message: "Error checking for mail type" });
  }
}
