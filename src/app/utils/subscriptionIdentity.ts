export function normalizeSubscriptionIdentity(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(inc|llc|ltda|sas|s\.a\.s|s\.a|colombia|latam)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
