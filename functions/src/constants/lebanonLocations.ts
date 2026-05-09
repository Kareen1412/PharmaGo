export const LEBANON_REGIONS = [
  "Beirut",
  "Mount Lebanon",
  "North",
  "South",
  "Bekaa",
  "Nabatieh",
  "Akkar",
  "Baalbek-Hermel",
  "Keserwan-Jbeil",
] as const;

export type LebanonRegion = (typeof LEBANON_REGIONS)[number];

export const REGION_CITIES: Record<LebanonRegion, string[]> = {
  "Beirut": [
    "Beirut",
  ],

  "Mount Lebanon": [
    "Jbeil",
    "Keserwan",
    "Metn",
    "Baabda",
    "Aley",
    "Chouf",
    "Jounieh",
    "Beit ed-Dine",
  ],

  "North": [
    "Tripoli",
    "Batroun",
    "Bsharri",
    "Koura",
    "Miniyeh-Danniyeh",
    "Zgharta",
  ],

  "South": [
    "Sidon",
    "Tyre",
    "Jezzine",
  ],

  "Bekaa": [
    "Zahle",
    "Rashaya",
    "Western Bekaa",
  ],

  "Nabatieh": [
    "Nabatieh",
    "Bent Jbeil",
    "Hasbaya",
    "Marjaayoun",
  ],

  "Akkar": [
    "Halba",
  ],

  "Baalbek-Hermel": [
    "Baalbek",
    "Hermel",
  ],

  "Keserwan-Jbeil": [
    "Keserwan",
    "Jbeil",
    "Byblos",
  ],
};
