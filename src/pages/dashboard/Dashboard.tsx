import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type SellerRow = {
  id: string;
  store_name: string | null;
  contact_number: string | null;
  store_description: string | null;
  business_address: string | null;
  status: string;
};

type UserRow = {
  id: string;
  full_name: string;
  email: string;
};

type SellerApplication = SellerRow & {
  full_name: string | null;
  email: string | null;
};

const cardClass =
  "rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]";

const Dashboard = () => {
  const [applications, setApplications] = useState<SellerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data: sellerRows, error: sellerError } = await supabase
      .from("seller")
      .select(
        "id, store_name, contact_number, store_description, business_address, status",
      )
      .eq("status", "pending")
      .order("id", { ascending: false });

    if (sellerError) {
      setError(sellerError.message);
      setApplications([]);
      setLoading(false);
      return;
    }

    const sellers = (sellerRows ?? []) as SellerRow[];
    if (sellers.length === 0) {
      setApplications([]);
      setLoading(false);
      return;
    }

    const sellerIds = sellers.map((row) => row.id);
    const { data: userRows } = await supabase
      .from("users")
      .select("id, full_name, email")
      .in("id", sellerIds);

    const usersById = (userRows ?? []).reduce<Record<string, UserRow>>(
      (acc, user) => {
        acc[user.id] = user as UserRow;
        return acc;
      },
      {},
    );

    setApplications(
      sellers.map((seller) => ({
        ...seller,
        full_name: usersById[seller.id]?.full_name ?? null,
        email: usersById[seller.id]?.email ?? null,
      })),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadApplications();
  }, [loadApplications]);

  const updateStatus = async (sellerId: string, status: "approved" | "rejected") => {
    setUpdatingId(sellerId);

    const { error: updateError } = await supabase
      .from("seller")
      .update({ status })
      .eq("id", sellerId);

    setUpdatingId(null);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    toast.success(status === "approved" ? "Seller approved" : "Seller rejected");
    setApplications((prev) => prev.filter((app) => app.id !== sellerId));
  };

  return (
    <div className="px-[16px] pt-[80px] pb-[168px] lg:px-[100px]">
      <div className="mb-6">
        <h1 className="font-poppins text-[32px] font-bold uppercase text-black lg:text-[40px]">
          Admin dashboard
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Review seller applications waiting for approval.
        </p>
      </div>

      {loading ? (
        <p className="text-black/60">Loading applications...</p>
      ) : error ? (
        <div className={`${cardClass} text-red-500`}>
          Could not load applications: {error}
        </div>
      ) : applications.length === 0 ? (
        <div className={`${cardClass} text-center text-black/60`}>
          No pending seller applications.
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <article key={app.id} className={cardClass}>
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/10 pb-4">
                <div>
                  <p className="font-semibold text-black">
                    {app.store_name || "Unnamed store"}
                  </p>
                  <p className="mt-1 text-sm text-black/60">
                    {app.full_name ?? "Unknown applicant"}
                    {app.email ? ` · ${app.email}` : ""}
                  </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium capitalize text-amber-800">
                  {app.status}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-black/60">Contact</dt>
                  <dd className="font-medium text-black">
                    {app.contact_number || "—"}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-black/60">Business address</dt>
                  <dd className="font-medium text-black">
                    {app.business_address || "—"}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-black/60">Store description</dt>
                  <dd className="font-medium text-black">
                    {app.store_description || "—"}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 flex flex-wrap gap-3">
                <Button
                  disabled={updatingId === app.id}
                  onClick={() => void updateStatus(app.id, "approved")}
                  className="rounded-[62px] bg-black text-white hover:bg-black/80"
                >
                  Approve
                </Button>
                <Button
                  variant="outline"
                  disabled={updatingId === app.id}
                  onClick={() => void updateStatus(app.id, "rejected")}
                  className="rounded-[62px] border-black/10"
                >
                  Reject
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
