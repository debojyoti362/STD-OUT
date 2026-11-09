import { useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import "./Auth.css";

export default function Auth() {
  const { login, signup } = useAuth();
  const [showModal, setShowModal] = useState(false); // Controls modal/dropdown visibility
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isSignup = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignup) await signup(name, email, password);
      else await login(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? "login" : "signup");
    setError("");
  };

  return (
    <div className="authPage">
      {/* Clear, crisp centered logo background element */}
      <div className="authLogoBackground">
        <img src="/bg-logo.png" alt="STD-out Logo" className="clearLogoImg" />
        
        {!showModal && (
          <button className="openAuthBtn" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-right-to-bracket"></i> Get Started / Sign In
          </button>
        )}
      </div>

      {/* Floating Login / Signup Form Dropdown Card */}
      {showModal && (
        <div className="modalOverlay" onClick={() => setShowModal(false)}>
          <form className="authCard" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
            <button className="closeModalBtn" type="button" onClick={() => setShowModal(false)}>
              &times;
            </button>

            <div className="authBrand">
              <i className="fa-solid fa-terminal"></i>
              <span>STD-out</span>
            </div>
            <h2>{isSignup ? "Create your account" : "Welcome back"}</h2>

            {isSignup && (
              <input
                className="authInput"
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            )}
            <input
              className="authInput"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            <input
              className="authInput"
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={6}
              required
            />

            {error && <p className="authError">{error}</p>}

            <button className="authSubmit" type="submit" disabled={busy}>
              {busy ? "Please wait…" : isSignup ? "Sign up" : "Log in"}
            </button>

            <p className="authSwitch">
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <span className="authLink" onClick={switchMode}>
                {isSignup ? "Log in" : "Create an account"}
              </span>
            </p>
          </form>
        </div>
      )}
    </div>
  );
}