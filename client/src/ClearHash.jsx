// src/ClearHash.jsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ClearHash = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.hash) {
      // remove the #something from the URL but keep path
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return null;
};

export default ClearHash;
