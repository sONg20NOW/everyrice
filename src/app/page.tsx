"use client";

import { User } from "@/types";
import { useEffect, useState } from "react";
import Dashboard from "./_pages/Dashboard";
import Matching from "./_pages/Matching";
import Profile from "./_pages/Profile";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Navigation from "@/components/Navigation";
import {
  getTimetableByUserId,
  getUserById,
  setUserTimetable,
  updateUserProfile,
} from "@/actions";

export default function Home() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<
    "dashboard" | "matching" | "profile"
  >("dashboard");

  // 로컬 스토리지에서 사용자 정보 복원
  useEffect(() => {
    const currentUserId = Number(localStorage.getItem("userId"));

    const handleCome = async () => {
      if (currentUserId) {
        const savedUser = await getUserById(Number(currentUserId));
        setCurrentUser({
          ...savedUser,
          preferences: JSON.parse(savedUser.preferencesJson),
          timetable: await getTimetableByUserId(savedUser.id),
        });
      } else {
        router.push("/login");
        alert("로그인이 필요합니다.");
      }
    };

    handleCome();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
    toast.success("로그아웃되었습니다!");
  };

  const handleUpdateUser = async (updates: User) => {
    const currentUserId = Number(localStorage.getItem("userId"));

    if (!currentUserId) {
      toast.error("유저 정보를 찾지 못해 유저 업데이트에 실패했습니다.");

      return;
    }
    const { id: userId, timetable, ...userData } = updates;

    const updatedUserData = await updateUserProfile(currentUserId, userData);
    const updatedTimetable = await setUserTimetable(currentUserId, timetable);

    setCurrentUser({ ...updatedUserData, timetable: updatedTimetable });
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
