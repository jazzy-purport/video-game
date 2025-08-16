# Detective Interrogation Game

A 3D detective game built with Three.js where you interrogate suspects to solve a murder case.

## Features

- 3D interrogation room with realistic cinderblock walls and one-way mirror
- Three unique suspects with AI-powered responses
- Emotion system with facial expressions
- Dynamic speech bubbles in 3D space
- Victory conditions based on extracting confessions

## Local Development

1. Start a local web server:
   ```bash
   python3 -m http.server 8000
   ```

2. Open http://localhost:8000 in your browser

## Vercel Deployment

### Setup

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Set your OpenAI API key as an environment variable in Vercel:
   ```bash
   vercel env add OPENAI_API_KEY
   ```
   Enter your OpenAI API key when prompted.

3. Deploy:
   ```bash
   vercel
   ```

### Environment Variables

For production deployment, set the following environment variable in your Vercel dashboard:

- `OPENAI_API_KEY`: Your OpenAI API key

The API key is kept secure on the server-side and never exposed to the client.

## Architecture

- **Frontend**: Vanilla JS with Three.js for 3D rendering
- **Backend**: Vercel serverless function (`/api/chat.js`) for OpenAI API calls
- **LLM Integration**: OpenAI GPT-3.5-turbo for character responses

## Characters

- **Elena Rodriguez**: Gallery assistant (innocent)
- **Dr. James Hartwell**: Physician and art collector (culprit)
- **Marcus Webb**: Security guard (red herring)

Each character has detailed knowledge profiles and responds differently based on their role in the murder case.