import { expect } from "chai";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { network } from "hardhat";
import { deployDeliveryRegistry, writeDeployment } from "../scripts/lib/deployment.js";

const { ethers } = await network.create();

describe("deployment script", function () {
  it("deploys DeliveryRegistry owned by the deploying wallet", async function () {
    const [deployer] = await ethers.getSigners();

    const { registry, record } = await deployDeliveryRegistry(ethers, "sepolia");

    expect(record.contract).to.equal("DeliveryRegistry");
    expect(record.network).to.equal("sepolia");
    expect(record.chainId).to.equal(31337);
    expect(record.address).to.equal(await registry.getAddress());
    expect(record.owner).to.equal(deployer.address);
    expect(await registry.owner()).to.equal(deployer.address);
    expect(record.transactionHash).to.match(/^0x[0-9a-f]{64}$/);
    expect(record.blockNumber).to.be.a("number");
  });

  it("records the ABI that the backend needs to call the contract", async function () {
    const { record } = await deployDeliveryRegistry(ethers, "sepolia");

    const names = record.abi.map((entry) => entry.name);
    expect(names).to.include.members([
      "registerDelivery",
      "getDeliveryHash",
      "DeliveryRegistered",
    ]);
  });

  it("writes the record to deployments/<network>.json", async function () {
    const { record } = await deployDeliveryRegistry(ethers, "sepolia");
    const directory = await mkdtemp(path.join(tmpdir(), "auxia-deployments-"));

    try {
      const file = await writeDeployment(directory, record);

      expect(path.basename(file)).to.equal("sepolia.json");
      expect(JSON.parse(await readFile(file, "utf8"))).to.deep.equal(record);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
