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

export const paymentListApi = {
  getPaymentLists: () => {
    return apiService.get("/paymentlist");
  },
  getPaymentList: (id) => {
    return apiService.get(`/paymentlist/${id}`);
  },
  createPaymentList: (formData) => {
    return apiService.post("/paymentlist", formData);
  },
  updatePaymentList: (id, formData) => {
    return apiService.put(`/paymentlist/${id}`, formData);
  },
  removePaymentListImage: (id, index) => {
    return apiService.put(`/paymentlist/${id}/${index}`);
  },
  deletePaymentList: (id) => {
    return apiService.delete(`/paymentlist/${id}`);
  },
};

export default paymentListApi;
