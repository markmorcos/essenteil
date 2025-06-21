"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import PhoneLogin from "../../components/PhoneLogin";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useRouter();

  const handleLoginSuccess = () => {
    navigate.push("/");
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <PhoneLogin onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
