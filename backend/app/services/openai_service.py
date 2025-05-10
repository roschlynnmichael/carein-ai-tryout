from openai import OpenAI
from ..config import settings

client = OpenAI(api_key = settings.OPENAI_API_KEY)

async def generate_summary(transcript: str) -> str:
    try:
        response = await client.chat.completions.create(
            model = 'gpt-3.5-turbo',
            messages = [
                {"role": "system", "content": "You are a helpful assistant that summarizes dental office phone calls. Focus on key points, patient concerns, and any actions needed."},
                {"role": "user", "content": f"Please summarize this dental office phone call transcript:\n\n{transcript}"}
            ],
            temperature = 0.7,
            max_tokens = 500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f'OpenAI Error: {e}')
        return (
            "Summary (mocked): This is a fallback summary because the OpenAI API is unavailable."
            "Key points and actions from the transcript would appear here!"
        )