import { useState } from "react";
import { SERVER_URL } from "../config";

export default function DocumentUploader({ token }) {
  const [file, setFile] = useState(null);
  const [reply, setReply] = useState("");

  async function upload() {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${SERVER_URL}/api/ai/document`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });

    const data = await res.json();
    setReply(data.reply);
  }

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-2"
      />

      <button
        onClick={upload}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Upload Document
      </button>

      {reply && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>AI Response:</strong> {reply}
        </div>
      )}
    </div>
  );
}
