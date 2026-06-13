import { useState } from "react";
import AddressAutocomplete from "@/components/address/AddressAutocomplete";
import { supabase } from "@/lib/supabase";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/Store";
import { Button } from "@/components/ui/button";
import { setProfile, type Profile } from "@/store/slice/authSlice";
import { toast } from "sonner";
import { CircleUser, Store } from "lucide-react";

const cardClass =
  "rounded-[20px] border border-black/10 bg-white px-5 py-5 shadow-[0_1px_0_rgba(0,0,0,0.03)] lg:px-6";
const inputClass =
  "w-full rounded-md border border-black/10 px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-black";
const labelClass = "mb-1 block text-sm font-medium text-black";

const profileToFormData = (profile: NonNullable<Profile>): NonNullable<Profile> => ({
  id: profile.id,
  full_name: profile.full_name ?? "",
  email: profile.email ?? "",
  avatar: profile.avatar ?? null,
  phone: profile.phone ?? null,
  address: profile.address ?? null,
  store_name: profile.store_name ?? null,
  contact_number: profile.contact_number ?? null,
  status: profile.status ?? null,
  business_address: profile.business_address ?? null,
  store_description: profile.store_description ?? null,
});

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSellersForm, setShowSellersForm] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const profile = useSelector((state: RootState) => state.auth.profile);
  const dispatch = useDispatch();
  const [addressVerified, setAddressVerified] = useState(false);

  const [formData, setFormData] = useState<NonNullable<Profile>>({
    id: profile?.id ?? "",
    full_name: profile?.full_name ?? "",
    email: profile?.email ?? "",
    avatar: profile?.avatar ?? null,
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    store_name: profile?.store_name ?? null,
    contact_number: profile?.contact_number ?? null,
    status: profile?.status ?? null,
    business_address: profile?.business_address ?? null,
    store_description: profile?.store_description ?? null,
  });

  const handleCancelEdit = () => {
    if (profile) {
      setFormData(profileToFormData(profile));
      setAddressVerified(!!profile.address);
    }
    setIsEditing(false);
    setAvatarFile(null);
    setPreview(null);
  };

  const handleSave = async () => {
    if (!profile) return;

    const { id, full_name, email, phone, address } = formData;

    if ((address ?? "").trim() && !addressVerified) {
      toast.error("Please pick a valid address from the suggestions");
      return;
    }

    let avatarUrl: string | null =
      typeof formData.avatar === "string" ? formData.avatar : profile.avatar ?? null;

    if (avatarFile) {
      const filePath = `${id}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) {
        console.error("Avatar upload failed:", uploadError);
        toast.error(
          uploadError.message ||
            (typeof uploadError === "object" && "error" in uploadError
              ? String(uploadError.error)
              : "Failed to upload avatar. Check Supabase Storage bucket and policies."),
        );
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      avatarUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("users")
      .update({ full_name, email, avatar: avatarUrl })
      .eq("id", id)
      .select("id");

    if (error) {
      console.error(error);
      toast.error("Failed to update profile");
      return;
    }

    const { data: customerData, error: customerError } = await supabase
      .from("customers")
      .upsert(
        { id, phone: phone ?? null, address: address ?? null },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (customerError) {
      console.error(customerError);
      toast.error("Failed to update customer");
      return;
    }
    if (!customerData) {
      toast.error(
        "Customer record could not be updated. Check Supabase RLS policies for the customers table.",
      );
      return;
    }

    dispatch(setProfile({ ...formData, avatar: avatarUrl }));
    setIsEditing(false);
    setAvatarFile(null);
    setPreview(null);
    toast.success("Profile updated!");
  };

  const handleSellerSave = async () => {
    if (!profile) return;

    const { id, store_name, contact_number, store_description, business_address } = formData;

    const { data: sellersData, error: sellerError } = await supabase
      .from("seller")
      .upsert(
        {
          id,
          store_name: store_name ?? null,
          contact_number: contact_number ?? null,
          status: (formData.status === "approved" ? "approved" : "pending") as
            | "pending"
            | "approved"
            | "rejected",
          store_description: store_description ?? null,
          business_address: business_address ?? null,
        },
        { onConflict: "id" },
      )
      .select("id")
      .single();

    if (sellerError) {
      console.error(sellerError);
      toast.error("Failed to update seller");
      return;
    }

    if (!sellersData) {
      toast.error(
        "Seller record could not be updated. Check Supabase RLS policies for the sellers table.",
      );
      return;
    }

    dispatch(setProfile({
      ...formData,
      avatar: typeof formData.avatar === "string" ? formData.avatar : profile?.avatar ?? null,
    }));
    setShowSellersForm(false);
    toast.success("Seller profile updated!");
  };

  const avatarSrc = preview ?? profile?.avatar ?? null;

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2 sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-black/10 bg-[#F0F0F0]">
              {avatarSrc ? (
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <CircleUser className="h-12 w-12 text-black/30" />
                </div>
              )}

              {isEditing ? (
                <input
                  type="file"
                  name="avatar"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAvatarFile(file);
                      setPreview(URL.createObjectURL(file));
                    }
                  }}
                />
              ) : null}
            </div>
            {isEditing ? (
              <p className="text-xs text-black/50">Click photo to change</p>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-xl font-bold text-black">Profile</p>
              <p className="mt-1 text-sm text-black/60">
                Manage your personal details and shipping address.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className={labelClass}>Full name</label>
                {isEditing ? (
                  <input
                    name="full_name"
                    className={inputClass}
                    placeholder="Full name"
                    value={formData.full_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="text-base font-semibold text-black">
                    {profile?.full_name || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Email</label>
                {isEditing ? (
                  <input
                    name="email"
                    className={`${inputClass} bg-black/5 text-black/60`}
                    value={formData.email}
                    disabled
                  />
                ) : (
                  <p className="text-base font-semibold text-black">
                    {profile?.email || "—"}
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>Phone</label>
                {isEditing ? (
                  <input
                    name="phone"
                    type="tel"
                    className={inputClass}
                    placeholder="Phone number"
                    value={formData.phone ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <p className="text-base font-semibold text-black">
                    {profile?.phone || "No phone number"}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Address</label>
                {isEditing ? (
                  <AddressAutocomplete
                    value={formData.address ?? ""}
                    verified={addressVerified}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, address: value }))
                    }
                    onVerifiedChange={setAddressVerified}
                    placeholder="Start typing your address"
                    className={inputClass}
                  />
                ) : (
                  <p className="text-base font-semibold text-black">
                    {profile?.address || "No address saved"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-black/10 pt-5">
              {isEditing ? (
                <>
                  <Button
                    onClick={() => handleSave()}
                    className="rounded-[62px] bg-black px-6 text-white hover:bg-black/80"
                  >
                    Save changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="rounded-[62px] border-black/10"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => {
                    if (profile) {
                      setFormData(profileToFormData(profile));
                    }
                    setIsEditing(true);
                    setAddressVerified(!!profile?.address);
                  }}
                  className="rounded-[62px] bg-black px-6 text-white hover:bg-black/80"
                >
                  Edit profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/5">
            <Store className="h-5 w-5 text-black" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold text-black">Seller</p>
            <p className="mt-1 text-sm text-black/60">
              Apply to sell on Shopco or manage your store details.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              {profile?.status === "pending" ? (
                <Button
                  disabled
                  className="rounded-[62px] bg-amber-500 text-white hover:bg-amber-500"
                >
                  Pending approval
                </Button>
              ) : profile?.status === "approved" ? (
                <Button
                  onClick={() => setShowSellersForm(!showSellersForm)}
                  className="rounded-[62px] bg-black text-white hover:bg-black/80"
                >
                  {showSellersForm ? "Hide seller form" : "Seller dashboard"}
                </Button>
              ) : (
                <Button
                  onClick={() => setShowSellersForm(!showSellersForm)}
                  variant="outline"
                  className="rounded-[62px] border-black/10"
                >
                  {showSellersForm ? "Hide application" : "Become a seller"}
                </Button>
              )}
            </div>

            {showSellersForm ? (
              <div className="mt-5 space-y-4 rounded-[16px] border border-black/10 bg-[#FAFAFA] p-4">
                <div>
                  <label className={labelClass}>Store name</label>
                  <input
                    type="text"
                    name="store_name"
                    placeholder="Store name"
                    className={inputClass}
                    value={formData.store_name ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Contact number</label>
                  <input
                    type="tel"
                    name="contact_number"
                    placeholder="Contact number"
                    className={inputClass}
                    value={formData.contact_number ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className={labelClass}>Business address</label>
                  <AddressAutocomplete
                    value={formData.business_address ?? ""}
                    verified={addressVerified}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, business_address: value }))
                    }
                    onVerifiedChange={setAddressVerified}
                    placeholder="Start typing your business address"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Store description</label>
                  <input
                    type="text"
                    name="store_description"
                    placeholder="Store description"
                    className={inputClass}
                    value={formData.store_description ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [e.target.name]: e.target.value,
                      }))
                    }
                  />
                </div>
                <Button
                  onClick={() => handleSellerSave()}
                  className="rounded-[62px] bg-black text-white hover:bg-black/80"
                >
                  Save seller info
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
