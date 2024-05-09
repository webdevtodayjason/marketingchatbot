require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.use(bodyParser.json());

// Endpoint to handle chat requests
app.post('/chat', async (req, res) => {
  const { prompt, messages } = req.body;

  try {
    // Embedding conversation history using OpenAI's embeddings
    const conversationEmbeddings = messages.map(message =>
      openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: message.text,
      })
    );

    const embeddingsResponses = await Promise.all(conversationEmbeddings);
    const embeddings = embeddingsResponses.map(response => response.data.data[0].embedding);

    // Create a prompt with the conversation history
    const historyPrompt = messages.map(msg => `${msg.role}: ${msg.text}`).join('\n');
    const fullPrompt = `${historyPrompt}\n${prompt}`;

    // Call OpenAI to generate the response
    const chatResponse = await openai.createChatCompletion({
      model: "gpt-4.0-turbo",
      messages: messages.map(msg => ({ role: msg.role, content: msg.text })),
      max_tokens: 150,
    });

    res.json({ response: chatResponse.data.choices[0].message.content, embeddings });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing chat request');
  }
});

// Endpoint to submit user data to a CRM
app.post('/submit-crm', async (req, res) => {
  const { name, email, phone } = req.body;
  try {
    await axios.post(process.env.CRM_URL, { name, email, phone });
    res.send('Data submitted successfully');
  } catch (error) {
    console.error('Error submitting to CRM:', error);
    res.status(500).send('Error submitting data to CRM');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});