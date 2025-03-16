# TRUTH SEEKER

A real-time fact-checking application that verifies the accuracy of information using advanced AI algorithms to combat misinformation in the digital age.



## Demo

[Watch Demo Video](https://drive.google.com/file/d/1ZALxg75qRG2zF5EfMRmO9S6nQQuH5Szp/view?usp=sharing)

## Features

- **Real-time Fact Verification**: Instantly analyze and verify statements against trusted sources
- **AI-Powered Analysis**: Leverages advanced natural language processing to evaluate factual accuracy
- **Verdict Classification**: Clear categorization (True, Partially True, False, Undetermined)
- **Detailed Explanations**: Comprehensive reasoning with supporting evidence
- **Correction Suggestions**: Accurate alternatives for misleading information
- **Responsive Design**: Seamless experience across all devices
- **Visual Indicators**: Color-coded verdicts for intuitive understanding
- **Markdown Support**: Rich text formatting in explanations
- **Animated UI**: Smooth transitions and loading states for enhanced UX

## Architecture

### System Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│  Express Server │────▶│  Perplexity AI  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       │                        │
        │                       │                        │
        └───────────────────────┴────────────────────────┘
                          Data Flow
```

### Project Structure

```
TRUTH SEEKER/
├── backend/
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── index.js
│   ├── package-lock.json
│   └── package.json
└── frontend/
    ├── node_modules/
    ├── public/
    ├── src/
    │   ├── assets/
    │   │   ├── correct.png
    │   │   └── videoplayback.webm
    │   ├── App.css
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── .gitignore
    │   ├── eslint.config.js
    │   ├── index.html
    │   ├── package-lock.json
    │   ├── package.json
    │   ├── README.md
    │   └── vite.config.js
```

## Technology Stack

### Backend
- **Node.js** with Express for robust API endpoints
- **Socket.IO** for real-time bidirectional communication
- **Perplexity AI API** for advanced fact-checking capabilities
- **HTTP server** with RESTful architecture

### Frontend
- **React.js** with Vite for optimized performance
- **ReactMarkdown** for rich text rendering
- **CSS3** with animations and transitions
- **ES6+** JavaScript features
- **Responsive Design** principles

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Perplexity AI API key

### Backend Setup
```bash
# Clone the repository
git clone https://github.com/yasharthbajpai/truth-seeker.git
cd truth-seeker/backend

# Install dependencies
npm install

# Create .env file with your API credentials
echo "PERPLEXITY_API_KEY=your_api_key_here" > .env
echo "PERPLEXITY_MODEL=pplx-70b-online" >> .env

# Start the server
npm start
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Usage

1. Enter a statement or claim in the input field
2. Click "Fact Check" or press Enter
3. The AI will analyze the information in real-time
4. Review the color-coded verdict, detailed explanation, and any corrections

## API Reference

### Endpoints

#### POST /api/fact-check
Verifies the accuracy of provided information.

**Request Body:**
```json
{
  "content": "Statement to fact-check"
}
```

**Response:**
```json
{
  "ok": true,
  "original": "Statement to fact-check",
  "factCheck": {
    "verdict": "True/False/Partially True/Undetermined",
    "explanation": "Detailed reasoning...",
    "corrections": "Any necessary corrections..."
  }
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

- [ ] Multi-language support
- [ ] Source citation in explanations
- [ ] User accounts and history
- [ ] Browser extension
- [ ] Mobile application
- [ ] API for third-party integration

## License

This project is licensed under the MIT License 

## Contact

Yasharth Bajpai - [@yasharthbajpai](https://yasharthbajpai.carrd.co/) 


---

Made with ❤️ by Yasharth Bajpai

© Copyright 2025 Yasharth Bajpai. All Rights Reserved.

