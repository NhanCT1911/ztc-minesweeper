import { BrowserProvider, Contract } from "ethers";
import { REWARDER_ABI } from "./rewarderAbi";

export async function claimOnChain(
  provider: BrowserProvider,
  difficulty: "easy" | "medium" | "hard",
  secondsPlayed: number
) {
  const signer = await provider.getSigner();
  const addr = import.meta.env.VITE_REWARDER_ADDRESS as string;
  if (!addr) throw new Error("Missing VITE_REWARDER_ADDRESS");

  const diffCode = difficulty === "easy" ? 0 : difficulty === "medium" ? 1 : 2;
  const contract = new Contract(addr, REWARDER_ABI, signer);

  const tx = await contract.claimWin(diffCode, Math.max(0, Math.floor(secondsPlayed)));
  const receipt = await tx.wait();

  return receipt; // trả receipt để lấy hash
}
