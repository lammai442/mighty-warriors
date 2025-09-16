import { v4 as uuid } from "uuid";

export const generateId = (text) => {
  const uniqueId = `${text.toUpperCase()}#` + uuid().substring(0, 5);
  return uniqueId;
};
