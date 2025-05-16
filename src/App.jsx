import { useEffect } from "react";
import Scheduler from "./components/Scheduler";
import GitHubFooter from "./components/GitHubFooter";
import "./App.css";

function App() {
  useEffect(() => {
    document.title = "CPU Scheduler";
  }, []);
  return (
    <div className="bg-dark">
        <div className="m-auto p-6 bg-white-400">
        <Scheduler />
        </div>
        {/* <GitHubFooter /> */}
    </div>
  );
}

export default App;