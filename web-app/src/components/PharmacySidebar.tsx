import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../config/firebase";
import styles from "../styles/pharmacy-dashboard.module.css";
import logo from "../assets/images/logo.png";

export default function PharmacySidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [pharmacyName, setPharmacyName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let unsubscribePharmacy: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribePharmacy?.();

      if (!user) {
        setPharmacyName("");
        setEmail("");
        setLoadingProfile(false);
        return;
      }

      setEmail(user.email ?? "");

      const pharmacyRef = doc(db, "pharmacies", user.uid);

      unsubscribePharmacy = onSnapshot(
        pharmacyRef,
        (snapshot) => {
          if (!snapshot.exists()) {
            setPharmacyName("");
            setEmail(user.email ?? "");
            setLoadingProfile(false);
            return;
          }

          const data = snapshot.data();

          setPharmacyName(data.pharmacyNameEnglish ?? "");
          setEmail(data.email ?? user.email ?? "");
          setLoadingProfile(false);
        },
        (error) => {
          console.error("SIDEBAR PHARMACY SNAPSHOT ERROR:", error);
          setPharmacyName("");
          setEmail(user.email ?? "");
          setLoadingProfile(false);
        }
      );
    });

    return () => {
      unsubscribePharmacy?.();
      unsubscribeAuth();
    };
  }, []);

  const navItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "profile", label: "Profile", path: "/profile" },
    { key: "requests", label: "Requests", path: "/pharmacy/requests" },
    { key: "questions", label: "Questions", path: "/pharmacy/questions" },
    { key: "settings", label: "Settings", path: "/pharmacy/settings" },
  ] as const;

  const getActiveItem = () => {
    if (location.pathname === "/") return "dashboard";
    if (location.pathname.startsWith("/profile")) return "profile";
    if (location.pathname.startsWith("/pharmacy/requests")) return "requests";
    if (location.pathname.startsWith("/pharmacy/questions")) return "questions";
    if (location.pathname.startsWith("/pharmacy/settings")) return "settings";

    return "dashboard";
  };

  const activeItem = getActiveItem();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }

    setIsMobileOpen(false);
  };

  return (
    <>
      <header className={styles.mobileNavbar}>
        <div className={styles.mobileBrand}>
          <img src={logo} alt="PharmaGo logo" className={styles.mobileLogo} />
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
                  <h2>{loadingProfile ? "" : pharmacyName}</h2>
                </div>
                <p>{loadingProfile ? "" : email}</p>
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
                  type="button"
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