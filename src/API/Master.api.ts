const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface Master {
  _id?: string;
  logo?: string;
  email: string;
  address: {
    registeredOffice: string;
    marketingOffice: string;
  };
  rera?: string;
  privyarApi: string;
  phone: string[];
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
}

export const masterApi = {
  async getMaster(): Promise<Master | null> {
    const res = await fetch(`${API_BASE_URL}/master`);
    if (!res.ok) throw new Error("Failed to fetch master data");
    const json = await res.json();
    if (Array.isArray(json.data)) return json.data[0] || null;
    return json.data || null;
  },

  async createMaster(
    data: Omit<Master, "_id"> & { logo?: string | null },
  ): Promise<Master> {
    const res = await fetch(`${API_BASE_URL}/master`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create master data");
    const json = await res.json();
    return json.data || json;
  },

  async updateMaster(
    id: string,
    data: Partial<Master> & { logo?: string | null },
  ): Promise<Master> {
    const res = await fetch(`${API_BASE_URL}/master/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update master data");
    const json = await res.json();
    return json.data || json;
  },
};
