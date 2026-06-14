export const formatDate = (value) => {
  if (!value) return "-";
  return new Date(value).toLocaleString();
};

export const formatDateInput = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
};

export const formatMoney = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(Number(value ?? 0));

export const customerName = (customer) => {
  if (!customer) return "-";
  if (typeof customer === "string") return customer;
  return customer.name ?? customer.company ?? customer.email ?? "-";
};
