import { useState, useEffect } from "react";
import ProcessForm from "./ProcessForm";
import SRJF from "./SRJF";
import FCFS from "./FCFS";
import ProcessDetails from "./ProcessDetails";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SJF from "./SJF";

const Scheduler = () => {
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [processes, setProcesses] = useState([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", true);
  }, []);

  const addProcess = (process) => {
    setProcesses([...processes, process]);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white transition-all p-6">
      <ToastContainer />
      
      {/* Title */}
      <h1 className="text-4xl font-bold mb-10">Scheduling Algorithm</h1>

      {/* Algorithm Selection */}
      <div className="flex flex-col items-center text-center mb-10">
        <label className="text-2xl font-medium mb-4">Select Algorithm:</label>
        <select
          className="border p-3 rounded bg-black text-white text-center"
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="FCFS">First Come First Serve (FCFS)</option>
          <option value="SJF">Shortest Job First (SJF)</option>
          <option value="SRTF">Shortest Remaining Time First (SRTF)</option>
          <option value="RR">Round Robin (RR)</option>
          <option value="Priority (Non-Preemptive)">Priority Scheduling (Non-Preemptive)</option>
          <option value="Priority (Preemptive)">Priority Scheduling (Preemptive)</option>
          <option value="MLQ">Multilevel Queue (MLQ)</option>
          <option value="MLFQ">Multilevel Feedback Queue (MLFQ)</option>
        </select>
      </div>

      {/* Process Management */}
      <div className="w-full mx-auto">
  {/* Flexbox Container: Form on Left, Process Details on Right */}
        <div className="flex flex-col md:flex-row gap-6 justify-between">
          {/* Left: Process Form */}
          <div className="w-1/2">
            <ProcessForm processes={processes} addProcess={addProcess} algorithm={algorithm} />
          </div>

          {/* Right: Process Details */}
          <div className="w-full">
            <ProcessDetails processes={processes} setProcesses={setProcesses}/>
          </div>
        </div>
      </div>
      <div>
      {algorithm==="FCFS" && <FCFS processes={processes} /> }
      {algorithm==="SJF" && <SJF processes={processes} />}
      {algorithm==="SRTF" && <SRJF processes={processes} />}
      </div>

    </div>
  );
};

export default Scheduler;