import GlassCard from "../../components/ui/GlassCard";
import Counter from "../../components/ui/Counter";
export default function Dashboard() {
  return (
    <>
      <GlassCard>
        <h2>Championship Leader</h2>
        <p>Max Verstappen</p>
      </GlassCard>

      <br />

      <GlassCard>
        <h2>Points Gap</h2>
        <Counter value={8} /> Points
      </GlassCard>
    </>
  );
}
