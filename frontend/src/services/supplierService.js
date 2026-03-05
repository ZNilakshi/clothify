// services/supplierService.js
const BASE = "http://localhost:8080/api/suppliers";

export const createSupplier = async (data) => {
  const res = await fetch(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save supplier");
  return res.json();
};

export const fetchSuppliers = async (name = "") => {
  const url = name ? `${BASE}?name=${encodeURIComponent(name)}` : BASE;
  const res = await fetch(url);
  return res.json();
};