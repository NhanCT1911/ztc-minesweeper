# ZTC Minesweeper

A Minesweeper game built with **React + TypeScript + Vite** and **TailwindCSS**. Connect **MetaMask** to **ZenChain Testnet (ChainID 8408)** to display wallet & chain info. **No private keys requested** and **no on-chain transactions** — rewards are simulated off-chain.

## ⚙️ Tech stack
- React + TypeScript + Vite
- TailwindCSS
- ethers.js (MetaMask connection)
- Dark theme

## 🔗 ZenChain Testnet
When the user clicks **Connect Wallet**, the app will:
- Check if the current chain is `0x20D8` (8408). If **not**, it calls `wallet_addEthereumChain` to prompt MetaMask to add/switch:
```json
{
  "chainId": "0x20D8",
  "chainName": "ZenChain Testnet",
  "nativeCurrency": { "name": "ZTC", "symbol": "ZTC", "decimals": 18 },
  "rpcUrls": ["https://zenchain-testnet.api.onfinality.io/public"],
  "blockExplorerUrls": ["https://zentrace.io"]
}
```
- After switching to the correct network, it calls `eth_requestAccounts` to connect the wallet. **No private key is ever requested.**

## 🎮 Gameplay
- 3 difficulties:
  - **Easy:** 9x9, 10 mines — multiplier x1
  - **Medium:** 16x16, 40 mines — multiplier x3
  - **Hard:** 30x16, 99 mines — multiplier x5
- Left click to reveal; right click/long press (mobile) to flag.
- Shows adjacent mine counts; automatic flood-reveal for empty zones; hitting a mine reveals all and loses.
- **Start / Reset** button.
- Timer starts from the very first reveal.

### Win condition & simulated reward
- Win when all non-mine cells are revealed.
- Popup: **“Congratulations, you win!”**
- Simulated reward:
```
rewardZTC = max(0.001, 0.5 / (1 + minutesPlayed)) * difficultyMultiplier
// multiplier: 1 | 3 | 5 for Easy | Medium | Hard
```
- Reward is displayed in the UI only; **no blockchain transaction**.

## 🧾 UI
- Two columns: left — the board; right — wallet, chain id, time, and simulated reward.
- Dark theme.

## 🚀 Setup & run
```bash
npm install
npm run dev
```
The app runs at the Vite URL (usually `http://localhost:5173`).

## 📁 Structure
```
ztc-minesweeper/
  ├─ index.html
  ├─ package.json
  ├─ tailwind.config.js
  ├─ postcss.config.js
  ├─ tsconfig.json
  ├─ vite.config.ts
  └─ src/
      ├─ main.tsx
      ├─ App.tsx
      ├─ index.css
      ├─ types.ts
      ├─ hooks/useWallet.ts
      ├─ utils/minesweeper.ts
      └─ components/
          ├─ Board.tsx
          └─ Cell.tsx
```
> Note: No real on-chain transactions are performed.