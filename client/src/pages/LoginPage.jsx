import React, { useContext, useState } from 'react'
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import { AuthContext } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    try {
      setSubmitting(true);
      if (currState === "Sign Up") {
        if (!isDataSubmitted) {
          setIsDataSubmitted(true);
          return;
        }
        const res = await api.post("/auth/signup", {
          fullname: fullName,
          email,
          password,
          bio,
        });
        if (res.data?.success) {
          login(res.data.userData, res.data.token);
          navigate("/");
        } else {
          alert(res.data?.message || "Signup failed");
        }
      } else {
        const res = await api.post("/auth/login", { email, password });
        if (res.data?.success) {
          login(res.data.userData, res.data.token);
          navigate("/");
        } else {
          alert(res.data?.message || "Login failed");
        }
      }
    } catch (err) {
      alert(err?.response?.data?.message || err.message || "Request failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-black relative">
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md 
          bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900 
          border border-gray-800 shadow-2xl backdrop-blur-lg 
          rounded-3xl p-8 flex flex-col gap-7"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <h2 className="font-semibold text-3xl text-white tracking-wide drop-shadow-lg">{currState}</h2>
          <span
            onClick={() => {
              setCurrState(currState === "Sign Up" ? "Login" : "Sign Up");
              setIsDataSubmitted(false);
            }}
            className="text-gray-300 cursor-pointer hover:text-white hover:scale-105 transition font-medium"
          >
            {currState === "Sign Up" ? "Already have an account?" : "Don't have an account?"}
          </span>
        </div>

        {/* Inputs */}
        {currState === "Sign Up" && !isDataSubmitted && (
          <input
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            type="text"
            className="p-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900/70 text-white placeholder-gray-500 font-medium"
            placeholder="Full Name"
            required
            autoFocus
          />
        )}
        {!isDataSubmitted && (
          <>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className="p-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900/70 text-white placeholder-gray-500 font-medium"
              type="email"
              required
              placeholder="Email Address"
            />
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className="p-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900/70 text-white placeholder-gray-500 font-medium"
              type="password"
              required
              placeholder="Password"
            />
          </>
        )}
        {currState === "Sign Up" && isDataSubmitted && (
          <textarea
            onChange={(e) => setBio(e.target.value)}
            value={bio}
            rows={3}
            className="p-3 rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-gray-600 bg-gray-900/70 text-white placeholder-gray-500 font-medium resize-none"
            placeholder="Provide a short bio..."
            required
          />
        )}

        <button
          disabled={submitting}
          className="py-3 mt-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 hover:from-gray-700 hover:to-gray-600 transition-shadow shadow-lg text-white rounded-xl font-semibold text-lg active:scale-95 duration-150 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {currState === "Sign Up" && !isDataSubmitted
            ? "Next"
            : currState === "Sign Up"
              ? "Create Account"
              : "Login Now"}
        </button>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
          <input type="checkbox" className="accent-gray-600" required />
          <p>
            Agree to <span className="underline cursor-pointer">Terms of Use & Privacy Policy</span>.
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
