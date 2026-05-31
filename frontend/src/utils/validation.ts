export function isValidRoomCode(raw: string) {
  const code = (raw || "").trim().toUpperCase();
  return /^[A-Z0-9]{4}$/.test(code);
}

export function roomCodeErrorMessage(raw: string) {
  const code = (raw || "").trim();
  if (code.length === 0) return "";
  if (!/^[A-Za-z0-9]*$/.test(code)) return "Room code may only contain letters and numbers.";
  if (code.length !== 4) return "Room code must be 4 characters.";
  return "";
}
