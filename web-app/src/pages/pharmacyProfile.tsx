import React, { useEffect, useState } from "react";
import styles from "../styles/pharmacy-profile.module.css";
import PharmacySidebar from "../components/PharmacySidebar";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import type {
  Pharmacy,
  PharmacyPhone,
  OperatingHours,
  PharmacyAddress,
} from "../../../shared/types/pharmacy";
import {
  savePharmacyProfile,
  subscribeToPharmacyPhones,
  subscribeToPharmacyProfile,
} from "../services/pharmacyProfileService";

type PanelKey =
  | "general"
  | "address"
  | "hours"
  | "phones"
  | "accountStatus";

const dayLabels: Record<keyof OperatingHours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const days: Array<keyof OperatingHours> = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const regionOptions = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "Akkar",
  "Bekaa",
  "Baalbek-Hermel",
  "South",
  "Nabatieh",
];

const cityOptions = [
  "Hamra",
  "Achrafieh",
  "Verdun",
  "Jounieh",
  "Tripoli",
  "Sidon",
  "Tyre",
  "Zahle",
];



function formatTimestamp(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDayHours(day: {
  open: string | null;
  close: string | null;
  isClosed: boolean;
}) {
  if (day.isClosed) return "Closed";
  if (!day.open || !day.close) return "—";
  return `${day.open} - ${day.close}`;
}

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  const displayValue =
    value === null || value === undefined || value === "" ? "—" : value;

  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{displayValue}</div>
    </div>
  );
}

function Panel({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.panel}>
      <button type="button" className={styles.panelHeader} onClick={onToggle}>
        <div className={styles.panelTitleWrap}>
          <span className={styles.panelArrow}>
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
          <span className={styles.panelTitle}>{title}</span>
        </div>
      </button>

      <div
        className={`${styles.panelContent} ${
          isOpen ? styles.panelContentOpen : ""
        }`}
      >
        <div className={styles.panelBody}>{children}</div>
      </div>
    </section>
  );
}


function normalizePhoneNumber(value: string) {
  return value.trim().replace(/[\s()-]/g, "");
}

function isValidPhoneNumber(value: string) {
  const cleaned = normalizePhoneNumber(value);

  return /^(\+961|0)?[0-9]{7,8}$/.test(cleaned);
}

function cleanPhones(phones: PharmacyPhone[]) {
  return phones
    .map((phone) => ({
      ...phone,
      phoneNumber: phone.phoneNumber.trim(),
    }))
    .filter((phone) => phone.phoneNumber !== "");
}



export default function PharmacyProfilePage() {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [pharmacy, setPharmacy] = useState<Pharmacy | null>(null);
  const [draft, setDraft] = useState<Pharmacy | null>(null);

  const [phones, setPhones] = useState<PharmacyPhone[]>([]);
  const [draftPhones, setDraftPhones] = useState<PharmacyPhone[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openPanels, setOpenPanels] = useState<Record<PanelKey, boolean>>({
    general: false,
    address: false,
    hours: false,
    phones: false,
    accountStatus: false,
  });

  useEffect(() => {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      setLoading(false);
      setError("You must be signed in.");
      return;
    }

    const unsubProfile = subscribeToPharmacyProfile(
      currentUser.uid,
      (profile) => {
        setPharmacy(profile);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    const unsubPhones = subscribeToPharmacyPhones(
      currentUser.uid,
      (data) => {
        setPhones(data);
      },
      (err) => {
        setError(err.message);
      }
    );

    return () => {
      unsubProfile();
      unsubPhones();
    };
  }, []);

  const canToggleActivity =
  pharmacy?.verificationStatus?.toLowerCase() === "verified";

  const togglePanel = (key: PanelKey) => {
    setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  const startEditing = () => {
    if (!pharmacy) return;
    setDraft(pharmacy);
    setDraftPhones(phones);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (!pharmacy) return;
    setDraft(pharmacy);
    setDraftPhones(phones);
    setIsEditing(false);
  };

  const saveChanges = async () => {
  if (!draft || !pharmacy) return;

  const cleanedPharmacyNameEnglish = draft.pharmacyNameEnglish?.trim() ?? "";

  if (!cleanedPharmacyNameEnglish) {
    setError("Pharmacy name in English is required.");
    setOpenPanels((prev) => ({...prev, general: true}));
    return;
  }

  const cleanedPhones = cleanPhones(draftPhones);
  const invalidPhone = cleanedPhones.find(
    (phone) => !isValidPhoneNumber(phone.phoneNumber)
  );

  if (invalidPhone) {
    setError(
      "Please enter a valid phone number. Example: +961 76 123 456 or 03 123 456."
    );
    return;
  }

  try {
    setSaving(true);
    setError(null);

    await savePharmacyProfile({
      pharmacyNameEnglish: cleanedPharmacyNameEnglish,
      pharmacyNameArabic: draft.pharmacyNameArabic,
      ownerName: draft.ownerName,
      isActive: pharmacy.isActive,
      address: draft.address,
      is24Hours: draft.is24Hours,
      operatingHours: draft.operatingHours,
      phones: cleanedPhones,
    });

    setDraftPhones(cleanedPhones);
    setIsEditing(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : "Failed to save profile.");
  } finally {
    setSaving(false);
  }
};

  const handleActivityToggle = async (checked: boolean) => {
    if (!pharmacy) return;

    try {
      setSaving(true);
      setError(null);

      await savePharmacyProfile({
        pharmacyNameEnglish: pharmacy.pharmacyNameEnglish,
        pharmacyNameArabic: pharmacy.pharmacyNameArabic,
        ownerName: pharmacy.ownerName,
        isActive: checked,
        address: pharmacy.address,
        is24Hours: pharmacy.is24Hours,
        operatingHours: pharmacy.operatingHours,
        phones: cleanPhones(phones),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update activity."
      );
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof Pharmacy>(key: K, value: Pharmacy[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateAddressField = <K extends keyof PharmacyAddress>(
    key: K,
    value: PharmacyAddress[K]
  ) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            address: {
              ...prev.address,
              [key]: value,
            },
          }
        : prev
    );
  };

  const updateDay = (
    day: keyof OperatingHours,
    patch: Partial<OperatingHours[keyof OperatingHours]>
  ) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            operatingHours: {
              ...prev.operatingHours,
              [day]: {
                ...prev.operatingHours[day],
                ...patch,
              },
            },
          }
        : prev
    );
  };

  const addPhone = () => {
    const pharmacyId = draft?.id ?? pharmacy?.id ?? "";

    setDraftPhones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pharmacyId,
        phoneNumber: "",
        isWhatsapp: false,
        isLandline: false,
      },
    ]);
  };

  const updatePhone = (id: string, patch: Partial<PharmacyPhone>) => {
    setDraftPhones((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removePhone = (id: string) => {
    setDraftPhones((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <PharmacySidebar
          pharmacyName={null}
          email={null}
          activeItem="profile"
        />
        <div className={styles.container}>Loading profile...</div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className={styles.page}>
        <PharmacySidebar
          pharmacyName={null}
          email={null}
          activeItem="profile"
        />
        <div className={styles.container}>
          {error || "Pharmacy profile not found."}
        </div>
      </div>
    );
  }

  const safeDraft = draft ?? pharmacy;
  const safePhones = isEditing ? draftPhones : phones;
  const isEnglishNameEmpty =
  isEditing && (safeDraft.pharmacyNameEnglish ?? "").trim() === "";

  return (
    <div className={styles.page}>
      <PharmacySidebar
        pharmacyName={pharmacy.pharmacyNameEnglish}
        email={pharmacy.email}
        activeItem="profile"
      />

      <div className={styles.container}>
        {error && <div className={styles.errorBox}>{error}</div>}

        <div className={styles.hero}>
          <div className={styles.heroLeft}>
            <h1 className={styles.title}>
              {pharmacy.pharmacyNameEnglish || "Pharmacy Profile"}
            </h1>
            {pharmacy.pharmacyNameArabic && (
              <div className={styles.subtitleAr}>
                {pharmacy.pharmacyNameArabic}
              </div>
            )}
          </div>

          <div className={styles.heroActions}>
            <span
              className={`${styles.statusBadge} ${
                styles[
                  `status${
                    pharmacy.verificationStatus[0].toUpperCase() +
                    pharmacy.verificationStatus.slice(1)
                  }`
                ]
              }`}
            >
              {pharmacy.verificationStatus}
            </span>

            <span
              className={`${styles.statusBadge} ${
                pharmacy.isActive ? styles.activeBadge : styles.inactiveBadge
              }`}
            >
              {pharmacy.isActive ? "Active" : "Inactive"}
            </span>

            {!isEditing ? (
              <button
                type="button"
                className={styles.primaryButton}
                onClick={startEditing}
              >
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={saveChanges}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.panels}>
          <Panel
            title="General Information"
            isOpen={openPanels.general}
            onToggle={() => togglePanel("general")}
          >
            {!isEditing ? (
              <div className={`${styles.grid} ${styles.gridTwo}`}>
                <Field
                  label="Pharmacy name in English"
                  value={pharmacy.pharmacyNameEnglish}
                />
                <Field
                  label="Pharmacy name in Arabic"
                  value={pharmacy.pharmacyNameArabic}
                />
                <Field label="Licensed pharmacist" value={pharmacy.ownerName} />
                <Field label="Email" value={pharmacy.email} />
                <Field
                  label="Created at"
                  value={formatTimestamp(pharmacy.createdAt)}
                />
              </div>
            ) : (
              <div className={`${styles.grid} ${styles.gridTwo}`}>
                <div className={styles.inputGroup}>
                  <label>Pharmacy name in English</label>
                  <input
                    type="text"
                    value={safeDraft.pharmacyNameEnglish ?? ""}
                    className={isEnglishNameEmpty ? styles.inputError : ""}
                    onChange={(e) =>
                      updateField("pharmacyNameEnglish", e.target.value)
                    }
                  />
                  {isEnglishNameEmpty && (
                    <p className={styles.fieldError}>
                      Pharmacy name in English is required.
                    </p>
                  )}
                </div>

                <div className={styles.inputGroup}>
                  <label>Pharmacy name in Arabic</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={safeDraft.pharmacyNameArabic ?? ""}
                    onChange={(e) =>
                      updateField(
                        "pharmacyNameArabic",
                        e.target.value.trim() === "" ? null : e.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Licensed pharmacist</label>
                  <input
                    type="text"
                    value={safeDraft.ownerName ?? ""}
                    onChange={(e) =>
                      updateField(
                        "ownerName",
                        e.target.value.trim() === "" ? null : e.target.value
                      )
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={safeDraft.email}
                    disabled
                    className={styles.disabledInput}
                  />
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Address"
            isOpen={openPanels.address}
            onToggle={() => togglePanel("address")}
          >
            {!isEditing ? (
              <div className={`${styles.grid} ${styles.gridTwo}`}>
                <Field label="Region" value={pharmacy.address.region} />
                <Field label="City" value={pharmacy.address.city} />
                <Field label="Street" value={pharmacy.address.street} />
                <Field
                  label="Additional details"
                  value={pharmacy.address.additionalDetails}
                />
                <Field
                  label="Map location"
                  value={
                    pharmacy.address.locationUrl ? (
                      <a
                        href={pharmacy.address.locationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        Open map location
                      </a>
                    ) : (
                      "—"
                    )
                  }
                />
              </div>
            ) : (
              <div className={`${styles.grid} ${styles.gridTwo}`}>
                <div className={styles.inputGroup}>
                  <label>Region</label>
                  <select
                    value={safeDraft.address.region ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "region",
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                  >
                    <option value="">Select region</option>
                    {regionOptions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label>City</label>
                  <select
                    value={safeDraft.address.city ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "city",
                        e.target.value === "" ? null : e.target.value
                      )
                    }
                  >
                    <option value="">Select city</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={`${styles.inputGroup} ${styles.span2}`}>
                  <label>Street</label>
                  <input
                    type="text"
                    value={safeDraft.address.street ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "street",
                        e.target.value.trim() === "" ? null : e.target.value
                      )
                    }
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.span2}`}>
                  <label>Location URL</label>
                  <input
                    type="url"
                    value={safeDraft.address.locationUrl ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "locationUrl",
                        e.target.value.trim() === "" ? null : e.target.value
                      )
                    }
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.span2}`}>
                  <label>Additional details</label>
                  <textarea
                    value={safeDraft.address.additionalDetails ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "additionalDetails",
                        e.target.value.trim() === "" ? null : e.target.value
                      )
                    }
                  />
                </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Operating Hours"
            isOpen={openPanels.hours}
            onToggle={() => togglePanel("hours")}
          >
            {!isEditing ? (
              pharmacy.is24Hours ? (
                <div className={styles.pillBox}>Open 24/7</div>
              ) : (
                <div className={styles.hoursList}>
                  {days.map((day) => (
                    <div className={styles.hoursRow} key={day}>
                      <span>{dayLabels[day]}</span>
                      <span>{formatDayHours(pharmacy.operatingHours[day])}</span>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <>
                <div className={`${styles.toggleCard} ${styles.hoursTopToggle}`}>
                  <div>
                    <div className={styles.toggleTitle}>Open 24/7</div>
                    <div className={styles.toggleText}>
                      Turn this on if the pharmacy is open all day, every day.
                    </div>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={safeDraft.is24Hours}
                      onChange={(e) =>
                        updateField("is24Hours", e.target.checked)
                      }
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                {!safeDraft.is24Hours && (
                  <div className={`${styles.hoursList} ${styles.editHoursList}`}>
                    {days.map((day) => {
                      const schedule = safeDraft.operatingHours[day];
                      return (
                        <div className={styles.hoursEditRow} key={day}>
                          <div className={styles.dayName}>{dayLabels[day]}</div>

                          <input
                            type="time"
                            value={schedule.open ?? ""}
                            disabled={schedule.isClosed}
                            required={!schedule.isClosed}
                            onChange={(e) =>
                              updateDay(day, {
                                open: e.target.value === "" ? null : e.target.value,
                              })
                            }
                          />

                          <input
                            type="time"
                            value={schedule.close ?? ""}
                            disabled={schedule.isClosed}
                            required={!schedule.isClosed}
                            onChange={(e) =>
                              updateDay(day, {
                                close: e.target.value === "" ? null : e.target.value,
                              })
                            }
                          />

                          <label className={styles.closedCheck}>
                            <input
                              type="checkbox"
                              checked={schedule.isClosed}
                              onChange={(e) =>
                                updateDay(day, {
                                  isClosed: e.target.checked,
                                  open: e.target.checked ? null : schedule.open,
                                  close: e.target.checked ? null : schedule.close,
                                })
                              }
                            />
                            Closed
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </Panel>

          <Panel
            title="Phone Numbers"
            isOpen={openPanels.phones}
            onToggle={() => togglePanel("phones")}
          >
            {!isEditing ? (
              <div className={styles.phoneList}>
                {safePhones.map((phone, index) => (
                  <div className={styles.phoneCard} key={phone.id}>
                    <div className={styles.phoneCardTop}>
                      <div className={styles.phoneTitle}>
                        <Phone size={16} />
                        Phone {index + 1}
                      </div>
                    </div>

                    <div className={styles.phoneNumber}>
                      {phone.phoneNumber || "—"}
                    </div>

                    <div className={styles.phoneTags}>
                      {phone.isWhatsapp && (
                        <span
                          className={`${styles.statusBadge} ${styles.miniBadge}`}
                        >
                          WhatsApp
                        </span>
                      )}
                      {phone.isLandline && (
                        <span
                          className={`${styles.statusBadge} ${styles.miniBadge}`}
                        >
                          Landline
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.phoneList}>
                {draftPhones.map((phone, index) => (
                  <div className={styles.phoneCard} key={phone.id}>
                    <div className={styles.phoneCardTop}>
                      <div className={styles.phoneTitle}>
                        <Phone size={16} />
                        Phone {index + 1}
                      </div>

                      {draftPhones.length > 1 && (
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() => removePhone(phone.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label>Phone number</label>
                      <input
                        type="text"
                        value={phone.phoneNumber}
                        placeholder="03 123 456"
                        onChange={(e) =>
                          updatePhone(phone.id, {
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className={styles.checkRow}>
                      <label>
                        <input
                          type="checkbox"
                          checked={phone.isWhatsapp}
                          onChange={(e) =>
                            updatePhone(phone.id, {
                              isWhatsapp: e.target.checked,
                            })
                          }
                        />
                        WhatsApp
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={phone.isLandline}
                          onChange={(e) =>
                            updatePhone(phone.id, {
                              isLandline: e.target.checked,
                            })
                          }
                        />
                        Landline
                      </label>
                    </div>
                  </div>
                ))}

                <div className={styles.phoneAddRow}>
                <button
                  type="button"
                  className={styles.linkButton}
                  onClick={addPhone}
                >
                  <Plus size={16} />
                  Add another phone number
                </button>
              </div>
              </div>
            )}
          </Panel>

          <Panel
            title="Account Status"
            isOpen={openPanels.accountStatus}
            onToggle={() => togglePanel("accountStatus")}
          >
            <div className={`${styles.grid} ${styles.gridTwo}`}>
              <Field
                label="Verification status"
                value={pharmacy.verificationStatus}
              />

              <div className={styles.toggleCard}>
                <div>
                  <div className={styles.toggleTitle}>Account activity</div>
                  <div className={styles.toggleText}>
                    {canToggleActivity
                      ? "You can switch this pharmacy between active and inactive."
                      : "Account activity can only be changed after verification is approved."}
                  </div>
                </div>
                <div className={styles.switchBlock}>
  <span className={styles.switchStateText}>
    {pharmacy.isActive ? "Active" : "Inactive"}
  </span>
                <label className={styles.switch}>
                  <input
                    type="checkbox"
                    checked={pharmacy.isActive}
                    disabled={!canToggleActivity || saving}
                    onChange={(e) => handleActivityToggle(e.target.checked)}
                  />
                  <span className={styles.slider} />
                </label>
              </div></div>

              <Field
                label="Suspension reason"
                value={pharmacy.suspensionReason}
              />
              <Field
                label="Users who reported this pharmacy"
                value={pharmacy.reportCount}
              />
              <Field
                label="Verified at"
                value={formatTimestamp(pharmacy.verifiedAt)}
              />
            </div>
          </Panel>
        </div>

        <div className={styles.footerActions}>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}