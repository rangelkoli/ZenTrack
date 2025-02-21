import google.generativeai as genai
import os 
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))
genAIModel = genai.GenerativeModel("gemini-1.5-flash")
