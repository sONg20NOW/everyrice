"use client";

import { User } from "@/types";
import { useEffect, useState } from "react";
import Dashboard from "./_pages/Dashboard";
import Matching from "./_pages/Matching";
import Profile from "./_pages/Profile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import { getTimetableByUserId } from "@/actions";

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "matching" | "profile"
  >("dashboard");

  // 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const handleCome = async () => {
      if (localStorage.getItem("user")) {
        const savedUser = JSON.parse(localStorage.getItem("user")!);
        setCurrentUser({
          ...savedUser,
          preferences: JSON.parse(savedUser.preferencesJson),
          timetable: await getTimetableByUserId(savedUser.id),
        });
      } else {
        toast.error("로그인이 필요합니다.");
        router.push("/login");
      }
    };

    handleCome();
  }, [router]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    router.back();
    toast.success("로그아웃되었습니다!");
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const handleNavigate = (
    page: "dashboard" | "matching" | "profile",
    scrollTo: "top" | "bottom" = "top"
  ) => {
    setCurrentPage(page);
    if (scrollTo === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    currentUser && (
      <div className="min-h-screen">
        <Navigation
          currentUser={currentUser}
          currentPage={currentPage}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
        />
        {currentPage === "dashboard" && (
          <Dashboard currentUser={currentUser} onNavigate={handleNavigate} />
        )}
        {currentPage === "matching" && (
          <Matching currentUser={currentUser} onNavigate={handleNavigate} />
        )}
        {currentPage === "profile" && (
          <Profile currentUser={currentUser} onUpdateUser={handleUpdateUser} />
        )}
      </div>
    )
  );
}
