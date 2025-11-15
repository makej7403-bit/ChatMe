import { useState } from "react";
import { SERVER_URL } from "../config";

export default function ImageUploader({ token }) {
  const [image, setImage] = useState(null);
  const [reply, setReply] = useState("");

  async function upload() {
    if (!image) return;

    const formData = new FormData();
    formData.append("file", image);

    const res = await fetch(`${SERVER_URL}/api/ai/image`, {
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
        accept="image/*"
        onChange={(e) => setImage(e.target.files[0])}
        className="mb-2"
      />

      <button
        onClick={upload}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Image
      </button>

      {reply && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <strong>AI Response:</strong> {reply}
        </div>
      )}
    </div>
  );
}
