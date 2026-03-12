import { useEffect, useRef, useState } from "react";

export default function IntroVideo({ onFinish }) {
  const videoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);

  const skipIntro = () => {
    if (onFinish) onFinish();
  };

  const unmuteVideo = () => {
    const video = videoRef.current;

    if (video) {
      video.muted = false;
      video.volume = 1;
      setIsMuted(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;

    const handleKey = (e) => {
      if (e.key === "Enter") {
        skipIntro();
      }
    };

    const handleClick = () => {
      unmuteVideo();
    };

    window.addEventListener("keydown", handleKey);
    window.addEventListener("click", handleClick);

    if (video) {
      video.play().catch(() => {
        console.log("Autoplay blocked");
      });
    }

    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <div className="intro-overlay">
      <video
        ref={videoRef}
        autoPlay
        muted={isMuted}
        playsInline
        className="intro-video"
        onEnded={skipIntro}
      >
        <source src="/Intro.mp4" type="video/mp4" />
      </video>

      <div className="skip-message">
        Press <b>ENTER</b> to skip
       
      </div>
      <div className="skip-message-2">
       {isMuted && <div className="unmute-text">Click anywhere to unmute</div>}
      </div>
    </div>
  );
}