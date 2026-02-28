import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/Store";
import { Button } from "@/components/ui/button";
import { setProfile, type Profile } from "@/store/slice/authSlice";
import { toast } from "sonner";
import { CircleUser } from "lucide-react";

const EditProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showSellersForm, setShowSellersForm] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  // Keep selected file out of formData/Redux (File is not serializable)
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const profile = useSelector((state: RootState) => state.auth.profile);
  const dispatch = useDispatch();

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
  });

  const handleSave = async () => {
    if (!profile) return;

    const { id, full_name, email, phone, address } = formData;
    // Use existing URL unless we're uploading a new file (avatar must be string | null for DB and Redux)
    let avatarUrl: string | null = formData.avatar ?? null;

    if (avatarFile) {
      const filePath = `${id}-${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });
      if (uploadError) {
        toast.error("Failed to upload avatar");
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

    // customers table: no approved column (removed); only id, phone, address
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

    const { id, store_name, contact_number } = formData;

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

    // Only pass serializable values (avatar must be string | null, never File)
    dispatch(setProfile({
      ...formData,
      avatar: typeof formData.avatar === "string" ? formData.avatar : profile?.avatar ?? null,
    }));
    setShowSellersForm(false);
    toast.success("Seller profile updated!");
  };

  return (
    <div>
     <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shrink-0 relative">
  {isEditing ? (
    <>
      {preview ? (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      ) : profile?.avatar ? (
        <img
          src={profile.avatar}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      ) : (
        <CircleUser className="h-12 w-12 text-gray-400" />
      )}

      <input
        type="file"
        name="avatar"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            setFormData((prev) => ({
              ...prev,
              [e.target.name]: file,
            }));

            setPreview(URL.createObjectURL(file));
          }
        }}
      />
    </>
  ) : profile?.avatar ? (
    <img
      src={profile.avatar}
      alt="Profile"
      className="w-full h-full object-cover"
    />
  ) : (
    <CircleUser className="h-12 w-12 text-gray-400" />
  )}
</div>
      <div className="mt-3">
        {isEditing ? (
          <input
            name="full_name"
            className="border rounded px-2 py-2 text-[20px] w-full"
            placeholder="Kindly Enter Full Name"
            value={formData.full_name}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
          />
        ) : (
          <p className="text-[25px] font-semibold">{profile?.full_name}</p>
        )}
      </div>
      <div className="mt-3">
        {isEditing ? (
          <input
            name="email"
            className="border rounded px-2 py-2 text-[20px] w-full bg-gray-200"
            placeholder="Kindly Enter Email"
            value={formData.email}
            disabled
          />
        ) : (
          <p className="text-[25px] font-semibold">{profile?.email}</p>
        )}
      </div>

      <div className="mt-3">
        {isEditing ? (
          <input
            name="phone"
            className="border rounded px-2 py-2 text-[20px] w-full"
            placeholder="EKindly Enter Phone Number"
            value={formData.phone ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                [e.target.name]: e.target.value,
              }))
            }
          />
        ) : (
          <p className="text-[25px] font-semibold">
            {profile?.phone ?? "No phone number"}
          </p>
        )}
      </div>

      <div className="mt-5">
        {isEditing ? (
          <div className="flex gap-2">
            <Button
              onClick={() => handleSave()}
              className="bg-blue-600 text-white"
            >
              Save
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setAvatarFile(null);
                setPreview(null);
              }}
              className="bg-gray-300"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsEditing(!isEditing)}>Edit Profile</Button>
        )}

        <div className="mt-5">
          {profile?.status === "pending" ? (
            <Button disabled className="bg-yellow-500 text-white">
              Pending Approval
            </Button>
          ) : profile?.status === "approved" ? (
            <Button
              onClick={() => setShowSellersForm(!showSellersForm)}
              className="bg-green-600 text-white"
            >
              Seller Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => setShowSellersForm(!showSellersForm)}
              className="bg-blue-600 text-white"
            >
              Become a Seller
            </Button>
          )}

          {showSellersForm && (
            <div className="flex gap-2 flex-col py-3">
              <input
                type="text"
                name="store_name"
                placeholder="Store Name"
                value={formData.store_name ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <input
                type="text"
                name="contact_number"
                placeholder="Contact Number"
                value={formData.contact_number ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    [e.target.name]: e.target.value,
                  }))
                }
              />
              <Button
                onClick={() => handleSellerSave()}
                className="bg-blue-600 text-white"
              >
                Save
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
