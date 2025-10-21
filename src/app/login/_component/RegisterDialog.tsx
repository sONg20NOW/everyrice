import { createUser } from "@/actions";
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
import { User } from "@/types";
import { useCallback, useState } from "react";
import { useForm, Controller } from "react-hook-form"; // Controller 추가 임포트
import { toast } from "sonner";

// 🚨 주의: isSubmitting 상태를 관리하려면 Dialog를 닫는 로직도 수정해야 합니다.

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
  // Dialog 열림/닫힘 상태를 관리하여 가입 성공 시 닫도록 합니다.
  const [open, setOpen] = useState(false);

  const {
    register,
    control, // Controller 사용을 위해 control을 가져옵니다.
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<RegisterFormType>({
    // 기본값 설정 (Select 컴포넌트가 제어 모드에서 오류를 방지하도록)
    defaultValues: {
      name: "",
      email: "",
      password: "",
      department: "",
      grade: "",
    },
  });

  const onRegister = useCallback(
    async (data: RegisterFormType) => {
      try {
        // createUser 함수가 grade를 Int로 변환할 것으로 가정합니다.
        // 만약 그렇지 않다면 여기서 data.grade = parseInt(data.grade, 10); 변환이 필요합니다.
        const newUser: User = await createUser(data);

        console.log("Registration successful:", newUser);

        // 성공적으로 사용자 생성 후 Dialog를 닫고 폼을 초기화합니다.
        toast.success("회원가입이 완료되었습니다!");
        setOpen(false);
        reset();

        return newUser;
      } catch (error) {
        console.error("Registration failed:", error);
        // 사용자에게 오류 메시지를 표시하는 로직을 여기에 추가할 수 있습니다.
        throw error; // isSubmitting 상태가 적절히 해제되도록 에러를 다시 던집니다.
      }
    },
    [reset]
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>회원가입으로 지금 바로 합류!</Button>
      </DialogTrigger>
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
          {/* 이름 필드 (Input은 register 사용) */}
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

          {/* 학과 필드 (Controller 사용) */}
          <div className="space-y-2 w-full">
            <Label htmlFor="department">학과</Label>
            <Controller
              name="department"
              control={control}
              rules={{ required: "학과는 필수 입력입니다." }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  name={field.name}
                  // field.onBlur는 Select 컴포넌트에서는 일반적으로 사용되지 않습니다.
                  // 필요하다면 SelectTrigger에 추가할 수 있습니다.
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
              )}
            />
            {errors.department && (
              <ErrorMessage message={errors.department.message!} />
            )}
          </div>

          {/* 학년 필드 (Controller 사용) */}
          <div className="space-y-2 w-full">
            <Label htmlFor="year">학년</Label>
            <Controller
              name="grade"
              control={control}
              rules={{ required: "학년은 필수 입력입니다." }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  name={field.name}
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
              )}
            />
            {errors.grade && <ErrorMessage message={errors.grade.message!} />}
          </div>

          {/* 이메일 필드 (Input은 register 사용) */}
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

          {/* 비밀번호 필드 (Input은 register 사용) */}
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
              // isSubmitting 상태를 버튼 비활성화에 사용합니다.
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "가입 중..." : "가입"}
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                취소
              </Button>
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
