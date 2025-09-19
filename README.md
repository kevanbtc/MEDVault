# Consent/Proof Demo – Infrastructure Audit

## Overview

This repo demonstrates a minimal "patient consent + data proof + vault pin" workflow on an EVM devnet (Anvil/Hardhat, chain id **31337**):

* **ConsentNFT** – non-transferable ERC-721 that mints a token to an admin and emits `Consented(patient, scope, cid, ts)` when a patient records consent.
* **ProofReceipt** – logs document hashes via `ProofLogged(cidHash, subject, ts, tag)`.
* **VaultAccount** – pins "top-level" proofs via `ProofPinned(cidHash, tag)`.

Node scripts (Ethers v6) handle:

1. writing sample transactions with **sequenced nonces**,
2. reading historical events,
3. live event streaming,
4. exporting consent history to CSV/JSON.

---

## Stack / Versions

* **Node.js**: v22.19.0
* **Ethers**: ^6.15.0
* **dotenv**: ^17.2.2
* **Foundry** (forge/cast), target: **anvil-hardhat** (chain id 31337)
* **PowerShell** (Windows) for helper scripts

---

## Repo Layout (key files)

```
.
├─ .env                          # RPC_URL, PRIVATE_KEY
├─ .env.addresses                # Deployed contract addresses (synced after each deploy)
├─ abi/
│  ├─ ConsentNFT.json            # ABI (UTF-8 no BOM)
│  ├─ ProofReceipt.json
│  └─ VaultAccount.json
├─ broadcast/Deploy.s.sol/31337/ # Foundry "run-latest.json" per deploy
├─ scripts/
│  ├─ demo.mjs                   # Write: consent + proof + vault pin (with nonce allocator)
│  ├─ read-consents.mjs          # Read historical Consented
│  ├─ read-proofs.mjs            # Read historical ProofLogged
│  ├─ read-vault.mjs             # Read historical ProofPinned
│  ├─ export-consents.mjs        # Export consents → export/consents.{json,csv}
│  └─ watch.mjs                  # Live event stream for all three contracts
├─ export/
│  ├─ consents.json
│  └─ consents.csv
├─ deploy-run.ps1                # Full "deploy → sync → demo → export → cast summaries"
└─ package.json                  # npm scripts
```

---

## Environment

Create **.env**:

```
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x<dev-private-key>
```

> The demo uses the dev wallet **0x70997970C51812dc3A010C7d01b50e0d17dc79C8** (derived from `PRIVATE_KEY`) on the local anvil-hardhat chain.

---

## Contracts (surface)

### ConsentNFT

* **Key functions**

  * `mintTo(address) -> uint256`
  * `recordConsent(bytes32 scope, string cid)` → emits event
  * `idOf(address) -> uint256`
* **Event**

  * `Consented(address patient, bytes32 scope, string cid, uint256 ts)`

### ProofReceipt

* **Key function**

  * `logProof(bytes32 cidHash, string tag)` → emits event
* **Event**

  * `ProofLogged(bytes32 cidHash, address subject, uint256 ts, string tag)`

### VaultAccount

* **Key function**

  * `pinProof(bytes32 cidHash, string tag)` → emits event
* **Event**

  * `ProofPinned(bytes32 cidHash, string tag)`

---

## Current Addresses (latest successful deploy)

> These are also written to **.env.addresses** after each deploy.

```
CONSENT_NFT   = 0x6ad448bf2adbf3a7aa9bfe411ed908315566ae24
PROOF_RECEIPT = 0xa4f9a0fcace423b1ac9497705c4470a713cf839c
VAULT_ACCOUNT = 0x2731e51aff4615796d44b37a9d2e7970d88e331a
Chain         = 31337 (anvil-hardhat)
```

### Recent Address History (examples from previous runs)

* (newer → older)

  * `0xA82ED522…`, `0x17C8b71E…`, `0x8990C5DA…`
  * `0xDadd1125…`, `0x23d351BA…`, `0x35D2F51D…`
  * `0xC63d2a04…`, `0x1a6a3e7B…`, `0x093e8F4d…`
  * `0xE0b39353…`, `0xE5BD5bDC…`, `0xAd5d57aD…`

(Use `broadcast/Deploy.s.sol/31337/run-latest.json` to verify any run.)

---

## Data Flow (demo)

`scripts/demo.mjs` performs:

1. `idOf(admin)` → confirms tokenId (admin minted on deploy).
2. `recordConsent(scopeHash("DOC_SHARE_SCOPE"), "ipfs://bafy-consent.json")`
3. `logProof(0xaaaaaaaa…32, "doc:pathology")`
4. `pinProof(0xbbbbbbbb…32, "careplan:v1")`

**Nonce management**: we prefetch the latest nonce and allocate sequentially:

```js
const base = await provider.getTransactionCount(address, "latest");
let n = base;
const allocNonce = () => (n++);
```

Each tx passes `{ nonce: allocNonce() }` to avoid "nonce too low" on devnets with ghost/pending tx.

---

## Reading & Exporting

* **Historical reads**

  * `scripts/read-consents.mjs` → prints all `Consented`
  * `scripts/read-proofs.mjs` → prints all `ProofLogged`
  * `scripts/read-vault.mjs` → prints all `ProofPinned`
* **Live stream**

  * `scripts/watch.mjs` → subscribes and logs new events as they occur
* **Export**

  * `scripts/export-consents.mjs` → writes `export/consents.json` and `export/consents.csv`

---

## NPM Scripts

`package.json`:

```json
{
  "scripts": {
    "read:consents": "node scripts/read-consents.mjs",
    "read:proofs":   "node scripts/read-proofs.mjs",
    "read:vault":    "node scripts/read-vault.mjs",
    "read:all":      "powershell -NoProfile -Command \"npm run read:consents; npm run read:proofs; npm run read:vault\"",
    "watch":         "node scripts/watch.mjs",
    "export":        "node scripts/export-consents.mjs",
    "demo":          "node scripts/demo.mjs",
    "deploy":        "powershell -ExecutionPolicy Bypass -File ./deploy-run.ps1"
  }
}
```

> If PowerShell quoting fights you, prefer `npm set-script read:all 'powershell -NoProfile -Command "npm run read:consents; npm run read:proofs; npm run read:vault"'\`.

---

## PowerShell Helpers

In your shell session we used:

* `Load-Addresses` – read `.env.addresses` → set `$env:CONSENT_NFT`, `$env:PROOF_RECEIPT`, `$env:VAULT_ACCOUNT`.
* `Scope-Hash` – convenience keccak.
* `Sync-Addresses` – parse `broadcast/.../run-latest.json` and rewrite `.env.addresses` (UTF-8 **no BOM**).
* `Refresh-Addresses` – re-apply `.env.addresses` values to the current shell env.

**One-shot pipeline script**: `deploy-run.ps1`

* `forge script` deploy
* `Sync-Addresses` → `.env.addresses`
* `Refresh-Addresses` → process env
* `node scripts/demo.mjs`
* `node scripts/export-consents.mjs`
* `cast logs` summaries (Consented / ProofLogged / ProofPinned)

---

## Casting (sanity)

```powershell
$RPC="http://127.0.0.1:8545"
$ME = (cast wallet address --private-key $env:PRIVATE_KEY).Trim()

# token id for admin
cast call $env:CONSENT_NFT "idOf(address)(uint256)" $ME --rpc-url $RPC

# event pulls (from block 0 on devnet)
cast logs --rpc-url $RPC --address $env:CONSENT_NFT   --from-block 0 "Consented(address,bytes32,string,uint256)"
cast logs --rpc-url $RPC --address $env:PROOF_RECEIPT --from-block 0 "ProofLogged(bytes32,address,uint256,string)"
cast logs --rpc-url $RPC --address $env:VAULT_ACCOUNT --from-block 0 "ProofPinned(bytes32,string)"
```

---

## Known Issues & Fixes

* **UTF-8 BOM garbage (`EF BB BF`) or weird bytes in ABI files**
  Fix: always write ABI/addresses with `new System.Text.UTF8Encoding($false)`. You already standardized:

  ```powershell
  [System.IO.File]::WriteAllText("$PWD\abi\ConsentNFT.json", $abiJson, (New-Object System.Text.UTF8Encoding($false)))
  ```

* **`SyntaxError: Unexpected token '�' ... is not valid JSON`**
  Caused by BOM/encoding in ABI files. Fixed (see above).

* **Nonce errors (`NONCE_EXPIRED`, `nonce too low`)**
  Fixed by using a **local nonce allocator** based on `getTransactionCount(..., "latest")` and passing `{ nonce }` explicitly to each tx.

* **PowerShell quoting with `npm pkg set`**
  Use `npm set-script` (simpler), or this exact quoting:

  ```powershell
  npm pkg set scripts.'read:all'='powershell -NoProfile -Command "npm run read:consents; npm run read:proofs; npm run read:vault"'
  ```

---

## Security Notes

* **Never commit `.env` or private keys.**
  The `dotenv` banner shows it's loading `.env`. Keep it local only.
* This is a **devnet** demo; contracts are deliberately simple and permissive.

---

## Reproduce / Daily Ops

```powershell
# 0) Start a local chain (anvil/hardhat) on 127.0.0.1:8545

# 1) Deploy + run demo + export + cast summaries
npm run deploy

# 2) Live stream
npm run watch

# 3) One-shot reads
npm run read:consents
npm run read:proofs
npm run read:vault
npm run read:all

# 4) Export
npm run export

# 5) Rerun just the demo txs (nonces handled)
npm run demo
```

---

## Appendix – What the events look like

**Consented**

```json
{
  "block": 74,
  "tx": "0xd32a68…",
  "patient": "0x70997970C5…79C8",
  "scope": "0xefb7c8cb85d1c708ee6535b89689f2b6849bc245e4fa0597f94b140bc6ec371f",
  "cid": "ipfs://bafy-consent.json",
  "ts": 1758252172
}
```

**ProofLogged**

```json
{
  "block": 75,
  "tx": "0x2bb966…",
  "cidHash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "subject": "0x70997970C5…79C8",
  "tag": "doc:pathology",
  "ts": 1758252173
}
```

**ProofPinned**

```json
{
  "block": 76,
  "tx": "0x0302f8…",
  "cidHash": "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  "tag": "careplan:v1"
}
```

---

## Next Steps (nice-to-haves)

* Add a small web UI to visualize events and CSV exports.
* Parameterize scope/tag inputs in `demo.mjs`.
* Optional: persist a "deploy history" file that appends addresses per run for quick diff.