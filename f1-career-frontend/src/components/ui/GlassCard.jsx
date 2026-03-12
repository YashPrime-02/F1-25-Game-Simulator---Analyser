import "./glasscard.css";

function GlassCard({ children }) {
  return (
    <div className="glass-card">
      {children}
    </div>
  );
}

export default GlassCard;