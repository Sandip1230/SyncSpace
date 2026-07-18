import { API_BASE_URL } from "../utils/constants";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function createRoom() {
  const res = await fetch(`${API_BASE_URL}/rooms`, { method: "POST" });
  return handle(res); // { roomId }
}

export async function getRoom(roomId) {
  const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
  return handle(res); // { roomId, active, userCount }
}