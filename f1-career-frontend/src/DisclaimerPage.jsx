import { useEffect } from "react";
import "./Disclaimer.css";
import useBackgroundAudio from ".//hooks/useBackgroundAudio";
import f1Music from "./assets/f1Drive.mp3";

export default function DisclaimerPage({ onEnter }) {
  /* ===============================
       🎵 BACKGROUND AUDIO
    =============================== */

  useBackgroundAudio(f1Music, {
    volume: 0.35,
    loop: true,
  });

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        onEnter();
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [onEnter]);

  return (
    <div className="disclaimer-screen" onClick={onEnter}>
      <div className="disclaimer-box" onClick={(e) => e.stopPropagation()}>
        <h1 className="disclaimer-title">DISCLAIMER</h1>

        <p>
          This application is a fan-made project created for entertainment,
          learning and portfolio demonstration purposes only.
        </p>

        <p>
          All teams, drivers, names, logos, images and other intellectual
          property related to Formula One are the property of their respective
          owners.
        </p>

        <p>
          This project is not affiliated with, endorsed by, sponsored by, or
          connected to Formula One, the FIA, or any official teams, broadcasters
          or partners.
        </p>

        <p>
          Some audio used within this project includes music inspired by or
          sourced from Formula One related media, including compositions by Hans
          Zimmer and music associated with Formula One cinematic productions.
        </p>

        <p>
          Additional music references include songs from the Formula One film
          soundtrack featuring artists such as Ed Sheeran, as well as the
          Formula One podium scorecard theme used for stylistic presentation
          within this fan project.
        </p>

        <p>
          All music rights belong to their respective composers, performers,
          production studios and record labels. No ownership is claimed over any
          copyrighted material.
        </p>

        <p className="fan-note">
          This project exists purely for fan enjoyment, creative experimentation
          and educational demonstration purposes. No monetization, commercial
          use or redistribution of copyrighted media is intended. All rights
          belong to their respective owners.
          <br />
          <br />
          Built by a fan, for fans of Formula One.
          <br />
          <span className="lights-out-text">Lights out… and away we go.</span>
        </p>
        <button className="enter-btn" onClick={onEnter}>
          PRESS ENTER OR CLICK TO PROCEED
        </button>
      </div>
    </div>
  );
}
