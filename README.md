# ERC-3525 Semi-Fungible Token (SFT) Example

## Overview
ERC-3525 introduces semi-fungible tokens that combine features from ERC-20 and ERC-721. These tokens have unique IDs and a value property, making them suitable for various use cases.
## Motivation
- Traditional fungible tokens (ERC-20) lack individuality, while non-fungible tokens (ERC-721) lack quantitative features. 
- ERC-3525 aims to bridge this gap by creating semi-fungible tokens that combine uniqueness and quantifiability.
- It provides a flexible way to represent fractional ownership, financial instruments, and other use cases.

## Features
- **Unique ID**: Each token has a unique ID, similar to ERC-721.
- **Value Property**: Represents the quantitative aspect of the token (like an ERC-20 balance).
- **Slot Attribute**: Ensures fungibility within the same slot.
- **Transfer Models**: Introduces new transfer models for semi-fungibility.

## Use Cases
1. **Fractional Ownership**:
   - Represent partial ownership of real estate, art, or other assets.
   - Allow users to hold a fraction of an asset without needing to own the entire thing.

2. **Financial Instruments**:
   - Create bonds, insurance policies, or vesting plans as semi-fungible tokens.
   - Enable fractional ownership of financial instruments.

3. **Liquidity Pools**:
   - Enhance liquidity management by representing shares in liquidity pools.
   - Users can trade these shares while maintaining fungibility.

## Dynamic NFTs for Fractional Ownership
- We've extended this project to include dynamic NFTs.
- These NFT values change over time, responding to external events or user interactions.
- Our dynamic NFTs represent fractional ownership, allowing users to hold a fraction of an asset without needing to own the entire thing.


