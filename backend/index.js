import express from 'express';
import { createServer } from 'http';
import { Server as socketIO } from 'socket.io';
import { OpenAI } from 'openai';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const server = createServer(app);
const io = new socketIO(server);

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Perplexity API client
const perplexity = new OpenAI({
  apiKey: process.env.PERPLEXITY_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

// Function to clean text and remove citations
function cleanText(text) {
  // Remove citations like [1][2]
  return text.replace(/\[\d+\](?:\[\d+\])*/g, '').trim();
}

// Function to parse fact-checking response
function parseFactCheckResponse(text) {
  try {
    // Try to parse as JSON first
    try {
      const jsonResponse = JSON.parse(text);
      if (jsonResponse.verdict && jsonResponse.explanation && jsonResponse.corrections) {
        return {
          verdict: cleanText(jsonResponse.verdict),
          explanation: cleanText(jsonResponse.explanation),
          corrections: cleanText(jsonResponse.corrections)
        };
      }
    } catch (e) {
      // Not JSON, continue with regex parsing
    }
    
    // Check if the response already has the expected format
    if (text.includes("VERDICT:") && text.includes("EXPLANATION:") && text.includes("CORRECTIONS:")) {
      const verdictMatch = text.match(/VERDICT:(.*?)(?=EXPLANATION:|$)/s);
      const explanationMatch = text.match(/EXPLANATION:(.*?)(?=CORRECTIONS:|$)/s);
      const correctionsMatch = text.match(/CORRECTIONS:(.*?)(?=$)/s);
      
      return {
        verdict: verdictMatch ? cleanText(verdictMatch[1].trim()) : "Undetermined",
        explanation: explanationMatch ? cleanText(explanationMatch[1].trim()) : cleanText(text),
        corrections: correctionsMatch ? cleanText(correctionsMatch[1].trim()) : "No corrections provided."
      };
    }
    
    // If all else fails, use a simple heuristic approach
    if (text.toLowerCase().includes("true") || text.toLowerCase().includes("accurate") || 
        text.toLowerCase().includes("correct") || text.toLowerCase().includes("factual")) {
      
      const firstParagraph = text.split('\n\n')[0];
      const lastParagraph = text.split('\n\n').pop();
      
      return {
        verdict: "Likely True",
        explanation: cleanText(text.substring(0, text.length - lastParagraph.length).trim()),
        corrections: "No corrections needed."
      };
    } else if (text.toLowerCase().includes("false") || text.toLowerCase().includes("inaccurate") || 
               text.toLowerCase().includes("incorrect") || text.toLowerCase().includes("misleading")) {
      
      const firstParagraph = text.split('\n\n')[0];
      const lastParagraph = text.split('\n\n').pop();
      
      return {
        verdict: "Likely False",
        explanation: cleanText(firstParagraph),
        corrections: cleanText(text.substring(firstParagraph.length).trim())
      };
    } else {
      return {
        verdict: "Undetermined",
        explanation: cleanText(text),
        corrections: "Unable to determine specific corrections."
      };
    }
  } catch (error) {
    console.error("Error parsing fact-check response:", error);
    return {
      verdict: "Error",
      explanation: cleanText(text),
      corrections: "Error parsing the fact-check response."
    };
  }
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoint for fact-checking
app.post('/api/fact-check', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        ok: false,
        error: 'Missing required field: content'
      });
    }

    const response = await perplexity.chat.completions.create({
      model: process.env.PERPLEXITY_MODEL ,
      messages: [
        { 
          role: 'system', 
          content: 'You are a fact-checking assistant. Your job is to verify the accuracy of the given information and provide a clear verdict. Structure your response in three parts:\n\n1. A clear verdict (True, Partially True, False, or Undetermined)\n2. A detailed explanation of your reasoning\n3. Any necessary corrections to the information\n\nFormat your response exactly as follows:\n\nVERDICT: [your verdict here]\n\nEXPLANATION: [your detailed explanation]\n\nCORRECTIONS: [any corrections to the information]' 
        },
        { role: 'user', content: `Please fact-check the following information: ${content}` }
      ],
      max_tokens: 1024
    });

    const rawContent = response.choices[0].message.content;
    const parsedResponse = parseFactCheckResponse(rawContent);

    res.json({
      ok: true,
      original: content,
      factCheck: parsedResponse
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      ok: false,
      error: 'An error occurred while processing your request'
    });
  }
});

// Socket.IO implementation for real-time fact-checking
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('fact check', async (content) => {
    try {
      const response = await perplexity.chat.completions.create({
        model: process.env.PERPLEXITY_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a fact-checking assistant. Your job is to verify the accuracy of the given information and provide a clear verdict. Structure your response in three parts:\n\n1. A clear verdict (True, Partially True, False, or Undetermined)\n2. A detailed explanation of your reasoning\n3. Any necessary corrections to the information\n\nFormat your response exactly as follows:\n\nVERDICT: [your verdict here]\n\nEXPLANATION: [your detailed explanation]\n\nCORRECTIONS: [any corrections to the information]' 
          },
          { role: 'user', content: `Please fact-check the following information: ${content}` }
        ],
        max_tokens: 1024
      });

      const rawContent = response.choices[0].message.content;
      const parsedResponse = parseFactCheckResponse(rawContent);

      io.emit('user content', {
        content: content
      });

      io.emit('fact check result', {
        original: content,
        verdict: parsedResponse.verdict,
        explanation: parsedResponse.explanation,
        corrections: parsedResponse.corrections
      });
    } catch (error) {
      console.error('Error:', error);
      io.emit('error', 'An error occurred while processing your request');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
