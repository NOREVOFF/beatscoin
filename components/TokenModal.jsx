
import { useTokens } from "../context/TokenContext";
import { TOKEN_PACKAGES } from "../lib/constants";
import { Wallet } from "lucide-react";
import { useState } from "react";
import { payWithWallet, connectWalletWithSignature } from "../lib/walletUtils";

export default function TokenModal({ isOpen, onClose }) {
  const { credit } = useTokens();
  const [selected, setSelected] = useState(TOKEN_PACKAGES[0]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-neutral-900 p-8 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-beatsOrange text-xl font-bold">Recharger des jetons</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <p className="mb-4">Choisissez votre package :</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {TOKEN_PACKAGES.map((p) => (
            <button
              key={p.amount}
              onClick={() => setSelected(p)}
              className={`rounded-lg p-4 text-center border transition-all ${
                selected.amount === p.amount
                  ? "bg-beatsOrange text-black border-beatsOrange"
                  : "border-beatsOrange/60 text-white"
              }`}
            >
              <div className="text-2xl font-bold">{p.amount}</div>
              <div className="text-sm">jetons</div>
              <div className="mt-2 text-xs">{p.price} BTC</div>
            </button>
          ))}
        </div>

        <button
          disabled={loading}
          onClick={async () => {
            setLoading(true);
            try {
              const wallet = await connectWalletWithSignature("Unisat"); // default → peut être changé
              await payWithWallet(wallet, Number(selected.price) * 1e8);
              credit(selected.amount);
              onClose();
            } catch (e) {
              console.error(e);
              alert("Paiement échoué : " + e.message);
            }
            setLoading(false);
          }}
          className="w-full bg-beatsOrange hover:bg-orange-700 text-black py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
        >
          <Wallet size={18} />
          {loading ? "Paiement en cours…" : `Acheter ${selected.amount} jetons (${selected.price} BTC)`}
        </button>

        <p className="text-xs text-gray-400 mt-6">
          En mode développement : les transactions sont simulées.
        </p>
        <p className="text-xs text-yellow-400 mt-2">
          💡 Chaque conversion coûte 5 jetons. Les jetons sont liés à votre wallet et ne peuvent pas être remboursés.
        </p>
      </div>
    </div>
  );
}
