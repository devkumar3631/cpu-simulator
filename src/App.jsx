import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Scheduler from "./components/Scheduler";
import DiskSimulator from "./components/DiskSimulator";
import FrontPage from "./components/Frontpage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<FrontPage />} />
        <Route path="/cpu-scheduling" element={<Scheduler />} /> 
        <Route path="/disk-simulator" element={<DiskSimulator />} /> 
      </Routes>
  );
}

export default App;
