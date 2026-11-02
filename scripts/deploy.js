// Deploys DeliveryRegistry and saves its address and ABI in deployments/<network>.json.
// Usage: npx hardhat run scripts/deploy.js --network sepolia
import { network } from "hardhat";
import { deployDeliveryRegistry, writeDeployment } from "./lib/deployment.js";

// Hardhat's in-process network disappears when the script ends: nothing to save.
const LOCAL_NETWORKS = new Set(["default", "hardhat"]);

const { ethers, networkName } = await network.create();
const { record } = await deployDeliveryRegistry(ethers, networkName);

console.log(`DeliveryRegistry deployed on ${networkName} (chain ${record.chainId})`);
console.log(`  address: ${record.address}`);
console.log(`  owner:   ${record.owner}`);
console.log(`  block:   ${record.blockNumber}`);

if (LOCAL_NETWORKS.has(networkName)) {
  console.log("Local network: the deployment is not saved.");
} else {
  const file = await writeDeployment("deployments", record);
  console.log(`Saved in ${file}`);
  console.log(`Verify it with: npx hardhat verify --network ${networkName} ${record.address}`);
}
