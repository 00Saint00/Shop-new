import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Login from "./Login";
import Register from "./Register";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { data } from "react-router-dom";
import toast from "react-hot-toast";

type ServerError = {
  message: string;
};

const AuthPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [serverError, setServerError] = useState<ServerError | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession(); // get current session
      if (session) {
        setUser(session.user);
      } else {
        setUser(null); // user not logged in yet
      }
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

  const handleRegister = async (data: any) => {
    try {
      const { fullName, email, password, avatarFile } = data;

      // 1️⃣ Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const user = authData.user;
      if (!user) return;

      // const file = avatarFile[0];
      // const filePath = `avatars/${user.id}-${file.name}`;
      // await supabase.storage.from("avatars").upload(filePath, file);

      // await supabase.storage
      //   .from("avatars")
      //   .upload(`${user.id}-${file.name}`, file);

      // const { data: urlData } = supabase.storage
      //   .from("avatars")
      //   .getPublicUrl(`${user.id}-${file.name}`);
      // const avatarUrl = urlData.publicUrl;

      let avatarUrl = null;
      if (avatarFile?.length > 0) {
        const file = avatarFile[0];
        const filePath = `${user.id}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = urlData.publicUrl;
      }

      // 3️⃣ Insert profile
      await supabase.from("users").insert({
        id: user.id,
        full_name: fullName,
        avatar: avatarUrl,
        email: email,
      });

      toast.success("Registration successful!");
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
