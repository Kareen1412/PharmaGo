import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu, X } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import {
  clearPharmacyNotifications,
  listenToPharmacyNotifications,
  markPharmacyNotificationAsRead,
} from "../services/pharmacyNotificationService";
import type { PharmacyNotification } from
  "../../../shared/types/pharmacyNotification";
import styles from "../styles/pharmacy-dashboard.module.css";
import logo from "../assets/images/logo.png";

const formatNotificationTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function PharmacySidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PharmacyNotification[]>(
    []
  );

  const [pharmacyName, setPharmacyName] = useState("");
  const [email, setEmail] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let unsubscribePharmacy: (() => void) | null = null;
    let unsubscribeNotifications: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribePharmacy?.();
      unsubscribeNotifications?.();

      if (!user) {
        setPharmacyName("");
        setEmail("");
        setNotifications([]);
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

      unsubscribeNotifications = listenToPharmacyNotifications(
        setNotifications,
        (error) => {
          console.error("PHARMACY NOTIFICATIONS ERROR:", error);
        }
      );
    });

    return () => {
      unsubscribePharmacy?.();
      unsubscribeNotifications?.();
      unsubscribeAuth();
    };
  }, []);

  const unreadCount = useMemo(() => {
    return notifications.filter((item) => item.readAt === null).length;
  }, [notifications]);

  const navItems = [
    { key: "dashboard", label: "Dashboard", path: "/" },
    { key: "profile", label: "Profile", path: "/profile" },
    { key: "requests", label: "Requests", path: "/requests" },
    { key: "questions", label: "Questions", path: "/questions" },
  ] as const;

  const getActiveItem = () => {
    if (location.pathname === "/") return "dashboard";
    if (location.pathname.startsWith("/profile")) return "profile";
    if (location.pathname.startsWith("/requests")) return "requests";
    if (location.pathname.startsWith("/questions")) return "questions";

    return "dashboard";
  };

  const activeItem = getActiveItem();

  const handleNavigate = (path: string) => {
    if (location.pathname !== path) {
      navigate(path);
    }

    setIsMobileOpen(false);
  };

  const handleNotificationClick = async (
    notification: PharmacyNotification
  ) => {
    try {
      await markPharmacyNotificationAsRead(notification.id);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }

    setNotificationsOpen(false);
    setIsMobileOpen(false);

    if (notification.targetType === "reservation") {
      navigate("/requests", {
        state: {
          activeTab: "reserved",
          openReservationId: notification.targetId,
        },
      });
      return;
    }

    if (notification.targetType === "request") {
      navigate("/requests", {
        state: {
          activeTab: "active",
          openRequestId: notification.targetId,
        },
      });
      return;
    }

    if (notification.targetType === "question") {
      navigate("/questions", {
        state: {
          openQuestionId: notification.targetId,
        },
      });
    }
  };

  const handleClearNotifications = async () => {
  try {
    await clearPharmacyNotifications();
    setNotificationsOpen(false);
  } catch (error) {
    console.error("Failed to clear notifications:", error);
  }
};

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
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
        <div className={styles.sidebarInner}>
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

            <div className={styles.notificationBox}>
              <button
                type="button"
                className={styles.notificationButton}
                onClick={() =>
                  setNotificationsOpen((current) => !current)
                }
              >
                <span>
                  <Bell size={17} />
                  Notifications
                </span>

                {unreadCount > 0 && (
                  <strong className={styles.notificationBadge}>
                    {unreadCount}
                  </strong>
                )}
              </button>

              {notificationsOpen && (
                <div className={styles.notificationDropdown}>
                  {notifications.length > 0 && (
  <button
    type="button"
    className={styles.clearNotificationsButton}
    onClick={handleClearNotifications}
  >
    Clear all
  </button>
)}
                  {notifications.length === 0 ? (
                    <div className={styles.notificationEmpty}>
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className={`${styles.notificationItem} ${
                          notification.readAt === null ?
                            styles.notificationUnread :
                            ""
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <div>
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span>
                            {formatNotificationTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
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

          <button
            type="button"
            className={styles.sidebarLogoutButton}
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}