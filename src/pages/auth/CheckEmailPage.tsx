import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const CheckEmailPage = () => {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (error) throw error;
      toast.success("Verification email sent. Check your inbox.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to resend email.";
      toast.error(message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="px-4 lg:px-[100px] pt-[80px] pb-[50%] md:pb-[25%] lg:pb-[168px] min-h-[60vh] flex items-center justify-center">
      <div className="w-full max-w-md mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-black/5 p-4">
            <Mail className="h-12 w-12 text-black/70" />
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-2">Check your email</h1>
        <p className="text-gray-600 mb-6">
          We sent a verification link to
          {email ? (
            <span className="font-bold text-black block text-2xl my-2">{email}</span>
          ) : (
            " your email address."
          )}
          Click the link to verify your account, then you can sign in.
        </p>
      <div className="flex gap-[40px] justify-center items-center mt-6">
      {email && (
          <Button
            type="button"
            variant="outline"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Resend verification email"}
          </Button>
        )}
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm font-medium text-black hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
      </div>
    </div>
  );
};

export default CheckEmailPage;
