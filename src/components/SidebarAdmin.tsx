"use client";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../public/Logo.png";
import { BiSolidDashboard } from "react-icons/bi";
import { MdOutlineCategory } from "react-icons/md";
import { AiFillProduct } from "react-icons/ai";
import { FaHome, FaUsers } from "react-icons/fa";
import { FaCartArrowDown } from "react-icons/fa6";

const SidebarAdmin = () => {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/admin") {
      router.replace("/admin/dashboard");
    }
  }, [pathname, router]);

  const menuItems = useMemo(
    () => [
      {
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <BiSolidDashboard />,
      },
      {
        name: "Categories",
        path: "/admin/categories",
        icon: <MdOutlineCategory />,
      },
      { name: "Products", path: "/admin/products", icon: <AiFillProduct /> },
      { name: "Users", path: "/admin/users", icon: <FaUsers /> },
      { name: "Orders", path: "/admin/orders", icon: <FaCartArrowDown /> },
      { name: "Home", path: "/", icon: <FaHome /> },
    ],
    []
  );

  return (
    <div className="h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 shadow-lg flex flex-col p-4 text-white">
      <div className="flex flex-col items-center gap-3 border-b pb-4 border-gray-700">
        <Image
          src={logo}
          alt="Logo"
          width={60}
          height={60}
          className="rounded-full border-4 border-gray-600 shadow-md"
        />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      <ul className="mt-4 space-y-2 px-3">
        {menuItems.map((item) => (
          <li
            key={item.path}
            className={`flex items-center gap-3 p-3 text-lg font-medium cursor-pointer rounded-lg transition-all duration-300 group ${
              pathname === item.path
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-700"
            }`}
            onClick={() => router.push(item.path)}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {item.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarAdmin;