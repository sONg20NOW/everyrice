"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Users } from "lucide-react";
import { User } from "@/types";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const router = useRouter();

  //  로컬 스토리지에 사용자 정보가 있다면 홈으로 이동
  useEffect(() => {
    if (localStorage.getItem("user")) {
      toast.success("환영합니다!");
      router.push("/");
    }
  }, [router]);

  // 사용자 정보 변경 시 로컬 스토리지에 저장
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("user", JSON.stringify(currentUser));
    }
  }, [currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    toast.success("환영합니다!");
    router.push("/");
  };

  const [formData, setFormData] = useState({
    name: "",
    department: "",
    year: "",
    email: "",
  });

  const departments = [
    "컴퓨터공학과",
    "경영학과",
    "경제학과",
    "기계공학과",
    "전자공학과",
    "화학과",
    "물리학과",
    "수학과",
    "영어영문학과",
    "심리학과",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.department &&
      formData.year &&
      formData.email
    ) {
      const userData: User = {
        id: Date.now().toString(),
        ...formData,
        year: parseInt(formData.year),
        timetable: [],
        preferences: {
          mealTimes: [12, 13, 18],
          locations: ["학생회관"],
          foodTypes: ["한식"],
        },
      };
      handleLogin(userData);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Calendar className="w-10 h-10 text-red-500" />
            <Users className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">에브리라이스</h1>
          <p className="text-gray-600">에브리타임 기반 대학생 식사 약속 매칭</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">회원가입 / 로그인</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">이름</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="이름을 입력하세요"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">학과</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학과를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">학년</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, year: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="학년을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1학년</SelectItem>
                    <SelectItem value="2">2학년</SelectItem>
                    <SelectItem value="3">3학년</SelectItem>
                    <SelectItem value="4">4학년</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600"
              >
                시작하기
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <p>시간표를 등록하고 새로운 친구들과 함께 식사해보세요!</p>
        </div>
      </div>
    </div>
  );
}
