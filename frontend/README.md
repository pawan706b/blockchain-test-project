# Blockchain Dapp 
## Technology Stack

- **Smart Contracts**: Developed using Solidity with Hardhat.
- **Frontend**: Built with TypeScript, React, and Next.js.
- **Blockchain Integration**: Leveraged Wagmi for Web3 development.


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

