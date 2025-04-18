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
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] pointer-events-none"></div>

      {/* Wallet Connect Button */}
      <div className="absolute top-6 right-6 p-2 z-10">
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md space-y-8 bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#2A2A2A]">
          {/* Amount Input */}
          <div className="text-center">
            <label htmlFor="amount" className="block text-xl font-medium mb-2 text-[#00FF8C]">
              Amount of $GRIND to deposit
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:outline-none focus:border-[#00FF8C] text-white transition-colors"
              min="1"
              step="1"
            />
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            className="w-64 h-64 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-2xl font-bold rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center mx-auto"
          >
            Deposit $GRIND
          </button>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-lg font-medium text-[#00FF8C]">When you swear, deposit $GRIND tokens:</p>
            <ul className="space-y-2 text-[#CCCCCC]">
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>90% chance it goes into your jar</span>
              </li>
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>10% chance it gets burned or donated</span>
              </li>
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>Withdraw when you reach the minimum amount</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/hamster-dance.gif"
              alt="Dancing Hamster"
              className="mx-auto mb-4 rounded-xl"
            />
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Failure Popup */}
      {showFailurePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/GrindBozo01_GBG.gif"
              alt="Grind Bozo"
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Oops! Your $GRIND was burned!</p>
            <button
              onClick={() => setShowFailurePopup(false)}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
