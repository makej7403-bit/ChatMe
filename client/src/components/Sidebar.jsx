// client/src/components/Sidebar.jsx
export default function Sidebar() {
  return (
    <div className="w-[260px] h-full bg-white border-r px-4 py-6 flex flex-col">
      <h1 className="text-xl font-bold mb-6">ChatMe Pro</h1>

      <nav className="flex flex-col gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Conversational Chat</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Image Analyzer</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Document Q&A</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Voice Understanding</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Live AI Call</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Math Solver</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Code Generator</button>
        <button className="p-2 hover:bg-gray-100 rounded-lg text-left">Language Translator</button>
      </nav>

      <div className="mt-auto pt-6 border-t">
        <button className="w-full bg-black text-white py-2 rounded-xl">
          Upgrade to Pro
        </button>
      </div>
    </div>
  );
}
