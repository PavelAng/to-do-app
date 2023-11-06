import "./App.css";
import { BoardProvider } from "./components/BoardContext";
import WorkBoard from "./components/WorkBoard";

function App() {
  return (
    <BoardProvider>
      <WorkBoard />
    </BoardProvider>
  );
}

export default App;
