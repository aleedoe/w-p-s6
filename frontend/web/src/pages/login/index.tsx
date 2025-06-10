import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useAuth } from "../../contexts/auth-context";

const LoginPage: React.FC = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      const from =
        (location.state as { from?: Location })?.from?.pathname ||
        "/admin/products";

      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location, navigate]);

  const togglePasswordVisibility = () =>
    setIsPasswordVisible(!isPasswordVisible);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/admin/products");
    } catch (err) {
      // Error is handled in auth context
      // eslint-disable-next-line no-console
      console.error("Login failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="w-full">
          <CardHeader className="flex flex-col items-center gap-2 pb-0">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
              <Icon icon="lucide:zap" width={32} />
            </div>
            <h1 className="text-2xl font-bold">Admin Login</h1>
            <p className="text-default-500 text-center">
              Sign in to manage your electronics reseller platform
            </p>
          </CardHeader>

          <CardBody>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                isRequired
                label="Email"
                placeholder="Enter your email"
                startContent={
                  <Icon
                    className="text-default-400"
                    icon="lucide:mail"
                    width={18}
                  />
                }
                type="email"
                value={email}
                onValueChange={setEmail}
              />

              <Input
                isRequired
                endContent={
                  <button
                    className="focus:outline-none"
                    type="button"
                    onClick={togglePasswordVisibility}
                  >
                    <Icon
                      className="text-default-400"
                      icon={isPasswordVisible ? "lucide:eye-off" : "lucide:eye"}
                      width={18}
                    />
                  </button>
                }
                label="Password"
                placeholder="Enter your password"
                startContent={
                  <Icon
                    className="text-default-400"
                    icon="lucide:lock"
                    width={18}
                  />
                }
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onValueChange={setPassword}
              />

              {error && (
                <div className="text-danger text-sm p-2 bg-danger-50 rounded-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-between items-center">
                <Link href="#" size="sm">
                  Forgot password?
                </Link>
                <Button color="primary" isLoading={loading} type="submit">
                  Sign In
                </Button>
              </div>
            </form>
          </CardBody>

          <CardFooter className="flex justify-center pt-0">
            <p className="text-default-500 text-sm">
              © 2024 ElectroAdmin. All rights reserved.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
