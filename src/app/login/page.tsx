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
// NOTE: shadcn/ui Form 컴포넌트들을 import 합니다.
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import RegisterDialog from "./_component/RegisterDialog";

// 기존 Login/Register 타입을 FormValues 하나로 통합하여 useForm에 사용합니다.
interface FormValues {
  name: string;
  email: string;
  department: string;
  grade: string; // Select 값이므로 문자열로 정의합니다.
}

// NOTE: ErrorMessage 컴포넌트는 FormMessage로 대체되므로 필요 없습니다.
// function ErrorMessage({ message }: { message: string }) {
//   return <p className="ps-2 text-xs text-red-600">{message}</p>;
// }

export default function LoginPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const router = useRouter();

  // useForm 훅 초기화 및 defaultValues 설정 (중요!)
  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      department: "", // Select 필드 초기값
      grade: "", // Select 필드 초기값
    },
    // resolver: zodResolver(schema), // 유효성 검사 라이브러리 (예: Zod)를 사용한다면 여기에 추가
  });

  // 로컬 스토리지에 사용자 정보가 있다면 홈으로 이동
  // useEffect(() => {
  //   if (localStorage.getItem("user")) {
  //     toast.success("환영합니다!");
  //     router.push("/");
  //   }
  // }, [router]);

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

  // 폼 제출 핸들러
  const onSubmit = (data: FormValues) => {
    const userData: User = {
      id: Date.now().toString(),
      name: data.name,
      email: data.email,
      department: data.department,
      // grade는 문자열로 넘어오므로 숫자로 변환합니다.
      grade: parseInt(data.grade),
      timetable: [],
      preferences: {
        mealTimes: [12, 13, 18],
        locations: ["학생회관"],
        foodTypes: ["한식"],
      },
    };
    handleLogin(userData);
  };

  // 폼 상태를 useForm에서 직접 가져와 사용합니다.
  const { isDirty, isSubmitting, isValid } = form.formState;

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
            {/* 1. Form 컴포넌트로 전체 폼을 감싸고 useForm 인스턴스를 전달합니다. */}
            <Form {...form}>
              {/* 2. form.handleSubmit을 사용하여 onSubmit 함수와 연결합니다. */}
              <form
                className="space-y-4 flex flex-col items-center"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                {/* 이름 필드 (일반 Input) */}
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "이름은 필수 입력입니다." }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="이름을 입력하세요"
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      {/* FormMessage가 errors 객체의 메시지를 자동으로 표시합니다. */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 학과 필드 (Select) - 핵심! */}
                <FormField
                  control={form.control}
                  name="department"
                  rules={{ required: "학과는 필수 입력입니다." }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>학과</FormLabel>
                      {/* Select 컴포넌트에는 onValueChange와 value를 field에 연결해야 합니다. */}
                      <Select
                        onValueChange={field.onChange} // RHF의 onChange 함수 연결
                        defaultValue={field.value} // RHF의 value 연결
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="학과를 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        {/* SelectContent의 w-full도 유지하여 너비를 맞춥니다. */}
                        <SelectContent className="w-full">
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 학년 필드 (Select) */}
                <FormField
                  control={form.control}
                  name="grade"
                  rules={{ required: "학년은 필수 입력입니다." }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>학년</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="학년을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-full">
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                          <SelectItem value="4">4학년</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 이메일 필드 (Input) */}
                <FormField
                  control={form.control}
                  name="email"
                  rules={{
                    required: "이메일은 필수 입력입니다.",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "유효한 이메일을 입력하세요.",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="이메일을 입력하세요"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="w-full flex gap-3 justify-center">
                  <Button
                    type="submit"
                    className="w-full bg-red-500 hover:bg-red-600"
                    // 모든 필드가 채워지고 유효성 검사를 통과해야 버튼 활성화
                    disabled={!isDirty || isSubmitting || !isValid}
                  >
                    시작하기
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <RegisterDialog />
        </div>
      </div>
    </div>
  );
}
