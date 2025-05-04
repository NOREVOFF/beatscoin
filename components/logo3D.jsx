
import { motion } from "framer-motion";
export default function Logo3D() {
  return (
    <motion.img
      src="/logo_beatscoin_large.png"
      alt="Beatscoin"
      className="w-[500px] h-[500px] drop-shadow-neon"
      animate={{ rotateY: 360 }}
      transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
    />
  );
}
