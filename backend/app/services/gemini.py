import json
import re
from groq import AsyncGroq
from app.config import settings

client = AsyncGroq(api_key=settings.groq_api_key)

async def analyze_resume(resume_text: str) -> dict:
    prompt = f"""
You are an expert HR consultant and ATS specialist with 10+ years of experience.

Analyze the following resume carefully and provide a detailed analysis.

Resume:
{resume_text}

Return ONLY a valid JSON object with this exact structure (no extra text, no markdown):
{{
    "ats_score": <number between 0-100>,
    "overall_summary": "<2-3 sentence summary of the resume>",
    "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
    "missing_skills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
    "improvement_suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"],
    "keywords_found": ["<keyword 1>", "<keyword 2>", "<keyword 3>"],
    "experience_level": "<Fresher/Junior/Mid/Senior>",
    "top_skills": ["<skill 1>", "<skill 2>", "<skill 3>"]
}}
"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert HR consultant. Always respond with valid JSON only. No markdown, no explanation, just pure JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=2000,
        )

        raw_text = response.choices[0].message.content.strip()

        if "```" in raw_text:
            pattern = r"```(?:json)?\s*([\s\S]*?)```"
            match = re.search(pattern, raw_text)
            if match:
                raw_text = match.group(1).strip()

        result = json.loads(raw_text)
        return result

    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse AI response as JSON: {str(e)}")
    except Exception as e:
        raise Exception(f"Groq API error: {str(e)}")
async def generate_questions(resume_text: str) -> list:
    prompt = f"""
You are an expert technical interviewer and career coach creating a complete interview preparation guide.

Based on this resume, generate 8 interview questions with full preparation material for each.

Resume:
{resume_text}

Return ONLY a valid JSON array like this:
[
    {{
        "id": 1,
        "question": "...",
        "category": "Technical/HR/Behavioral",
        "difficulty": "Easy/Medium/Hard",
        "ideal_answer": "<a strong sample answer, 3-5 sentences>",
        "interviewer_expectation": "<1-2 sentences on what the interviewer is really evaluating>",
        "explanation": "<2-3 sentences explaining the concept or context behind the question>",
        "key_points": ["<point 1>", "<point 2>", "<point 3>"],
        "common_mistakes": ["<mistake 1>", "<mistake 2>"],
        "follow_up_questions": ["<follow-up 1>", "<follow-up 2>"],
        "related_concepts": ["<concept 1>", "<concept 2>"]
    }}
]

No extra text. Just the JSON array.
"""
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return only valid JSON array. No markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            max_tokens=4000,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
            if match:
                raw = match.group(1).strip()
        return json.loads(raw)
    except Exception as e:
        raise Exception(f"Questions generation failed: {str(e)}")

async def evaluate_answer(question: str, answer: str, category: str) -> dict:
    prompt = f"""
You are an expert interviewer evaluating a candidate's answer.

Question ({category}): {question}
Candidate's Answer: {answer}

Return ONLY a valid JSON object:
{{
    "score": <number 0-10>,
    "feedback": "<2-3 sentence constructive feedback>",
    "tip": "<1 sentence tip to improve this specific answer>"
}}
"""
    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "Return only valid JSON object. No markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
            max_tokens=500,
        )
        raw = response.choices[0].message.content.strip()
        if "```" in raw:
            match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw)
            if match:
                raw = match.group(1).strip()
        return json.loads(raw)
    except Exception as e:
        raise Exception(f"Answer evaluation failed: {str(e)}")