
import { UploadCloud, Music } from "lucide-react";
export default function DropZone({ onFile }) {
  return (
    <div
      className="relative border-2 border-dotted border-beatsOrange rounded-xl p-10 flex flex-col items-center text-center gap-4 animate-[pulseBorder_6s_linear_infinite]"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
    >
      <Music size={48} className="text-beatsOrange" />
      <p className="text-beatsOrange">Déposez votre fichier audio</p>
      <label className="bg-beatsOrange text-black rounded-md px-4 py-2 cursor-pointer font-semibold inline-flex items-center gap-2 hover:bg-orange-700">
        <UploadCloud size={16} /> Ou sélectionner un fichier
        <input
          type="file"
          accept="audio/mp3,audio/mpeg,audio/wav"
          className="hidden"
          onChange={(e) => e.target.files && onFile(e.target.files[0])}
        />
      </label>
    </div>
  );
}
