#!/usr/bin/env python3
"""
opuspro4.py – Convertisseur Opus v4 (correctif afade)
====================================================
Version corrigée après retour d’erreur FFmpeg :

* **Problème rencontré** : L’option `st=send‑0.005` dans le filtre `afade` n’est pas
  acceptée par certaines versions de FFmpeg → « Unable to parse option value
  \"send-0.005\" as duration ».
* **Solution** : on conserve un fondu d’entrée ultra‑court (0,005 s) pour éviter les
  clics, mais on retire le fondu de sortie. Cela suffit pour éliminer les artéfacts
  sans risquer d’incompatibilité.

Usage inchangé :
    python opuspro4.py input.wav [output.opus] [--max-size 350] [--target-br 24k]

Dépendances : `ffmpeg` ≥ 4.x et `ffprobe` disponibles dans le PATH.
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

DEFAULT_SR = 24_000  # Hz
DEFAULT_CUTOFF = 13_000  # Hz
MIN_BITRATE = 12  # kbit/s – en‑dessous, la qualité devient mauvaise


def probe_duration(in_file: str) -> float:
    """Retourne la durée du fichier audio (en secondes) via ffprobe."""
    result = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "a:0",
            "-show_entries",
            "stream=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(in_file),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(result.stdout.strip())


def ensure_wav(in_file: str) -> str:
    """Si l'entrée n'est pas un WAV, la décode temporairement en WAV et retourne le chemin."""
    ext = Path(in_file).suffix.lower()
    if ext == ".wav":
        return in_file

    tmp_wav = tempfile.mktemp(suffix=".wav")
    subprocess.run(
        ["ffmpeg", "-y", "-i", in_file, "-ar", str(DEFAULT_SR), tmp_wav], check=True
    )
    return tmp_wav


def build_filter_chain(cutoff: int, silence_th: str = "-40dB", silence_dur: float = 0.2):
    """Construit la chaîne de filtres FFmpeg (passe‑bas + trim silence + mini fade‑in)."""
    silenceremove = (
        f"silenceremove=start_periods=1:start_threshold={silence_th}:"
        f"stop_periods=1:stop_threshold={silence_th}:stop_duration={silence_dur}"
    )
    # Fondu d'entrée court pour supprimer les clics après suppression du silence
    afade_in = "afade=t=in:d=0.005"
    return f"lowpass=f={cutoff},{silenceremove},{afade_in}"


def opus_encode(
    in_wav: str,
    out_opus: str,
    bitrate_kbps: int,
    frame_dur: str = "60",
    frames_per_packet: int | None = 2,
):
    """Encode le WAV en Opus avec un bitrate CBR donné."""
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        in_wav,
        "-c:a",
        "libopus",
        "-b:a",
        f"{bitrate_kbps}k",
        "-vbr",
        "off",
        "-application",
        "audio",
        "-frame_duration",
        frame_dur,
    ]
    if frames_per_packet:
        cmd += ["-frames_per_packet", str(frames_per_packet)]
    cmd.append(out_opus)
    subprocess.run(cmd, check=True)


def convert(
    input_file: str,
    output_file: str | None = None,
    max_size_kb: int = 350,
    target_br: str = "24k",
):
    """Pipeline complet : pré‑traitement, encodage adaptatif, contrôle de taille."""
    if output_file is None:
        base = os.path.splitext(input_file)[0]
        output_file = base + "_v4.opus"

    # Étape 1 : garantir une source WAV
    tmp_wav1 = ensure_wav(input_file)

    # Étape 2 : pré‑traitement (mono + filtre + trim silence + fade‑in)
    tmp_wav2 = tempfile.mktemp(suffix=".wav")
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            tmp_wav1,
            "-ar",
            str(DEFAULT_SR),
            "-ac",
            "1",
            "-af",
            build_filter_chain(DEFAULT_CUTOFF),
            tmp_wav2,
        ],
        check=True,
    )

    # Étape 3 : encodage adaptatif jusqu'à respecter la limite
    duration = probe_duration(tmp_wav2)
    bits_allowed = max_size_kb * 1024 * 8
    max_br_kbps = int(bits_allowed / duration / 1000)

    requested_br = int(target_br.rstrip("k"))
    br_kbps = min(requested_br, max_br_kbps)
    br_kbps = max(br_kbps, MIN_BITRATE)

    while True:
        opus_encode(tmp_wav2, output_file, br_kbps)
        size_kb = os.path.getsize(output_file) / 1024
        if size_kb <= max_size_kb or br_kbps <= MIN_BITRATE:
            break
        br_kbps = max(br_kbps - 2, MIN_BITRATE)
        print(f"Fichier trop gros ({size_kb:.0f} kB), réencodage à {br_kbps} kbps…")

    # Rapport final
    print(
        f"✓ Conversion terminée : {size_kb:.1f} kB – bitrate réel {br_kbps} kbps – durée {duration:.1f}s"
    )

    # Nettoyage
    for f in {tmp_wav1, tmp_wav2}:
        if f and os.path.exists(f) and f != input_file:
            os.remove(f)


# --------------------------------------------------
# CLI
# --------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convertisseur Opus optimisé (<350 kB).")
    parser.add_argument("input_file", help="Fichier audio source (WAV/Opus/…)")
    parser.add_argument("output_file", nargs="?", help="Nom du fichier Opus de sortie")
    parser.add_argument("--max-size", type=int, default=350, help="Taille max en kB (350 par défaut)")
    parser.add_argument(
        "--target-br",
        default="24k",
        help="Débit souhaité en kbit/s ('24k' par défaut). Sera abaissé si nécessaire.",
    )
    args = parser.parse_args()

    convert(args.input_file, args.output_file, args.max_size, args.target_br)
