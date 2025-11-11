import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { store } from "./Redux/Store"; 
import dayjs from "dayjs";

const baseURL = "http://72.61.171.1:8002";

const getAuthTokens = () => {
  const state = store.getState();
  return state.auth.token ? { token: state.auth.token, refresh: state.auth.refresh } : null;
};

const axiosInstance = axios.create({
  baseURL,
});

axiosInstance.interceptors.request.use(async (req) => {
  // Get authTokens from Redux state
  const authTokens = getAuthTokens();

  if (!authTokens) {
    return req; // If no tokens, just proceed with the request
  }

  req.headers.Authorization = `Bearer ${authTokens.token}`;

  const user = jwtDecode(authTokens.token);
  const isExpired = dayjs.unix(user.exp).diff(dayjs()) < 1;

  if (!isExpired) return req;

  try {
    // If token is expired, try to refresh the token using the refresh token
    const response = await axios.post(`${baseURL}/auth/token/refresh/`, {
      refresh: authTokens.refresh,
    });

    // Get current state to preserve user data
    const currentState = store.getState();
    
    // Update Redux store with new tokens - match the structure from your authSlice
    store.dispatch({
      type: "auth/loginSuccess",
      payload: {
        user: currentState.auth.user, // Preserve existing user
        access_token: response.data.access, // Use 'access' instead of 'token'
        refresh_token: response.data.refresh, // Use 'refresh_token' instead of 'refresh'
      },
    });

    req.headers.Authorization = `Bearer ${response.data.access}`;
  } catch (error) {
    console.error("Error refreshing token:", error);
    // Dispatch logout action if token refresh fails
    store.dispatch({ type: "auth/logout" });
  }

  return req;
});

export default axiosInstance;