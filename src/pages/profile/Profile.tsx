import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Heart, ListOrdered } from "lucide-react";
import Wishlist from "./wishlist/Wishlist";
import EditProfile from "./editProfile/EditProfile";
import Order from "./orders/Order";

const Profile = () => {
  return (
    <div className="border-r border-gray-200 bg-white g:flex-row px-[16px] lg:px-[100px] pt-[80px] pb-[90%] lg:pb-[168px]">
      <div className="flex flex-col gap-5">
        <Tabs defaultValue="profile" orientation="vertical">
          <TabsList className="flex flex-col gap-2 w-64">
            <TabsTrigger
              value="profile"
              className="flex items-center gap-2 p-3 text-[15px] font-bold"
            >
              <User className="w-5 h-5  " />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="dashboard"
              className="flex items-center gap-2 p-3 text-[15px] font-bold"
            >
              <Heart className="w-5 h-5 " />
              Wishlist
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-2 p-3 text-[15px] font-bold"
            >
              <ListOrdered className="w-5 h-5 " />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="flex items-center gap-2 p-3 text-[15px] font-bold"
            >
              <Settings className="w-5 h-5 " />
              Settings
            </TabsTrigger>
          </TabsList>

          <div className="px-5 w-full">
            <TabsContent value="profile">
              <EditProfile />
            </TabsContent>
            <TabsContent value="dashboard">
              <Wishlist />
            </TabsContent>
            <TabsContent value="orders">
              <Order />
            </TabsContent>

            <TabsContent value="settings">Settings content here</TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
