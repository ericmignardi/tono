const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    // Access the model via the API directly if SDK doesn't support listModels easily in older versions,
    // but let's try the standard way first. It might be hidden or require fetch.
    // Actually the SDK has a model listing method?
    // Checking documentation recall: genAI.getGenerativeModel is for getting one.
    // There isn't a direct listModels on the main class in some versions.
    // Let's try to just invoke a simple generateContent with 'gemini-1.5-flash' and 'gemini-1.5-flash-001' to see which one works.

    const modelsToTest = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-001',
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
    ];

    for (const modelName of modelsToTest) {
      console.log(`Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, are you there?');
        console.log(`SUCCESS: ${modelName} responded: ${result.response.text()}`);
      } catch (e) {
        console.error(`FAILED: ${modelName} - ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
