"use client"

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Product from "./(product)/page";
import Section from "@/components/Section";

const Page = () => {
  return (
    <div>
      <Navbar />
      <Section />
      <Product />
      <Footer />
    </div>        
  );
};

export default Page;
