// client/src/features/aiFeatureTemplates.js

// Define the features ONLY ONCE — DO NOT redeclare it
const features = [
  { id: 'chat', title: 'Conversational Chat', defaultPrompt: 'Hello, tell me about yourself.' },
  { id: 'image', title: 'Image Analyzer', defaultPrompt: 'Upload an image and I will describe it.' },
  { id: 'document', title: 'Document Q&A', defaultPrompt: 'Upload a document and ask questions.' },
  { id: 'voice', title: 'Voice Message Understanding', defaultPrompt: 'Record your voice and I will interpret it.' },
  { id: 'livecall', title: 'Live AI Call', defaultPrompt: 'Start a live call with the AI.' },
  { id: 'math', title: 'Math Solver', defaultPrompt: 'Solve this math problem: ' },
  { id: 'code', title: 'Code Generator', defaultPrompt: 'Generate code for: ' },
  { id: 'translate', title: 'Language Translator', defaultPrompt: 'Translate this text to English: ' },
  { id: 'email', title: 'Email Writer', defaultPrompt: 'Write an email about: ' },
  { id: 'story', title: 'Story Writer', defaultPrompt: 'Write a creative story about: ' },
  { id: 'study', title: 'Study Helper', defaultPrompt: 'Explain this concept: ' }
  // Add all your remaining features here without redefining the variable
];

// Export it correctly
export default features;
