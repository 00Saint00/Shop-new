import { useState, useEffect, type FormEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import Logo from "../../assets/logo/SHOP.CO.svg";
import {
  ChevronDown,
  ChevronUp,
  Search,
  CircleUser,
  Clipboard,
  User,
  ClipboardCheck,
  ShoppingCart,
  Menu,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store/Store";
import { logout } from "@/store/slice/authSlice";
import { useCart } from "@/context/CartContext";

const SHOP_SEARCH_PATH =
  /^\/shop\/?$|^\/shop\/(top-selling|new-arrivals|a-z|z-a)$|^\/shop\/brand\/[^/]+$/;

const MOBILE_NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/shop/men", label: "Men" },
  { to: "/shop/women", label: "Women" },
  { to: "/shop/electronics", label: "Electronics" },
  { to: "/shop/fragrances", label: "Fragrances" },
  { to: "/shop/new-arrivals", label: "New Arrival" },
  { to: "/brands", label: "Brands" },
] as const;

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { cartItems } = useCart();

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchDraft.trim();
    if (q) {
      navigate(`/shop?q=${encodeURIComponent(q)}`);
    } else {
      navigate("/shop");
    }
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (SHOP_SEARCH_PATH.test(location.pathname)) {
      setSearchDraft(searchParams.get("q") ?? "");
    }
  }, [location.pathname, searchParams]);

  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = useSelector((state: RootState) => state.auth.profile);

  // Recovery flow creates a Supabase session; keep header in “signed out” chrome on this route
  const hideSignedInChrome = location.pathname === "/reset-password";

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
  };

  return (
    <header className="flex justify-between items-center lg:px-[100px] px-[16px] bg-white shadow-sm relative z-50">
      <div className="flex justify-between items-center w-full lg:py-[24px] py-[12px]">
        <div className="flex items-center gap-[14px]">
          {/* mobile nav */}
          <div className="sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Open menu"
                  className="flex cursor-pointer items-center justify-center rounded-md p-1 hover:text-gray-500 transition-colors"
                >
                  <Menu className="h-[24px] w-[24px]" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,320px)]">
                <SheetHeader>
                  <SheetTitle className="text-left font-poppins text-lg uppercase">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                <form
                  role="search"
                  onSubmit={handleSearchSubmit}
                  className="mt-4 flex items-center rounded-[62px] bg-[#f0f0f0] px-4 py-3"
                >
                  <Search className="h-5 w-5 shrink-0 text-gray-400" />
                  <input
                    type="search"
                    name="q"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="Search for products..."
                    autoComplete="off"
                    className="min-w-0 flex-1 bg-transparent px-3 text-sm focus:outline-none"
                  />
                </form>
                <nav className="mt-6 flex flex-col gap-1">
                  {MOBILE_NAV_LINKS.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-black transition-colors hover:bg-black/5"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          {/* Logo */}
          <Link to="/">
            <img
              src={Logo}
              alt="Logo"
              className="h-[22px] w-[140px]"
              loading="eager"
            />
          </Link>
        </div>
        <nav className="hidden sm:flex items-center gap-[24px] ml-[40px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1 hover:text-gray-800 cursor-pointer transition-colors">
                Shop
                <ChevronDown className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56">
              <DropdownMenuItem asChild>
                <Link to="/shop/men" className="cursor-pointer">
                  Men
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/shop/women" className="cursor-pointer">
                  Women
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/shop/electronics" className="cursor-pointer">
                  Electronics
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/shop/fragrances" className="cursor-pointer">
                  Fragrances
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div>On Sale</div>
          <Link
            to="/shop/new-arrivals"
            className="px-2 py-1 hover:text-gray-800 transition-colors"
          >
            New Arrival
          </Link>
          <Link
            to="/brands"
            className="px-2 py-1 hover:text-gray-800 transition-colors"
          >
            Brands
          </Link>
        </nav>

        {/* Search (Desktop Only) */}
        <form
          className="hidden lg:flex items-center border-0 rounded-[62px] px-[16px] py-[12px] bg-[#f0f0f0] w-[577px] h-[48px]"
          role="search"
          onSubmit={handleSearchSubmit}
        >
          <Search className="h-[24px] w-[24px] shrink-0 text-gray-400" />
          <input
            type="search"
            name="q"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search for products..."
            autoComplete="off"
            className="min-w-0 px-4 py-2 flex-1 focus:outline-none bg-transparent"
          />
        </form>

        <div className="flex items-center gap-[14px]">
          <div className="relative">
            <ShoppingCart
              className="h-[24px] w-[24px] cursor-pointer hover:text-gray-500 transition-colors"
              onClick={() => navigate("/cart")}
            />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-[-10px] bg-red-500 text-white text-xs rounded-full px-2 py-1 w-4 h-4 flex items-center justify-center text-center text-xs font-medium">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            )}
          </div>

          {user && !hideSignedInChrome ? (
            <DropdownMenu
              open={profileMenuOpen}
              onOpenChange={setProfileMenuOpen}
            >
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1 cursor-pointer hover:text-gray-500 transition-colors focus:outline-none"
                >
                  {/* <CircleUser className="h-[24px] w-[24px]" /> */}

                  {userProfile?.avatar ? (
                    <img
                      src={userProfile.avatar}
                      alt="Avatar"
                      className="h-[40px] w-[40px] rounded-full object-cover"
                    />
                  ) : (
                    <CircleUser className="h-[24px] w-[24px]" />
                  )}

                  {/* <img
                    src={userProfile?.avatar ?? <CircleUser className="h-[24px] w-[24px]" />}
                    alt="Avatar"
                    className="h-[40px] w-[40x] rounded-full object-cover"
                  /> */}

                  <ChevronUp
                    className={`h-4 w-4 text-gray-500 transition-transform duration-400 ease-out ${
                      profileMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-48">
                <DropdownMenuItem asChild>
                  <div className=" px-3 py-2 border-b">
                    <div className="inline-block">
                      <p className="text-sm font-medium ">
                        {userProfile?.full_name.toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {userProfile?.email}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer">
                    <User className="h-[16px] w-[16px] mr-2" />
                    <p>My Profile</p>
                  </Link>
                </DropdownMenuItem>
                {userProfile?.role === "admin" ? (
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex cursor-pointer">
                      <ClipboardCheck className="h-4 w-4 mr-2" />
                      <p>Dashboard</p>
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem asChild>
                  <div className="flex" onClick={handleLogout}>
                    <Clipboard className="h-4 w-4 mr-2 text-red-600" />
                    <p className="text-sm text-red-600 cursor-pointer">
                      Logout
                    </p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div>
              <Link
                to="/auth"
                className="flex items-center gap-2 px-2 py-1 hover:text-gray-500 transition-colors cursor-pointer"
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
