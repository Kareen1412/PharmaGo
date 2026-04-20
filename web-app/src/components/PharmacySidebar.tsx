import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import styles from "../styles/pharmacy-dashboard.module.css";

type PharmacySidebarProps = {
  pharmacyName?: string | null;
  email: string;
  activeItem: "dashboard" | "profile" | "requests" | "questions" | "settings";
};

export default function PharmacySidebar({
  pharmacyName,
  email,
  activeItem,
}: PharmacySidebarProps) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  const navItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "profile", label: "Profile", path: "/profile" },
    { key: "requests", label: "Requests", path: "/pharmacy/requests" },
    { key: "questions", label: "Questions", path: "/pharmacy/questions" },
    { key: "settings", label: "Settings", path: "/pharmacy/settings" },
  ] as const;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <div className={styles.brandBox}>
          <h2>PharmaGo</h2>
          <p>{email}</p>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => {
            const isActive = activeItem === item.key;

            return (
              <button
                key={item.key}
                className={`${styles.navItem} ${
                  isActive ? styles.activeNavItem : ""
                }`}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <button className={styles.logoutButton} onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}