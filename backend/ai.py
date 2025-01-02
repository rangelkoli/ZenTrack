import google.generativeai as genai

genai.configure(api_key="")
genAIModel = genai.GenerativeModel("gemini-1.5-flash")
