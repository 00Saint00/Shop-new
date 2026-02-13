import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo/SHOP.CO.svg";
import {
  ChevronDown,
  ChevronUp,
  Search,
  CircleUser,
  Clipboard,
  User,
  ClipboardCheck,
  X,
  ShoppingCart,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/Store";
import { setUser } from "@/store/slice/authSlice";
import { logout } from "@/store/slice/authSlice";

const Header = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.auth.profile);

  // useEffect(() => {
  //   supabase.auth.getUser().then(({ data }) => {
  //     if (data.user) {
  //       dispatch(setUser(data.user));
  //     }
  //   });
  // }, []);

  const handleLogout = () => {
    supabase.auth.signOut().then(() => {
      dispatch(logout());
      navigate("/auth");
    });
  }

  return (
    <header className="flex justify-between items-center lg:px-[100px] px-[16px] bg-white shadow-sm relative z-50">
      <div className="flex justify-between items-center w-full lg:py-[24px] py-[12px]">
        {/* Logo */}
        <Link to="/">
          <img
            src={Logo}
            alt="Logo"
            className="h-[22px] w-[140px]"
            loading="eager"
          />
        </Link>
        <nav className="hidden sm:flex items-center gap-[24px] ml-[40px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 hover:text-blue-600">
                Shop
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-48">
              <DropdownMenuItem asChild>
                <div>Men</div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div>Women</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>On Sale</div>
          <div>New Arrival</div>
          <div>Brands</div>
        </nav>

        {/* Search (Desktop Only) */}
        <div className="hidden lg:flex items-center border-0 rounded-[62px] px-[16px] py-[12px] bg-[#f0f0f0] w-[577px] h-[48px]">
          <Search className="h-[24px] w-[24px] text-gray-400" />
          <input
            type="text"
            placeholder="Search for products..."
            className="px-4 py-2 flex-1 focus:outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-[14px]">
          <div className="relative">
            <ShoppingCart className="h-[24px] w-[24px]" />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer">
                  {/* <CircleUser className="h-[24px] w-[24px]" /> */}
                  <img src={userProfile?.avatar} alt="Avatar"   className="h-[40px] w-[40x] rounded-full object-cover" />
                </div>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <div className=" px-3 py-2 border-b">
                    <div className="inline-block">
                      <p className="text-sm font-medium ">
                        {userProfile?.full_name.toUpperCase
                        ()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">{userProfile?.email}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex">
                    <User className="h-[16px] w-[16px] mr-2" />
                    <p>My Profile</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    <p>Dashboard</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <div className="flex" onClick={handleLogout}>
                    <Clipboard className="h-4 w-4 mr-2 text-red-600" />
                    <p className="text-sm text-red-600 cursor-pointer" >Logout</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div>
              <Link
                to="/auth"
                className="flex items-center gap-2 px-2 py-1 hover:text-blue-600"
              >
                <CircleUser className="h-[24px] w-[24px]" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
