import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/pharmacy-dashboard.module.css";
import logo from "../assets/images/logo.png";

type PharmacySidebarProps = {
  pharmacyName?: string | null;
  email: string | null;
  activeItem: "dashboard" | "profile" | "requests" | "questions" | "settings";
};

export default function PharmacySidebar({
  pharmacyName,
  email,
  activeItem,
}: PharmacySidebarProps) {
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "profile", label: "Profile", path: "/profile" },
    { key: "requests", label: "Requests", path: "/pharmacy/requests" },
    { key: "questions", label: "Questions", path: "/pharmacy/questions" },
    { key: "settings", label: "Settings", path: "/pharmacy/settings" },
  ] as const;

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <>
      <header className={styles.mobileNavbar}>
        <div className={styles.mobileBrand}>
          <img
            src={logo}
            alt="PharmaGo logo"
            className={styles.mobileLogo}
          />
          <span>PharmaGo</span>
        </div>

        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {isMobileOpen && (
        <button
          type="button"
          className={styles.sidebarOverlay}
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.sidebarTop}>
          <div className={styles.brandBox}>
            <div className={styles.mobileSidebarHeader}>
              <div>
                <div className={styles.sidebarBrandRow}>
                 
                  <h2>{pharmacyName || "PharmaGo"}</h2>
                </div>
                <p>{email || "No email"}</p>
              </div>

              <button
                type="button"
                className={styles.closeSidebarButton}
                onClick={() => setIsMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
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
                  onClick={() => handleNavigate(item.path)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}