const { RaceResult, RaceWeekend, Driver, Team } = require("../models");

const POINTS = {
  1:25,2:18,3:15,4:12,5:10,
  6:8,7:6,8:4,9:2,10:1
};

//==============================
// CONSTRUCTOR STANDINGS
//==============================

exports.getConstructors = async (req,res) => {

  try{

    const { seasonId } = req.params;

    const weekends = await RaceWeekend.findAll({
      where:{ seasonId }
    });

    const weekendIds = weekends.map(w=>w.id);

    const results = await RaceResult.findAll({
      where:{ raceWeekendId: weekendIds },
      include:[
        {
          model:Driver,
          include:[Team]
        }
      ]
    });

    const teams = {};

    results.forEach(r=>{

      const team = r.Driver.Team.name;
      const pos = r.position;

      if(!teams[team]){

        teams[team] = {
          team,
          points:0,
          drivers:{}
        };

      }

      const pts = POINTS[pos] || 0;

      teams[team].points += pts;

      const driverName =
        r.Driver.firstName + " " + r.Driver.lastName;

      if(!teams[team].drivers[driverName])
        teams[team].drivers[driverName] = 0;

      teams[team].drivers[driverName] += pts;

    });

    const table =
      Object.values(teams)
      .sort((a,b)=>b.points-a.points)
      .map((t,i)=>({

        position:i+1,
        team:t.team,
        points:t.points,
        drivers:Object.entries(t.drivers).map(d=>({
          name:d[0],
          points:d[1]
        }))

      }));

    res.json(table);

  }
  catch(err){

    console.error(err);
    res.status(500).json({message:"Constructor standings error"});

  }

};

//==============================
// TEAMMATE DELTA
//==============================

exports.getTeammateDelta = async (req,res)=>{

  try{

    const { seasonId } = req.params;

    const weekends = await RaceWeekend.findAll({
      where:{ seasonId }
    });

    const weekendIds = weekends.map(w=>w.id);

    const results = await RaceResult.findAll({
      where:{ raceWeekendId: weekendIds },
      include:[
        {
          model:Driver,
          include:[Team]
        }
      ]
    });

    const teams={};

    const POINTS={
      1:25,2:18,3:15,4:12,5:10,
      6:8,7:6,8:4,9:2,10:1
    };

    results.forEach(r=>{

      const team=r.Driver.Team.name;

      const name=r.Driver.firstName+" "+r.Driver.lastName;

      const pts=POINTS[r.position]||0;

      if(!teams[team]) teams[team]={};

      if(!teams[team][name]) teams[team][name]=0;

      teams[team][name]+=pts;

    });

    const delta=[];

    Object.entries(teams).forEach(([team,drivers])=>{

      const d=Object.entries(drivers);

      if(d.length===2){

        const diff=Math.abs(d[0][1]-d[1][1]);

        delta.push({

          team,
          driver1:d[0][0],
          points1:d[0][1],
          driver2:d[1][0],
          points2:d[1][1],
          delta:diff

        });

      }

    });

    res.json(delta);

  }
  catch(err){

    console.error(err);
    res.status(500).json({message:"Teammate delta error"});

  }

};