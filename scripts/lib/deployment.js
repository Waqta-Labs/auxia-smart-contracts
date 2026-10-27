import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Deploys DeliveryRegistry with the first account of the connection, which
 * becomes its owner: the backend wallet. Returns the contract and the record
 * that the backend needs to call it.
 */
export async function deployDeliveryRegistry(ethers, networkName) {
  const [deployer] = await ethers.getSigners();
  const registry = await ethers.deployContract("DeliveryRegistry");
  await registry.waitForDeployment();
  const receipt = await registry.deploymentTransaction().wait();
  const { chainId } = await ethers.provider.getNetwork();
  const artifact = await ethers.getContractFactory("DeliveryRegistry");

  const record = {
    contract: "DeliveryRegistry",
    network: networkName,
    chainId: Number(chainId),
    address: await registry.getAddress(),
    owner: deployer.address,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    deployedAt: new Date().toISOString(),
    abi: JSON.parse(artifact.interface.formatJson()),
  };
  return { registry, record };
}

/** Writes the record to `<directory>/<network>.json` and returns its path. */
export async function writeDeployment(directory, record) {
  await mkdir(directory, { recursive: true });
  const file = path.join(directory, `${record.network}.json`);
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
  return file;
}
