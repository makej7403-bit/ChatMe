export default function MainMenu({ onSelect }) {
  const items = [
    { name: "Chat AI", value: "chat" },
    { name: "Upload Image", value: "image" },
    { name: "Upload Document", value: "doc" },
    { name: "Voice Recorder", value: "voice" },
    { name: "Live Call", value: "call" },
    { name: "Premium", value: "premium" }
  ];

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {items.map((item) => (
        <button
          key={item.value}
          className="p-4 bg-blue-100 hover:bg-blue-200 rounded-xl shadow text-center"
          onClick={() => onSelect(item.value)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}
