import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Auth/Login";
import ModeSelect from "./pages/ModeSelect/ModeSelect";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/mode" element={<ModeSelect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;