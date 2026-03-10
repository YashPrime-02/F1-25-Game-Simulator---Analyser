import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import transitionMusic from "../assets/transition-music.mp3";

const NavigationSound = () => {
  const location = useLocation();
  const audioRef = useRef(null);
  const unlockedRef = useRef(false);

  // Create audio object
  useEffect(() => {
    audioRef.current = new Audio(transitionMusic);
    audioRef.current.volume = 0.7;
  }, []);

  // Unlock autoplay after first user interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioRef.current) return;

      audioRef.current
        .play()
        .then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          unlockedRef.current = true;
          console.log("Audio unlocked");
        })
        .catch(() => {});

      window.removeEventListener("click", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
  }, []);

  // Play sound on route change
  useEffect(() => {
    if (!audioRef.current || !unlockedRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  }, [location.pathname]);

  return null;
};

export default NavigationSound;