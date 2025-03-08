"use client";
import Home from "@/components/Navbar";
import { createClient } from "@/supabase/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {useEffect,useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ll from "@/photos/AlaskaViolet_CVecchio_KLoving_sml.webp"

const supabase = createClient();

interface Product {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: string;
  images: string[];
  active: boolean;
}

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setProductId(resolvedParams.id);
    };

    fetchParams();
  }, [params]);

  useEffect(() => {
    if (!productId) return;

    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("User fetch error:", error);
        return;
      }
      setUserId(data?.user?.id || null);
    };

    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("product")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) {
        console.error("Product fetch error:", error);
        return;
      }

      setProduct(data);
      setSelectedImage(data.images[0]);
    };

    fetchUser();
    fetchProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!userId || !product) {
      toast.error("Foydalanuvchi yoki mahsulot ma'lumotlari topilmadi!");
      return;
    }
    
    const quantity = 1;
    const totalPrice = parseFloat(product.price) * quantity;

    const { data: existingProduct, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", product.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Cart check error:", error);
      toast.error("Savatchani tekshirishda xatolik yuz berdi!");
      return;
    }

    if (existingProduct) {
      const newQuantity = existingProduct.quantity + quantity;
      const newTotalPrice = parseFloat(product.price) * newQuantity;

      const { error: updateError } = await supabase
        .from("cart")
        .update({ quantity: newQuantity, total_price: newTotalPrice })
        .eq("id", existingProduct.id);

      if (updateError) {
        toast.error("Xatolik yuz berdi!");
      } else {
        toast.success("Mahsulot qo‘shildi");
      }
    } else {
      const { error: insertError } = await supabase.from("cart").insert([
        {
          user_id: userId,
          product_id: product.id,
          quantity,
          total_price: totalPrice,
        },
      ]);

      if (insertError) {
        toast.error("Xatolik yuz berdi!");
      } else {
        toast.success("Mahsulot qo‘shildi!");
      }
    }
  };
  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  return (
    <div className="w-full">
      <ToastContainer position="top-right" autoClose={3000} />
      <Home />
      <div className="w-[80%] mx-auto my-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="md:w-1/2 flex flex-col items-center">
            <Image
              src={selectedImage || product?.images[0] || ll }
              width={300}
              height={300}
              alt="Product Image"
              className="w-full h-[400px] object-cover rounded-lg transition-all duration-300"
            />
            <div className="flex gap-2 mt-4">
              {product?.images.map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  height={50}
                  alt={`Thumbnail ${index + 1}`}
                  onMouseEnter={() => setSelectedImage(img)}
                  width={50}
                  className={`w-20 h-20 object-cover rounded-md cursor-pointer transition-all duration-200 ${
                    selectedImage === img
                      ? "border-2 border-green-600 opacity-100"
                      : "opacity-50 hover:opacity-75"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-semibold">{product?.name}</h1>
            <p className="text-green-600 text-2xl font-bold mt-2">
              ${product?.price}
            </p>
            <p className="text-gray-600 mt-4">{product?.description}</p>
            <div className="mt-6 flex gap-4">
              <button
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                onClick={handleBuyNow}
              >
                Buy now
              </button>
              <button
                onClick={handleAddToCart}
                className="border border-green-600 text-green-600 px-6 py-3 rounded-md hover:bg-green-100"
              >
                Add To Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
