import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Heart, ListOrdered } from "lucide-react";
import Wishlist from "./wishlist/Wishlist";
import EditProfile from "./editProfile/EditProfile";
import Order from "./orders/Order";

const tabTriggerClass =
  "flex items-center justify-center gap-2 p-3 text-[14px] font-bold max-md:shrink-0 max-md:rounded-full max-md:px-4 sm:text-[15px] md:w-full md:justify-start md:rounded-md";

const Profile = () => {
  return (
    <div className="bg-white px-[16px] pt-[80px] pb-[60%] md:pb-[15%] md:px-[40px] lg:px-[100px]">
      <Tabs
        defaultValue="profile"
        orientation="vertical"
        className="flex flex-col gap-6 md:flex-row md:items-start"
      >
        <TabsList className="flex h-auto w-full flex-row gap-1 overflow-x-auto rounded-none border-b border-black/10 bg-transparent p-0 pb-2 md:w-64 md:flex-col md:gap-2 md:overflow-visible md:border-b-0 md:pb-0">
          <TabsTrigger value="profile" className={tabTriggerClass}>
            <User className="h-5 w-5 shrink-0" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="dashboard" className={tabTriggerClass}>
            <Heart className="h-5 w-5 shrink-0" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="orders" className={tabTriggerClass}>
            <ListOrdered className="h-5 w-5 shrink-0" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="settings" className={tabTriggerClass}>
            <Settings className="h-5 w-5 shrink-0" />
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="min-w-0 flex-1 md:px-2">
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
  );
};

export default Profile;
