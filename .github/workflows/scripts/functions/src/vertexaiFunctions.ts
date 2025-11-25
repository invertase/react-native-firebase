import { onRequest } from 'firebase-functions/v2/https';

const poem = [
  'The wind whispers secrets through the trees,',
  'Rustling leaves in a gentle breeze.',
  'Sunlight dances on the grass,',
  'A fleeting moment, sure to pass.',
  'Birdsong fills the air so bright,',
  'A symphony of pure delight.',
  'Time stands still, a peaceful pause,',
  "In nature's beauty, no flaws.",
];

const response = {
  candidates: [
    {
      content: {
        parts: [
          {
            text: 'Google\'s mission is to "organize the world\'s information and make it universally accessible and useful."',
          },
        ],
        role: 'model',
      },
      finishReason: 'STOP',
      index: 0,
      safetyRatings: [
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
      ],
    },
  ],
  promptFeedback: {
    safetyRatings: [
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', probability: 'NEGLIGIBLE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', probability: 'NEGLIGIBLE' },
      { category: 'HARM_CATEGORY_HARASSMENT', probability: 'NEGLIGIBLE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', probability: 'NEGLIGIBLE' },
    ],
  },
};

export const testFetchStream = onRequest(async (_, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const updatedResponse = { ...response };

  for (let i = 0; i < poem.length; i++) {
    updatedResponse.candidates[0].content.parts[0].text = poem[i];
    res.write(`data: ${JSON.stringify(updatedResponse)}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  res.end();
});

export const testFetch = onRequest(async (_, res) => {
  res.json(response);
});
