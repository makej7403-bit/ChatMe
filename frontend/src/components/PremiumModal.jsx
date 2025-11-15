export default function PremiumModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-80 p-6 rounded-xl shadow-xl">
        <h2 className="text-xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-gray-700 mb-4">
          Unlock all 80+ features, unlimited AI, and voice calls.
        </p>

        <p className="font-bold mb-4">Free Trial: $9.9 → auto-renew</p>

        <button
          className="bg-yellow-500 text-white w-full py-2 rounded mb-3"
        >
          Subscribe Now
        </button>

        <button
          onClick={onClose}
          className="bg-gray-300 w-full py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}
