export async function api(url, options) {
  let response;
  try {
    response = await fetch("/api" + url, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Nepavyko susisiekti su serveriu. Patikrink interneto ryšį ir bandyk dar kartą.",
    );
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Serveris šiuo metu nepasiekiamas. Bandyk dar kartą vėliau.",
    );
  }
  if (!response.ok) {
    const error = new Error(data.error || "Nepavyko gauti duomenų.");
    error.fields = data.fields;
    error.status = response.status;
    throw error;
  }
  return data;
}
