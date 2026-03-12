import { useEffect, useRef, useState } from "react";

export default function F1StartLights({ onComplete }) {

  const [lights, setLights] = useState(0);
  const [green, setGreen] = useState(false);
  const [started, setStarted] = useState(false);

  const beepAudio = useRef(null);

  useEffect(() => {

    const startSequence = () => {

      if (started) return;

      setStarted(true);

      console.log("User interaction detected → starting sequence");

      const audio = beepAudio.current;

      if (audio) {
        audio.currentTime = 0;
        audio.play()
          .then(() => console.log("Beep audio started"))
          .catch(err => console.error("Audio blocked:", err));
      }

      let count = 0;

      const interval = setInterval(() => {

        count += 1;

        console.log("Light:", count);

        setLights(count);

        if (count === 5) {

          clearInterval(interval);

          setTimeout(() => {

            console.log("Lights green");
            setGreen(true);

            setTimeout(() => {

              console.log("Transition to intro video");

              if (onComplete) onComplete();

            }, 1000);

          }, 1200);
        }

      }, 1000);

    };

    window.addEventListener("click", startSequence);
    window.addEventListener("keydown", startSequence);

    return () => {
      window.removeEventListener("click", startSequence);
      window.removeEventListener("keydown", startSequence);
    };

  }, [started, onComplete]);

  return (
    <div className="lights-overlay">

      <audio
        ref={beepAudio}
        src="/beep.mp3"
        preload="auto"
      />

      {!started && (
        <div className="start-message">
          Click or press any key to start
        </div>
      )}

      <div className="gantry">

        <div className="gantry-top">
          {[1,2,3,4,5].map(n => (
            <div key={n} className="gantry-slot"/>
          ))}
        </div>

        <div className="lights-container">
          {[1,2,3,4,5].map(n => (
            <div
              key={n}
              className={`light ${
                green
                  ? "green"
                  : lights >= n
                  ? "red"
                  : ""
              }`}
            />
          ))}
        </div>

      </div>

    </div>
  );
}