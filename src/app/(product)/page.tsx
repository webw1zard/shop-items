"use client";
import React, {useState, useCallback } from "react";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";

type Category = {
  id: string;
  name: string;
  active: boolean;
};

type Product = {
  id: string;
  name: string;
  category_id: string;
  description: string;
  price: string;
  images: string[];
  active: boolean;
};

const ProductPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [onlyActive, setOnlyActive] = useState(false);

  const fetchProducts = useCallback(async () => {
    const { data, error } = await supabase.from("product").select("*").order("id", { ascending: true });
    if (error) console.error(error);
    return data || [];
  }, [supabase]);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("category").select("*").order("id", { ascending: true });
    if (error) console.error(error);
    return data || [];
  }, [supabase]);

  useCallback(() => {
    const fetchData = async () => {
      setLoading(true);
      const [productData, categoryData] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(productData);
      setCategories(categoryData);
      setLoading(false);
    };
    fetchData();
  }, [fetchProducts, fetchCategories]);

  const filteredProducts = products.filter((p) =>
    (selectedCategory === "" || p.category_id === selectedCategory) &&
    parseFloat(p.price) >= priceRange[0] &&
    parseFloat(p.price) <= priceRange[1] &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (!onlyActive || p.active)
  );

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-6 mt-6 p-4">
      <div className="w-full md:w-1/4 p-6 bg-white border rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-green-700">Filters</h2>
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border p-2 rounded w-full mb-3 focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min Price"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
            className="border p-2 rounded w-1/2"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
            className="border p-2 rounded w-1/2"
          />
        </div>
        <label className="flex items-center gap-2 mt-3">
          <input type="checkbox" checked={onlyActive} onChange={() => setOnlyActive(!onlyActive)} /> Show Only Active
        </label>
      </div>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading
          ? Array(3).fill(0).map((_, index) => (
              <div key={index} className="bg-white border rounded-lg shadow-lg p-4">
                <Skeleton height={192} />
                <Skeleton width={150} height={24} className="mt-2" />
                <Skeleton count={2} className="mt-2" />
              </div>
            ))
          : filteredProducts.map((product) => (
              <div className="bg-white border rounded-lg shadow-lg overflow-hidden" key={product.id}>
                <Image src={product.images[0]} alt={product.name} width={300} height={200} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-lg font-bold text-green-800">{product.name}</h2>
                  <p className="text-green-700 line-clamp-3">{product.description.substring(0, 100)}...</p>
                  <div className="mt-2 text-lg font-semibold text-green-800">${product.price}</div>
                  <button
                    onClick={() => router.push(`/products/${product.id}`)}
                    className="w-full text-center bg-green-700 hover:bg-green-600 text-white py-2 mt-4 rounded"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default ProductPage;