const phonePattern = /^(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}$/;

export const normalizePhone = (value: string) => value.replace(/\D/g, "");

export const isValidPhone = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" || phonePattern.test(trimmed);
};
