import React from "react";
import { useNavigate } from "react-router-dom";
import bg from "./assets/LandingPageBG.png"
import img1 from "./assets/Image1.png"
import feat1 from "./assets/Feature1.png"
import feat2 from "./assets/Feature2.png"
import feat3 from "./assets/Feature3.png"
import Spline from '@splinetool/react-spline';

export function App() {

  const navigate = useNavigate();

  return(
    <div className="blackGradient text-white p-4 text-sm min-h-screen font-league">
      <nav className="relative z-10 flex justify-between">
        <h2>Scriptocol</h2>
        <div className="flex gap-8">
          <button className="hover:opacity-70 hover:cursor-pointer" 
          onClick={() => navigate("/login")}
          >Login</button>
          <button className="p-2 rounded-xl hover:opacity-70 purpleGradient hover:cursor-pointer"
          onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </nav>
      <div className="flex flex-col items-center justify-center h-screen" style={{ backgroundImage: `url(${bg})`, backgroundSize: "contain", backgroundPosition: "center",
          backgroundRepeat: "no-repeat" }}>
        
        <div className="absolute inset-0 z-0 opacity-60">
          <Spline 
            scene="https://prod.spline.design/Ysa1zUA2GRdg2e2T/scene.splinecode"
            style={{
              width: '100%', 
              height: '100%', 
              position: 'absolute',
              top: 0,
              left: 0,
              background: 'transparent',
              pointerEvents: 'none' // Prevents interaction with the 3D scene
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-screen">
            <h1 className="font-medium text-8xl tracking-[2rem]">SCRIPTOCOL</h1>
            <p className="font-light text-xl tracking-wider">Ai Powered Self Healing Code
            Optimization and Testing</p>
            <div className="flex pt-10 gap-5 w-4/12"> 
              <button className="bg-white w-6/12 text-black hover:opacity-70 rounded-xl p-2 hover:cursor-pointer">Get Started</button>
              <button className="purpleGradient hover:opacity-70 w-6/12 rounded-xl p-2 hover:cursor-pointer"
              onClick={()=> navigate("/login")}
              >Login</button>
            </div>
        </div>

        
      </div>
      <div className="flex flex-col items-center py-[10%] h-full">
        <p className="font-medium text-2xl tracking-widest w-8/12 text-center leading-loose">Integrated with GitHub Actions, it automatically tests, fixes, and optimizes your code</p>
        <p className="font-light text-lg tracking-wide py-5">Ai That fixes your code Before you do</p>
        <img src={img1} className="w-8/12 object-contain pt-10"></img>
      </div>
      <div id="features" className="flex flex-col gap-6 items-center py-[10%] h-full">
        <p className="font-bold text-4xl">Features</p>
        <p className="font-light tracking-widest text-2xl">Optimize. Test. Heal.</p>
        <div className="flex w-full px-10 justify-center gap-10 py-[2%]">
          <div className="relative w-2/12">
            <img className=" object-cover" src={feat1}></img>
            <p className="absolute top-2/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-lg text-center">
            Ai Powered Code Fixes
            </p>
          </div>
          <div className="relative w-2/12">
            <img className=" object-cover" src={feat2}></img>
            <p className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-md text-center">
              Automated Testing
              on PR’s and Code Pushes
            </p>
          </div>
          <div className="relative w-2/12">
            <img className=" object-cover" src={feat3}></img>
            <p className="absolute top-[75%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-md text-center">
            Raises PR’s automaticlly
            when required
            </p>
          </div>
        </div>
      </div>
      <footer className="bg-black text-gray-400 py-8 px-6 md:px-16">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white"><a href="#">Scriptocol</a></h2>
          <p className="mt-2 text-sm">AI-powered self-healing code optimization and testing.</p>
        </div>

        <div className="mt-6 md:mt-0 text-right">
          <h3 className="text-lg font-medium text-white">Quick Links</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#" className="hover:text-white transition">Home</a></li>
            <li><a href="#features" className="hover:text-white transition">Features</a></li>
            <li><a href="#" className="hover:text-white transition">Contact</a></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-6 pt-4 text-center text-sm">
        © {new Date().getFullYear()} Scriptocol. All rights reserved.
      </div>
    </footer>
    </div>
  )
}

export default App;