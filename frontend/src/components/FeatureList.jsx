import features from "../features/aiFeatureTemplates";

export default function FeatureList() {
  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">AI Features</h2>

      <ul className="space-y-2">
        {features.map((f, idx) => (
          <li
            key={idx}
            className="p-3 bg-gray-100 rounded-lg shadow text-gray-800"
          >
            {f}
          </li>
        ))}
      </ul>
    </div>
  );
}
