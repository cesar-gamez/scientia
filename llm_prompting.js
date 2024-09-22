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
