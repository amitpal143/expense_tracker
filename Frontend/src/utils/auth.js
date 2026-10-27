import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "https://expense-tracker-7jqm.onrender.com/api";

// The token lives in localStorage ("Remember me") or sessionStorage (default).
export const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token") || null;

export const clearToken = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

// Replace the token in whichever storage currently holds it
export const setToken = (token) => {
  if (!token) return;
  if (localStorage.getItem("token")) localStorage.setItem("token", token);
  else sessionStorage.setItem("token", token);
};

// Auto-logout when the session expires (401 from a protected endpoint)
let installed = false;
export const setupAuthInterceptor = () => {
  if (installed) return;
  installed = true;
  axios.interceptors.response.use(
    (res) => res,
    (error) => {
      const url = error?.config?.url || "";
      const isAuthCall = /\/user\/(login|register)/.test(url);
      if (error?.response?.status === 401 && !isAuthCall && getToken()) {
        clearToken();
        if (window.location.pathname !== "/login") window.location.assign("/login");
      }
      return Promise.reject(error);
    }
  );
};
