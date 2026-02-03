import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  loginSuccess,
  loginFailure,
  startLoading,
} from "@/Redux/slices/authSlice";
import { toast } from "sonner";
import axios from "axios";
import { backendUrl } from "@/components/Constants/Constants";
import logo from "../assets/cipher_scar[1].png";
import logotwo from "../assets/cipher_peak full.png";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(startLoading(true));

    try {
      const response = await axios.post(`${backendUrl}auth/login/`, {
        username,
        password,
      });

      console.log("FULL LOGIN RESPONSE:", response.data);
      console.log("User Info Object:", response.data.user_info);

      // Ensure userInfo has an ID
      const userInfo = response.data.user_info || {};
      if (!userInfo.id) {
        // Try common variations
        userInfo.id = response.data.user_id || response.data.id || response.data.pk || userInfo.pk || userInfo.user_id;
        console.log("Patched UserInfo ID:", userInfo.id);
      }

      // Dispatch login success
      dispatch(
        loginSuccess({
          user: response.data.user,
          userInfo: userInfo,
          access_token: response.data.access,
          refresh_token: response.data.refresh,
        })
      );

      toast.success("Login successful");
      navigate("/");
    } catch (error: any) {
      console.error("Login failed:", error);
      dispatch(loginFailure());

      const errorMessage = error.response?.data?.detail || "Invalid credentials. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      dispatch(startLoading(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img src={logotwo} alt="Company Logo" className="opacity-5" />
      </div>

      <Card className="w-full max-w-lg shadow-lg ">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16  rounded-2xl flex items-center justify-center">
            <img src={logo} alt="" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Welcome to Cipherpeak
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the Cipherpeak management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#4D4D4D] hover:bg-[#4D4D4D]"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
