export const FAMILY = {
  appName: "Ninho do Papai",
  roomDisplayName: "Ninho da Ágatha",
  roomName: "ninho-da-agatha",
  daughterName: "Ágatha",
  partnerName: "Vanessa",
  fatherLabel: "Papai",
} as const;

export type FamilyRole = "papai" | "vanessa";

export const ROLE_LABELS: Record<FamilyRole, string> = {
  papai: FAMILY.fatherLabel,
  vanessa: FAMILY.partnerName,
};

export const SESSION_COOKIE = "ninho_session";
