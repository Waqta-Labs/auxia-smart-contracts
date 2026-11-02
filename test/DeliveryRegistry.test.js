import { expect } from "chai";
import { network } from "hardhat";

const { ethers, networkHelpers } = await network.create();

// UUID 3f2b8c1e-7a4d-4e9b-9c6f-1d2e3f4a5b6c in binary form.
const DELIVERY_ID = "0x3f2b8c1e7a4d4e9b9c6f1d2e3f4a5b6c";
const OTHER_DELIVERY_ID = "0x9a8b7c6d5e4f40312a1b2c3d4e5f6a7b";
const ZERO_DELIVERY_ID = "0x00000000000000000000000000000000";
const HASH = ethers.sha256(ethers.toUtf8Bytes('{"deliveryId":"3f2b8c1e"}'));
const OTHER_HASH = ethers.sha256(ethers.toUtf8Bytes('{"deliveryId":"9a8b7c6d"}'));

describe("DeliveryRegistry", function () {
  async function deployFixture() {
    const [backend, stranger] = await ethers.getSigners();
    const registry = await ethers.deployContract("DeliveryRegistry");
    return { registry, backend, stranger };
  }

  describe("deployment", function () {
    it("makes the deployer the owner", async function () {
      const { registry, backend } = await networkHelpers.loadFixture(deployFixture);

      expect(await registry.owner()).to.equal(backend.address);
    });
  });

  describe("registerDelivery", function () {
    it("stores the hash of a new delivery", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      await registry.registerDelivery(DELIVERY_ID, HASH);

      expect(await registry.getDeliveryHash(DELIVERY_ID)).to.equal(HASH);
    });

    it("emits DeliveryRegistered with the block timestamp", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      const tx = await registry.registerDelivery(DELIVERY_ID, HASH);
      const block = await ethers.provider.getBlock(tx.blockNumber);

      await expect(tx)
        .to.emit(registry, "DeliveryRegistered")
        .withArgs(DELIVERY_ID, HASH, block.timestamp);
    });

    it("keeps deliveries independent from each other", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      await registry.registerDelivery(DELIVERY_ID, HASH);
      await registry.registerDelivery(OTHER_DELIVERY_ID, OTHER_HASH);

      expect(await registry.getDeliveryHash(DELIVERY_ID)).to.equal(HASH);
      expect(await registry.getDeliveryHash(OTHER_DELIVERY_ID)).to.equal(OTHER_HASH);
    });

    it("rejects a delivery that is already registered", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);
      await registry.registerDelivery(DELIVERY_ID, HASH);

      await expect(registry.registerDelivery(DELIVERY_ID, OTHER_HASH))
        .to.be.revertedWithCustomError(registry, "DeliveryAlreadyRegistered")
        .withArgs(DELIVERY_ID);
      expect(await registry.getDeliveryHash(DELIVERY_ID)).to.equal(HASH);
    });

    it("rejects an empty hash", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      await expect(
        registry.registerDelivery(DELIVERY_ID, ethers.ZeroHash),
      ).to.be.revertedWithCustomError(registry, "EmptyHash");
    });

    it("rejects a zero delivery identifier", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      await expect(
        registry.registerDelivery(ZERO_DELIVERY_ID, HASH),
      ).to.be.revertedWithCustomError(registry, "InvalidDeliveryId");
    });

    it("rejects a call from an account other than the owner", async function () {
      const { registry, stranger } = await networkHelpers.loadFixture(deployFixture);

      await expect(registry.connect(stranger).registerDelivery(DELIVERY_ID, HASH))
        .to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount")
        .withArgs(stranger.address);
      expect(await registry.getDeliveryHash(DELIVERY_ID)).to.equal(ethers.ZeroHash);
    });
  });

  describe("getDeliveryHash", function () {
    it("returns zero for a delivery that was never registered", async function () {
      const { registry } = await networkHelpers.loadFixture(deployFixture);

      expect(await registry.getDeliveryHash(DELIVERY_ID)).to.equal(ethers.ZeroHash);
    });

    it("can be read by any account", async function () {
      const { registry, stranger } = await networkHelpers.loadFixture(deployFixture);
      await registry.registerDelivery(DELIVERY_ID, HASH);

      expect(await registry.connect(stranger).getDeliveryHash(DELIVERY_ID)).to.equal(HASH);
    });
  });
});
