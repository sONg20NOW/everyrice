import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileImage, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { TimeSlot } from "@/types";
import Image from "next/image";

interface TimetableUploaderProps {
  onTimetableExtracted: (schedule: TimeSlot[]) => void;
}

// 환경 변수에서 API 키를 가져옵니다.
// Vercel, Netlify 등 배포 환경에서 보안을 위해 환경 변수 사용을 권장합니다.
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export default function TimetableUploader({
  onTimetableExtracted,
}: TimetableUploaderProps) {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        toast({
          title: "이미지 선택됨",
          description: `${file.name}이 선택되었습니다.`,
        });
      } else {
        toast({
          title: "잘못된 파일 형식",
          description: "이미지 파일만 업로드 가능합니다.",
          variant: "destructive",
        });
      }
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, 부분을 제거
        const base64Data = result.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractTimetableWithChatGPT = async (
    imageBase64: string
  ): Promise<TimeSlot[]> => {
    if (!OPENAI_API_KEY) {
      throw new Error(
        "OpenAI API 키가 설정되지 않았습니다. 관리자에게 문의하세요."
      );
    }

    const prompt = `
      이 이미지는 대학교 시간표입니다. 시간표를 분석하여 다음 JSON 형식의 schedule 배열로 반환해주세요.
      JSON 형식 외에 다른 설명은 절대 포함하지 마세요.
      
      예시:
      {
        "schedule": [
          {
            "day": 0,
            "startTime": 9,
            "endTime": 10.5,
            "subject": "과목명",
            "location": "강의실명"
          },
          {
            "day": 2,
            "startTime": 14.5,
            "endTime": 16,
            "subject": "다른 과목",
            "location": "다른 강의실"
          }
        ]
      }
      
      주의사항:
      1. 시간은 9시면 9, 10시 30분이면 10.5와 같은 숫자 형식으로 표시
      2. 요일은 숫자로 표시 (월요일은 0, 화요일은 1, 수요일은 2, 목요일은 3, 금요일은 4)
      3. 빈 시간대는 포함하지 않음
      4. JSON 형식만 반환하고 다른 설명은 포함하지 않음
      5. 모든 수업의 시작시간은 30분 단위
      6. 모든 수업의 길이는 1시간 30분 혹은 3시간
      `;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        // model: "gpt-4-vision-preview",
        model: "gpt-5",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_completion_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `ChatGPT API 오류: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();
    const content: string = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("ChatGPT API에서 응답을 받지 못했습니다.");
    }

    try {
      // JSON 파싱 시도
      const parsedData: { schedule: TimeSlot[] } = JSON.parse(content);
      // 'schedule' 배열이 있는지 확인하고 반환
      if (!parsedData.schedule || !Array.isArray(parsedData.schedule)) {
        throw new Error("JSON 응답에 'schedule' 배열이 없습니다.");
      }
      return parsedData.schedule;
    } catch (e) {
      console.log(e);
      // JSON 파싱 실패 시 텍스트에서 JSON 추출 시도
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedMatch = JSON.parse(jsonMatch[0]);
        if (!parsedMatch.schedule || !Array.isArray(parsedMatch.schedule)) {
          throw new Error("추출된 JSON에 'schedule' 배열이 없습니다.");
        }
        return parsedMatch.schedule;
      }
      throw new Error("ChatGPT 응답을 JSON으로 파싱할 수 없습니다.");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "파일을 선택해주세요",
        description: "시간표 이미지를 먼저 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const imageBase64 = await convertImageToBase64(selectedFile);
      const extractedSchedule = await extractTimetableWithChatGPT(imageBase64);

      // 추출된 데이터를 부모 컴포넌트로 전달
      onTimetableExtracted(extractedSchedule);

      toast({
        title: "시간표 분석 완료",
        description: "ChatGPT API를 통해 시간표가 성공적으로 분석되었습니다.",
      });
    } catch (error) {
      console.error("시간표 분석 오류:", error);
      toast({
        title: "분석 실패",
        description:
          error instanceof Error
            ? error.message
            : "시간표 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setOpen(false);
    }
  };

  // DialogTrigger를 Button에 감싸는 대신 Button에 onClick 핸들러를 직접 추가
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          이미지 업로드
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex gap-2 items-center">
            <FileImage className="h-5 w-5" />
            시간표 업로드
          </DialogTitle>
          <DialogDescription>
            시간표 이미지를 업로드하면 ChatGPT API가 자동으로 분석합니다
          </DialogDescription>
        </DialogHeader>
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timetable-upload">시간표 이미지</Label>
              <Input
                id="timetable-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isProcessing}
              />
            </div>

            {previewUrl && (
              <div className="space-y-2">
                <Label>미리보기</Label>
                <div className="border rounded-lg p-2">
                  <Image
                    width={50}
                    height={50}
                    src={previewUrl}
                    alt="시간표 미리보기"
                    className="w-full h-auto max-h-64 object-contain rounded"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ChatGPT로 분석 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  시간표 분석하기
                </>
              )}
            </Button>

            {!OPENAI_API_KEY && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                ⚠️ OpenAI API 키가 설정되지 않았습니다. 관리자가 API 키를 설정한
                후 사용 가능합니다.
              </div>
            )}
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
