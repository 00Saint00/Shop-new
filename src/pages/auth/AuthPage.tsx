import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";
import Register from "./Register";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type ServerError = {
  message: string;
};

const AuthPage = () => {
  const [serverError, setServerError] = useState<ServerError | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    const { email, password } = data;
    setServerError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
      console.log("User logged in:", data.user?.email, data.user);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Login failed";
      setServerError({ message });
    }
  };

  const handleRegister = async (data: {
    fullName: string;
    email: string;
    password: string;
  }) => {
    try {
      const { fullName, email, password } = data;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) {
        throw new Error("User creation failed");
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          full_name: fullName,
          email,
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Failed to update user profile:", updateError);
      }

      navigate("/auth/check-email", { state: { email } });
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const message =
        error instanceof Error ? error.message : "Registration failed";
      setServerError({ message });
      toast.error(message);
    }
  };

  return (
    <div className="px-[16px] lg:px-[100px] pt-[80px] pb-[50%] md:pb-[25%] lg:pb-[168px]">
      <div className="w-full max-w-md mx-auto">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="flex border-b border-gray-300 justify-between w-full">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Login
              onLogin={handleLogin}
              serverError={serverError?.message ?? null}
            />
          </TabsContent>
          <TabsContent value="register">
            <Register
              onSubmit={handleRegister}
              serverError={serverError?.message ?? null}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
