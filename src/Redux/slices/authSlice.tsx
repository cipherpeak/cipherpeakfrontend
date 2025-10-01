import { createSlice } from "@reduxjs/toolkit";



const loadState = () => {
  try {
    const serializedState = localStorage.getItem('cipherauthTokens');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
};

const initialState = loadState() || {
  user: null,
  token: null,
  refresh: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    startLoading: (state,action) => {
      state.loading = action.payload;
    },

    loginSuccess: (state, action) => {
      const { user,access_token,refresh_token } = action.payload;
      state.user = user;
      state.refresh = refresh_token;
      state.token = access_token;
    },

    loginFailure: (state) => {
      state.loading = false;
      state.error = "Login failed";
    },


    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refresh = null;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("cipherauthTokens");
    },
  },
});

export const { startLoading, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
