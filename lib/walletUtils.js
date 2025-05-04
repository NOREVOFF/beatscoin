
import { RECEIVING_ADDRESS } from "./constants";

export async function connectWalletWithSignature(walletName) {
  let wallet;
  if (walletName === "Unisat") wallet = window.unisat;
  if (walletName === "Xverse") wallet = window.xverse;
  if (!wallet) throw new Error("Wallet non détecté");

  await wallet.requestAccounts();
  // simple ping signature pour relier adresse ↔ site
  await wallet.signMessage("Beatscoin login");
  return wallet;
}

export async function payWithWallet(wallet, sats) {
  // Conversion BTC → satoshi & création PSBT basique vers RECEIVING_ADDRESS
  const btc = sats / 1e8;
  const psbt = await wallet.createPsbt({
    to: [{ address: RECEIVING_ADDRESS, amount: btc.toString() }],
    feeRate: 15 // sats/vB – ajustable
  });
  const signed = await wallet.signPsbt(psbt);
  return wallet.pushPsbt(signed);
}

