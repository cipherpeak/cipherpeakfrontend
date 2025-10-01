import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

interface AuthState {
  token: string | null;
  loading: boolean;
  user: any; 
  refresh: string | null;
  error: string | null;
}

interface RootState {
  auth: AuthState;
}

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { 
    token,
    loading 
  } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;