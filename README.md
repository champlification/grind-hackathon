# SwearJar: Gamified On-Chain Habit Breaking with $GRIND

## Overview
SwearJar is a fully on-chain, gamified, and nearly 100% 'vibe coded' dApp that helps users break bad habits through financial incentives and engaging mechanics. While the prototype uses $CUSS as a stand-in, it's designed to integrate with $GRIND, creating an entertaining and effective way to improve yourself while participating in the GRIND ecosystem.

## Core Mechanics

### The Basic Concept
- Users deposit tokens into the SwearJar when they swear or engage in a habit they want to break
- Deposits can be withdrawn once they reach a minimum threshold
- Each deposit has a chance to be "cleansed" (lost), adding real stakes to breaking habits

### Token Mechanics
- When tokens are "cleansed", approximately 50% are burned forever, permanently reducing the token supply
- The remaining cleansed tokens stay in the contract
- A chance for "Mercy" exists where users can receive back a portion of their total cleansed tokens
- This creates an engaging risk/reward system while ensuring token burning contributes to $GRIND's deflationary mechanics

## Smart Contract Innovation
The SwearJar contract (CA: 0x2D54E36A94Dfe1D089F817455cB35f2a3FFCb7ED) is 100% on-chain with no external dependencies, featuring:
- Transparent and verifiable random number generation for cleansing chances
- Built-in mercy system with configurable percentages
- Automated token burning mechanism
- Minimum withdrawal thresholds to encourage longer-term commitment
- Full event system for tracking deposits, cleansing, and mercy grants
- Completely permissionless - anyone can participate

## Frontend Experience

### Interactive Design
- Features the beloved Grind Hamster throughout the interface
- Custom animated GIF states for different actions:

### User Interface
- Clean, modern design with intuitive controls
- Real-time balance updates and transaction status
- Clear visualization of cleansing odds and mercy chances
- Responsive animations and state changes
- Seamless wallet integration using RainbowKit (includes support for Abstract's AGW)

### Competitive Elements
Dynamic leaderboards showcase:
- Most Cleansed: Top users who've had tokens cleansed
- Most Deposited: Highest total deposits
- Most Mercy Received: Lucky users granted the most mercy

## Why It Works
1. **Gamification**: The chance of losing tokens (or receiving mercy) adds excitement and unpredictability
2. **Real Stakes**: The permanent burning of tokens creates genuine incentive to break bad habits
3. **Community Aspect**: Leaderboards foster competition and engagement
4. **Token Utility**: Provides a genuine use case for $GRIND while contributing to its tokenomics
5. **Scalability**: Can be used for breaking any habit, not just swearing

## Technical Implementation
- Built with Next.js 15.3.1 and TypeScript
- Integrates with Abstract Testnet
- Uses wagmi v2 and RainbowKit v2 for wallet interactions
- Fully responsive and mobile-friendly
- Real-time transaction monitoring and state updates

The SwearJar represents a perfect blend of utility, entertainment, and tokenomics - creating a meaningful way to use $GRIND while helping users better themselves through gamified incentives.