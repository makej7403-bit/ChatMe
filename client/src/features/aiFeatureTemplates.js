// client/src/features/aiFeatureTemplates.js

// Define all AI features here
const features = [
  { id: 'chat', title: 'Conversational Chat', defaultPrompt: 'Hello, tell me about yourself.' },
  { id: 'image', title: 'Image Analyzer', defaultPrompt: 'Upload an image and I will describe it.' },
  { id: 'document', title: 'Document Q&A', defaultPrompt: 'Upload a document and ask questions.' },
  { id: 'voice', title: 'Voice Understanding', defaultPrompt: 'Record your voice and I will interpret it.' },
  { id: 'livecall', title: 'Live AI Call', defaultPrompt: 'Start a live call with the AI.' },
  { id: 'math', title: 'Math Solver', defaultPrompt: 'Solve this math problem:' },
  { id: 'code', title: 'Code Generator', defaultPrompt: 'Generate code for:' },
  { id: 'translate', title: 'Language Translator', defaultPrompt: 'Translate this:' }
];

// Export only once
export default features;
