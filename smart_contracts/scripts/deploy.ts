import { ethers } from "hardhat";

async function main() {

  const initialTokenSupply = 50000;
  const FSTokenFactory = await ethers.getContractFactory("FSToken");

  // 50,000 tokens
  const fsToken = await FSTokenFactory.deploy(initialTokenSupply)

  const fsTokenAddress = await fsToken.getAddress();
  console.log(`FSToken deployed with ${initialTokenSupply} tokens and deployed address is ${fsTokenAddress}`);

  // Deploying FSVault
  const FSVaultFactory = await ethers.getContractFactory("FSVault");
  const fsVault = await FSVaultFactory.deploy(fsTokenAddress);

  const fsVaultAddress = await fsVault.getAddress();
  console.log(`FSVault deployed and address is ${fsVaultAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
