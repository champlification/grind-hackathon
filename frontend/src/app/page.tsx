'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { formatUnits, parseUnits, decodeEventLog } from 'viem';
import { SWEAR_JAR_ADDRESS, CUSS_TOKEN_ADDRESS } from '../config/addresses';
import { SWEAR_JAR_ABI } from '../config/abis';
import { ERC20_ABI } from '../config/abis';
import Image from 'next/image';

// Add ProcessingMessage enum
type ProcessingMessageType = 
  | 'INITIAL'
  | 'APPROVAL_REQUESTED'
  | 'APPROVAL_PENDING'
  | 'APPROVAL_CONFIRMED'
  | 'DEPOSIT_REQUESTED'
  | 'DEPOSIT_PENDING';

const PROCESSING_MESSAGES: Record<ProcessingMessageType, string> = {
  INITIAL: 'Processing your transaction...',
  APPROVAL_REQUESTED: 'Please approve tokens in your wallet...',
  APPROVAL_PENDING: 'Waiting for approval confirmation...',
  APPROVAL_CONFIRMED: 'Approval confirmed, please confirm deposit in your wallet...',
  DEPOSIT_REQUESTED: 'Please confirm deposit in your wallet...',
  DEPOSIT_PENDING: 'Waiting for deposit confirmation...',
};

// Add type for user stats
type UserStats = {
  address: string;
  depositedAmount: bigint;
  cleansedAmount: bigint;
  mercyCount: bigint;
  mercyAmount: bigint;
};

// Instructions Component
const Instructions = ({ 
  cleanseOddsNum, 
  minWithdrawAmount,
  mercyPercentage,
  burnRatio
}: { 
  cleanseOddsNum: number, 
  minWithdrawAmount: bigint | undefined,
  mercyPercentage: number,
  burnRatio: number
}) => {
  const minAmount = minWithdrawAmount ?? BigInt(10) * BigInt(10**18); // Default 10 tokens if undefined
  
  return (
    <div className="w-full">
      <div className="text-left">
        <h1 className="text-2xl font-bold mb-2 text-[#00FF8C]">Fully On-Chain Gamified Swear Jar</h1>
        <p className="mb-6 text-[#CCCCCC]">
          Trying to stop swearing or break a habit? Put some $CUSS in the swear jar each time you swear or perform the bad habit.
        </p>
        
        <h2 className="text-xl font-semibold mb-3 text-[#00FF8C]">How it works</h2>
        <ul className="space-y-3 text-[#CCCCCC]">
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-[#00FF8C] flex-shrink-0"></span>
            <span>Choose the amount of $CUSS to send</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-[#00FF8C] flex-shrink-0"></span>
            <span>Click the $GRIND Hamster to put $CUSS in the Swear Jar</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-[#00FF8C] flex-shrink-0"></span>
            <span>After you&apos;ve put {formatTokenAmount(minAmount)}+ $CUSS in the swear jar, you can withdraw</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-[#00FF8C] flex-shrink-0"></span>
            <span>There&apos;s a {cleanseOddsNum}% chance your $CUSS gets Cleansed (You lose it)
              <br />
              <span className="text-sm opacity-75">
                Helps incentivize you to stop swearing
                <br />
                When Cleansed: {burnRatio}% of tokens are burned forever
              </span>
            </span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-2 h-2 mt-2 rounded-full bg-[#00FF8C] flex-shrink-0"></span>
            <span>There&apos;s a small chance you will be granted Mercy
              <br />
              <span className="text-sm opacity-75">{mercyPercentage}% of your total Cleansed $CUSS will be returned to you</span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

// Utility function to format token amounts
const formatTokenAmount = (amount: bigint | undefined): string => {
  if (!amount) return '0';
  return Number(formatUnits(amount, 18)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
};

// Add Leaderboard Component after Instructions Component
const LeaderboardPanel = ({ 
  title, 
  data,
  valueFormatter = (val: bigint) => formatTokenAmount(val),
  isLoading = false
}: { 
  title: string;
  data: { address: string; value: bigint }[];
  valueFormatter?: (val: bigint) => string;
  isLoading?: boolean;
}) => {
  return (
    <div className="bg-[#1A1A1A] rounded-2xl p-6 shadow-xl border border-[#2A2A2A]">
      <h2 className="text-xl font-bold mb-4 text-[#00FF8C]">{title}</h2>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-[#2A2A2A] rounded-lg"></div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="text-center text-[#CCCCCC] py-4">
          No data available yet
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-[#0A0A0A] rounded-lg border border-[#2A2A2A]">
              <div className="flex items-center space-x-3">
                <span className="text-[#00FF8C] font-bold">#{index + 1}</span>
                <span className="font-mono text-sm text-[#CCCCCC]">
                  {item.address.slice(0, 6)}...{item.address.slice(-4)}
                </span>
              </div>
              <span className="font-bold text-white">{valueFormatter(item.value)} $CUSS</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('1');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showCleansedPopup, setShowCleansedPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showWithdrawSuccessPopup, setShowWithdrawSuccessPopup] = useState(false);
  const [showProcessingPopup, setShowProcessingPopup] = useState(false);
  const [showMercyPopup, setShowMercyPopup] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTransacting, setIsTransacting] = useState(false);
  const [currentTransactionType, setCurrentTransactionType] = useState<'approval' | 'deposit' | null>(null);
  
  // Contract read states - only enabled when connected
  const { data: depositedAmount, refetch: refetchDeposited } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getDeposited',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
    }
  });

  const { data: cleansedAmount, refetch: refetchCleansed } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getCleansed',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && isConnected),
    }
  });

  // Static contract reads - no wallet needed
  const { data: minWithdrawAmount } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getMinWithdrawAmount',
    query: {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
    }
  });

  const { data: cleanseOdds } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getCleanseOdds',
    query: {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
    }
  });

  const { data: mercyPercentage } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getMercyPercentage',
    query: {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
    }
  });

  const { data: burnRatio } = useReadContract({
    address: SWEAR_JAR_ADDRESS,
    abi: SWEAR_JAR_ABI,
    functionName: 'getBurnRatio',
    query: {
      staleTime: 1000 * 60 * 60, // Cache for 1 hour
    }
  });

  // Check token approval - only when needed
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: CUSS_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address ?? '0x0', SWEAR_JAR_ADDRESS],
    query: {
      enabled: Boolean(address && isConnected && amount && !isNaN(parseFloat(amount))),
    }
  });

  // Contract write functions
  const { writeContractAsync: approve } = useWriteContract();
  const { writeContractAsync: deposit } = useWriteContract();
  const { writeContractAsync: withdraw } = useWriteContract();
  const [depositStatus, setDepositStatus] = useState('idle');
  const [withdrawStatus, setWithdrawStatus] = useState('idle');
  const [approveStatus, setApproveStatus] = useState('idle');
  const [currentTxHash, setCurrentTxHash] = useState<`0x${string}` | undefined>(undefined);

  // Wait for transaction receipt
  const { isSuccess: isTransactionConfirmed } = useWaitForTransactionReceipt({
    hash: currentTxHash,
  });

  const publicClient = usePublicClient();

  // Add a state for the processing message
  const [processingMessage, setProcessingMessage] = useState(PROCESSING_MESSAGES.INITIAL);

  // Add state for processing GIF selection
  const [processingGif, setProcessingGif] = useState('/static/GrindWen01_GBG.gif');
  const processingGifs = ['/static/GrindWen01_GBG.gif', '/static/GrindSwing.gif'];

  // Add state for leaderboard data
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Update approval status when allowance changes or amount changes
  useEffect(() => {
    const checkApproval = async () => {
      if (!address || !amount || allowance === undefined || allowance === null) {
        return;
      }

      try {
        const amountInWei = parseUnits(amount, 18);
        const currentAllowance = BigInt(allowance.toString());
        
        console.log('Checking approval:', {
          currentAllowance: currentAllowance.toString(),
          amountInWei: amountInWei.toString()
        });
        
        setIsPending(false);
      } catch (error) {
        console.error('Error checking approval:', error);
      }
    };

    checkApproval();
  }, [address, allowance, amount]);

  // Reset UI state when amount changes
  useEffect(() => {
    setShowSuccessPopup(false);
    setShowCleansedPopup(false);
    setShowProcessingPopup(false);
    setIsTransacting(false);
    setCurrentTransactionType(null);
  }, [amount]);

  // Update resetAllPopups to also reset currentTxHash and processing GIF
  const resetAllPopups = () => {
    setShowSuccessPopup(false);
    setShowCleansedPopup(false);
    setShowErrorPopup(false);
    setShowWithdrawSuccessPopup(false);
    setShowProcessingPopup(false);
    setShowMercyPopup(false);
    setIsTransacting(false);
    setCurrentTransactionType(null);
    setProcessingMessage(PROCESSING_MESSAGES.INITIAL);
    setCurrentTxHash(undefined);  // Reset the transaction hash
    // Select random GIF for next time
    setProcessingGif(processingGifs[Math.floor(Math.random() * processingGifs.length)]);
    // Refresh allowance
    refetchAllowance?.();
  };

  // Update the transaction receipt effect
  useEffect(() => {
    if (!isTransactionConfirmed || !currentTxHash || !publicClient || !currentTransactionType) {
      return;
    }

    const fetchReceipt = async () => {
      try {
        const receipt = await publicClient.getTransactionReceipt({ 
          hash: currentTxHash 
        });

        // Only process events for deposit transactions
        if (currentTransactionType !== 'deposit') {
          return;
        }

        // Find relevant events in the logs
        const logs = receipt.logs.filter(log => 
          log.address.toLowerCase() === SWEAR_JAR_ADDRESS.toLowerCase()
        );

        if (logs.length === 0) {
          if (!isTransacting) {
            setShowProcessingPopup(false);
          }
          return;
        }

        let foundEvent = false;
        let wasTokenCleansed = false;
        let mercyGranted = false;

        // Try to decode each log
        for (const log of logs) {
          try {
            const event = decodeEventLog({
              abi: SWEAR_JAR_ABI,
              data: log.data,
              topics: log.topics,
            }) as { 
              eventName: string; 
              args: { user?: `0x${string}`; amount?: bigint; wasCleansed?: boolean; }
            };

            console.log('Processing event:', {
              eventName: event.eventName,
              args: event.args,
              currentTxHash,
              currentTransactionType
            });

            // Only process if it's for the current user
            const isCurrentUser = event.args.user?.toLowerCase() === address?.toLowerCase();
            if (!isCurrentUser) continue;

            foundEvent = true;

            switch (event.eventName) {
              case 'Deposited':
                wasTokenCleansed = event.args.wasCleansed ?? false;
                break;

              case 'TokensCleansed':
                wasTokenCleansed = true;
                break;

              case 'MercyGranted':
                mercyGranted = true;
                break;
            }

          } catch (error) {
            console.log('Skipping unrecognized event:', error);
            continue;
          }
        }

        // After processing all events, determine final state
        if (foundEvent) {
          setShowProcessingPopup(false);
          setIsTransacting(false);
          setCurrentTransactionType(null);
          setCurrentTxHash(undefined);  // Reset the transaction hash after processing
          
          if (wasTokenCleansed) {
            if (mercyGranted) {
              setShowMercyPopup(true);
              setShowCleansedPopup(false);
              setShowSuccessPopup(false);
            } else {
              setShowCleansedPopup(true);
              setShowSuccessPopup(false);
              setShowMercyPopup(false);
            }
          } else {
            setShowSuccessPopup(true);
            setShowCleansedPopup(false);
            setShowMercyPopup(false);
          }
        }

        // Update stats regardless of outcome
        refetchDeposited?.();
        refetchCleansed?.();
        refetchAllowance?.();

      } catch (error) {
        console.error('Error processing receipt:', error);
        if (!isTransacting) {
          setShowProcessingPopup(false);
        }
        setCurrentTransactionType(null);
        setCurrentTxHash(undefined);  // Reset the transaction hash on error
      }
    };

    fetchReceipt();
  }, [isTransactionConfirmed, currentTxHash, publicClient, currentTransactionType, address, isTransacting, refetchDeposited, refetchCleansed, refetchAllowance]);

  // Update isPending state based on transaction status
  useEffect(() => {
    setIsPending(
      approveStatus === 'pending' || 
      depositStatus === 'pending' || 
      withdrawStatus === 'pending'
    );
  }, [approveStatus, depositStatus, withdrawStatus]);

  // Update handleTokenApproval
  const handleTokenApproval = async (amountInWei: bigint): Promise<void> => {
    if (!address || !publicClient) throw new Error('No address or public client');

    console.log('Approval needed, approving tokens...', {
      currentAllowance: allowance?.toString() || '0',
      amountInWei: amountInWei.toString()
    });
    
    try {
      setApproveStatus('pending');
      setProcessingMessage(PROCESSING_MESSAGES.APPROVAL_REQUESTED);
      setCurrentTransactionType('approval');
      
      // Submit approval transaction
      const hash = await approve({
        address: CUSS_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [SWEAR_JAR_ADDRESS, amountInWei],
      });

      setCurrentTxHash(hash);
      setProcessingMessage(PROCESSING_MESSAGES.APPROVAL_PENDING);

      // Wait for approval transaction to be mined
      const approvalReceipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000
      });

      if (approvalReceipt.status !== 'success') {
        throw new Error('Approval transaction failed');
      }

      setApproveStatus('success');
      setProcessingMessage(PROCESSING_MESSAGES.APPROVAL_CONFIRMED);

      // Wait for chain to update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh allowance
      await refetchAllowance?.();
      
      // Verify the allowance was updated
      const updatedAllowance = await publicClient.readContract({
        address: CUSS_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: [address, SWEAR_JAR_ADDRESS],
      }) as bigint;

      if (updatedAllowance < amountInWei) {
        throw new Error('Allowance not updated after approval');
      }
    } catch (error) {
      console.error('Approval error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to approve tokens');
      setShowErrorPopup(true);
      setIsTransacting(false);
      setCurrentTransactionType(null);
    }
  };

  // Update handleTokenDeposit
  const handleTokenDeposit = async (amountInWei: bigint): Promise<void> => {
    if (!address || !publicClient) throw new Error('No address or public client');

    console.log('Depositing:', amountInWei.toString());
    setDepositStatus('pending');
    setProcessingMessage(PROCESSING_MESSAGES.DEPOSIT_REQUESTED);
    setCurrentTransactionType('deposit');
    
    const hash = await deposit({
      address: SWEAR_JAR_ADDRESS,
      abi: SWEAR_JAR_ABI,
      functionName: 'deposit',
      args: [amountInWei],
    });

    setCurrentTxHash(hash);
    setProcessingMessage(PROCESSING_MESSAGES.DEPOSIT_PENDING);
    
    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash,
      timeout: 60_000
    });

    if (receipt.status !== 'success') {
      throw new Error('Deposit transaction failed');
    }

    setDepositStatus('success');
    // Let the event handler manage popups and UI updates
  };

  // Update handleDeposit
  const handleDeposit = async () => {
    if (!isConnected || !address || !publicClient) return;

    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount)) {
        console.error('Invalid amount');
        return;
      }
      
      const amountInWei = parseUnits(amount, 18);
      
      // Reset all UI states before starting new deposit
      resetAllPopups();
      
      // Select random GIF before showing popup
      setProcessingGif(processingGifs[Math.floor(Math.random() * processingGifs.length)]);
      
      setIsTransacting(true);
      setShowProcessingPopup(true);
      setProcessingMessage(PROCESSING_MESSAGES.INITIAL);

      // Check if approval is needed
      const currentAllowance = allowance ? BigInt(allowance.toString()) : 0n;
      if (currentAllowance < amountInWei) {
        await handleTokenApproval(amountInWei);
      }

      // Proceed with deposit
      await handleTokenDeposit(amountInWei);

    } catch (error) {
      console.error('Deposit error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to deposit tokens');
      setDepositStatus('error');
      setShowErrorPopup(true);
      setIsTransacting(false);
      setCurrentTransactionType(null);
    }
  };

  // Handle withdraw
  const handleWithdraw = async () => {
    if (!isConnected || !publicClient) return;
    try {
      setWithdrawStatus('pending');
      setShowProcessingPopup(true);
      
      const hash = await withdraw({
        address: SWEAR_JAR_ADDRESS,
        abi: SWEAR_JAR_ABI,
        functionName: 'withdraw',
      });

      setCurrentTxHash(hash);
      setWithdrawStatus('success');
      
      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ 
        hash,
        timeout: 60_000
      });

      if (receipt.status === 'success') {
        setShowProcessingPopup(false);
        setShowWithdrawSuccessPopup(true);
        refetchDeposited?.();
        refetchCleansed?.();
      }
    } catch (error) {
      console.error('Withdrawal failed:', error);
      setWithdrawStatus('error');
      setShowProcessingPopup(false);
      setShowErrorPopup(true);
      setErrorMessage('Failed to withdraw tokens. Please try again.');
    }
  };

  // Convert values for comparison with safe defaults
  const depositedAmountNum = depositedAmount ?? BigInt(0);
  const minWithdrawAmountNum = minWithdrawAmount ?? BigInt(10) * BigInt(10**18); // Default 10 tokens
  const cleanseOddsNum = Number(cleanseOdds ?? BigInt(10)); // Default 10%
  const mercyPercentageNum = Number(mercyPercentage ?? BigInt(50)); // Default 50%
  const burnRatioNum = Number(burnRatio ?? BigInt(50)); // Default 50%
  const needsMore = depositedAmountNum < minWithdrawAmountNum;
  const amountNeeded = needsMore ? minWithdrawAmountNum - depositedAmountNum : 0n;

  // Add effect to fetch user stats
  useEffect(() => {
    const fetchUserStats = async () => {
      if (!publicClient) return;

      try {
        setIsLoadingStats(true);

        // Update the event filtering to properly type check and handle errors
        const logs = await publicClient.getLogs({
          address: SWEAR_JAR_ADDRESS as `0x${string}`,
          fromBlock: BigInt(0),
          toBlock: 'latest'
        });

        // Filter for Deposited events and extract unique addresses
        const uniqueAddresses = new Set<`0x${string}`>();
        for (const log of logs) {
          try {
            const event = decodeEventLog({
              abi: SWEAR_JAR_ABI,
              data: log.data,
              topics: log.topics,
            });
            
            // Only add address if it's a user-related event
            if ('user' in event.args && typeof event.args.user === 'string') {
              uniqueAddresses.add(event.args.user as `0x${string}`);
            }
          } catch (error) {
            console.log('Could not decode event:', error);
            continue;
          }
        }

        const recentAddresses = Array.from(uniqueAddresses).slice(-100);

        // Fetch stats for each address
        const stats = await Promise.all(
          recentAddresses.map(async (address) => {
            const result = await publicClient.readContract({
              address: SWEAR_JAR_ADDRESS,
              abi: SWEAR_JAR_ABI,
              functionName: 'getUserStats',
              args: [address],
            }) as [bigint, bigint, bigint, bigint];

            return {
              address: address as string,
              depositedAmount: result[0],
              cleansedAmount: result[1],
              mercyCount: result[2],
              mercyAmount: result[3],
            };
          })
        );

        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchUserStats();
  }, [publicClient]);

  // Prepare leaderboard data
  const getMostCleansed = () => {
    return [...userStats]
      .sort((a, b) => (b.cleansedAmount > a.cleansedAmount ? 1 : -1))
      .slice(0, 3)
      .map(stat => ({ address: stat.address, value: stat.cleansedAmount }));
  };

  const getMostDeposited = () => {
    return [...userStats]
      .sort((a, b) => (b.depositedAmount > a.depositedAmount ? 1 : -1))
      .slice(0, 3)
      .map(stat => ({ address: stat.address, value: stat.depositedAmount }));
  };

  const getMostMercy = () => {
    return [...userStats]
      .sort((a, b) => (b.mercyAmount > a.mercyAmount ? 1 : -1))
      .slice(0, 3)
      .map(stat => ({ address: stat.address, value: stat.mercyAmount }));
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white relative">
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] pointer-events-none"></div>

      {/* Beta Notice Banner */}
      <div className="relative z-20 bg-yellow-100 bg-opacity-90 border-b border-yellow-400 py-2">
        <div className="container mx-auto px-6 text-center">
          <p className="text-yellow-800 text-sm font-bold">
            🚧 Beta Version - Running on Abstract Testnet 🚧
          </p>
        </div>
      </div>

      {/* Header with Title and Wallet Button */}
      <div className="relative z-10 flex justify-between items-center px-6 py-6">
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
                    {isConnected ? formatTokenAmount(cleansedAmount) : '0'}
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
              className={`relative w-48 h-48 mx-auto flex items-center justify-center
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95 
              ${(!isConnected || isPending) && 'opacity-50 cursor-not-allowed hover:scale-100'}`}
            >
              <Image 
                src="/static/GrindSwear.png"
                alt="Deposit Button"
                width={192}
                height={192}
                className="w-full h-full object-contain rounded-3xl"
              />
            </button>

            {/* Contract Addresses */}
            <div className="mt-8 text-center space-y-2 text-xs text-[#CCCCCC]">
              <div>
                <div className="font-medium mb-1">SwearJar Contract:</div>
                <div className="font-mono bg-[#0A0A0A] px-3 py-1 rounded-lg border border-[#2A2A2A]">
                  {SWEAR_JAR_ADDRESS}
                </div>
              </div>
              <div>
                <div className="font-medium mb-1">$CUSS Token Contract:</div>
                <div className="font-mono bg-[#0A0A0A] px-3 py-1 rounded-lg border border-[#2A2A2A]">
                  {CUSS_TOKEN_ADDRESS}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Component */}
          <div className="bg-[#1A1A1A] rounded-2xl p-8 shadow-xl border border-[#2A2A2A] flex items-center">
            <Instructions 
              cleanseOddsNum={cleanseOddsNum} 
              minWithdrawAmount={minWithdrawAmountNum}
              mercyPercentage={mercyPercentageNum}
              burnRatio={burnRatioNum}
            />
          </div>
        </div>

        {/* Leaderboards Section */}
        <div className="w-full max-w-5xl mx-auto mt-8 mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Leaderboards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <LeaderboardPanel
              title="Most Cleansed"
              data={getMostCleansed()}
              isLoading={isLoadingStats}
            />
            <LeaderboardPanel
              title="Most Deposited"
              data={getMostDeposited()}
              isLoading={isLoadingStats}
            />
            <LeaderboardPanel
              title="Most Mercy Received"
              data={getMostMercy()}
              isLoading={isLoadingStats}
            />
          </div>
        </div>
      </div>

      {/* Processing Popup */}
      {showProcessingPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <Image
              src={processingGif}
              alt="Processing"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">{processingMessage}</p>
            <p className="text-[#CCCCCC] mb-4">Please wait while we process your transaction</p>
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
            <Image
              src="/static/GrindBurn04.gif"
              alt="Success Hamster"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">
              Your $CUSS was added to the jar!
            </p>
            <button
              onClick={resetAllPopups}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cleansed Popup */}
      {showCleansedPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <Image
              src="/static/GrindBozo01_GBG.gif"
              alt="Cleansed Tokens"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">
              Your $CUSS was cleansed!
            </p>
            <p className="text-[#CCCCCC] mb-4">
              {burnRatioNum}% of your tokens have been burned forever.
            </p>
            <button
              onClick={resetAllPopups}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <Image
              src="/static/GrindCry01_GBG.gif"
              alt="Error Occurred"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#FF3333]">
              Transaction Failed
            </p>
            <p className="text-[#CCCCCC] mb-4">
              {errorMessage}
            </p>
            <button
              onClick={resetAllPopups}
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
            <Image
              src="/static/GrindTower01_GBG.gif"
              alt="Money Tower Hamster"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">Successfully withdrew your $CUSS!</p>
            <button
              onClick={resetAllPopups}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Mercy Popup */}
      {showMercyPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1A1A1A] p-8 rounded-2xl border border-[#2A2A2A] text-center max-w-md w-full mx-4">
            <Image
              src="/static/GrindRain01_GBG.gif"
              alt="Mercy Granted"
              width={300}
              height={300}
              className="mx-auto mb-4 rounded-xl"
            />
            <p className="text-2xl font-bold mb-4 text-[#00FF8C]">
              Divine Mercy Has Been Granted!
            </p>
            <p className="text-[#CCCCCC] mb-4">
              Although your tokens were cleansed, divine mercy has returned{' '}
              <span className="text-[#00FF8C] font-bold">
                {formatTokenAmount(cleansedAmount ? (BigInt(cleansedAmount) * BigInt(mercyPercentageNum)) / 100n : 0n)} $CUSS
              </span>{' '}
              to you ({mercyPercentageNum}% of your cleansed tokens).
            </p>
            <button
              onClick={resetAllPopups}
              className="px-6 py-3 bg-[#00FF8C] text-black font-bold rounded-xl hover:bg-[#00CC70] transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Message Display */}
      {errorMessage && (
        <div className="text-red-500 mt-2">
          {errorMessage}
        </div>
      )}

      {/* Footer */}
      <div className="relative z-10 w-full bg-[#1A1A1A] border-t border-[#2A2A2A] py-4 mt-8">
        <div className="container mx-auto px-6 text-center">
          <a 
            href="https://x.com/champlification" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center space-x-2 text-[#CCCCCC] hover:text-[#00FF8C] transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>@champlification</span>
          </a>
        </div>
      </div>
    </main>
  );
}
