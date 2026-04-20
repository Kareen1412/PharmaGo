import React, { useMemo, useState } from "react";
import styles from "../styles/pharmacy-profile.module.css";
import PharmacySidebar from "../components/PharmacySidebar";
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  Save,
  X,
  Phone,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface DailyOperatingHours {
  open: string | null;
  close: string | null;
  isClosed: boolean;
}

export interface OperatingHours {
  monday: DailyOperatingHours;
  tuesday: DailyOperatingHours;
  wednesday: DailyOperatingHours;
  thursday: DailyOperatingHours;
  friday: DailyOperatingHours;
  saturday: DailyOperatingHours;
  sunday: DailyOperatingHours;
}

export interface PharmacyAddress {
  region: string | null;
  city: string | null;
  street: string | null;
  mapLat: number | null;
  mapLng: number | null;
  additionalDetails: string | null;
}

export interface Pharmacy {
  id: string;
  pharmacyNameEnglish: string | null;
  pharmacyNameArabic: string | null;
  guildIdFileUrl: string | null;
  verificationStatus: VerificationStatus;
  ownerName: string | null;
  email: string;
  createdAt: number;
  verifiedAt: number | null;
  rejectionReason: string | null;
  isActive: boolean;
  address: PharmacyAddress;
  suspensionReason: string | null;
  reportCount: number;
  is24Hours: boolean;
  operatingHours: OperatingHours;
  updatedAt: number | null;
}

export interface PharmacyPhone {
  id: string;
  pharmacyId: string;
  phoneNumber: string;
  isWhatsapp: boolean;
  isLandline: boolean;
}

type PanelKey =
  | "general"
  | "address"
  | "hours"
  | "phones"
  | "verification";

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

const initialPharmacy: Pharmacy = {
  id: "4lAZqsvJIkhD8xmy8dFsuckKHox2",
  pharmacyNameEnglish: "PharmaGo Care",
  pharmacyNameArabic: "فارماجو كير",
  guildIdFileUrl:
    "verification-uploads/4lAZqsvJIkhD8xmy8dFsuckKHox2/guild-card.pdf",
  verificationStatus: "pending",
  ownerName: "Dr. Rana Khalil",
  email: "trial2@gmail.com",
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
  verifiedAt: null,
  rejectionReason: null,
  isActive: true,
  address: {
    region: "Beirut",
    city: "Hamra",
    street: "Makdessi Street",
    mapLat: 33.8976,
    mapLng: 35.4826,
    additionalDetails: "Near the main road, next to the bakery.",
  },
  suspensionReason: null,
  reportCount: 0,
  is24Hours: false,
  operatingHours: {
    monday: { open: "09:00", close: "21:00", isClosed: false },
    tuesday: { open: "09:00", close: "21:00", isClosed: false },
    wednesday: { open: "09:00", close: "21:00", isClosed: false },
    thursday: { open: "09:00", close: "21:00", isClosed: false },
    friday: { open: "09:00", close: "21:00", isClosed: false },
    saturday: { open: "10:00", close: "18:00", isClosed: false },
    sunday: { open: null, close: null, isClosed: true },
  },
  updatedAt: Date.now() - 1000 * 60 * 60,
};

const initialPhones: PharmacyPhone[] = [
  {
    id: "1",
    pharmacyId: initialPharmacy.id,
    phoneNumber: "+961 76 123 456",
    isWhatsapp: true,
    isLandline: false,
  },
  {
    id: "2",
    pharmacyId: initialPharmacy.id,
    phoneNumber: "+961 1 345 678",
    isWhatsapp: false,
    isLandline: true,
  },
];

function buildMapUrl(address: PharmacyAddress) {
  if (address.mapLat != null && address.mapLng != null) {
    return `https://www.google.com/maps?q=${address.mapLat},${address.mapLng}`;
  }
  return "";
}

function formatTimestamp(value: number | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDayHours(day: DailyOperatingHours) {
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
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>{label}</div>
      <div className={styles.fieldValue}>{value || "—"}</div>
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

      {isOpen && <div className={styles.panelBody}>{children}</div>}
    </section>
  );
}

export default function PharmacyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [pharmacy, setPharmacy] = useState<Pharmacy>(initialPharmacy);
  const [draft, setDraft] = useState<Pharmacy>(initialPharmacy);

  const [phones, setPhones] = useState<PharmacyPhone[]>(initialPhones);
  const [draftPhones, setDraftPhones] = useState<PharmacyPhone[]>(initialPhones);

  const [openPanels, setOpenPanels] = useState<Record<PanelKey, boolean>>({
    general: false,
    address: false,
    hours: false,
    phones: false,
    verification: false,
  });

  const mapUrl = useMemo(() => buildMapUrl(pharmacy.address), [pharmacy.address]);
  const draftMapUrl = useMemo(() => buildMapUrl(draft.address), [draft.address]);

  const togglePanel = (key: PanelKey) => {
    setOpenPanels((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startEditing = () => {
    setDraft(pharmacy);
    setDraftPhones(phones);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(pharmacy);
    setDraftPhones(phones);
    setIsEditing(false);
  };

  const saveChanges = () => {
    setPharmacy({ ...draft, updatedAt: Date.now() });
    setPhones(draftPhones);
    setIsEditing(false);
  };

  const updateField = <K extends keyof Pharmacy>(key: K, value: Pharmacy[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const updateAddressField = <K extends keyof PharmacyAddress>(
    key: K,
    value: PharmacyAddress[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [key]: value,
      },
    }));
  };

  const updateDay = (
    day: keyof OperatingHours,
    patch: Partial<DailyOperatingHours>
  ) => {
    setDraft((prev) => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours,
        [day]: {
          ...prev.operatingHours[day],
          ...patch,
        },
      },
    }));
  };

  const addPhone = () => {
    setDraftPhones((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        pharmacyId: draft.id,
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

  return (
    <div className={styles.page}>
      <PharmacySidebar
        pharmacyName={pharmacy.pharmacyNameEnglish}
        email={pharmacy.email}
        activeItem="profile"
      />

      <div className={styles.container}>
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
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={startEditing}
              >
                <Edit3 size={16} />
                Edit
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={cancelEditing}
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={saveChanges}
                >
                  <Save size={16} />
                  Save
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
                <Field
                  label="Updated at"
                  value={formatTimestamp(pharmacy.updatedAt)}
                />
              </div>
            ) : (
              <div className={`${styles.grid} ${styles.gridTwo}`}>
                <div className={styles.inputGroup}>
                  <label>Pharmacy name in English</label>
                  <input
                    type="text"
                    value={draft.pharmacyNameEnglish ?? ""}
                    onChange={(e) =>
                      updateField("pharmacyNameEnglish", e.target.value || null)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Pharmacy name in Arabic</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={draft.pharmacyNameArabic ?? ""}
                    onChange={(e) =>
                      updateField("pharmacyNameArabic", e.target.value || null)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Licensed pharmacist</label>
                  <input
                    type="text"
                    value={draft.ownerName ?? ""}
                    onChange={(e) =>
                      updateField("ownerName", e.target.value || null)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                </div>

                <div className={styles.toggleCard}>
                  <div>
                    <div className={styles.toggleTitle}>Active account</div>
                    <div className={styles.toggleText}>
                      Controls whether the pharmacy account is active.
                    </div>
                  </div>
                  <label className={styles.switch}>
                    <input
                      type="checkbox"
                      checked={draft.isActive}
                      onChange={(e) => updateField("isActive", e.target.checked)}
                    />
                    <span className={styles.slider} />
                  </label>
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
                    mapUrl ? (
                      <a
                        href={mapUrl}
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
                  <input
                    type="text"
                    value={draft.address.region ?? ""}
                    onChange={(e) =>
                      updateAddressField("region", e.target.value || null)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>City</label>
                  <input
                    type="text"
                    value={draft.address.city ?? ""}
                    onChange={(e) =>
                      updateAddressField("city", e.target.value || null)
                    }
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.span2}`}>
                  <label>Street</label>
                  <input
                    type="text"
                    value={draft.address.street ?? ""}
                    onChange={(e) =>
                      updateAddressField("street", e.target.value || null)
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Latitude</label>
                  <input
                    type="number"
                    value={draft.address.mapLat ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "mapLat",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Longitude</label>
                  <input
                    type="number"
                    value={draft.address.mapLng ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "mapLng",
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                  />
                </div>

                <div className={`${styles.inputGroup} ${styles.span2}`}>
                  <label>Additional details</label>
                  <textarea
                    value={draft.address.additionalDetails ?? ""}
                    onChange={(e) =>
                      updateAddressField(
                        "additionalDetails",
                        e.target.value || null
                      )
                    }
                  />
                </div>

                <div className={`${styles.field} ${styles.span2}`}>
                  <div className={styles.fieldLabel}>Map location preview</div>
                  <div className={styles.fieldValue}>
                    {draftMapUrl ? (
                      <a
                        href={draftMapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.link}
                      >
                        Open map location
                      </a>
                    ) : (
                      "—"
                    )}
                  </div>
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
                      checked={draft.is24Hours}
                      onChange={(e) => updateField("is24Hours", e.target.checked)}
                    />
                    <span className={styles.slider} />
                  </label>
                </div>

                {!draft.is24Hours && (
                  <div className={`${styles.hoursList} ${styles.editHoursList}`}>
                    {days.map((day) => {
                      const schedule = draft.operatingHours[day];
                      return (
                        <div className={styles.hoursEditRow} key={day}>
                          <div className={styles.dayName}>{dayLabels[day]}</div>

                          <input
                            type="time"
                            value={schedule.open ?? ""}
                            disabled={schedule.isClosed}
                            onChange={(e) =>
                              updateDay(day, { open: e.target.value || null })
                            }
                          />

                          <input
                            type="time"
                            value={schedule.close ?? ""}
                            disabled={schedule.isClosed}
                            onChange={(e) =>
                              updateDay(day, { close: e.target.value || null })
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
                {phones.map((phone, index) => (
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
                        <span className={`${styles.statusBadge} ${styles.miniBadge}`}>
                          WhatsApp
                        </span>
                      )}
                      {phone.isLandline && (
                        <span className={`${styles.statusBadge} ${styles.miniBadge}`}>
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

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={addPhone}
                >
                  <Plus size={16} />
                  Add another phone number
                </button>
              </div>
            )}
          </Panel>

          <Panel
            title="Verification"
            isOpen={openPanels.verification}
            onToggle={() => togglePanel("verification")}
          >
            <div className={`${styles.grid} ${styles.gridTwo}`}>
              <Field
                label="Verification status"
                value={pharmacy.verificationStatus}
              />
              <Field
                label="Verified at"
                value={formatTimestamp(pharmacy.verifiedAt)}
              />
              <Field label="Report count" value={pharmacy.reportCount} />
              <Field
                label="Suspension reason"
                value={pharmacy.suspensionReason}
              />
              <Field label="Rejection reason" value={pharmacy.rejectionReason} />
              <Field
                label="Guild file"
                value={
                  pharmacy.guildIdFileUrl ? (
                    <div className={styles.guildFile}>
                      <FileText size={16} />
                      <span className={styles.guildPath}>
                        {pharmacy.guildIdFileUrl}
                      </span>
                    </div>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}