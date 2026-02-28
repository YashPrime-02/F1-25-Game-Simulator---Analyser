import { useEffect, useRef } from "react";

export default function useBackgroundAudio(src, options = {}) {
  const audioRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null); // ✅ prevent animation leak

  useEffect(() => {
    const STORAGE_KEY = "music-muted";

    /* ===== DEFAULT STATE (music ON first visit) ===== */
    if (localStorage.getItem(STORAGE_KEY) === null) {
      localStorage.setItem(STORAGE_KEY, "false");
    }

    const audio = new Audio(src);
    audio.loop = true;
    audio.volume = options.volume ?? 0.35;

    audioRef.current = audio;

    /* ===== AUDIO CONTEXT ===== */
    const ctx = new (window.AudioContext ||
      window.webkitAudioContext)();

    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();

    analyser.fftSize = 256;

    source.connect(analyser);
    analyser.connect(ctx.destination);

    analyserRef.current = analyser;

    /* ===== PLAY (SAFE AUTOSTART) ===== */
    const start = async () => {
      const muted =
        localStorage.getItem(STORAGE_KEY) === "true";

      if (!muted) {
        try {
          if (ctx.state === "suspended") {
            await ctx.resume();
          }
          await audio.play();
        } catch {
          // autoplay blocked silently
        }
      }
    };

    start();

    /* ===== BEAT LOOP ===== */
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateBeat = () => {
      analyser.getByteFrequencyData(dataArray);

      const avg =
        dataArray.reduce((a, b) => a + b, 0) /
        dataArray.length;

      window.dispatchEvent(
        new CustomEvent("music-beat", {
          detail: avg,
        })
      );

      rafRef.current = requestAnimationFrame(updateBeat);
    };

    updateBeat();

    /* ===== GLOBAL MUTE HANDLER ===== */
    const toggleHandler = async () => {
      const muted =
        localStorage.getItem(STORAGE_KEY) === "true";

      try {
        if (ctx.state === "suspended") {
          await ctx.resume();
        }

        if (muted) {
          audio.pause();
        } else {
          await audio.play();
        }
      } catch {}
    };

    window.addEventListener("music-toggle", toggleHandler);

    /* ===== CLEANUP ===== */
    return () => {
      window.removeEventListener("music-toggle", toggleHandler);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      audio.pause();
      audio.src = "";
      ctx.close();
    };
  }, [src, options.volume]);

  return { audioRef, analyserRef };
}