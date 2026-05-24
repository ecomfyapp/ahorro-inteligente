export function buildApplicationNumber(seed?: string | null) {
  const value = String(seed || "").trim();

  if (!value) return "AP-3520";

  const hash = Array.from(value).reduce(
    (sum, char) => (sum * 31 + char.charCodeAt(0)) % 9000,
    0,
  );

  return `AP-${String(1000 + hash).padStart(4, "0")}`;
}
