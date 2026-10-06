import type { DeliveryDetails } from "@/lib/types";

export type FieldErrors = Partial<Record<string, string>>;

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
] as const;

const str = (form: FormData, key: string) => String(form.get(key) ?? "").trim();

export function normaliseEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
}

/** Accepts 10-digit Indian mobile numbers, optionally prefixed +91 / 0. */
export function normalisePhone(value: string) {
  const digits = value.replace(/[\s\-()]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export function parseDelivery(form: FormData): { data?: DeliveryDetails; errors: FieldErrors } {
  const errors: FieldErrors = {};
  const name = str(form, "name");
  const phoneRaw = str(form, "phone");
  const line1 = str(form, "line1");
  const line2 = str(form, "line2");
  const landmark = str(form, "landmark");
  const city = str(form, "city");
  const state = str(form, "state");
  const pincode = str(form, "pincode");

  if (name.length < 2 || name.length > 100) errors.name = "Enter the recipient’s full name.";
  const phone = normalisePhone(phoneRaw);
  if (!phone) errors.phone = "Enter a 10-digit Indian mobile number.";
  if (line1.length < 4 || line1.length > 200) errors.line1 = "Enter the house, street or building.";
  if (line2.length > 200) errors.line2 = "Keep this under 200 characters.";
  if (landmark.length > 120) errors.landmark = "Keep this under 120 characters.";
  if (city.length < 2 || city.length > 80) errors.city = "Enter the town or city.";
  if (!(INDIAN_STATES as readonly string[]).includes(state)) errors.state = "Choose a state or union territory.";
  if (!/^[1-9]\d{5}$/.test(pincode)) errors.pincode = "Enter a 6-digit PIN code.";

  if (Object.keys(errors).length) return { errors };
  return {
    errors,
    data: {
      name,
      phone: phone!,
      line1,
      line2: line2 || undefined,
      landmark: landmark || undefined,
      city,
      state,
      pincode,
    },
  };
}
