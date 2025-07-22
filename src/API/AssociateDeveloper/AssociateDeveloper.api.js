const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiService = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const { headers = {}, ...rest } = options;

    const config = {
      headers: {
        ...headers,
      },
      ...rest,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong");
      }
      return response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: "GET", ...options });
  },

  post(endpoint, body, options = {}) {
    // For FormData, we don't set Content-Type, the browser does it.
    if (body instanceof FormData) {
      return this.request(endpoint, { method: "POST", body, ...options });
    }

    return this.request(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });
  },

  put(endpoint, body, options = {}) {
    if (body instanceof FormData) {
      return this.request(endpoint, { method: "PUT", body, ...options });
    }

    return this.request(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      ...options,
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: "DELETE", ...options });
  },
};

export const associateDeveloperApi = {
  getAssociateDevelopers: () => {
    return apiService.get("/associatedeveloper");
  },
  getAssociateDeveloper: (id) => {
    return apiService.get(`/associatedeveloper/${id}`);
  },
  createAssociateDeveloper: (formData) => {
    return apiService.post("/associatedeveloper", formData);
  },
  updateAssociateDeveloper: (id, formData) => {
    return apiService.put(`/associatedeveloper/${id}`, formData);
  },
  deleteAssociateDeveloper: (id) => {
    return apiService.delete(`/api/associatedeveloper/${id}`);
  },
  uploadAssociateDeveloperImages: (imageUrls) => {
    return apiService.post("/api/associatedeveloper", { images: imageUrls });
  },
  deleteAssociateDeveloperImage: (id, index) => {
    return apiService.put(`/associatedeveloper/${id}/${index}`);
  },
};
