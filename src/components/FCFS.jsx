import { useState, useEffect } from "react";

const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
  // Add more process colors as needed
};

const FCFS = ({ processes }) => {
  const [pendingProcesses, setPendingProcesses] = useState([...processes]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [comparingProcess, setComparingProcess] = useState(null);
  const [fadeOutProcess, setFadeOutProcess] = useState(null);

  useEffect(() => {
    if (pendingProcesses.length > 0 && currentProcess === null) {
      executeProcess();
    }
  }, [pendingProcesses, currentProcess]);

  const executeProcess = async () => {
    if (pendingProcesses.length === 0) return;

    let arrivedProcess = null;
    let i = 0;

    for (i = 0; i < pendingProcesses.length; i++) {
      setComparingProcess(pendingProcesses[i]);
      console.log(`Checking process ${pendingProcesses[i].name}, i = ${i}`);

      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!completedProcesses.some((p) => p.name === pendingProcesses[i].name)) {
        arrivedProcess = pendingProcesses[i];
        console.log(`Selected arrivedProcess: ${arrivedProcess.name}, i = ${i}`);
        break;
      }
    }

    if (!arrivedProcess) {
      setComparingProcess(null);
      return;
    }

    setCurrentProcess(arrivedProcess);

    i++;
    for (i; i < pendingProcesses.length; i++) {
      setComparingProcess(pendingProcesses[i]);
      console.log(`Comparing ${pendingProcesses[i].name} with ${arrivedProcess.name}, i = ${i}`);

      await new Promise((resolve) => setTimeout(resolve, 500));

      if (
        !completedProcesses.some((p) => p.name === pendingProcesses[i].name) &&
        pendingProcesses[i].arrivalTime < arrivedProcess.arrivalTime
      ) {
        arrivedProcess = pendingProcesses[i];
        setCurrentProcess(arrivedProcess);
        console.log(`Updated arrivedProcess: ${arrivedProcess.name}, i = ${i}`);
      }
    }

    setComparingProcess(null);

    // Start fade-out animation
    setFadeOutProcess(arrivedProcess.name);

    setTimeout(() => {
      setCompletedProcesses((prev) => [...prev, arrivedProcess]);
      setPendingProcesses((prev) => prev.filter((p) => p.name !== arrivedProcess.name));
      setGanttChart((prev) => [...prev, arrivedProcess.name]);
      setCurrentProcess(null);
      setFadeOutProcess(null);
    }, 900);
  };

  const resetSimulation = () => {
    setPendingProcesses([...processes]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setFadeOutProcess(null);
  };

  return (
    <div className="flex flex-col items-center p-6">
      <h2 className="text-xl font-semibold mb-4">FCFS Scheduling</h2>

      <button
        onClick={resetSimulation}
        className="mt-6 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Reset Simulation
      </button>

      {/* Pending and Completed Processes */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Pending Processes */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2 text-center">Pending Processes</h3>
          <div className="flex gap-4 justify-center">
            {pendingProcesses.map((p) => (
              <div
                key={p.name}
                className={`p-4 border rounded-lg shadow-md text-center transition-all w-32 duration-700 ease-in-out ${
                  fadeOutProcess === p.name
                    ? "opacity-0 scale-75"
                    : currentProcess && currentProcess.name === p.name
                    ? "scale-110 bg-yellow-500"
                    : comparingProcess && comparingProcess.name === p.name
                    ? "scale-105 bg-red-500 text-white"
                    : "bg-black text-white"
                }`}
              >
                <p className="font-semibold">{p.name}</p>
                <p>Burst: {p.burstTime}</p>
                <p>Arr: {p.arrivalTime}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Processes */}
        <div className="w-full">
          <h3 className="text-lg font-semibold mb-2 text-center">Completed Processes</h3>
          <div className="flex gap-4 justify-center">
            {completedProcesses.map((p) => (
              <div
                key={p.name}
                className="p-4 border rounded-lg shadow-md text-center bg-green-500 text-white w-32 animate-slide-in"
              >
                <p className="font-semibold">{p.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="mt-6 w-full flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2">Gantt Chart</h3>

        {/* Gantt Chart Timeline */}
<div className="relative w-[80%] border bg-gray-200 rounded-lg shadow-md flex">
  {ganttChart.map((p, index) => (
    <div
      key={index}
      className="h-12 flex items-center justify-center text-white font-semibold border-r border-gray-700"
      style={{
        width: `${Math.max(5, (p.burstTime / processes.reduce((acc, val) => acc + val.burstTime, 0)) * 100)}%`,
        backgroundColor: processColors[p.name] || "#3498db",
        minWidth: "50px",
      }}
    >
      {p.name}
    </div>
  ))}
</div>

{/* Time Markers (Fixed Overlapping) */}
<div className="w-[80%] flex justify-between text-sm font-semibold mt-1">
  {ganttChart.reduce((acc, p) => {
    const lastTime = acc.length > 0 ? acc[acc.length - 1] : 0;
    acc.push(parseFloat(lastTime) + parseFloat(p.burstTime));
    return acc;
  }, [0]).map((time, index) => (
    <span key={index} className="min-w-[30px]">{time}</span>
  ))}
</div>
      </div>
    </div>
  );
};

export default FCFS;