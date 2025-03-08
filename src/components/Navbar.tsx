"use client";
import { useCallback, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/supabase/client";
import { Menu, X, ShoppingCart,  User } from "lucide-react";

export default function Navbar() {
  interface User {
    id: string;
    role: string;
  }
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState<User>();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useCallback(() => {
    const checkUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const { data: userData } = await supabase
          .from("user")
          .select("role")
          .eq("id", sessionData.session.user.id)
          .single();
        if (userData) {
          setUser({ id: sessionData.session.user.id, role: userData.role });
        }
      }
    };
    checkUser();
  }, [supabase]);

  useCallback(() => {
    if (!user) return;
    const fetchCartCount = async () => {
      const { data } = await supabase
        .from("cart")
        .select("id")
        .eq("user_id", user.id);
      setCartCount(data?.length || 0);
    };
    fetchCartCount();
  }, [user, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(undefined);
    setCartCount(0);
    router.push("/");
  };

  return (
    <nav className="bg-gray-900 text-white p-4 sticky top-0 shadow-lg z-50">
      <div className="container mx-auto flex justify-between items-center">
        <button onClick={() => router.push("/")} className="text-2xl font-bold text-green-400">
          GREENSHOP
        </button>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
        <ul className={`md:flex space-x-6 hidden`}> 
          {pathname !== "/" && (
            <li>
              <button onClick={() => router.push("/")} className="hover:text-green-400 transition">
                Home
              </button>
            </li>
          )}
          {user?.role === "admin" && pathname !== "/admin" && (
            <li>
              <button onClick={() => router.push("/admin")} className="hover:text-green-400 transition">
                Admin
              </button>
            </li>
          )}
          {pathname !== "/cart" && (
            <li className="relative">
              <button onClick={() => router.push("/cart")} className="relative flex items-center gap-2 mt-1">
                <ShoppingCart size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2">
                    {cartCount}
                  </span>
                )}
              </button>
            </li>
          )}
          <li>
            {user ? (
              <div className="relative">
                <User size={28} className="cursor-pointer hover:text-green-400" onMouseEnter={() => setDropdownOpen(!dropdownOpen)} onMouseLeave={() => setDropdownOpen(false)}/>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 bg-white text-black shadow-lg border rounded-md p-2 w-40">
                    {pathname !== "/cabinet" && (
                      <button onClick={() => router.push("/cabinet")} className="block p-2 hover:bg-gray-200">
                        Cabinet
                      </button>
                    )}
                    <button onClick={handleLogout} className="block p-2 text-red-600 hover:bg-gray-200">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              pathname !== "/login" && (
                <button onClick={() => router.push("/login")} className="hover:text-green-400 transition">
                  Log In
                </button>
              )
            )}
          </li>
        </ul>
      </div>
    </nav>
  );
}
