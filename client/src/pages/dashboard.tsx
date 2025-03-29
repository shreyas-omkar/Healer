import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-6 font-league">
      <nav className="w-full flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold hover:opacity-75 transition hover:cursor-pointer" onClick={() => navigate("/")}>Scriptocol</h1>
        <button 
          onClick={() => navigate("/login")}
          className="px-4 py-2 rounded-full purpleGradient hover:cursor-pointer hover:opacity-75 transition"
        >
          Logout
        </button>
      </nav>
      
      <div className="space-y-6 font-league">
        <div className="grid grid-cols-3 text-black gap-6">
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-6 text-black">
            <h3 className="text-lg font-semibold mb-2">Total Repos</h3>
            <p className="text-3xl font-bold">12</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Active PRs</h3>
            <p className="text-3xl font-bold">5</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-2">Contributions</h3>
            <p className="text-3xl font-bold">28</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <p>Merged PR in repository-name</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p>Created new PR in repository-name</p>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <p>Updated repository settings</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Your Repositories</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 cursor-pointer transition">
              <h3 className="font-semibold">repository-name</h3>
              <p className="text-sm text-gray-400">Last updated 2 days ago</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 cursor-pointer transition">
              <h3 className="font-semibold">another-repo</h3>
              <p className="text-sm text-gray-400">Last updated 1 week ago</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 hover:bg-gray-700 cursor-pointer transition">
              <h3 className="font-semibold">project-repo</h3>
              <p className="text-sm text-gray-400">Last updated 3 days ago</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4">Pull Requests</h2>
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Feature: Add new dashboard</h3>
                <span className="px-3 py-1 rounded-full text-sm bg-blue-500">Open</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">repository-name • Created 2 days ago</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold">Fix: Update styling</h3>
                <span className="px-3 py-1 rounded-full text-sm bg-green-500">Merged</span>
              </div>
              <p className="text-sm text-gray-400 mt-2">another-repo • Merged 1 day ago</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <span>Email Notifications</span>
                <button className="px-4 py-2 rounded-full purpleGradient hover:opacity-75 transition">
                  Configure
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                <span>Theme</span>
                <button className="px-4 py-2 rounded-full purpleGradient hover:opacity-75 transition">
                  Change
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <button className="w-full px-6 py-3 rounded-xl purpleGradient hover:opacity-75 transition text-lg">
              Raise a Pull Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
