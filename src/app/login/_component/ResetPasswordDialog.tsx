import { getUserByEmail } from "@/actions";
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
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form"; // Controller 추가 임포트
import { toast } from "sonner";

import emailjs from "@emailjs/browser";

// 🚨 주의: isSubmitting 상태를 관리하려면 Dialog를 닫는 로직도 수정해야 합니다.

interface RegisterFormType {
  email: string;
}

export default function ResetPasswordDialog() {
  // Dialog 열림/닫힘 상태를 관리하여 가입 성공 시 닫도록 합니다.
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty, isSubmitting, errors },
  } = useForm<RegisterFormType>({
    // 기본값 설정 (Select 컴포넌트가 제어 모드에서 오류를 방지하도록)
    defaultValues: {
      email: "",
    },
  });

  const onEnterEmail = useCallback(
    async (data: RegisterFormType) => {
      try {
        emailjs.init({ publicKey: "BdDrGjg64GHBOjQhc" });
        const user = await getUserByEmail(data.email);

        if (!user) {
          toast.error("그런 이메일의 유저는 없는걸요..");
          return;
        }

        emailjs.send("everyrice", "template_85qt4ao", {
          password: user.password,
          email: data.email,
        });

        console.log("Send password successful:", data.email);

        // 성공적으로 사용자 생성 후 Dialog를 닫고 폼을 초기화합니다.
        toast.success("비밀번호를 보내드렸어요!");
        setOpen(false);
        reset();
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
        <Button variant={"link"}>비밀번호를 잊어버리셨나요?</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>비밀번호 찾기</DialogTitle>
          <DialogDescription>
            가입하신 이메일을 알려주시면 비밀번호를 보내드릴게요!
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(onEnterEmail)}
          className="w-full flex flex-col w-full gap-2 items-center"
        >
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

          <DialogFooter>
            <Button
              type="submit"
              className="w-fit bg-red-500 hover:bg-red-600"
              // isSubmitting 상태를 버튼 비활성화에 사용합니다.
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? "비밀번호 보내는 중..." : "비밀번호 보내기"}
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
