# Eth-Stark Crowdsourcing Platform

## Overview

This platform enables users to create and support crowdfunding campaigns across Ethereum and Starknet seamlessly. Users on either chain can participate in campaigns without the need to bridge tokens between chains, ensuring a smooth and intuitive user experience.

## Features

- **Omnichain Support:** Create and fund campaigns on both Ethereum and Starknet without bridging tokens.
- **User-Friendly Interface:** Designed with a focus on providing an exceptional user experience.
- **Cross-Chain Fund Accessibility:** Ethereum users can access funds from Starknet users and vice versa.

## Technologies Used

- **Starknet L1-L2 Messaging Bridge:** Enables integration between Ethereum and Starknet.
- **Dynamic:** Facilitates the connection of both Ethereum and Starknet wallets in one simple dApp.

## Built With

This project is built on top of the following frameworks:

- **Scaffold-ETH**
- **Scaffold-Stark**

## Getting Started

### Prerequisites

Before you begin, ensure you have the following tools installed:

- **Node.js:** Version 18.17 or higher
- **Yarn:** Version 1 or 2+
- **Git**
- **Scarb:** Version 2.5.4

  - To check your Scarb version:
    ```sh
    scarb --version
    ```
  - If your local Scarb version is not 2.5.4, you need to install it.

- **Starknet Foundry:** Version 0.25.0
  - To check your Starknet Foundry version:
    ```sh
    snforge --version
    ```
  - If your Starknet Foundry version is not 0.25.0, you need to install it.

### Compatible Versions

- **Scarb:** v2.5.4
- **Snforge:** v0.23
- **Cairo:** v2.5.4
- **Rpc:** v0.5.1

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/jrcarlos2000/eth-stark-dapp --recurse-submodules
   ```
