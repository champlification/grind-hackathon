'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState } from 'react';

export default function Home() {
  const [amount, setAmount] = useState('1');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);

  const handleDeposit = async () => {
    // TODO: Implement contract interaction
    const random = Math.random();
    if (random < 0.1) {
      setShowFailurePopup(true);
    } else {
      setShowSuccessPopup(true);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Wallet Connect Button */}
      <div className="absolute top-4 right-4">
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8">
          {/* Amount Input */}
          <div className="text-center">
            <label htmlFor="amount" className="block text-lg font-medium mb-2">
              Amount of $GRIND to deposit
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              min="1"
              step="1"
            />
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-lg transition-colors"
          >
            Deposit $GRIND
          </button>

          {/* Instructions */}
          <div className="mt-8 text-center text-gray-400">
            <p className="mb-2">When you swear, deposit $GRIND tokens:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>90% chance it goes into your jar</li>
              <li>10% chance it gets burned or donated</li>
              <li>Withdraw when you reach the minimum amount</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/static/hamster-dance.gif"
              alt="Dancing Hamster"
              className="mx-auto mb-4"
            />
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Failure Popup */}
      {showFailurePopup && (
        <div className="fixed inset-0 bg-red-500 bg-opacity-90 flex items-center justify-center">
          <div className="text-center">
            <img
              src="/static/GrindBozo01_GBG.gif"
              alt="Grind Bozo"
              className="mx-auto mb-4"
            />
            <p className="text-2xl font-bold mb-4">Oops! Your $GRIND was burned!</p>
            <button
              onClick={() => setShowFailurePopup(false)}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
