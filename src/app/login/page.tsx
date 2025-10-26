"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getUserByEmail } from "@/actions";
import ResetPasswordDialog from "./_component/ResetPasswordDialog";

// 기존 Login/Register 타입을 FormValues 하나로 통합하여 useForm에 사용합니다.
interface FormValues {
  email: string;
  password: string; // Select 값이므로 문자열로 정의합니다.
}

// NOTE: ErrorMessage 컴포넌트는 FormMessage로 대체되므로 필요 없습니다.
// function ErrorMessage({ message }: { message: string }) {
//   return <p className="ps-2 text-xs text-red-600">{message}</p>;
// }

export default function LoginPage() {
  const router = useRouter();

  // useForm 훅 초기화 및 defaultValues 설정 (중요!)
  const form = useForm<FormValues>({
    defaultValues: {
      email: "",
      password: "",
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

  const handleLogin = (user: User) => {
    localStorage.setItem("userId", user.id.toString());
    toast.success(`환영합니다, ${user.name}님!`);
    router.push("/");
  };

  // 폼 제출 핸들러
  const onSubmit = async (data: FormValues) => {
    const userData: User = await getUserByEmail(data.email);

    console.log(userData);
    if (userData) {
      if (userData.password === data.password) {
        handleLogin(userData);
      } else {
        toast.error("비밀번호가 일치하지 않습니다.");
      }
    } else {
      toast.error("해당 이메일의 유저가 존재하지 않습니다.");
    }
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
                {/* 비밀번호 필드 (Input) */}
                <FormField
                  control={form.control}
                  name="password"
                  rules={{
                    required: "비밀번호는 필수 입력입니다.",
                  }}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="비밀번호를 입력하세요"
                          type="password"
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

        <div className="flex flex-col items-center">
          <RegisterDialog />
          <ResetPasswordDialog />
        </div>
      </div>
    </div>
  );
}
