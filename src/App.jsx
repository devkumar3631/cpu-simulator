import { useEffect } from "react";
import Scheduler from "./components/Scheduler";
import "./App.css";

function App() {
  
  useEffect(() => {
    document.title = "CPU Scheduling Simulator";
  }, []);

  return (
    <div className="bg-black">
        <div className="m-auto p-6 bg-black">
        <Scheduler />
        </div>
    </div>
  );
}

export default App;