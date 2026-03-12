import { createContext, useContext, useRef } from "react";

const SoundContext = createContext();

export function SoundProvider({ children }) {
  const errorRef = useRef(new Audio("/fahhhhh.mp3"));

  const playError = () => {
    errorRef.current.currentTime = 0;
    errorRef.current.play();
  };

  return (
    <SoundContext.Provider value={{ playError }}>
      {children}
    </SoundContext.Provider>
  );
}

export const useSound = () => useContext(SoundContext);