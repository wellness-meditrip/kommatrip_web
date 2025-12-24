import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const mockReviews = [
  { content: '선생님이 친절하고 설명을 잘 해주세요.', starRating: 5 },
  { content: '기다리는 시간이 조금 길었어요.', starRating: 3 },
  { content: '시설이 깔끔하고 접수도 빨랐어요.', starRating: 4 },
  { content: '진료는 괜찮았는데 주차가 불편해요.', starRating: 3 },
  { content: '추천하고 싶은 병원이에요.', starRating: 5 },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const prompt = `
다음은 한의원에 대한 사용자 리뷰입니다. 공통된 의견을 바탕으로 병원의 특징을 3줄 이내로 요약해주세요.

${mockReviews.map((r) => `- ${r.content} (${r.starRating}점)`).join('\n')}
    `;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    });

    res.status(200).json({ summary: result.text });
  } catch (err) {
    console.error('Gemini API Error:', err);
    res.status(500).json({ error: '요약 생성 실패' });
  }
}
