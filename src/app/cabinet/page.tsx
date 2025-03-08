"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { createClient } from "@/supabase/client";
import { useCallback,  useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaEdit } from "react-icons/fa";
import { LogOut } from "lucide-react";
import Image from "next/image";

const supabase = createClient();

type User = {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
};

type OrderInfo = {
  phone?: string;
  address?: string;
};

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [newValue, setNewValue] = useState<string>("");
  const router = useRouter();

  useCallback(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data?.session?.user) {
        router.push("/login");
        return;
      }

      const { data: userData } = await supabase
        .from("user")
        .select("id, email, username, avatar_url")
        .eq("id", data.session.user.id)
        .single();

      if (userData) {
        setUser(userData);
        fetchOrderInfo(userData.id);
      }
      setLoading(false);
    };

    const fetchOrderInfo = async (userId: string) => {
      const { data } = await supabase
        .from("orders")
        .select("phone, address")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (data) setOrderInfo(data);
    };

    fetchUser();
  }, [router]);

  const handleEdit = (field: keyof User | keyof OrderInfo, value: string) => {
    setEditingField(field);
    setNewValue(value);
  };

  const handleSave = async () => {
    if (!user || !editingField) return;

    if (editingField in user) {
      await supabase
        .from("user")
        .update({ [editingField]: newValue })
        .eq("id", user.id);
      setUser((prev) => (prev ? { ...prev, [editingField]: newValue } : prev));
    } else {
      await supabase
        .from("orders")
        .update({ [editingField]: newValue })
        .eq("user_id", user.id);
      setOrderInfo((prev) =>
        prev ? { ...prev, [editingField]: newValue } : prev
      );
    }

    setEditingField(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-green-100 to-white">
      <Navbar />
      <div className="flex-grow flex justify-center items-center p-6">
        <div className="bg-white shadow-2xl rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden">
          <div className="bg-green-700 text-white p-8 flex flex-col items-center w-full md:w-1/3">
            {loading ? (
              <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-white"></div>
            ) : user?.avatar_url ? (
              <Image
                src={"https://cdn1.vectorstock.com/i/1000x1000/51/90/student-avatar-user-profile-icon-vector-47025190.jpg"}
                width={96}
                height={96}
                className="rounded-full border-4 border-white shadow-lg transition-transform transform hover:scale-105"
                alt="Avatar"
              />
            ) : (
              <FaUser className="w-24 h-24 border-4 border-white rounded-full p-4 shadow-lg bg-white text-green-700" />
            )}
            <h1 className="mt-4 text-xl font-semibold">{user?.username}</h1>
          </div>

          <div className="p-8 w-full md:w-2/3">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">User Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(
                ["email", "phone", "address"] as (
                  | keyof User
                  | keyof OrderInfo
                )[]
              ).map((field) => (
                <div
                  key={field}
                  className={field === "address" ? "col-span-2" : ""}
                >
                  <p className="font-semibold flex justify-between items-center">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    <FaEdit
                      className="cursor-pointer text-blue-600 hover:text-blue-400 transition-all"
                      onClick={() =>
                        handleEdit(
                          field,
                          (user && user[field as keyof User]) ||
                            (orderInfo &&
                              orderInfo[field as keyof OrderInfo]) ||
                            ""
                        )
                      }
                    />
                  </p>
                  {editingField === field ? (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        className="border p-2 rounded-lg w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                      <button
                        onClick={handleSave}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-700 mt-1">{(user && user[field as keyof User]) || (orderInfo && orderInfo[field as keyof OrderInfo]) || "Not available"}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-8">
              <button
                className="btn btn-success btn-hover"
                onClick={() => router.push("/cabinet/myOrders")}
              >
                My Orders
              </button>
              <button
                className="btn btn-danger btn-hover"
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
              >
                <LogOut size={20} className="mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
