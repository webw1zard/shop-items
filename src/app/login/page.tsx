"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaGoogle,
  FaFacebook,
  FaGithub,
  FaLinkedin,
} from "react-icons/fa";
import { createClient } from "@/supabase/client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bcrypt from "bcryptjs";

export default function Login() {
  const router = useRouter();
  const supabase = createClient();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData?.user) {
        const { error: insertError } = await supabase.from("user").insert([
          { id: authData.user.id, email, username, password: hashedPassword },
        ]);
        if (insertError) {
          toast.error("User saved in auth but failed in users table");
        } else {
          toast.success("Registration successful! Check your email.");
          resetForm();
          setIsRegister(false);
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration.");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { data: userData, error: userError } = await supabase
        .from("user")
        .select("id, email, password")
        .eq("email", email)
        .single();

      if (userError || !userData) {
        toast.error("User not found or incorrect email.");
        return;
      }

      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (!passwordMatch) {
        toast.error("Incorrect password!");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Login successful!");
        resetForm();
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
      <ToastContainer />
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isRegister ? "Register" : "Login"}
        </h1>
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          {isRegister && (
            <InputField
              icon={FaUser}
              type="text"
              placeholder="Username"
              value={username}
              setValue={setUsername}
            />
          )}
          <InputField
            icon={FaEnvelope}
            type="email"
            placeholder="Email"
            value={email}
            setValue={setEmail}
          />
          <InputField
            icon={FaLock}
            type="password"
            placeholder="Password"
            value={password}
            setValue={setPassword}
          />
          <button
            type="submit"
            className="w-full py-3 bg-indigo-500 text-white rounded-lg mt-4 hover:bg-indigo-600 transition"
          >
            {isRegister ? "Register" : "Login"}
          </button>
        </form>
        <p className="text-center mt-4">or continue with</p>
        <SocialIcons />
        <p className="text-center mt-4">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="text-indigo-600 underline"
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? "Login" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  type,
  placeholder,
  value,
  setValue,
}: {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-3 mt-4">
      <Icon className="w-5 h-5 text-gray-500 mr-2" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
}

function SocialIcons() {
  return (
    <div className="flex justify-center mt-4 space-x-4">
      {[FaGoogle, FaGithub, FaFacebook, FaLinkedin].map((Icon, index) => (
        <button
          key={index}
          className="p-3 border rounded-lg hover:bg-gray-200 transition"
        >
          <Icon className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}
