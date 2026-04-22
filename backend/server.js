import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import NodeCache from 'node-cache';

dotenv.config();

const cache = new NodeCache({ stdTTL: 86400 }); // Cache graphs for 24 hours

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PORT = process.env.PORT || 5000;

async function generateWithRetry(prompt, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        response_format: { type: 'json_object' }
      });
      // Groq returns the text inside choices[0].message.content
      return { text: response.choices[0].message.content };
    } catch (error) {
      if (error?.status === 503 && i < retries - 1) {
        console.warn(`503 High Demand detected. Retrying in ${1.5 * (i + 1)}s...`);
        await new Promise(resolve => setTimeout(resolve, 1500 * (i + 1)));
        continue;
      }
      throw error;
    }
  }
}

app.post('/api/explore', async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required' });
  }

  const cacheKey = `explore_${topic.toLowerCase().trim()}`;
  if (cache.has(cacheKey)) {
    console.log(`[CACHE HIT] Explore: ${topic}`);
    return res.json(cache.get(cacheKey));
  }

  try {
    const prompt = `
      Create a knowledge graph starting point for the topic: "${topic}".
      Return exactly 1 root node and 4-6 related concept nodes connected to it.

      JSON format required:
      {
        "nodes": [
          {"id": "Exact Topic Name", "title": "Display Title", "category": "science/history/art/etc", "description": "A 2-3 sentence engaging explanation.", "url": "https://en.wikipedia.org/wiki/..."}
        ],
        "links": [
          {"source": "Exact Topic Name", "target": "Related Concept Name", "label": "relationship (e.g. 'invented by', 'leads to')"}
        ]
      }
      Make sure the root node's id matches the source in links. Provide a highly relevant Wikipedia URL for each node if possible.
    `;

    const response = await generateWithRetry(prompt);

    const text = response.text;
    if (!text) throw new Error("Empty response from API");
    
    const parsedData = JSON.parse(text);
    cache.set(cacheKey, parsedData);
    console.log(`[CACHE MISS] Generated Explore: ${topic}`);
    
    res.json(parsedData);
  } catch (error) {
    console.error('Explore Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate graph' });
  }
});

app.post('/api/expand', async (req, res) => {
  const { node, existingConnections, existingNodeIds } = req.body;
  
  if (!node) {
    return res.status(400).json({ error: 'Node is required' });
  }

  const cacheKey = `expand_${node.id}_${(existingNodeIds || []).length}`;
  if (cache.has(cacheKey)) {
    console.log(`[CACHE HIT] Expand: ${node.id}`);
    return res.json(cache.get(cacheKey));
  }

  try {
    const prompt = `
      Expand the knowledge graph for the node: "${node.id}".
      It is already directly connected to: ${existingConnections?.join(', ') || ''}.
      The entire existing graph currently contains these nodes: ${existingNodeIds?.join(', ') || ''}.

      1. Generate 3-5 NEW, fascinating related concepts that are NOT in the existing graph.
      2. Create links from "${node.id}" to these new concepts.
      3. CRITICAL: Analyze the entire existing graph list. If any of your NEW concepts are strongly related to ANY OTHER existing nodes, create additional links between them to form a true, interconnected web instead of just a star pattern.

      JSON format required:
      {
        "nodes": [
          {"id": "New Concept 1", "title": "Display Title", "category": "science/history/art/etc", "description": "A 2-3 sentence engaging explanation.", "url": "https://en.wikipedia.org/wiki/..."}
        ],
        "links": [
          {"source": "${node.id}", "target": "New Concept 1", "label": "relationship description"},
          {"source": "New Concept 1", "target": "Some Other Existing Node", "label": "cross-link relationship"}
        ]
      }
      Provide a highly relevant Wikipedia URL for each new node if possible.
    `;

    const response = await generateWithRetry(prompt);

    const text = response.text;
    if (!text) throw new Error("Empty response from API");
    
    const parsedData = JSON.parse(text);
    cache.set(cacheKey, parsedData);
    console.log(`[CACHE MISS] Generated Expand: ${node.id}`);

    res.json(parsedData);
  } catch (error) {
    console.error('Expand Error:', error);
    res.status(500).json({ error: error.message || 'Failed to expand graph' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
