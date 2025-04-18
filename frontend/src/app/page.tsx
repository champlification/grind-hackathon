'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWatchContractEvent, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits, decodeEventLog } from 'viem';
import { SWEAR_JAR_ADDRESS, CUSS_TOKEN_ADDRESS } from '../config/addresses';
import { SWEAR_JAR_ABI } from '../config/abis';
import { ERC20_ABI } from '../config/abis';

// Utility function to format token amounts
const formatTokenAmount = (amount: bigint | undefined): string => {
  if (!amount) return '0';
  return Number(formatUnits(amount, 18)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Instructions Component
const Instructions = ({ cleanseOddsNum, minWithdrawAmount }: { cleanseOddsNum: number, minWithdrawAmount: bigint }) => {
  return (
    <div className="w-full max-w-md mx-auto mt-8 p-8 bg-[#1A1A1A] rounded-2xl shadow-xl border border-[#2A2A2A]">
      <div className="text-center">
        <p className="mb-4 text-lg font-medium text-[#00FF8C]">When you swear, deposit $CUSS tokens:</p>
        <ul className="space-y-2 text-[#CCCCCC]">
          <li className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
            <span>{100 - cleanseOddsNum}% chance it goes into your jar</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
            <span>{cleanseOddsNum}% chance it gets cleansed</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
            <span>Withdraw when you reach {formatTokenAmount(minWithdrawAmount)} $CUSS</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showFailurePopup, setShowFailurePopup] = useState(false);
  const [showWithdrawSuccessPopup, setShowWithdrawSuccessPopup] = useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [showBurnedPopup, setShowBurnedPopup] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [isPending, setIsPending] = useState(false);
  
  // Contract read states
  const { data: depositedAmount, refetch: refetchDeposited } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getDeposited',
    args: address ? [address] : undefined,
  });

  const { data: burnedAmount, refetch: refetchBurned } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getCleansed',
    args: address ? [address] : undefined,
  });

  const { data: minWithdrawAmount } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getMinWithdrawAmount',
  });

  const { data: cleanseOdds } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getCleanseOdds',
  });

  // Convert values for comparison
  const depositedAmountNum = depositedAmount ?? BigInt(0);
  const minWithdrawAmountNum = minWithdrawAmount ?? BigInt(0);
  const cleanseOddsNum = Number(cleanseOdds ?? BigInt(0));

  // Contract write functions
  const { writeContract: deposit, data: depositData, status: depositStatus } = useWriteContract();
  const { writeContract: withdraw, data: withdrawData, status: withdrawStatus } = useWriteContract();
  const { writeContract: approve, data: approveData, status: approveStatus } = useWriteContract();

  // Check token approval
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CUSS_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address ?? '0x0', SWEAR_JAR_ADDRESS],
  });

  // Watch for approval transaction
  const { isSuccess: isApproveConfirmed } = useWaitForTransactionReceipt({
    hash: approveData,
  });

  // Wait for deposit transaction receipt
  const { isSuccess: isDepositConfirmed } = useWaitForTransactionReceipt({
    hash: depositData,
  });

  const publicClient = usePublicClient();

  // Update approval status when allowance changes or approval confirms
  useEffect(() => {
    const checkApproval = async () => {
      if (!address || !amount || allowance === null || allowance === undefined) {
        setNeedsApproval(true);
        return;
      }

      try {
        const amountInWei = parseUnits(amount, 18);
        const currentAllowance = BigInt(allowance.toString());
        console.log('Checking approval:', {
          allowance: currentAllowance.toString(),
          required: amountInWei.toString()
        });
        setNeedsApproval(currentAllowance < amountInWei);
      } catch (error) {
        console.error('Error checking approval:', error);
        setNeedsApproval(true);
      }
    };

    // Only check approval if we have all required data
    if (address && amount && allowance !== undefined && allowance !== null) {
      checkApproval();
    }
  }, [address, allowance, amount, isApproveConfirmed]);

  // Refresh allowance after successful approval
  useEffect(() => {
    if (isApproveConfirmed) {
      refetchAllowance?.();
    }
  }, [isApproveConfirmed, refetchAllowance]);

  // Handle deposit success/failure
  useEffect(() => {
    if (depositStatus === 'success') {
      console.log('Deposit transaction submitted successfully. Transaction hash:', depositData);
      setShowProcessingPopup(true);
      // Don't show other popups here, we'll show them based on the event
      refetchDeposited?.();
      refetchBurned?.();
    }
    if (depositStatus === 'error') {
      console.log('Deposit transaction failed');
      setShowProcessingPopup(false);
      setShowFailurePopup(true);
    }
  }, [depositStatus, refetchDeposited, refetchBurned, depositData]);

  // Handle deposit confirmation
  useEffect(() => {
    if (isDepositConfirmed && depositData && publicClient) {
      console.log('Deposit transaction confirmed on chain. Hash:', depositData);
      console.log('Fetching transaction receipt...');
      
      const fetchReceipt = async () => {
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: depositData });
          console.log('Transaction receipt:', receipt);

          // Find relevant events in the logs
          const logs = receipt.logs.filter(log => 
            log.address.toLowerCase() === SWEAR_JAR_ADDRESS.toLowerCase()
          );

          if (logs.length === 0) {
            console.log('No events found in logs');
            setShowProcessingPopup(false);
            return;
          }

          console.log('Found logs:', logs);

          try {
            // Try to decode each log until we find our event
            for (const log of logs) {
              try {
                const decodedLog = decodeEventLog({
                  abi: SWEAR_JAR_ABI,
                  data: log.data,
                  topics: log.topics,
                });

                console.log('Decoded log:', decodedLog);

                // Check if this is a Deposited or TokensCleansed event
                if (decodedLog.eventName === 'Deposited') {
                  const args = decodedLog.args as {
                    user: string;
                    amount: bigint;
                    wasCleansed: boolean;
                  };

                  console.log('Deposit event data:', args);

                  // Update UI based on event data
                  setShowProcessingPopup(false);
                  if (args.wasCleansed) {
                    console.log('Tokens were cleansed, showing failure popup');
                    setShowFailurePopup(true);
                    setShowSuccessPopup(false);
                  } else {
                    console.log('Tokens were not cleansed, showing success popup');
                    setShowSuccessPopup(true);
                    setShowFailurePopup(false);
                  }
                  break;
                }
              } catch (decodeError) {
                console.log('Could not decode log as Deposited event:', decodeError);
                // Continue to next log
              }
            }

            // Refresh stats regardless of event type
            refetchDeposited?.();
            refetchBurned?.();

          } catch (error) {
            console.error('Error processing logs:', error);
            setShowProcessingPopup(false);
          }

        } catch (error) {
          console.error('Error processing transaction receipt:', error);
          setShowProcessingPopup(false);
        }
      };

      fetchReceipt();
    }
  }, [isDepositConfirmed, depositData, address, publicClient, refetchDeposited, refetchBurned]);

  // Add a timeout to hide processing popup if no event is received
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showProcessingPopup) {
      timeoutId = setTimeout(() => {
        console.log('No event received after 30 seconds, hiding processing popup');
        setShowProcessingPopup(false);
      }, 30000); // 30 seconds timeout
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showProcessingPopup]);

  // Handle withdraw success
  useEffect(() => {
    if (withdrawStatus === 'success') {
      console.log('Withdrawal transaction submitted successfully');
      setShowProcessingPopup(true);
    }
  }, [withdrawStatus]);

  // Handle withdraw confirmation
  const { isSuccess: isWithdrawConfirmed, data: withdrawReceiptData } = useWaitForTransactionReceipt({
    hash: withdrawData,
  });

  // Handle withdraw confirmation
  useEffect(() => {
    if (isWithdrawConfirmed && withdrawData && publicClient) {
      console.log('Withdraw transaction confirmed on chain. Hash:', withdrawData);
      
      const fetchReceipt = async () => {
        try {
          const receipt = await publicClient.getTransactionReceipt({ hash: withdrawData });
          console.log('Withdraw receipt:', receipt);

          // Find Withdrawn event in logs
          const withdrawLog = receipt.logs.find(log => 
            log.address.toLowerCase() === SWEAR_JAR_ADDRESS.toLowerCase()
          );

          if (withdrawLog) {
            try {
              const decodedLog = decodeEventLog({
                abi: SWEAR_JAR_ABI,
                data: withdrawLog.data,
                topics: withdrawLog.topics,
              });

              console.log('Decoded withdraw log:', decodedLog);

              if (decodedLog.eventName === 'Withdrawn') {
                // Update UI
                setShowProcessingPopup(false);
                setShowWithdrawSuccessPopup(true);
                
                // Refresh stats
                refetchDeposited?.();
                refetchBurned?.();
              }
            } catch (decodeError) {
              console.error('Error decoding withdraw event:', decodeError);
            }
          }

          // Even if we couldn't decode the event, still hide processing
          setShowProcessingPopup(false);

        } catch (error) {
          console.error('Error processing withdraw receipt:', error);
          setShowProcessingPopup(false);
        }
      };

      fetchReceipt();
    }
  }, [isWithdrawConfirmed, withdrawData, publicClient, refetchDeposited, refetchBurned]);

  // Update isPending state based on transaction status
  useEffect(() => {
    setIsPending(
      approveStatus === 'pending' || 
      depositStatus === 'pending' || 
      withdrawStatus === 'pending'
    );
  }, [approveStatus, depositStatus, withdrawStatus]);

  const handleApprove = async () => {
    if (!isConnected || !address) return;
    try {
      const amountInWei = parseUnits(amount, 18);
      console.log('Approving:', {
        token: CUSS_TOKEN_ADDRESS,
        spender: SWEAR_JAR_ADDRESS,
        amount: amountInWei.toString()
      });
      await approve({
        address: CUSS_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SWEAR_JAR_ADDRESS, amountInWei],
      });
    } catch (error) {
      console.error('Approval failed:', error);
    }
  };

  const handleDeposit = async () => {
    if (!isConnected || !address) return;
    
    if (needsApproval) {
      console.log('Needs approval, handling approve...');
      await handleApprove();
      return;
    }

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        console.error('Invalid amount');
        return;
      }
      
      const amountInWei = parseUnits(amount, 18);
      console.log('Depositing:', amountInWei.toString());
      
      await deposit({
        address: SWEAR_JAR_ADDRESS,
        abi: SWEAR_JAR_ABI,
        functionName: 'deposit',
        args: [amountInWei],
      });
    } catch (error) {
      console.error('Deposit failed:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!isConnected) return;
    try {
      await withdraw({
        address: SWEAR_JAR_ADDRESS,
        abi: SWEAR_JAR_ABI,
        functionName: 'withdraw',
      });
    } catch (error) {
      console.error('Withdrawal failed:', error);
    }
  };

  // Update the minWithdrawAmount comparison
  const needsMore = depositedAmountNum < minWithdrawAmountNum;
  const amountNeeded = needsMore ? minWithdrawAmountNum - depositedAmountNum : 0n;

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
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Main Card */}
          <div className="space-y-8 bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#2A2A2A]">
            {/* Stats Display */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A]">
                <div className="text-sm text-[#CCCCCC] mb-1">Deposited</div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">
                    {isConnected ? formatTokenAmount(depositedAmount) : '0'}
                  </span>
                  <span className="ml-2 text-[#00FF8C]">$CUSS</span>
                </div>
                <div className="mt-2 text-xs text-[#CCCCCC]">
                  {!isConnected ? (
                    "Connect wallet to deposit"
                  ) : depositedAmountNum >= minWithdrawAmountNum ? (
                    <button
                      onClick={handleWithdraw}
                      className="w-full mt-2 px-4 py-2 bg-[#00FF8C] hover:bg-[#00CC70] text-black font-bold rounded-lg transition-colors"
                    >
                      Withdraw $CUSS
                    </button>
                  ) : (
                    `Need ${formatTokenAmount(amountNeeded)} more to withdraw`
                  )}
                </div>
              </div>
              <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#2A2A2A]">
                <div className="text-sm text-[#CCCCCC] mb-1">Cleansed</div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-white">
                    {isConnected ? formatTokenAmount(burnedAmount) : '0'}
                  </span>
                  <span className="ml-2 text-[#FF3333]">$CUSS</span>
                </div>
                <div className="mt-2 text-xs text-[#FF3333]">
                  Gone forever
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="text-center">
              <label htmlFor="amount" className="block text-xl font-medium mb-2 text-[#00FF8C]">
                Amount of $CUSS to deposit
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => {
                  // Ensure non-negative numbers only
                  const value = e.target.value;
                  if (value === '' || Number(value) >= 0) {
                    setAmount(value);
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl bg-[#0A0A0A] border-2 border-[#2A2A2A] focus:outline-none focus:border-[#00FF8C] text-white transition-colors ${!isConnected && 'opacity-50 cursor-not-allowed'}`}
                min="0"
                step="0.01"
                placeholder="Enter amount"
                disabled={!isConnected}
              />
            </div>

            {/* Deposit Button */}
            <button
              onClick={handleDeposit}
              disabled={!isConnected || isPending}
              className={`w-32 h-32 bg-[#1A1A1A] text-[#FF3333] text-xl font-bold rounded-full 
              shadow-[0_0_20px_rgba(255,51,51,0.2),inset_0_0_20px_rgba(255,51,51,0.1)] 
              border-2 border-[#FF3333] 
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95 
              flex items-center justify-center mx-auto 
              hover:border-[#FF5555] hover:shadow-[0_0_30px_rgba(255,51,51,0.3),inset_0_0_30px_rgba(255,51,51,0.2)] 
              group relative
              before:absolute before:inset-0 before:rounded-full before:shadow-[0_0_100px_20px_rgba(255,51,51,0.1)] before:z-[-1]
              ${(!isConnected || isPending) && 'opacity-50 cursor-not-allowed hover:scale-100 hover:bg-[#1A1A1A] hover:border-[#FF3333] hover:shadow-[0_0_20px_rgba(255,51,51,0.2),inset_0_0_20px_rgba(255,51,51,0.1)]'}`}
            >
              <span className={`${isConnected ? 'group-hover:animate-pulse' : ''}`}>
                {!isConnected ? 'Connect Wallet' : 
                 isPending ? 'Processing...' :
                 needsApproval ? 'Approve $CUSS' : 'Deposit $CUSS'}
              </span>
            </button>
          </div>

          {/* Instructions Component */}
          <div className="bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#2A2A2A] flex items-center">
            <div className="text-center w-full">
              <p className="mb-4 text-lg font-medium text-[#00FF8C]">When you swear, deposit $CUSS tokens:</p>
              <ul className="space-y-2 text-[#CCCCCC]">
                <li className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                  <span>{100 - cleanseOddsNum}% chance it goes into your jar</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                  <span>{cleanseOddsNum}% chance it gets cleansed</span>
                </li>
                <li className="flex items-center justify-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-[#00FF8C]"></span>
                  <span>Withdraw when you reach {formatTokenAmount(minWithdrawAmount)} $CUSS</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Processing Popup */}
      {showProcessingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/GrindRain01_GBG.gif"
              alt="Processing"
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Processing your deposit...</p>
            <p className="text-[#CCCCCC] mb-4">Waiting for transaction confirmation</p>
            <div className="animate-pulse">
              <div className="h-2 w-2 bg-[#00FF8C] rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <img
              src="/static/GrindBurn04.gif"
              alt="Success Hamster"
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">
              Your $CUSS was added to the jar!
            </p>
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                // Refetch allowance to get the latest value
                refetchAllowance?.();
              }}
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
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">
              Oops! Your $CUSS was cleansed!
            </p>
            <button
              onClick={() => {
                setShowFailurePopup(false);
                // Refetch allowance to get the latest value
                refetchAllowance?.();
              }}
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
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Successfully withdrew your $CUSS!</p>
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
