import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import AuthPage from "./pages/Auth/AuthPage";
import ModeSelect from "./pages/ModeSelect/ModeSelect";
import RaceControl from "./pages/RaceControl/RaceControl";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Standings from "./pages/Standings/Standings";
import Drivers from "./pages/Drivers/Drivers";
import Commentary from "./pages/Commentary/Commentary";
import F1Background from "./components/background/F1Background";
import PrivateRoute from "./pages/Auth/PrivateRoute";
import PublicRoute from "./pages/Auth/PublicRoute";
import ChampionshipPage from "./pages/Championship/Championship";
import RaceRecap from "./pages/RaceRecap/RaceRecap";
import PlayerCareerSetup from "./pages/player/PlayerCareerSetup";
import './App.css';
function App() {
  return (
    <ThemeProvider>
      <F1Background />
      <BrowserRouter>
        <Routes>
          {/* Public Route (blocked if logged in) */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />

          {/* Mode must also be protected */}
          <Route
            path="/mode"
            element={
              <PrivateRoute>
                <ModeSelect />
              </PrivateRoute>
            }
          />

          {/* Protected Layout Routes */}
          <Route
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/standings" element={<Standings />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/Commentary" element={<Commentary />} />
            <Route path="/dashboard/race-control" element={<RaceControl />} />
            <Route path="/dashboard/championship" element={<ChampionshipPage />}/>
            <Route path="/recap/:raceWeekendId" element={<RaceRecap />} />
            <Route path="/player-career/setup" element={<PlayerCareerSetup />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
