// pages/index.jsx – ajout d’un compteur global de conversions (stocké en localStorage)
import { useState, useEffect } from "react";
import Head from "next/head";
import { motion } from "framer-motion";
import DropZone from "../components/DropZone";
import Logo3D from "../components/Logo3D";

export default function Home() {
  const [file, setFile] = useState(null);
  const [log, setLog] = useState("");
  const [counter, setCounter] = useState(0);

  /* ---------- charger compteur depuis localStorage ---------- */
  useEffect(() => {
    const saved = Number(localStorage.getItem("beatscoin-count") || 0);
    setCounter(saved);
  }, []);
  /* --------------------------------------------------------- */

  /* ----- async typing queue ----- */
  const queue = [];
  let processing = false;
  const enqueue = (item) => {
    queue.push(item);
    if (!processing) processQueue();
  };
  const processQueue = async () => {
    processing = true;
    while (queue.length) {
      const item = queue.shift();
      if (typeof item === "function") { item(); continue; }
      for (const ch of item + "\n") {
        setLog((p) => p + ch);
        await new Promise((r) => setTimeout(r, 25));
      }
    }
    processing = false;
  };
  /* -------------------------------- */

  const reset = () => { setFile(null); setLog(""); };

  const convert = async (f) => {
    setFile(f);
    setLog("");
    enqueue(`Nom du fichier : ${f.name}`);
    enqueue(`Format : ${f.type}`);
    enqueue(`Poids initial : ${(f.size / 1024).toFixed(2)} Ko`);
    enqueue("");
    enqueue("Traitement Beatscoin en cours...");
    enqueue("");

    const fd = new FormData();
    fd.append("file", f);

    try {
      const res = await fetch("/api/convert", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Conversion échouée");
      const blob = await res.blob();

      enqueue(`Poids final : ${(blob.size / 1024).toFixed(2)} Ko`);
      enqueue("- Optimisation psycho-acoustique sans perte audible");
      enqueue("- Encodage Opus haute efficacité (24 kHz mono)");
      enqueue("- Suppression automatique des fichiers (privacy first)");
      enqueue("");
      enqueue("Projet artisanal : je développe Beatscoin en solo et j'améliore l'algorithme commit après commit.");
      enqueue("Si vous appréciez, vous pouvez soutenir le projet :");
      enqueue("bc1p8lcfssd4gkf5e8eqffhnv6zmc4rstev5y9rf79g0h86v9s3xetcqm4mz67");
      enqueue("");

      enqueue(() => {
        // incrémenter compteur & persister
        setCounter((c) => {
          const next = c + 1;
          localStorage.setItem("beatscoin-count", next);
          return next;
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "beatscoin.opus";
        a.click();
        URL.revokeObjectURL(url);
        enqueue("Téléchargement terminé");
      });
    } catch (e) {
      alert(e.message);
      reset();
    }
  };

  return (
    <>
      <Head><title>Beatscoin</title></Head>
      {/* Compteur conversions */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 text-beatsOrange text-sm font-mono drop-shadow-neon select-none">
        {counter} fichiers convertis
      </div>

      <main className="flex min-h-screen items-center justify-center bg-black text-white px-4 overflow-hidden">
        {/* Clickable logo */}
        <motion.div
          onClick={reset}
          className="cursor-pointer"
          animate={{ x: file ? "-45%" : 0 }}
          transition={{ type: "spring", stiffness: 70 }}
        >
          <Logo3D />
        </motion.div>

        <div className="w-full md:w-1/3 flex items-center justify-center">
          {!file && <DropZone onFile={convert} />}
          {file && (
            <pre className="whitespace-pre-wrap font-mono text-beatsGreen min-h-[460px]">{log}</pre>
          )}
        </div>
      </main>
    </>
  );
}
