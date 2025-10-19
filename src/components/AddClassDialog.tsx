import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TimeSlot } from "@/types";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";

export default function AddClassDialog({
  addTimeSlot,
}: {
  addTimeSlot: (time: TimeSlot) => boolean;
}) {
  const [open, setOpen] = useState(false);

  const form = useForm<TimeSlot>({
    defaultValues: {
      day: 0, // 월요일
      startTime: 9,
      endTime: 10.5,
      subject: "",
      location: "",
      professor: "",
    },
  });

  const addClass = (data: TimeSlot) => {
    if (data.startTime >= data.endTime) {
      form.setError("endTime", {
        type: "manual",
        message: "종료 시간은 시작 시간보다 늦어야 합니다.",
      });
      return;
    }

    if (typeof data.day === "string") {
      data.day = Number(data.day);
    }

    const successAdding = addTimeSlot(data);
    if (successAdding) {
      form.reset();

      toast.success(
        <div>
          <span color="yellow">{data.subject}</span> 수업이 정상적으로
          추가되었습니다!
        </div>
      );
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          수업 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>수업 추가</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(addClass)}>
            {/* 과목명 (Input) */}
            <FormField
              control={form.control}
              name="subject"
              rules={{ required: "과목명은 필수 입력입니다." }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="subject">과목명</FormLabel>
                  <FormControl>
                    <Input placeholder="과목명을 입력하세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              {/* 요일 (Select) */}
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="day">요일</FormLabel>
                    <Select
                      onValueChange={field.onChange} // field.onChange 연결
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="요일 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">월요일</SelectItem>
                        <SelectItem value="1">화요일</SelectItem>
                        <SelectItem value="2">수요일</SelectItem>
                        <SelectItem value="3">목요일</SelectItem>
                        <SelectItem value="4">금요일</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 강의실 (Input) */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="location">강의실</FormLabel>
                    <FormControl>
                      <Input placeholder="강의실" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* 시작 시간 (Input type="number") */}
              <FormField
                control={form.control}
                name="startTime"
                rules={{
                  required: "필수 입력입니다.",
                  min: { value: 9, message: "최소 9시부터 가능합니다." },
                  max: { value: 18, message: "최대 18시까지 가능합니다." },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel htmlFor="startTime">시작 시간</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="9"
                        max="18"
                        // Input type="number"는 value를 문자열로 관리해야 RHF에서 경고가 뜨지 않습니다.
                        // 따라서 field.value는 문자열, onChange는 e.target.value를 받습니다.
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 종료 시간 (Input type="number") */}
              <FormField
                control={form.control}
                name="endTime"
                rules={{
                  required: "필수 입력입니다.",
                  min: { value: 9, message: "최소 9시부터 가능합니다." },
                  max: { value: 18, message: "최대 18시까지 가능합니다." },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel htmlFor="endTime">종료 시간</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        min="9"
                        max="18"
                        {...field}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            {/* 교수명 (Input) */}
            <FormField
              control={form.control}
              name="professor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="professor">교수명</FormLabel>
                  <FormControl>
                    <Input placeholder="교수명" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button type="button">취소</Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  form.formState.isSubmitting || !form.formState.isDirty
                }
              >
                추가
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
