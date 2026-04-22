import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { logout } from "@/store/slice/authSlice";

type ForgotPasswordFormData = {
  email: string;
};

const ForgotPassword = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onForgotPassword = async (data: ForgotPasswordFormData) => {
    const email = data.email.trim();
    try {
      // Clear any existing session so reset + recovery flows do not feel like a surprise “login”
      await supabase.auth.signOut().catch(() => {});
      dispatch(logout());

      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      toast.success("If an account exists, we sent a reset link.");
      navigate("/auth/check-email", {
        state: { email, reason: "password-reset" as const },
      });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  return (
    <div className="px-[16px] lg:px-[100px] pt-[80px] pb-[50%] md:pb-[25%] lg:pb-[168px]">
      <form
        onSubmit={handleSubmit(onForgotPassword)}
        className="w-full max-w-md mx-auto"
      >
        <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
        <div className="my-6">
          {/* <label className="block text-sm font-medium mb-1">Email</label> */}
          <input
            type="email"
            placeholder="Enter your email"
            {...register("email", { required: "Email is required" })}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 transition disabled:opacity-60"
        >
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ForgotPassword;
