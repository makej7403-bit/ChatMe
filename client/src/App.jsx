import ImageUploader from './components/ImageUploader';
import DocumentUploader from './components/DocumentUploader';
import VoiceRecorder from './components/VoiceRecorder';
import LiveCall from './components/LiveCall';
import { API_BASE } from './config'; // create this file or inline API_BASE

// inside render:
<div className="grid grid-cols-2 gap-4">
  <ImageUploader apiBase={API_BASE} />
  <DocumentUploader apiBase={API_BASE} />
  <VoiceRecorder apiBase={API_BASE} />
  <LiveCall apiBase={API_BASE} />
</div>
