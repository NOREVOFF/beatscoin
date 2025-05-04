
import { useState } from "react";
import { connectWalletWithSignature } from "../lib/walletUtils";

const wallets = [
  { name: "Unisat", icon: "/wallets/unisat.png" },
  { name: "Xverse", icon: "/wallets/xverse.png" },
];

export default function WalletModal({ isOpen, onClose, onConnected }) {
  const [loading, setLoading] = useState(null);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-8 rounded-xl w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Connecter un wallet</h2>
        <div className="flex flex-col gap-4">
          {wallets.map((w) => (
            <button
              key={w.name}
              onClick={async () => {
                setLoading(w.name);
                try {
                  const wallet = await connectWalletWithSignature(w.name);
                  onConnected(wallet);
                  onClose();
                } catch (e) {
                  alert(e.message);
                }
                setLoading(null);
              }}
              className="w-full border border-beatsOrange rounded-lg py-2 flex items-center gap-3 justify-center hover:bg-orange-700/20"
            >
              <img src={w.icon} alt={w.name} className="w-6 h-6" />
              {loading === w.name ? "Connexion…" : w.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
