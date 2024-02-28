# Dapp and Smart contracts

## Test the project 
- https://github.com/

This is a Hardhat project configured to run Smart Contract compilations, testing, and deployments.

## Technology Stack
- **Smart Contracts**: Developed using Solidity with Hardhat.
- **Frontend**: Built with TypeScript, React, and Next.js.
- **Blockchain Integration**: Leveraged Wagmi for Web3 development.
## Pre-requisites

Before running the project, ensure you have the following installed:

- Node.js
- Yarn or npm
- Hardhat

## Installation

Firstly install the necessary dependencies:

```bash
npm install
```

or if you are using Yarn:

```bash
yarn install
```

## Configuration

Create a `.env` file in the root directory of your project. Add the following environment variables:

```
ALCHEMY_TESTNET_URL=<Your Sepolia Alchemy URL>
PRIVATE_KEY=<Your Private Key>
ETHERSCAN_API_KEY=<Your Etherscan API Key>
```

Replace `<Your Sepolia Alchemy URL>`, `<Your Private Key>`, and `<Your Etherscan API Key>` with your actual credentials.

## Compiling Contracts

To compile your Solidity contracts, run:

```bash
npx hardhat compile
```

## Running Tests

By default, tests run on the Hardhat network:

```bash
npx hardhat test
```

## Check Code Coverage

```bash
npx hardhat coverage
```

## Deploying Contracts

To deploy contracts on the Hardhat network (default):

```bash
npx hardhat run scripts/deploy.ts
```

To deploy on the Sepolia network, use:

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Make sure your `.env` file is set up with the correct Sepolia network details.

## Verifying Contracts

To verify contracts on Etherscan:

```bash
npx hardhat verify --network sepolia <Contract_Address> <arguments>
```

Replace `<Contract_Address>` with the address of the contract you wish to verify.

## Notes

- Ensure you have enough ETH in your Sepolia account for deployment.
- Keep your private key secure and never commit it to your repository.



# Dapp 

## Project Structure

The project structure is organized for clarity and modularity:
- **src/**: Contains all source code for the project.
  - **app/**: Main application folder.
    - **components/**: Reusable UI components.
      - **NavBar/**: Navigation component.
      - **DepositCard/**: Component for deposit functionality.
      - **WithdrawCard/**: Component for withdrawal functionality.
    - **constants/**: Constants used across the application.
      - **address.js**: Contains addresses of deployed smart contracts.
      - **abi/**: Contains ABI (Application Binary Interface) files for smart contracts.
    - **styles/**: Modular CSS styles for components.
- **public/**: Public assets for the application.
- **package.json**: Configuration file for npm dependencies.
- **README.md**: You are currently reading it!

## Getting Started
1. **Clone the Repository**: Begin by cloning this repository to your local machine.

    ```
    git clone <repository-url>
    ```

2. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies.

    ```
    cd <project-directory>
    npm install
    ```

Then, run the development server:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


# Improvements
- A generic read and write contract hooks extending wagmi react hooks to just call with given paramenters.
- Single stateful button for approval and deposit 
- Using Moralis api to get list of user owned ERC20 tokens (no need for user to input contract address instead select tokens owned list)

