import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  user: (() => {
    const parsed = JSON.parse(localStorage.getItem("user") || "null");
    if (!parsed) return null;
    return {
      ...parsed,
      permissions: Array.isArray(parsed.permissions) ? parsed.permissions : [],
    };
  })(),
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",

  initialState,

  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;
      const normalizedUser = {
        ...user,
        permissions: Array.isArray(user?.permissions) ? user.permissions : [],
      };
      state.token = token;
      state.user = normalizedUser;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    },

    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    setUser: (state, action) => {
      const normalizedUser = {
        ...action.payload,
        permissions: Array.isArray(action.payload?.permissions)
          ? action.payload.permissions
          : [],
      };
      state.user = normalizedUser;
      localStorage.setItem("user", JSON.stringify(normalizedUser));
    },
  },
});
export const { setCredentials, logout, setUser } = authSlice.actions;
export default authSlice.reducer;
