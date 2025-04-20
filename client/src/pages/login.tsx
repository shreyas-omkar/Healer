import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthResponse } from "../types/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post<AuthResponse>(
        "http://localhost:3000/auth/login",
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.message === "Login successful") {
        navigate("/dashboard");
      }
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex flex-col items-center text-white bg-black px-6 font-league">
      <nav className="w-full flex justify-between items-center text-sm py-4 px-8">
        <h2 
          className="text-white hover:opacity-70 hover:cursor-pointer text-lg" 
          onClick={() => navigate("/")}
        >
          Scriptocol
        </h2>
        <div className="flex gap-6">
          <button 
            className="hover:opacity-70 hover:cursor-pointer text-white"
            onClick={() => navigate("/")}
          >
            Home
          </button>
          <button
            className="px-3 py-1.5 rounded-xl hover:opacity-70 purpleGradient hover:cursor-pointer"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </button>
        </div>
      </nav>

      <div className="w-full max-w-4xl grid grid-cols-2 gap-6 mt-8">
        <div className="flex items-end cornerGradientLeft rounded-2xl border border-gray-600 p-8">
          <h1 className="text-3xl font-bold text-white">Login</h1>
        </div>

        <div className="rounded-2xl border border-gray-600 p-8 flex flex-col gap-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-white text-base">Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-purple-500 rounded-full bg-transparent text-white focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-white text-base">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-purple-500 rounded-full bg-transparent text-white focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end mt-2">
              <button 
                 onClick={() => navigate('/dashboard')} 
                className="px-6 py-2 rounded-full purpleGradient text-white hover:opacity-75 transition text-base"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
