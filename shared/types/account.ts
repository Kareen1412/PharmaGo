export type AccountRole = "user" | "pharmacy" | "admin";

export interface Account {
  authUserId: string;
  role: AccountRole;
}