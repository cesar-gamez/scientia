// import axios from 'axios'; // Use 'import' instead of 'require'
// import fs from 'fs';
// import os from 'os';
// import path from 'path';

// // Function to get OpenAI API key from the config file
// function getOpenAIKey() {
//   const configPath = path.join(os.homedir(), '.openai', 'config');
  
//   try {
//     const configFile = fs.readFileSync(configPath, 'utf-8');
//     const lines = configFile.split('\n');
    
//     for (const line of lines) {
//       if (line.startsWith('api_key=')) {
//         return line.split('=')[1].trim(); // Extract the key
//       }
//     }
//   } catch (err) {
//     console.error('Error reading OpenAI config:', err);
//   }

//   return null;
// }

// // Function to call OpenAI API with a prompt
// async function callGPT(prompt, maxTokens = 100) {
//   const apiKey = getOpenAIKey();

//   if (!apiKey) {
//     console.error('No OpenAI API key found!');
//     return null;
//   }

//   const requestData = {
//     model: 'gpt-3.5-turbo', // or 'gpt-4' if available
//     messages: [
//       {
//         role: 'system',
//         content: 'You are a helpful assistant.',
//       },
//       {
//         role: 'user',
//         content: prompt,
//       }
//     ],
//     max_tokens: maxTokens,
//   };

//   const headers = {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${apiKey}`,
//   };

//   try {
//     const response = await axios.post('https://api.openai.com/v1/chat/completions', requestData, { headers });
//     const assistantMessage = response.data.choices[0].message.content;
//     return assistantMessage;
//   } catch (error) {
//     console.error('Error:', error.response ? error.response.data : error.message);
//     return null;
//   }
// }

// // New function to ask GPT to fill in the sentence with 3-6 words
// async function fillInSentence(incompleteLine, maxTokens = 25) {
  // const prompt = `Fill in the following sentence with 3-6 words: "${incompleteLine}"
  //                 Do not give the previous context in the response you give, just the 3-6 words that would 
  //                 be appropriate based on the context given`;
//   const response = await callGPT(prompt, maxTokens);
  
//   if (response) {
//     console.log('Filled Sentence:', response);
//   }
//   return response;
// }

// (async () => {
//   const incompleteSentence = "Guitars can be great instruments but";
//   const filledSentence = await fillInSentence(incompleteSentence);
  
//   if (filledSentence) {
//     console.log('Result:', filledSentence);
//   }
// })();




import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

/**
 * Invokes a Mistral 7B Instruct model with a given prompt.
 *
 * @param {string} prompt - The input text prompt for the model to complete.
 * @param {string} [modelId] - The ID of the model to use. Defaults to "mistral.mistral-7b-instruct-v0:2".
 * @returns {Promise<string>} - The completed text from the model.
 */
export const invokeModel = async (prompt, modelId = "mistral.mistral-7b-instruct-v0:2") => {
  const client = new BedrockRuntimeClient({ region: "us-east-1" });

  const payload = {
    prompt: `<s>[INST] ${prompt} [/INST]`,
    max_tokens: 100, // Adjust based on your needs
    temperature: 0.5,
  };

  const command = new InvokeModelCommand({
    contentType: "application/json",
    body: JSON.stringify(payload),
    modelId,
  });

  try {
    const apiResponse = await client.send(command);
    const decodedResponseBody = new TextDecoder().decode(apiResponse.body);
    const responseBody = JSON.parse(decodedResponseBody);
    return responseBody.outputs[0].text.trim();
  } catch (err) {
    console.error("Error invoking model:", err);
    throw err;
  }
};

/**
 * Helper function to extract new completion text after the incomplete sentence, case-insensitive, ignoring grammar.
 * Removes text after the first period and strips quotation marks.
 *
 * @param {string} originalText - The original incomplete sentence that was sent to the model.
 * @param {string} modelResponse - The response text returned by the model.
 * @returns {string} - The new text added by the model.
 */
export const extractCompletion = (originalText, modelResponse) => {
  console.log(modelResponse);

  // case-insensitive comparison
  const lowerOriginalText = originalText.toLowerCase();
  let lowerModelResponse = modelResponse.toLowerCase();

  // Find position of the original text in the model response
  const position = lowerModelResponse.indexOf(lowerOriginalText);

  if (position !== -1) {
    // Extract original text from the modelResponse 
    let remainingText = modelResponse.slice(position + originalText.length).trim();

    // Remove any quotation marks
    remainingText = remainingText.replace(/['"]+/g, '');

    // Remove text after first period
    const periodIndex = remainingText.indexOf('.');
    if (periodIndex !== -1) {
      remainingText = remainingText.slice(0, periodIndex).trim();
    }

    return remainingText;
  }

  // If original text is not found, return the whole model response as fallback
  return modelResponse.trim();
};



/**
 * Prepares a prompt to complete a sentence and calls invokeModel.
 *
 * @param {string} incompleteLine - The incomplete sentence to fill in.
 * @returns {Promise<string>} - The completed sentence from the model.
 */
export const completeSentence = async (incompleteLine) => {
  var prompt = `You are a sentence autocomplete system. Your task is to complete an incomplete sentence/phrase.
                  Fill in the following sentence with your autocomplete suggestion: "${incompleteLine}"
                  Only give one possibility, not multiple options.
                  Do not give the previous context in the response you give, just the few words that would 
                  be appropriate based on the context given.`;

  const modelResponse = await invokeModel(prompt); // Pass the prompt to invokeModel
  return extractCompletion(incompleteLine, modelResponse); // Extract only the completion
};

/**
 * Prepares a prompt to complete a sentence and calls invokeModel.
 *
 * @param {string} incompleteLine - The incomplete sentence to fill in.
 * @returns {Promise<string>} - The completed sentence from the model.
 */
export const highlightingToRag = async (highlightedText) => {
  var prompt = `I am giving you a set of highlighted words. Your task is to make these words highlighted
                as a query for the knowledge database for Retrieval-augmented generation. 
                I want you to make a query out of these words: "${highlightedText}"
                Only create one query, not multiple.`;
};

// Example usage
(async () => {
    const incompleteLine = "i'm trying to ";
    const response = await completeSentence(incompleteLine);
    console.log(`${response}`); // This will print only the new completion (e.g., "lenovo and hp")


})();
