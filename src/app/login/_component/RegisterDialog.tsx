import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallback } from "react";
import { useForm } from "react-hook-form";

interface RegisterFormType {
  name: string;
  email: string;
  password: string;
  department: string;
  grade: string;
}

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

export default function RegisterDialog() {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<RegisterFormType>();

  const onRegister = useCallback((data: RegisterFormType) => {
    console.log("Register data:", data);

    return null;
  }, []);

  return (
    <Dialog>
      <DialogTrigger>회원가입으로 지금 바로 합류!</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>회원가입</DialogTitle>
          <DialogDescription>
            에브리라이스로 맛있는 대학생활을 시작하세요!
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onRegister)}
          className="w-full flex flex-col w-full gap-2 items-center"
        >
          <div className="space-y-2 w-full">
            <Label htmlFor="name">이름</Label>
            <Input
              {...register("name", {
                required: "이름은 필수 입력입니다.",
              })}
              id="name"
              type="text"
              placeholder="이름을 입력하세요"
            />
            {errors.name && <ErrorMessage message={errors.name.message!} />}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="department">학과</Label>
            <Select
              {...register("department", {
                required: "학과는 필수 입력입니다.",
              })}
            >
              <SelectTrigger className="w-full">
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
            {errors.department && (
              <ErrorMessage message={errors.department.message!} />
            )}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="year">학년</Label>
            <Select
              {...register("grade", {
                required: "학년은 필수 입력입니다.",
              })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="학년을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1학년</SelectItem>
                <SelectItem value="2">2학년</SelectItem>
                <SelectItem value="3">3학년</SelectItem>
                <SelectItem value="4">4학년</SelectItem>
              </SelectContent>
            </Select>
            {errors.grade && <ErrorMessage message={errors.grade.message!} />}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="email">이메일</Label>
            <Input
              {...register("email", {
                required: "이메일은 필수 입력입니다.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "유효한 이메일 주소를 입력하세요.",
                },
              })}
              id="email"
              type="email"
              placeholder="이메일을 입력하세요"
            />
            {errors.email && <ErrorMessage message={errors.email.message!} />}
          </div>
          <div className="space-y-2 w-full">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              {...register("password", {
                required: "비밀번호는 필수 입력입니다.",
              })}
              id="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
            />
            {errors.password && (
              <ErrorMessage message={errors.password.message!} />
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="w-fit bg-red-500 hover:bg-red-600"
              disabled={!isDirty || isSubmitting}
            >
              가입
            </Button>
            <DialogClose asChild>
              <Button>취소</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="ps-2 text-xs text-red-600">{message}</p>;
}
