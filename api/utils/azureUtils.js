const axios = require('axios').default;

/**
 * @typedef {Object} AzureCredentials
 * @property {string} azureOpenAIApiKey - The Azure OpenAI API key.
 * @property {string} azureOpenAIApiInstanceName - The Azure OpenAI API instance name.
 * @property {string} azureOpenAIApiDeploymentName - The Azure OpenAI API deployment name.
 * @property {string} azureOpenAIApiVersion - The Azure OpenAI API version.
 */

/**
 * Generates the Azure OpenAI API endpoint URL.
 * @param {Object} params - The parameters object.
 * @param {string} params.azureOpenAIApiInstanceName - The Azure OpenAI API instance name.
 * @param {string} params.azureOpenAIApiDeploymentName - The Azure OpenAI API deployment name.
 * @returns {string} The complete endpoint URL for the Azure OpenAI API.
 */
const genAzureEndpoint = ({ azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName }) => {
  if (!azureOpenAIApiInstanceName || !azureOpenAIApiDeploymentName) {
    throw new Error('Azure OpenAI API instance name and deployment name must be provided.');
  }
  
  return `https://${azureOpenAIApiInstanceName}.openai.azure.com/openai/deployments/${azureOpenAIApiDeploymentName}`;
};

/**
 * Sanitizes the model name to be used in the URL by removing or replacing disallowed characters.
 * @param {string} modelName - The model name to be sanitized.
 * @returns {string} The sanitized model name.
 */
const sanitizeModelName = (modelName) => {
  return modelName.replace(/\./g, '');
};

/**
 * Generates the Azure OpenAI API chat completion endpoint URL.
 * @param {AzureCredentials} credentials - The Azure credentials.
 * @returns {string} The complete chat completion endpoint URL for the Azure OpenAI API.
 */
const genAzureChatCompletion = (credentials) => {
  const { azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName, azureOpenAIApiVersion } = credentials;
  const endpoint = `${genAzureEndpoint({ azureOpenAIApiInstanceName, azureOpenAIApiDeploymentName })}/chat/completions?api-version=${azureOpenAIApiVersion}`;
  console.log(`Generated Endpoint: ${endpoint}`);
  return endpoint;
};

/**
 * Retrieves the Azure OpenAI API credentials from environment variables.
 * @returns {AzureCredentials} An object containing the Azure OpenAI API credentials.
 */
const getAzureCredentials = () => {
  const credentials = {
    azureOpenAIApiKey: process.env.AZURE_API_KEY,
    azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
    azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION,
  };

  if (!credentials.azureOpenAIApiKey || !credentials.azureOpenAIApiInstanceName || !credentials.azureOpenAIApiDeploymentName || !credentials.azureOpenAIApiVersion) {
    console.error('One or more environment variables are missing or invalid:', credentials);
    throw new Error('Invalid environment configuration.');
  }
  
  return credentials;
};

/**
 * Sends a chat message to the Azure OpenAI API using the provided credentials and message payload.
 * @param {Object} message - The message payload for the chat API.
 * @returns {Promise<Object>} The response from the Azure OpenAI API.
 */
const sendChatMessage = async (message) => {
  const credentials = getAzureCredentials();
  const endpoint = genAzureChatCompletion(credentials);

  try {
    const response = await axios.post(endpoint, message, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.azureOpenAIApiKey}`, // Updated to use Bearer token
      }
    });

    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending chat message:', error.response ? error.response.data : error.message);
    if (error.response) {
      console.error(error.response.data);
      console.error(error.response.status);
      console.error(error.response.headers);
    } else if (error.request) {
      console.error(error.request);
    } else {
      console.error('Error', error.message);
    }
    throw error;
  }
};

module.exports = {
  sanitizeModelName,
  genAzureEndpoint,
  genAzureChatCompletion,
  getAzureCredentials,
  sendChatMessage,
};
