import axios from 'axios'; // Use 'import' instead of 'require'
import fs from 'fs';
import os from 'os';
import path from 'path';

function getOpenAIKey() {
  const configPath = path.join(os.homedir(), '.openai', 'config');
  
  try {
    const configFile = fs.readFileSync(configPath, 'utf-8');
    const lines = configFile.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('api_key=')) {
        return line.split('=')[1].trim(); // Extract the key
      }
    }
  } catch (err) {
    console.error('Error reading OpenAI config:', err);
  }

  return null;
}

// Use the retrieved API key in your axios call
const apiKey = getOpenAIKey();

if (apiKey) {
  // Use the API key for your OpenAI requests
  const requestData = {
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant.',
      },
      {
        role: 'user',
        content: 'What are the basic principles of biology?',
      }
    ],
    max_tokens: 100,
  };

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  axios.post('https://api.openai.com/v1/chat/completions', requestData, { headers })
    .then(response => {
      const assistantMessage = response.data.choices[0].message.content;
      console.log('Assistant response:', assistantMessage);
    })
    .catch(error => {
      console.error('Error:', error.response ? error.response.data : error.message);
    });
} else {
  console.error('No OpenAI API key found!');
}




// import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
// import { fileURLToPath } from "url";

// const REGION = "us-east-1";
// const client = new BedrockRuntimeClient({ region: REGION });

// const invokeModel = async (modelId, prompt) => {
//   const params = {
//     ContentType: 'application/json',
//     Accept: 'application/json',
//     Body: JSON.stringify({ inputText: prompt }) // Correctly setting the Body as a stringified JSON
//   };

//   try {
//     // Ensure the ModelId is passed as part of the command and the Body is included
//     const command = new InvokeModelCommand({
//       ModelId: modelId,  // Ensure modelId is passed correctly
//       ...params, // Spread the params here
//     });

//     const response = await client.send(command);
//     const responseBody = await response.Body.text(); // Ensure to read the response body as text
//     console.log('Model response:', JSON.parse(responseBody));
//   } catch (err) {
//     console.error('Error invoking model:', err);
//   }
// };

// export const main = async () => {
//   const questions = [
//     "What are the basic principles of biology?"
//   ];

//   const modelId = "mistral.mistral-7b-instruct-v0:2";  // Ensure this modelId is valid

//   for (const question of questions) {
//     console.log(`Asking: ${question}`);
//     await invokeModel(modelId, question);
//   }
// };

// if (process.argv[1] === fileURLToPath(import.meta.url)) {
//   await main();
// }
