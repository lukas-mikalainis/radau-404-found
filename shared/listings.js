// Shared rules keep the form and API in sync.
export const categories = [
  "Elektronika",
  "Raktai",
  "Dokumentai",
  "Krepšiai",
  "Drabužiai",
  "Kita",
];
export const fields = {
  title: { label: "Pavadinimas", min: 3, max: 100 },
  description: { label: "Aprašymas", min: 10, max: 2000 },
  location: { label: "Vieta", min: 2, max: 150 },
  contact: { label: "Kontaktinė informacija", min: 5, max: 200 },
};
export function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Vilnius",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
export function validDate(value) {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value
  );
}
export function validatePost(body = {}) {
  const errors = {};
  for (const [key, rule] of Object.entries(fields)) {
    if (
      typeof body[key] !== "string" ||
      body[key].trim().length < rule.min ||
      body[key].trim().length > rule.max
    )
      errors[key] = `${rule.label}: įrašyk ${rule.min}–${rule.max} simbolių.`;
  }
  if (!["lost", "found"].includes(body.type))
    errors.type = "Pasirink skelbimo tipą.";
  if (!categories.includes(body.category))
    errors.category = "Pasirink kategoriją iš sąrašo.";
  if (!validDate(body.date) || body.date > today())
    errors.date = "Pasirink galiojančią datą, ne vėlesnę nei šiandien.";
  return errors;
}
