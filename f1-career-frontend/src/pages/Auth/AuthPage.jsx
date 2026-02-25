import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../../services/authService";
import { useSound } from "../../context/SoundContext";
import "./AuthPage.css";

function AuthPage() {
  const navigate = useNavigate();
  const { playError } = useSound();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto redirect if token exists
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/mode");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || (isSignup && !name)) {
      playError();
      return alert("All fields required");
    }

    try {
      setLoading(true);

      const payload = isSignup
        ? await signupUser({ name, email, password })
        : await loginUser({ email, password });

      localStorage.setItem("token", payload.token);
      navigate("/mode");
    } catch (err) {
      playError();
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>F1 Career Simulator</h2>
        <p className="subtitle">
          {isSignup ? "Create your paddock entry" : "Enter the paddock"}
        </p>

        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button disabled={loading}>
          {loading
            ? isSignup
              ? "Creating..."
              : "Entering..."
            : isSignup
            ? "Sign Up"
            : "Login"}
        </button>

        <p
          style={{ textAlign: "center", cursor: "pointer", fontSize: "13px" }}
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup
            ? "Already have an account? Login"
            : "Don't have an account? Sign Up"}
        </p>
      </form>
    </div>
  );
}

export default AuthPage;