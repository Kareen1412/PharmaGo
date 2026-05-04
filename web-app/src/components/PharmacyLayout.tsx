import { Outlet } from "react-router-dom";
import PharmacySidebar from "./PharmacySidebar";
import styles from "../styles/pharmacy-dashboard.module.css";

export default function PharmacyLayout() {
  return (
    <div className={styles.dashboardLayout}>
      <PharmacySidebar />
      <Outlet />
    </div>
  );
}