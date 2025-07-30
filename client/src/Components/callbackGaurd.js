import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import * as jose from "jose";

// Helper function to check for a valid token
const hasValidSession = () => {
  const access_token = localStorage.getItem("access_token");
  if (!access_token) {
    return false;
  }
  try {
    const payload = jose.decodeJwt(access_token);
    // Check if the token is expired
    return payload.exp * 1000 > Date.now();
  } catch (error) {
    // If token is malformed, it's not valid
    return false;
  }
};

const CallbackGuard = ({ children }) => {
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const hasAuthCode = query.has("code");

  const hasActiveSession = hasValidSession();

  if (!hasAuthCode && !hasActiveSession) {
    // Redirect them to the home/login page.
    // The 'replace' prop prevents the user from clicking "back" to the protected page.
    return <Navigate to="/" replace />;
  }

  return children;
};

export default CallbackGuard;
