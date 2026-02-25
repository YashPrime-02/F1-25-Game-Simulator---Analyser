import { Outlet } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import TopBar from "../components/ui/TopBar";
import "./layout.css";

function MainLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-area">
        <TopBar />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;