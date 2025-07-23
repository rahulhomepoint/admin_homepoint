const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  password: string;
  __v: number;
  status: string;
  profileImage: string;
}

export const usersApi = {
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE_URL}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    const json = await res.json();
    return json.users || [];
  },

  async getUserById(id: string): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error("Failed to fetch user");
    const json = await res.json();
    return json.user || json;
  },

  async editUser(id: string, data: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to edit user");
    const json = await res.json();
    return json.data || json;
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete user");
  },
};
