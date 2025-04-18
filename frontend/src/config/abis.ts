export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" }
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function"
  }
] as const;

export const SWEAR_JAR_ABI = [
  {
    "inputs": [{"internalType":"address","name":"_cussToken","type":"address"}],
    "stateMutability":"nonpayable",
    "type":"constructor"
  },
  {
    "inputs": [{"internalType":"address","name":"owner","type":"address"}],
    "name":"OwnableInvalidOwner",
    "type":"error"
  },
  {
    "inputs": [{"internalType":"address","name":"account","type":"address"}],
    "name":"OwnableUnauthorizedAccount",
    "type":"error"
  },
  {
    "inputs": [],
    "name":"ReentrancyGuardReentrantCall",
    "type":"error"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newRatio","type":"uint256"}],
    "name":"BurnRatioUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newOdds","type":"uint256"}],
    "name":"CleanseOddsUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},
      {"indexed":false,"internalType":"bool","name":"wasCleansed","type":"bool"}
    ],
    "name":"Deposited",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newHours","type":"uint256"}],
    "name":"MercyCooldownUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"bool","name":"enabled","type":"bool"}],
    "name":"MercyEnabled",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
    ],
    "name":"MercyGranted",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newOdds","type":"uint256"}],
    "name":"MercyOddsUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newPercentage","type":"uint256"}],
    "name":"MercyPercentageUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"newAmount","type":"uint256"}],
    "name":"MinWithdrawAmountUpdated",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],
    "name":"OwnerWithdrawn",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},
      {"indexed":true,"internalType":"address","name":"newOwner","type":"address"}
    ],
    "name":"OwnershipTransferred",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"address","name":"account","type":"address"}],
    "name":"Paused",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"burnAmount","type":"uint256"},
      {"indexed":false,"internalType":"uint256","name":"contractAmount","type":"uint256"}
    ],
    "name":"TokensCleansed",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":false,"internalType":"address","name":"token","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
    ],
    "name":"TokensRecovered",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed":false,"internalType":"address","name":"account","type":"address"}],
    "name":"Unpaused",
    "type":"event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed":true,"internalType":"address","name":"user","type":"address"},
      {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
    ],
    "name":"Withdrawn",
    "type":"event"
  },
  {
    "inputs": [],
    "name": "BURN_ADDRESS",
    "outputs": [{"internalType":"address","name":"","type":"address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_COOLDOWN_HOURS",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_WITHDRAW_AMOUNT",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "burnRatio",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name": "checkApproval",
    "outputs": [{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cleanseOdds",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"","type":"address"}],
    "name": "cleansed",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "contractCleansedTokens",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cussToken",
    "outputs": [{"internalType":"contract IERC20","name":"","type":"address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"","type":"address"}],
    "name": "deposited",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBurnRatio",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCleanseOdds",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name": "getCleansed",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractStats",
    "outputs": [
      {"internalType":"uint256","name":"totalDeposited","type":"uint256"},
      {"internalType":"uint256","name":"totalCleansed","type":"uint256"},
      {"internalType":"uint256","name":"mercyGrants","type":"uint256"},
      {"internalType":"uint256","name":"mercyAmount","type":"uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name": "getDeposited",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name": "getMercyAmountReceived",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMercyCooldownHours",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMercyOdds",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMercyPercentage",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name": "getMercyReceived",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMinWithdrawAmount",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"user","type":"address"}],
    "name": "getUserStats",
    "outputs": [
      {"internalType":"uint256","name":"depositedAmount","type":"uint256"},
      {"internalType":"uint256","name":"cleansedAmount","type":"uint256"},
      {"internalType":"uint256","name":"mercyCount","type":"uint256"},
      {"internalType":"uint256","name":"mercyAmount","type":"uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isMercyEnabled",
    "outputs": [{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "lastMercyTimestamp",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"","type":"address"}],
    "name": "mercyAmountReceived",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mercyCooldownHours",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mercyEnabled",
    "outputs": [{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mercyOdds",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mercyPercentage",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"","type":"address"}],
    "name": "mercyReceived",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minWithdrawAmount",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{"internalType":"address","name":"","type":"address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name": "ownerWithdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "paused",
    "outputs": [{"internalType":"bool","name":"","type":"bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"contract IERC20","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name": "recoverTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_burnRatio","type":"uint256"}],
    "name": "setBurnRatio",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_cleanseOdds","type":"uint256"}],
    "name": "setCleanseOdds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_hours","type":"uint256"}],
    "name": "setMercyCooldownHours",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"bool","name":"_enabled","type":"bool"}],
    "name": "setMercyEnabled",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_mercyOdds","type":"uint256"}],
    "name": "setMercyOdds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_mercyPercentage","type":"uint256"}],
    "name": "setMercyPercentage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"uint256","name":"_minWithdrawAmount","type":"uint256"}],
    "name": "setMinWithdrawAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDeposits",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMercyAmount",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalMercyGrants",
    "outputs": [{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType":"address","name":"newOwner","type":"address"}],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "unpause",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "withdraw",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const; 