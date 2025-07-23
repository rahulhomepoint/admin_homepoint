const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface Review {
  _id?: string;
  name: string;
  image?: string; // URL or base64 from backend
  work: string;
  message: string;
}

export const reviewsApi = {
  async getReviews(): Promise<Review[]> {
    const res = await fetch(`${API_BASE_URL}/reviews`);
    if (!res.ok) throw new Error("Failed to fetch reviews");
    const json = await res.json();
    // Fix: return the 'reviews' property from the response
    return json.reviews || [];
  },

  async addReview(data: {
    name: string;
    image?: string;
    work: string;
    message: string;
  }): Promise<Review> {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to add review");
    const json = await res.json();
    return json.data || json;
  },

  async editReview(
    id: string,
    data: { name: string; image?: string; work: string; message: string },
  ): Promise<Review> {
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to edit review");
    const json = await res.json();
    return json.data || json;
  },

  async deleteReview(id: string): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete review");
  },
};
