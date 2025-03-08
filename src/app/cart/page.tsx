"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/supabase/client";
import {  useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import Image from "next/image";

type CartItem = {
  id: string;
  product_id: string;
  user_id: string;
  quantity: number;
  total_price: number;
  product: {
    name: string;
    price: string;
    images: string[];
  };
};

const supabase = createClient();

export default function Cart() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

const fetchCart = async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("cart")
      .select("*, product:product_id (name, price, images)")
      .eq("user_id", userId);

    if (error) {
      toast.error("Error loading cart!");
    } else {
      setCartItems(data || []);
    }
    setLoading(false);
  };
  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        setUserId(null);
      } else {
        setUserId(data.user.id);
      }
      setCheckingUser(false);
    };
    getUser();
  }, [fetchCart]);
  
  useEffect(() => {
    if (userId) fetchCart();
  }, [userId,fetchCart]);
  

  const handleRemoveItem = async (id: string) => {
    const { error } = await supabase.from("cart").delete().eq("id", id);
    if (error) {
      toast.error("Error removing item!");
    } else {
      toast.success("Item removed successfully!");
      setCartItems(cartItems.filter((item) => item.id !== id));
    }
  };

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity <= 0) return handleRemoveItem(id);
    const item = cartItems.find((item) => item.id === id);
    if (!item) return;

    const newTotalPrice = parseFloat(item.product.price) * newQuantity;
    const { error } = await supabase
      .from("cart")
      .update({ quantity: newQuantity, total_price: newTotalPrice })
      .eq("id", id);

    if (error) {
      toast.error("Error updating quantity!");
    } else {
      setCartItems(
        cartItems.map((item) =>
          item.id === id
            ? { ...item, quantity: newQuantity, total_price: newTotalPrice }
            : item
        )
      );
    }
  };

  const totalPrice = cartItems.reduce((acc, item) => acc + item.total_price, 0);

  if (checkingUser) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-green-100 to-white">
        <Navbar />
        <div className="container mx-auto px-4 py-10 flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6 text-gray-800">
            Shopping Cart 🛒
          </h1>
          <p className="text-center text-gray-700 text-lg mb-14 font-semibold">
            Please register or log in!
          </p>
        </div>
        <div className="flex-grow"></div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-gradient-to-b from-green-100 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
          Shopping Cart 🛒
        </h1>
        <p className="text-2xl font-bold text-gray-900">
                    Total price:{" "}
                    <span className="text-green-600">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </p>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mb-10">Cart is empty</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg shadow-lg overflow-hidden bg-white">
              <thead>
                <tr className="bg-gradient-to-r from-green-600 to-green-400 text-white text-center">
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-b bg-gray-50 hover:bg-gray-100 transition-all">
                    <td className="p-3 text-center">
                      <Image src={item.product.images[0]} alt={item.product.name} width={70} height={70} className="w-16 h-16 object-cover rounded-lg mx-auto shadow-md" />
                    </td>
                    <td className="p-3 text-center font-medium">{item.product.name}</td>
                    <td className="p-3 text-center text-gray-700 font-semibold">${item.product.price}</td>
                    <td className="p-3 text-center flex justify-center items-center gap-2">
                      <button className="btn btn-info btn-sm rounded-md mt-3" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}>
                        <FaMinus className="text-gray-700" />
                      </button>
                      <span className="text-lg font-semibold mt-3">{item.quantity}</span>
                      <button className="btn btn-info btn-sm rounded-md mt-3" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}>
                        <FaPlus className="text-gray-700" />
                      </button>
                    </td>
                    <td className="p-3 text-center text-green-600 font-semibold">${item.total_price.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      <button className="text-red-600 hover:text-red-400 transition-all" onClick={() => handleRemoveItem(item.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="total">
              {cartItems.length > 0 && (
                <div className="text-center mt-8">
                  
                  <button
                    onClick={() => router.push("/checkout")}
                    className="btn btn-success btn-hover"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>
          
        )}
      </div>
      <Footer />
    </div>
  );
}
