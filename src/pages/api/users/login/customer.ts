import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const backendResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/non/login/customer`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(backendResponse.status).json(backendResponse.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({ message: 'Login failed' });
  }
}
