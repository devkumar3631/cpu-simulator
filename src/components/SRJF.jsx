import { useState, useEffect } from "react";

const processColors = {
  P1: "#FF5733",
  P2: "#33FF57",
  P3: "#3357FF",
  P4: "#FF33A8",
  P5: "#33FFF9",
  // Add more process colors as needed
};

const SRJF = ({ processes }) => {
  const [pendingProcesses, setPendingProcesses] = useState([]);
  const [activeProcesses, setActiveProcesses] = useState([]);
  const [completedProcesses, setCompletedProcesses] = useState([]);
  const [currentProcess, setCurrentProcess] = useState(null);
  const [comparingProcess, setComparingProcess] = useState(null);
  const [ganttChart, setGanttChart] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [animatingTimeJump, setAnimatingTimeJump] = useState(false);
  const [timeJumpTarget, setTimeJumpTarget] = useState(0);
  const [preemption, setPreemption] = useState(null);

  // Initialize simulation
  const startSimulation = () => {
    // Create a deep copy of processes with remaining time
    const processesWithRemaining = processes.map(p => ({
      ...p,
      remainingTime: parseInt(p.burstTime),
      originalBurstTime: parseInt(p.burstTime)
    }));
    
    setPendingProcesses(processesWithRemaining);
    setActiveProcesses([]);
    setCompletedProcesses([]);
    setGanttChart([]);
    setCurrentProcess(null);
    setComparingProcess(null);
    setCurrentTime(0);
    setPreemption(null);
    setAnimatingTimeJump(false);
    setTimeJumpTarget(0);
    setIsSimulating(true);
  };

  // Calculate delay based on animation speed
  const getAnimationDelay = (baseDelay) => {
    return baseDelay / animationSpeed;
  };

  // Handle simulation steps
  useEffect(() => {
    if (!isSimulating) return;
    if (pendingProcesses.length === 0 && activeProcesses.length === 0) {
      setIsSimulating(false);
      return;
    }
    
    const simulationStep = async () => {
      // Move arrived processes from pending to active
      const newlyArrived = pendingProcesses.filter(p => 
        parseInt(p.arrivalTime) <= currentTime
      );
      
      if (newlyArrived.length > 0) {
        setPendingProcesses(prev => 
          prev.filter(p => parseInt(p.arrivalTime) > currentTime)
        );
        setActiveProcesses(prev => [...prev, ...newlyArrived]);
        
        // Visual delay to show new processes arriving
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
      }
      
      // If no active processes but pending processes exist, jump to next arrival
      if (activeProcesses.length === 0 && pendingProcesses.length > 0) {
        const nextArrivalTime = Math.min(
          ...pendingProcesses.map(p => parseInt(p.arrivalTime))
        );
        
        // Animate time jump
        setAnimatingTimeJump(true);
        setTimeJumpTarget(nextArrivalTime);
        
        // Jump time to next arrival
        for (let t = currentTime + 1; t <= nextArrivalTime; t++) {
          setCurrentTime(t);
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(50)));
        }
        
        setAnimatingTimeJump(false);
        return; // Return to re-trigger effect with updated time
      }
      
      // Find process with shortest remaining time
      let shortestProcess = null;
      let shortestTime = Infinity;
      
      for (let i = 0; i < activeProcesses.length; i++) {
        const process = activeProcesses[i];
        setComparingProcess(process);
        
        // Visual delay to show comparison
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        
        if (process.remainingTime < shortestTime) {
          shortestProcess = process;
          shortestTime = process.remainingTime;
          setCurrentProcess(shortestProcess);
          
          // Visual delay to show new shortest
          await new Promise(resolve => setTimeout(resolve, getAnimationDelay(200)));
        }
      }
      
      setComparingProcess(null);
      
      // Check for preemption
      const lastGanttItem = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1] : null;
      const isPreemption = lastGanttItem && 
                          lastGanttItem.name !== shortestProcess.name && 
                          !lastGanttItem.completed;
      
      if (isPreemption) {
        // Show preemption animation
        setPreemption(lastGanttItem.name);
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(500)));
        setPreemption(null);
        
        // Update last gantt chart entry to mark end time
        setGanttChart(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            endTime: currentTime,
            completed: false
          };
          return updated;
        });
      }
      
      // Process execution
      const processStartTime = currentTime;
      let processEndTime;
      
      // Add to Gantt chart
      const nextGanttItem = {
        name: shortestProcess.name,
        arrivalTime: shortestProcess.arrivalTime,
        burstTime: shortestProcess.originalBurstTime,
        remainingBefore: shortestProcess.remainingTime,
        startTime: processStartTime,
        endTime: null, // Will be updated when process finishes or is preempted
        completed: false
      };
      
      setGanttChart(prev => [...prev, nextGanttItem]);
      
      // Execute time unit by time unit
      const executeOneUnit = async () => {
        // Increment time
        const newTime = currentTime + 1;
        setCurrentTime(newTime);
        setAnimatingTimeJump(true);
        setTimeJumpTarget(newTime);
        
        await new Promise(resolve => setTimeout(resolve, getAnimationDelay(300)));
        setAnimatingTimeJump(false);
        
        // Update remaining time for current process
        setActiveProcesses(prev => 
          prev.map(p => 
            p.name === shortestProcess.name 
              ? { ...p, remainingTime: p.remainingTime - 1 }
              : p
          )
        );
        
        // Check for newly arrived processes during this time unit
        const newArrivals = pendingProcesses.filter(p => 
          parseInt(p.arrivalTime) === newTime
        );
        
        if (newArrivals.length > 0) {
          setPendingProcesses(prev => 
            prev.filter(p => parseInt(p.arrivalTime) > newTime)
          );
          setActiveProcesses(prev => [...prev, ...newArrivals]);
          
          // Return true if we need to preempt due to new arrivals
          // that might have shorter remaining time
          return true;
        }
        
        // Check if process is completed
        const updatedActiveProcesses = activeProcesses.map(p => 
          p.name === shortestProcess.name 
            ? { ...p, remainingTime: p.remainingTime - 1 }
            : p
        );
        
        const updatedProcess = updatedActiveProcesses.find(p => p.name === shortestProcess.name);
        if (updatedProcess && updatedProcess.remainingTime <= 0) {
          // Process completed
          setCompletedProcesses(prev => [...prev, updatedProcess]);
          setActiveProcesses(prev => prev.filter(p => p.name !== updatedProcess.name));
          
          // Update gantt chart to mark completion
          setGanttChart(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              endTime: newTime,
              completed: true,
              remainingAfter: 0
            };
            return updated;
          });
          
          return false; // No need to preempt, process is done
        }
        
        return false; // Continue executing current process
      };
      
      // Execute until completion or preemption
      let shouldPreempt = false;
      do {
        shouldPreempt = await executeOneUnit();
        
        if (shouldPreempt) {
          // We have new arrivals, update gantt chart and check if we need to preempt
          setGanttChart(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              endTime: currentTime,
              completed: false,
              remainingAfter: shortestProcess.remainingTime - 1
            };
            return updated;
          });
          
          break; // Break to re-evaluate shortest remaining job
        }
        
        // If current process has finished, break to find next process
        const processFinished = activeProcesses
          .filter(p => p.name === shortestProcess.name)
          .every(p => p.remainingTime <= 1);
        
        if (processFinished) {
          break;
        }
      } while (!shouldPreempt);
      
      // Clear current process
      setCurrentProcess(null);
    };
    
    const timer = setTimeout(simulationStep, getAnimationDelay(500));
    return () => clearTimeout(timer);
  }, [isSimulating, pendingProcesses, activeProcesses, currentTime, animationSpeed]);

  // Calculate the total execution time for a process from Gantt chart
  const calculateTotalExecutionTime = (processName) => {
    return ganttChart
      .filter(item => item.name === processName)
      .reduce((sum, item) => sum + (item.endTime - item.startTime), 0);
  };

  // Calculate process metrics
  const calculateMetrics = () => {
    const metrics = {};
    
    processes.forEach(proc => {
      const processName = proc.name;
      const arrivalTime = parseInt(proc.arrivalTime);
      
      // Find all gantt chart segments for this process
      const segments = ganttChart.filter(item => item.name === processName);
      
      if (segments.length === 0) return;
      
      // Find completion time (end time of the last segment)
      const completionTime = Math.max(...segments.map(s => s.endTime));
      
      // Calculate turnaround time
      const turnaroundTime = completionTime - arrivalTime;
      
      // Calculate waiting time (turnaround time - burst time)
      const burstTime = parseInt(proc.burstTime);
      const waitingTime = turnaroundTime - burstTime;
      
      // Calculate response time (start time of first segment - arrival time)
      const responseTime = segments[0].startTime - arrivalTime;
      
      metrics[processName] = {
        arrivalTime,
        burstTime,
        completionTime,
        turnaroundTime,
        waitingTime,
        responseTime
      };
    });
    
    return metrics;
  };

  const metrics = ganttChart.length > 0 ? calculateMetrics() : {};

  return (
    <div className="flex flex-col items-center p-6 bg-black rounded-lg border border-white text-white min-w-[80vw] mx-auto">
      <h2 className="text-2xl font-bold mb-6">SRJF Scheduling Visualization</h2>

      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={startSimulation}
          disabled={isSimulating}
          className={`px-6 py-3 rounded-lg border border-white font-bold transition-all duration-300 ${
            isSimulating 
              ? "bg-gray-800 text-gray-400 cursor-not-allowed" 
              : "bg-black text-white hover:bg-gray-900"
          }`}
        >
          {isSimulating ? "Simulation in Progress..." : "Start SRJF Simulation"}
        </button>
        
        {/* Animation Speed Control */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium">Animation Speed:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => setAnimationSpeed(0.5)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 0.5 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              0.5x
            </button>
            <button 
              onClick={() => setAnimationSpeed(1)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 1 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              1x
            </button>
            <button 
              onClick={() => setAnimationSpeed(2)} 
              className={`px-3 py-1 rounded border transition-all duration-300 ${
                animationSpeed === 2 ? "bg-white text-black" : "bg-black text-white"
              }`}
              disabled={isSimulating && !animatingTimeJump}
            >
              2x
            </button>
          </div>
        </div>
      </div>

      {/* Current Time Display */}
      <div className="w-full mb-6 text-center">
        <div className="inline-block px-4 py-2 bg-black text-white rounded-lg border border-white overflow-hidden relative">
          <span className="font-semibold">Current Time:</span> 
          <span className={`inline-block min-w-[3ch] text-center ${animatingTimeJump ? "animate-pulse text-yellow-400" : ""}`}>
            {currentTime}
          </span>
          {animatingTimeJump && (
            <span className="text-xs text-yellow-400 ml-2">
              → {timeJumpTarget}
            </span>
          )}
        </div>
      </div>

      {/* Process Queue Visualization */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Pending Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Pending Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {pendingProcesses.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg border border-white text-center w-28"
                style={{
                  borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                  <p className="bg-gray-900 rounded p-1">Arrival: {p.arrivalTime}</p>
                  <p className="bg-gray-900 rounded p-1">Burst: {p.originalBurstTime}</p>
                </div>
              </div>
            ))}
            {pendingProcesses.length === 0 && (
              <p className="text-gray-400 italic">No pending processes</p>
            )}
          </div>
        </div>

        {/* Active Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Active Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {activeProcesses.map((p) => (
              <div
                key={p.name}
                className={`p-3 rounded-lg border text-center w-28 transition-all duration-300 ${
                  currentProcess && currentProcess.name === p.name
                    ? "scale-110 border-yellow-500 border-2 bg-yellow-900 bg-opacity-30"
                    : comparingProcess && comparingProcess.name === p.name
                      ? "scale-105 border-red-500 border-2 bg-red-900 bg-opacity-30"
                      : preemption === p.name
                        ? "scale-95 border-blue-500 border-2 bg-blue-900 bg-opacity-30"
                        : "border-white"
                }`}
                style={{
                  borderLeft: `5px solid ${processColors[p.name] || "#3498db"}`
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <div className="grid grid-cols-1 gap-1 mt-2 text-xs">
                  <p className="bg-gray-900 rounded p-1">Remaining: {p.remainingTime}</p>
                  <div className="bg-gray-900 rounded p-1 mt-1">
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full"
                        style={{
                          width: `${(p.remainingTime / p.originalBurstTime) * 100}%`,
                          backgroundColor: processColors[p.name] || "#3498db"
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {activeProcesses.length === 0 && (
              <p className="text-gray-400 italic">No active processes</p>
            )}
          </div>
        </div>

        {/* Completed Processes */}
        <div className="bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Completed Processes</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {completedProcesses.map((p) => (
              <div
                key={p.name}
                className="p-3 rounded-lg border border-white text-center w-28"
                style={{ 
                  borderLeftColor: processColors[p.name] || "#3498db",
                  borderLeftWidth: "5px"
                }}
              >
                <p className="font-bold text-lg">{p.name}</p>
                <p className="text-xs mt-1 bg-gray-900 rounded p-1">Completed</p>
              </div>
            ))}
            {completedProcesses.length === 0 && (
              <p className="text-gray-400 italic">No completed processes</p>
            )}
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="w-full bg-black p-4 rounded-lg border border-white mb-8">
        <h3 className="text-lg font-semibold mb-4 border-b border-white pb-2">Gantt Chart</h3>
        
        {ganttChart.length > 0 ? (
          <div className="relative">
            {/* Time Axis */}
            <div className="absolute left-0 right-0 bottom-0 h-8 border-t border-white"></div>
            
            {/* Process Blocks */}
            <div className="flex h-20 mb-12 relative">
              {ganttChart.map((p, index) => {
                // Skip if endTime is not set yet
                if (p.endTime === null) return null;
                
                // Calculate total timeline length for scaling
                const totalTime = Math.max(...ganttChart.filter(g => g.endTime !== null).map(g => g.endTime));
                
                // Calculate width as percentage of total time
                const blockWidth = ((p.endTime - p.startTime) / totalTime) * 100;
                
                return (
                  <div key={`${p.name}-${p.startTime}`} className="relative h-full">
                    {/* Process block */}
                    <div
                      className={`h-4/5 mt-2 flex items-center justify-center text-white font-bold rounded-md shadow-md transition-all duration-300 hover:h-full hover:mt-0 ${
                        p.completed ? "" : "border-r-4 border-dashed border-white"
                      }`}
                      style={{
                        width: `${blockWidth}%`,
                        backgroundColor: processColors[p.name] || "#3498db",
                        minWidth: '30px'
                      }}
                    >
                      <div className="flex flex-col items-center p-1">
                        <span className="text-sm font-bold">{p.name}</span>
                        <span className="text-xs">{p.endTime - p.startTime}u</span>
                      </div>
                    </div>
                    
                    {/* Vertical timeline connector */}
                    <div className="absolute left-0 -bottom-8 w-px h-8 bg-gray-600"></div>
                    
                    {/* Time label */}
                    <div className="absolute left-0 -bottom-8 text-xs font-medium bg-gray-800 px-1 py-1 rounded-md transform -translate-x-1/2">
                      {p.startTime}
                    </div>
                    
                    {index === ganttChart.length - 1 && (
                      <div className="absolute right-0 -bottom-8 text-xs font-medium bg-gray-800 px-1 py-1 rounded-md transform translate-x-1/2">
                        {p.endTime}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Timeline base */}
              <div className="absolute left-0 right-0 -bottom-8 h-px bg-gray-500"></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 italic text-center py-8">Gantt chart will appear here after simulation starts</p>
        )}
      </div>

      {/* Metrics Table (when simulation completes) */}
      {Object.keys(metrics).length > 0 && completedProcesses.length === processes.length && (
        <div className="w-full bg-black p-4 rounded-lg border border-white">
          <h3 className="text-lg font-semibold mb-3 border-b border-white pb-2">Performance Metrics</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-black">
              <thead>
                <tr className="bg-gray-900">
                  <th className="py-2 px-4 border border-white">Process</th>
                  <th className="py-2 px-4 border border-white">Arrival Time</th>
                  <th className="py-2 px-4 border border-white">Burst Time</th>
                  <th className="py-2 px-4 border border-white">Completion Time</th>
                  <th className="py-2 px-4 border border-white">Turnaround Time</th>
                  <th className="py-2 px-4 border border-white">Waiting Time</th>
                  <th className="py-2 px-4 border border-white">Response Time</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(metrics).map(([processName, data]) => (
                  <tr key={processName}>
                    <td className="py-2 px-4 border border-white font-medium" style={{color: processColors[processName] || "#3498db"}}>{processName}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.arrivalTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.burstTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.completionTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.turnaroundTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.waitingTime}</td>
                    <td className="py-2 px-4 border border-white text-center">{data.responseTime}</td>
                  </tr>
                ))}
                
                {/* Average metrics row */}
                {Object.keys(metrics).length > 0 && (
                  <tr className="bg-gray-900 font-semibold">
                    <td className="py-2 px-4 border border-white text-right" colSpan="4">Average</td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.turnaroundTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.waitingTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border border-white text-center">
                      {(Object.values(metrics).reduce((sum, data) => sum + data.responseTime, 0) / Object.keys(metrics).length).toFixed(2)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SRJF;