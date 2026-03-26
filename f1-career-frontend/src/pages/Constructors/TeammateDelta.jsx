import { useEffect,useState } from "react";
import api from "../../services/api";
import { useSeason } from "../../context/SeasonContext";
import "./TeammateDelta.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";
export default function TeammateDelta(){

  const { season } = useSeason();
  const [data,setData] = useState([]);

  useEffect(()=>{

    if(!season) return;

    api.get(`/standings/teammates/${season.id}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err));

  },[season]);

  const teamClass = (name) =>
    name.toLowerCase().replace(/[^a-z]/g,"");


    /* ===============================
       🎵 KEEP SOUND SYSTEM (UNCHANGED)
    =============================== */
  
    useBackgroundAudio(f1Music, {
      volume: 0.35,
      loop: true,
    });
  
  return(

    <div className="teammate-page">

      <h2>Teammate Battle</h2>

      {data.map(t => (

        <div
          key={t.team}
          className={`team-card ${teamClass(t.team)}`}
        >

          <h3>{t.team}</h3>

          <p>
            🪖 {t.driver1}
            <span className="driver-points">
              {t.points1}
            </span>
          </p>

          <p>
            🪖 {t.driver2}
            <span className="driver-points">
              {t.points2}
            </span>
          </p>

          <strong className="delta">
            Δ {t.delta}
          </strong>

        </div>

      ))}

    </div>

  );

}