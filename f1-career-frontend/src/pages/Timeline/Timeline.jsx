import { useEffect, useState } from "react";
import "./Timeline.css";

export default function LiveRaceTimeline({
  results,
  onFinish,
}) {
  const TOTAL_LAPS = 12; // cinematic laps

  const [lap, setLap] = useState(0);
  const [leader, setLeader] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!results) return;

    const winner = results.winner;
    setLeader(winner);

    const interval = setInterval(() => {
      setLap((prev) => {
        const next = prev + 1;

        generateEvent(next);

        if (next >= TOTAL_LAPS) {
          clearInterval(interval);
          setTimeout(onFinish, 1200);
        }

        return next;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [results]);

  const generateEvent = (lapNumber) => {
    const messages = [
      `${leader} sets fastest sector.`,
      "DRS battle intensifying.",
      "Midfield fight heating up.",
      "Pit strategy window opening.",
      `${leader} extending gap.`,
      "Close battle for podium positions.",
    ];

    const random =
      messages[Math.floor(Math.random() * messages.length)];

    setEvents((prev) => [
      { lap: lapNumber, text: random },
      ...prev.slice(0, 4),
    ]);
  };

  return (
    <div className="timeline-container">

      <h3>LIVE RACE FEED</h3>

      {/* LAP BAR */}
      <div className="lap-bar">
        <div
          className="lap-progress"
          style={{
            width: `${(lap / TOTAL_LAPS) * 100}%`,
          }}
        />
      </div>

      <p>Lap {lap} / {TOTAL_LAPS}</p>

      {/* LEADER */}
      <div className="leader-box">
        Leader: <strong>{leader}</strong>
      </div>

      {/* EVENTS */}
      <div className="event-feed">
        {events.map((e, i) => (
          <p key={i}>
            <span>Lap {e.lap}</span> — {e.text}
          </p>
        ))}
      </div>
    </div>
  );
}