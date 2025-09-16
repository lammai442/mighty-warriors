import { roomSchema } from "../models/roomSchema.mjs";

export const validateRoom = () => ({
  before: (handler) => {
    const { error, value } = roomSchema.validate(handler.event.body);
    console.log("Error i middleware: ", error);
    console.log("Value i middleware: ", value);
    if (error) throw new Error(error.details[0].message);
  },
});
