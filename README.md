# MEDVault

# What this project does (in plain English)

Think of this like a receipt system for health data:

* **ConsentNFT** = a "yes, I agree" receipt. When a patient gives consent to share a document, we write that consent on a local blockchain and emit an event you can see.
* **ProofReceipt** = a "document fingerprint" log. We don't store the file itself—just a fixed-length hash (like a fingerprint) plus a short label (e.g., `doc:pathology`).
* **VaultAccount** = a "pin board". We pin important, high-level proofs (like a care plan) so they're easy to find later.

Everything runs on a **local dev blockchain** (Anvil/Hardhat, chain id 31337). No real money, no public chain.

---

# Why this matters

* You can **prove** someone gave consent without exposing the actual document.
* You can **prove** a file existed at a time (by its hash) without storing the file itself.
* You can **monitor** when consents or proofs happen in real time or export them to CSV/JSON.

---

# Quick start (the 90-second tour)

1. **Set environment**

```
# .env (local only)
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0x<dev-private-key>
```

2. **Start a local chain**
   Run Anvil/Hardhat so `http://127.0.0.1:8545` is live.

3. **Deploy + demo + export (one command)**

```
npm run deploy
```

This:

* Deploys the 3 contracts
* Saves the new addresses to `.env.addresses`
* Sends 3 example transactions (record consent, log a proof, pin a proof)
* Exports consent history to `export/consents.json` and `export/consents.csv`
* Prints event summaries with `cast`

4. **See events live**

```
npm run watch
```

Leave this running to watch new consents/proofs as they happen.

5. **Read past events**

```
npm run read:consents
npm run read:proofs
npm run read:vault
```

6. **Re-export to CSV/JSON**

```
npm run export
```

---

# What you'll see

* **Console logs** like:

  * `[*] CNFT = 0x...` (addresses)
  * `recordConsent tx: 0x...` (transaction hashes)
* **Event prints** like:

  ```
  {
    block: 74,
    patient: "0x7099…79C8",
    scope: "0xefb7…c371f",
    cid: "ipfs://bafy-consent.json",
    ts: 1758252172
  }
  ```
* **Files** in `export/`:

  * `consents.json`
  * `consents.csv` (open in Excel/Sheets)

---

# What's in each contract (no jargon)

* **ConsentNFT**

  * Records a patient's consent with a scope (a topic name turned into a hash) and a link (e.g., IPFS URL).
  * Emits an event `Consented(...)` you can read later.

* **ProofReceipt**

  * Stores a **hash** of a document and a short tag (like "doc\:pathology").
  * Emits `ProofLogged(...)`.

* **VaultAccount**

  * Pins a top-level proof (e.g., a care plan hash) with a tag.
  * Emits `ProofPinned(...)`.

> We only store hashes + labels + timestamps, not the actual files.

---

# Common fixes (when things look weird)

* **"Unexpected token � … not valid JSON"**
  Your ABI files likely had the wrong encoding. We already fixed by writing them as **UTF-8 (no BOM)**.

* **"nonce too low / NONCE\_EXPIRED"**
  We use a **nonce allocator** in the demo so each tx is numbered in order. Running `npm run deploy` or `npm run demo` should just work.

* **Scripts can't find addresses**
  Make sure `.env.addresses` exists (it's created/updated automatically by the deploy).

---

# FAQ

**Is this on a real blockchain?**
No, it's a local dev chain just for testing.

**Do you store medical records on-chain?**
No. Only hashes and small labels. Actual files live off-chain (e.g., IPFS/S3/etc.).

**Can I change the labels or scope?**
Yes—edit `scripts/demo.mjs` to use your own strings.

---

# Handy commands (one glance)

```
npm run deploy       # redeploy + run demo + export + print summaries
npm run demo         # just send the 3 example transactions
npm run watch        # live events
npm run read:consents
npm run read:proofs
npm run read:vault
npm run export       # write export/consents.{json,csv}
```

---