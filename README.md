# auxia-smart-contracts

AuxIA smart contracts: DeliveryRegistry contract that stores delivery hashes on the blockchain for tamper-proof aid traceability.

`auxia-backend` (Traceability context, `BlockchainAdapter` with Web3j) anchors
the SHA-256 hash of each delivery in `DeliveryRegistry`. Anyone can then check
that the delivery record stored in PostgreSQL was not altered. Only the
delivery identifier and its hash go on chain: never names, documents,
quantities or any data about beneficiaries.

## Stack

| Item | Version |
|---|---|
| Node.js | 22.10 or later |
| Hardhat | 3.21.0 (ESM, `hardhat.config.js`) |
| Toolbox | `@nomicfoundation/hardhat-toolbox-mocha-ethers` 4.0.0 (Mocha, Chai, ethers v6) |
| Solidity | 0.8.28 |
| OpenZeppelin Contracts | 5.6.1 |

## Structure

```text
contracts/          # DeliveryRegistry.sol
test/               # DeliveryRegistry.test.js, deployment.test.js
scripts/            # deploy.js and the deployment logic it uses (lib/)
deployments/        # address, network, block and ABI per network, after deployment
hardhat.config.js
```

## DeliveryRegistry

The owner is the account that deploys the contract: the wallet of
`auxia-backend`. It uses OpenZeppelin's `Ownable`.

| Member | Access | Description |
|---|---|---|
| `registerDelivery(bytes16 deliveryId, bytes32 hash)` | Owner only | Anchors the hash of a delivery. `deliveryId` is the UUID of the delivery in binary form (16 bytes) and `hash` is the SHA-256 of its canonical record. |
| `getDeliveryHash(bytes16 deliveryId) returns (bytes32)` | Public, read only | Returns the anchored hash, or zero if the delivery was never registered. |
| `DeliveryRegistered(bytes16 indexed deliveryId, bytes32 hash, uint256 timestamp)` | Event | Emitted on each registration, for auditing from a block explorer. |

`registerDelivery` reverts with:

| Error | When |
|---|---|
| `OwnableUnauthorizedAccount(address)` | The caller is not the owner. |
| `InvalidDeliveryId()` | `deliveryId` is zero. |
| `EmptyHash()` | `hash` is zero. |
| `DeliveryAlreadyRegistered(bytes16)` | The delivery already has a hash. An anchored hash is never overwritten. |

From Java (Web3j), the UUID becomes `bytes16` with its 16 bytes in order
(most significant bits first), and the SHA-256 digest goes into `bytes32` as is.

## Setup

```bash
npm ci
```

Local tests run on Hardhat's simulated network and need no configuration.
The Sepolia deployment uses the variables listed in `.env.example`
(`PRIVATE_KEY`, `RPC_URL`, `ETHERSCAN_API_KEY`). Copy it to `.env` and fill in
the values. `.env` is ignored by git and must never be committed.

## Commands

| Command | Description |
|---|---|
| `npx hardhat compile` | Compiles the contracts. |
| `npx hardhat test` | Runs the tests on the local network. |
| `npx hardhat test --coverage` | Runs the tests with a coverage report. |

The same commands are available as `npm run compile`, `npm test` and
`npm run coverage`.

## Deployment (Sepolia)

1. Create a test wallet (for example in MetaMask) and get Sepolia ETH from a
   faucet. Its private key goes to `PRIVATE_KEY`: this wallet becomes the
   owner of the contract, so it is also the wallet the backend uses to
   register deliveries. Never use a wallet with real funds.
2. Create a Sepolia app in Alchemy or Infura and copy its URL to `RPC_URL`,
   and an Etherscan API key to `ETHERSCAN_API_KEY`.
3. Deploy:

   ```bash
   npx hardhat run scripts/deploy.js --network sepolia
   ```

   The script prints the address and saves `deployments/sepolia.json` with the
   network, chain id, address, owner, transaction, block and ABI. That file is
   versioned: the backend reads the address and the ABI from it.
4. Verify the source code on Etherscan with the command the script prints:

   ```bash
   npx hardhat verify --network sepolia <address>
   ```

Running the script without `--network` deploys on Hardhat's local network and
saves nothing.
