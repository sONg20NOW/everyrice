"use client";

import { User } from "@/types";
import Image from "next/image";
import { useEffect, useState } from "react";
import Dashboard from "./_pages/Dashboard";
import Matching from "./_pages/Matching";
import Profile from "./_pages/Profile";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "matching" | "profile"
  >("dashboard");

  // 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    setCurrentPage("dashboard");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
  };

  const handleNavigate = (page: "dashboard" | "matching" | "profile") => {
    setCurrentPage(page);
  };

  if (!localStorage.getItem("user")) {
    router.push("/login");
    return;
  }

  return (
    currentUser && (
      <div className="min-h-screen">
        {currentPage === "dashboard" && (
          <Dashboard
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === "matching" && (
          <Matching
            currentUser={currentUser}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
          />
        )}
        {currentPage === "profile" && (
          <Profile
            currentUser={currentUser}
            onLogout={handleLogout}
            onUpdateUser={handleUpdateUser}
            onNavigate={handleNavigate}
          />
        )}
      </div>
    )
  );
}
