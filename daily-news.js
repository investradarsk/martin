exports.handler = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    const prompt = `
Si InvestRadar editor.

Napíš 5 najdôležitejších dnešných správ pre investorov.

Formát:

1. Nadpis
Krátke zhrnutie
Dopad na trh:

Píš po slovensky.
Stručne a profesionálne.
`;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Žiadna odpoveď";

    return {
      statusCode: 200,
      body: text
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.toString()
    };
  }
};