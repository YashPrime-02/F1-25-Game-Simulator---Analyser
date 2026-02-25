import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

import AuthPage from "./pages/Auth/AuthPage";
import ModeSelect from "./pages/ModeSelect/ModeSelect";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import Standings from "./pages/Standings/Standings";
import RaceCenter from "./pages/RaceCenter/RaceCenter";
import Drivers from "./pages/Drivers/Drivers";
import News from "./pages/News/News";
import F1Background from "./components/background/F1Background";
import PrivateRoute from "./pages/Auth/PrivateRoute";
import PublicRoute from "./pages/Auth/PublicRoute";

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
            <Route path="/race" element={<RaceCenter />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/news" element={<News />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
