"use client";

import { AuthProvider } from "@/contexts/AuthContext";

import Header from "./Header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">{children}</main>
      </div>
    </AuthProvider>
  );
}
