export type PlanId = "7go" | "30go" | "illimite";
export type OperatorCode = "mtn" | "orange" | "camtel";
export type PaymentMethod = "mtn_momo" | "orange_money";

export const PLAN_CATALOG: Record<PlanId, { name: string; validity: string; price: number }> = {
  "7go": { name: "7 Go", validity: "Validité : 7 jours", price: 1200 },
  "30go": { name: "30 Go", validity: "Validité : 30 jours", price: 2500 },
  illimite: { name: "Illimité", validity: "Validité : 30 jours", price: 5000 },
};

export const OPERATOR_LABELS: Record<OperatorCode, string> = {
  mtn: "MTN",
  orange: "Orange",
  camtel: "CAMTEL",
};

/** Local 9-digit Cameroonian mobile number, e.g. 670000000 */
export const LOCAL_PHONE_REGEX = /^6\d{8}$/;

export const toInternational = (local: string) => `237${local}`;
