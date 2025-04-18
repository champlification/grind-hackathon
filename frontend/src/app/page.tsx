'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi';

// TODO: Import actual contract ABI and address
const SWEAR_JAR_ADDRESS = '0x...'; // Contract address will go here
const SWEAR_JAR_ABI = []; // Contract ABI will go here

export default function Home() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [showWithdrawSuccessPopup, setShowWithdrawSuccessPopup] = useState(false);
  
  // Contract read states
  const { data: depositedAmount = 0 } = useContractRead({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getDeposited',
    args: [address],
    watch: true,
    enabled: !!address,
  });

  const { data: burnedAmount = 0 } = useContractRead({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getBurned',
    args: [address],
    watch: true,
    enabled: !!address,
  });

  const { data: minWithdrawAmount = 10 } = useContractRead({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getMinWithdrawAmount',
    watch: true,
  });

  const { data: burnOdds = 10 } = useContractRead({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getBurnOdds',
    watch: true,
  });

  // Contract write functions
  const { write: deposit, data: depositData } = useContractWrite({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'deposit',
  });

  const { write: withdraw, data: withdrawData } = useContractWrite({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'withdraw',
  });

  // Transaction monitoring
  const { isSuccess: isDepositSuccess, isError: isDepositError } = useWaitForTransaction({
    hash: depositData?.hash,
  });

  const { isSuccess: isWithdrawSuccess } = useWaitForTransaction({
    hash: withdrawData?.hash,
  });

  // Handle deposit success/failure
  useEffect(() => {
    if (isDepositSuccess) {
      setShowSuccessPopup(true);
    }
    if (isDepositError) {
      setShowFailurePopup(true);
    }
  }, [isDepositSuccess, isDepositError]);

  // Handle withdraw success
  useEffect(() => {
    if (isWithdrawSuccess) {
      setShowWithdrawSuccessPopup(true);
    }
  }, [isWithdrawSuccess]);

  const handleDeposit = async () => {
    if (!isConnected) return;
    try {
      deposit({
        args: [amount],
      });
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) return;
    try {
      withdraw();
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] pointer-events-none"></div>

      {/* Header with Title and Wallet Button */}
      <div className="relative flex justify-between items-center px-6 py-6 z-10">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Swear</span>
          <span className="text-[#00FF8C]">Jar</span>
        </h1>
        <ConnectButton />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-88px)] p-4">
        <div className="w-full max-w-md space-y-8 bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#2A2A2A]">
          {/* Stats Display */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A]">
              <div className="text-sm text-[#CCCCCC] mb-1">Deposited</div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">{isConnected ? depositedAmount?.toString() : '0'}</span>
                <span className="ml-2 text-[#00FF8C]">$GRIND</span>
              </div>
              <div className="mt-2 text-xs text-[#CCCCCC]">
                {!isConnected ? (
                  "Connect wallet to deposit"
                ) : depositedAmount >= minWithdrawAmount ? (
                  <button
                    onClick={handleWithdraw}
                    className="w-full mt-2 px-4 py-2 bg-[#00FF8C] hover:bg-[#00CC70] text-black font-bold rounded-lg transition-colors"
                  >
                    Withdraw $GRIND
                  </button>
                ) : (
                  `Need ${(minWithdrawAmount - depositedAmount)?.toString()} more to withdraw`
                )}
              </div>
            </div>
            <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A]">
              <div className="text-sm text-[#CCCCCC] mb-1">Burned</div>
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-white">{isConnected ? burnedAmount?.toString() : '0'}</span>
                <span className="ml-2 text-[#FF3333]">$GRIND</span>
              </div>
              <div className="mt-2 text-xs text-[#FF3333]">
                Gone forever
              </div>
            </div>
          </div>

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
              className={`w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:outline-none focus:border-[#00FF8C] text-white transition-colors ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
              min="1"
              step="1"
              disabled={!isConnected}
            />
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="mb-4 text-lg font-medium text-[#00FF8C]">When you swear, deposit $GRIND tokens:</p>
            <ul className="space-y-2 text-[#CCCCCC]">
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>{100 - burnOdds}% chance it goes into your jar</span>
              </li>
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>{burnOdds}% chance it gets burned or donated</span>
              </li>
              <li className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                <span>Withdraw when you reach {minWithdrawAmount?.toString()} $GRIND</span>
              </li>
            </ul>
          </div>

          {/* Deposit Button */}
          <button
            onClick={handleDeposit}
            disabled={!isConnected}
            className={`w-64 h-64 bg-[#1A1A1A] text-[#FF3333] text-2xl font-bold rounded-full 
            shadow-[0_0_20px_rgba(255,51,51,0.2),inset_0_0_20px_rgba(255,51,51,0.1)] 
            border-2 border-[#FF3333] 
            transition-all duration-300 ease-in-out
            transform hover:scale-105 active:scale-95 
            flex items-center justify-center mx-auto 
            hover:border-[#FF5555] hover:shadow-[0_0_30px_rgba(255,51,51,0.3),inset_0_0_30px_rgba(255,51,51,0.2)] 
            group relative
            before:absolute before:inset-0 before:rounded-full before:shadow-[0_0_100px_20px_rgba(255,51,51,0.1)] before:z-[-1]
            ${!isConnected && 'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-[#1A1A1A] hover:border-[#FF3333] hover:shadow-[0_0_20px_rgba(255,51,51,0.2),inset_0_0_20px_rgba(255,51,51,0.1)]'}`}
          >
            <span className={`${isConnected ? 'group-hover:animate-pulse' : ''}`}>
              {isConnected ? 'Deposit $GRIND' : 'Connect Wallet'}
            </span>
          </button>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/GrindBurn04.gif"
              alt="Success Hamster"
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Your $GRIND was added to the jar!</p>
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

      {/* Withdraw Success Popup */}
      {showWithdrawSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/GrindRain01_GBG.gif"
              alt="Money Rain Hamster"
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Successfully withdrew your $GRIND!</p>
            <button
              onClick={() => setShowWithdrawSuccessPopup(false)}
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
