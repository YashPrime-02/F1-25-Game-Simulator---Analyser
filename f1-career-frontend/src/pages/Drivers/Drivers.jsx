import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Drivers.css";
import useBackgroundAudio from "../../hooks/useBackgroundAudio";
import f1Music from "../../assets/f1Drive.mp3";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine
} from "recharts";

export default function DriverProfile() {

  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);

  useBackgroundAudio(f1Music,{volume:0.35,loop:true});

  useEffect(()=>{

    const loadProfile = async()=>{

      try{

        const seasonRes = await api.get("/seasons/active");
        const seasonId = seasonRes.data.id;

        const profileRes = await api.get(
          `/player-career/profile/${seasonId}?career=true`
        );

        setData(profileRes.data);

      }catch(err){

        console.error("Driver profile load error:",err);

      }finally{

        setLoading(false);

      }
    };

    loadProfile();

  },[]);

  if(loading) return <div className="loading">Loading Driver Profile...</div>;
  if(!data) return <div className="loading">Driver data unavailable</div>;

  const {driver,stats,raceHistory} = data;

  /* CLEAN + SORT DATA */

  const chartData = [...raceHistory]

    .filter(r =>
      r &&
      r.round &&
      r.position !== null &&
      r.position !== undefined
    )

    .sort((a,b)=>{

      const [sA,rA] = a.round.replace("S","").split("-R");
      const [sB,rB] = b.round.replace("S","").split("-R");

      if(parseInt(sA) !== parseInt(sB))
        return parseInt(sA) - parseInt(sB);

      return parseInt(rA) - parseInt(rB);

    })

    .map((race,index)=>({

      raceIndex:index+1,
      position:race.position,
      round:race.round

    }));


  /* SEASON BREAKS */

  const seasonBreaks = [];
  const seasonLabels = [];

  chartData.forEach((race,i)=>{

    const currentSeason = race.round.split("-")[0];

    if(i===0){

      seasonLabels.push({
        index:race.raceIndex,
        season:currentSeason
      });

      return;
    }

    const prevSeason = chartData[i-1].round.split("-")[0];

    if(prevSeason !== currentSeason){

      seasonBreaks.push({
        index:race.raceIndex
      });

      seasonLabels.push({
        index:race.raceIndex,
        season:currentSeason
      });

    }

  });


  return (

    <div className="driver-profile-container">

      {/* HEADER */}

      <div className="driver-header">

        <div className="driver-info">
          <h2>{driver.name}</h2>
          <p>{driver.team}</p>
          <p>#{driver.number}</p>
        </div>

        <div className="morale">
          Morale: {driver.morale}
        </div>

      </div>


      {/* STATS */}

      <div className="stats-grid">

        <div className="stat">
          <span>P{stats.position}</span>
          <p>Current Championship Position</p>
        </div>

        <div className="stat">
          <span>{stats.points}</span>
          <p>Current Season Points</p>
        </div>

        <div className="stat">
          <span>{stats.wins}</span>
          <p>Total Wins</p>
        </div>

        <div className="stat">
          <span>{stats.podiums}</span>
          <p>Total Podiums</p>
        </div>

        <div className="stat">
          <span>{stats.fastestLaps}</span>
          <p>Total Fastest Laps</p>
        </div>

        <div className="stat">
          <span>{stats.avgFinish}</span>
          <p>Avg Finish</p>
        </div>

      </div>


      {/* PERFORMANCE CHART */}

      <div className="chart-section">

        <h3>Past Race Performances</h3>

        <ResponsiveContainer width="100%" height={420}>

          <ScatterChart margin={{top:40,right:60,left:20,bottom:20}}>

            <CartesianGrid
              stroke="rgba(255,255,255,0.15)"
              vertical
              horizontal
              strokeDasharray="3 3"
            />

            {/* X AXIS */}

            <XAxis
              type="number"
              dataKey="raceIndex"
              stroke="#aaa"
              interval={Math.ceil(chartData.length/15)}
              tick={{fill:"#aaa",fontSize:12}}
              tickFormatter={(v)=>`R${v}`}
              label={{
                value:"Race Number",
                position:"insideBottom",
                offset:-5,
                fill:"#ccc",
                fontSize:13
              }}
            />

            {/* Y AXIS */}

            <YAxis
              type="number"
              dataKey="position"
              reversed
              domain={[1,20]}
              stroke="#aaa"
              tick={{fill:"#aaa",fontSize:12}}
              tickFormatter={(v)=>`P${v}`}
              label={{
                value:"Finish Position",
                angle:-90,
                position:"insideLeft",
                fill:"#ccc",
                fontSize:13
              }}
            />

            {/* TOOLTIP */}

            <Tooltip
              contentStyle={{
                background:"#0c0c0c",
                border:"1px solid #e10600",
                borderRadius:"10px",
                color:"#fff"
              }}
              formatter={(v)=>[`P${v}`,"Finish Position"]}
              labelFormatter={(label,payload)=>
                payload?.[0]?.payload?.round
                ? `Race ${payload[0].payload.round}`
                : `Race ${label}`
              }
            />


            {/* SEASON SEPARATORS */}

            {seasonBreaks.map((s,i)=>(

              <ReferenceLine
                key={i}
                x={s.index}
                stroke="#ff2a2a"
                strokeDasharray="4 4"
              />

            ))}


            {/* SEASON LABELS */}

            {seasonLabels.map((s,i)=>(

              <ReferenceLine
                key={`label-${i}`}
                x={s.index}
                stroke="transparent"
                label={{
                  value:s.season.replace("S","Season "),
                  position:"top",
                  fill:"#ff2a2a",
                  fontSize:13,
                  offset:10
                }}
              />

            ))}


            {/* RACE DOTS */}

            <Scatter

              data={chartData}

              shape={(props)=>{

                const {cx,cy,payload} = props;
                const pos = payload.position;

                let color = "#555";

                if(pos===1) color="#FFD700";
                else if(pos<=3) color="#00d084";
                else if(pos<=10) color="#2b7cff";

                return (

                  <circle
                    cx={cx}
                    cy={cy}
                    r={6}
                    fill={color}
                    stroke="#111"
                    strokeWidth={1.5}
                  />

                );

              }}

            />

          </ScatterChart>

        </ResponsiveContainer>


        {/* LEGEND */}

        <div className="race-legend">

          <div>
            <span className="legend-dot win"></span> Win
          </div>

          <div>
            <span className="legend-dot podium"></span> Podium
          </div>

          <div>
            <span className="legend-dot points"></span> Points
          </div>

          <div>
            <span className="legend-dot dnf"></span> Outside Points / DNF
          </div>

        </div>

      </div>

    </div>

  );

}