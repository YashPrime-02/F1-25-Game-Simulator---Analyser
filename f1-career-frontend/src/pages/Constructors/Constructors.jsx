import { useEffect, useState } from "react";
import api from "../../services/api";
import { useSeason } from "../../context/SeasonContext";
import "./Combined.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/F1_theme.mp3";

/* ===============================
   Animated Number Counter
=============================== */

function AnimatedNumber({ value }) {

  const [display,setDisplay] = useState(0);

  useEffect(()=>{

    let start = 0;
    const duration = 1200;
    const step = 20;
    const increment = value / (duration / step);

    const counter = setInterval(()=>{

      start += increment;

      if(start >= value){
        start = value;
        clearInterval(counter);
      }

      setDisplay(Number(start.toFixed(1)));

    },step);

    return ()=>clearInterval(counter);

  },[value]);

  return <>{display}%</>;
}

export default function Constructors() {

  const { season } = useSeason();
  const [table,setTable] = useState([]);

  useEffect(()=>{

    if(!season) return;

    api
      .get(`/standings/constructors/${season.id}`)
      .then(res => setTable(res.data))
      .catch(err => console.error(err));

  },[season]);

  const teamClass = name =>
    name.toLowerCase().replace(/[^a-z]/g,"");

  const teamLogo = (team) => {

    const map = {

      ferrari:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/ferrari-logo.png",

      redbullracing:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",
      redbull:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/red-bull-racing-logo.png",

      mercedes:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/mercedes-logo.png",

      mclaren:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/mclaren-logo.png",

      astonmartin:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/aston-martin-logo.png",

      alpine:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/alpine-logo.png",

      williams:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/williams-logo.png",

      haas:
        "https://media.formula1.com/content/dam/fom-website/teams/2024/haas-logo.png",

      racingbulls:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/RB_Formula_One_Team_Logo.svg/512px-RB_Formula_One_Team_Logo.svg.png",
      rb:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/RB_Formula_One_Team_Logo.svg/512px-RB_Formula_One_Team_Logo.svg.png",

      sauber:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Stake_F1_Team_Kick_Sauber_logo.svg/512px-Stake_F1_Team_Kick_Sauber_logo.svg.png",
      kicksauber:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Stake_F1_Team_Kick_Sauber_logo.svg/512px-Stake_F1_Team_Kick_Sauber_logo.svg.png",
    };

    return map[teamClass(team)] ||
      "https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg";
  };

  /* ===============================
     🎵 Background Music
  =============================== */

  useBackgroundAudio(f1Music,{
    volume:0.35,
    loop:true
  });

  /* ===============================
     Probability Calculation
  =============================== */

  const getTop3Probabilities = () => {

    if(!table.length) return [];

    const top3 = table.slice(0,3);

    const total =
      top3.reduce((sum,t)=>sum+t.points,0);

    return top3.map(t=>({

      team:t.team,
      points:t.points,
      probability:
        Number(((t.points/total)*100).toFixed(1))

    }));

  };

  const top3Prob = getTop3Probabilities();

  return (

    <div className="constructors-page">

      <h2>Constructors Championship</h2>

      {/* ================= TABLE ================= */}

      <table>

        <thead>

          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>Drivers</th>
            <th>Points</th>
          </tr>

        </thead>

        <tbody>

          {table.map(team => (

            <tr
              key={team.team}
              className={`team-row ${teamClass(team.team)}`}
            >

              <td className="pos">
                {team.position}
              </td>

              <td className="team-name">

                <img
                  src={teamLogo(team.team)}
                  alt=""
                  className="team-logo"
                />

                {team.team}

              </td>

              <td>

                {team.drivers.map(d => (

                  <div
                    key={d.name}
                    className="driver-line"
                  >

                    🪖 {d.name}

                    <span className="driver-points">
                      {d.points}
                    </span>

                  </div>

                ))}

              </td>

              <td className="points-cell">

                <div className="points-value">
                  {team.points}
                </div>

                <div className="points-bar">

                  <div
                    className="points-fill"
                    style={{
                      width:
                      `${(team.points/table[0].points)*100}%`
                    }}
                  />

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

      {/* ================= PROBABILITY CARD ================= */}

      <div className="title-probability-card">

        <h3>🏆 Championship Probability</h3>

        {top3Prob.map(t => (

          <div
            key={t.team}
            className={`prob-row ${teamClass(t.team)}`}
          >

            <span className="prob-team">

              <img
                src={teamLogo(t.team)}
                alt=""
                className="team-logo-small"
              />

              {t.team}

            </span>

            <div className="prob-bar">

              <div
                className="prob-fill"
                style={{
                  width:`${t.probability}%`
                }}
              />

            </div>

            <span className="prob-value">

              <AnimatedNumber value={t.probability}/>

            </span>

          </div>

        ))}

      </div>

    </div>

  );

}