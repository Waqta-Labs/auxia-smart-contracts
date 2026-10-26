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
test/               # DeliveryRegistry.test.js
scripts/            # deploy.js
deployments/        # address, network, block and ABI per network, after deployment
hardhat.config.js
```

## Setup

```bash
npm ci
```

Local tests run on Hardhat's simulated network and need no configuration.
The testnet deployment uses the variables listed in `.env.example`
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
