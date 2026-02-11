import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";
import Register from "./Register";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

type ServerError = {
  message: string;
};

const AuthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [serverError, setServerError] = useState<ServerError | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogin = async (data: { email: string; password: string }) => {
    const { email, password } = data; // extract the two fields
    setServerError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      console.log("User logged in:", data.user?.email, data.user);
    } catch (error: any) {
      setServerError({ message: error.message });
    }
  };

  return (
    <div className="px-[16px] lg:px-[100px] pt-[80px] pb-[50%] md:pb-[25%] lg:pb-[168px]">
      <div className="w-full max-w-md mx-auto">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="flex border-b border-gray-300 justify-between w-100 ">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Login onLogin={handleLogin} serverError={serverError?.message ?? null} />
          </TabsContent>
          <TabsContent value="register">
            <Register />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage;
