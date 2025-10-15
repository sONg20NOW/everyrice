import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Timetable from "@/components/Timetable";
import Navigation from "@/components/Navigation";
import { User, TimeSlot, MatchRequest, FreeTimeSlot } from "@/types";
import { generateSampleUsers, calculateFreeTime } from "@/lib/timetable";
import {
  Plus,
  Clock,
  Users,
  Calendar,
  ArrowRight,
  Coffee,
  Utensils,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "react-toastify";

interface DashboardProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onNavigate: (page: "dashboard" | "matching" | "profile") => void;
}

interface MealType {
  type: string;
  icon: typeof Moon;
  color: string;
  timeRange: string;
}

export default function Dashboard({
  currentUser,
  onLogout,
  onUpdateUser,
  onNavigate,
}: DashboardProps) {
  const [sampleUsers] = useState(() => generateSampleUsers());
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [isCreateMatchOpen, setIsCreateMatchOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<FreeTimeSlot | null>(
    null
  );
  const [selectedMealType, setSelectedMealType] = useState<string>("");
  const [newMatchRequest, setNewMatchRequest] = useState({
    message: "",
    location: "",
    foodType: "",
  });

  const freeTime = calculateFreeTime(currentUser.timetable);
  const totalFreeHours = freeTime.reduce(
    (sum, slot) => sum + (slot.endTime - slot.startTime),
    0
  );

  // 샘플 매칭 요청 데이터
  const sampleMatchRequests: MatchRequest[] = [
    {
      id: "req1",
      fromUserId: "2",
      toUserId: currentUser.id,
      proposedTime: { day: 0, startTime: 12, endTime: 13 },
      message: "안녕하세요! 같이 점심 드실래요?",
      status: "pending",
      createdAt: new Date(),
      type: "unidirectional",
    },
    {
      id: "req2",
      fromUserId: "3",
      toUserId: currentUser.id,
      proposedTime: { day: 2, startTime: 18, endTime: 19 },
      message: "저녁 같이 먹어요~",
      status: "pending",
      createdAt: new Date(),
      type: "unidirectional",
    },
  ];

  // 시간대별 식사 타입 결정 (겹치는 모든 식사시간대 반환)
  const getMealTypes = (startTime: number, endTime: number): MealType[] => {
    const mealTypes: MealType[] = [];

    // 아침 (7-10시)
    if (startTime < 10 && endTime > 7) {
      mealTypes.push({
        type: "아침",
        icon: Sun,
        color: "text-orange-600 bg-orange-50",
        timeRange: "7:00-10:00",
      });
    }

    // 점심 (11-14시)
    if (startTime < 14 && endTime > 11) {
      mealTypes.push({
        type: "점심",
        icon: Utensils,
        color: "text-green-600 bg-green-50",
        timeRange: "11:00-14:00",
      });
    }

    // 저녁 (17-21시)
    if (startTime < 21 && endTime > 17) {
      mealTypes.push({
        type: "저녁",
        icon: Moon,
        color: "text-purple-600 bg-purple-50",
        timeRange: "17:00-21:00",
      });
    }

    // 간식 (기타 시간대)
    if (
      mealTypes.length === 0 ||
      (startTime >= 10 && startTime < 11) ||
      (startTime >= 14 && startTime < 17) ||
      endTime > 21
    ) {
      mealTypes.push({
        type: "간식",
        icon: Coffee,
        color: "text-blue-600 bg-blue-50",
        timeRange: "기타 시간",
      });
    }

    return mealTypes;
  };

  const addSampleTimetable = () => {
    const sampleTimetable: TimeSlot[] = [
      {
        day: 0,
        startTime: 9,
        endTime: 10.5,
        subject: "웹프로그래밍",
        location: "공학관 301",
        professor: "김교수",
      },
      {
        day: 0,
        startTime: 14,
        endTime: 15.5,
        subject: "데이터베이스",
        location: "공학관 201",
        professor: "이교수",
      },
      {
        day: 2,
        startTime: 11,
        endTime: 12.5,
        subject: "소프트웨어공학",
        location: "공학관 401",
        professor: "박교수",
      },
      {
        day: 4,
        startTime: 13,
        endTime: 14.5,
        subject: "네트워크보안",
        location: "공학관 501",
        professor: "최교수",
      },
    ];

    onUpdateUser({
      ...currentUser,
      timetable: sampleTimetable,
    });

    toast.success("샘플 시간표가 추가되었습니다! 🎉", {
      position: "top-right",
      autoClose: 3000,
    });
  };

  const handleCreateMatch = (timeSlot: FreeTimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setIsCreateMatchOpen(true);

    // 첫 번째 식사 시간대를 기본값으로 설정
    const mealTypes = getMealTypes(timeSlot.startTime, timeSlot.endTime);
    const defaultMealType = mealTypes[0]?.type || "간식";
    setSelectedMealType(defaultMealType);

    setNewMatchRequest({
      message: `${defaultMealType} 같이 드실 분 찾습니다!`,
      location: currentUser.preferences.locations[0] || "학생회관",
      foodType: currentUser.preferences.foodTypes[0] || "한식",
    });
  };

  const handleMealTypeChange = (mealType: string) => {
    setSelectedMealType(mealType);
    setNewMatchRequest({
      ...newMatchRequest,
      message: `${mealType} 같이 드실 분 찾습니다!`,
    });
  };

  const submitMatchRequest = () => {
    if (!selectedTimeSlot) return;

    // 실제로는 서버에 매칭 요청을 보냄
    console.log("매칭 요청 생성:", {
      timeSlot: selectedTimeSlot,
      mealType: selectedMealType,
      request: newMatchRequest,
      user: currentUser,
    });

    const dayName = ["월", "화", "수", "목", "금"][selectedTimeSlot.day];
    const timeStr = `${Math.floor(selectedTimeSlot.startTime)}:${(
      (selectedTimeSlot.startTime % 1) *
      60
    )
      .toString()
      .padStart(2, "0")}`;

    toast.success(
      `${dayName}요일 ${timeStr} ${selectedMealType} 매칭 요청이 생성되었습니다! 🍽️`,
      {
        position: "top-right",
        autoClose: 4000,
      }
    );

    setIsCreateMatchOpen(false);
    setSelectedTimeSlot(null);
    setSelectedMealType("");
    setNewMatchRequest({ message: "", location: "", foodType: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentUser={currentUser}
        currentPage="dashboard"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              안녕하세요, {currentUser.name}님! 👋
            </h1>
            <p className="text-gray-600 mt-1">
              {currentUser.department} {currentUser.year}학년
            </p>
          </div>
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 공강시간 카드 */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => {
              const freeTimeSection =
                document.getElementById("free-time-section");
              freeTimeSection?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  이번 주 공강시간
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {totalFreeHours}시간
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {freeTime.length}개 시간대
              </p>
            </CardContent>
          </Card>

          {/* 매칭 가능한 친구 카드 */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate("matching")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  매칭 가능한 친구
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {sampleUsers.length}명
              </div>
              <p className="text-xs text-gray-500 mt-1">현재 활성 사용자</p>
            </CardContent>
          </Card>

          {/* 받은 매칭 요청 카드 */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => onNavigate("matching")}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  받은 매칭 요청
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {sampleMatchRequests.length}개
              </div>
              <p className="text-xs text-gray-500 mt-1">대기 중인 요청</p>
            </CardContent>
          </Card>
        </div>

        {/* 받은 매칭 요청 미리보기 */}
        {sampleMatchRequests.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  최근 받은 매칭 요청
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("matching")}
                >
                  전체 보기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sampleMatchRequests.slice(0, 2).map((request) => {
                  const fromUser = sampleUsers.find(
                    (u) => u.id === request.fromUserId
                  );
                  return (
                    <div key={request.id} className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">
                              {fromUser?.name}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {fromUser?.department}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">
                            {
                              ["월", "화", "수", "목", "금"][
                                request.proposedTime.day
                              ]
                            }
                            요일 {request.proposedTime.startTime}:00 -{" "}
                            {request.proposedTime.endTime}:00
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => onNavigate("matching")}
                        >
                          응답하기
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 시간표 섹션 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2" />내 시간표
              </CardTitle>
              <div className="flex space-x-2">
                {currentUser.timetable.length === 0 && (
                  <Button onClick={addSampleTimetable} size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    샘플 시간표 추가
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("profile")}
                >
                  시간표 편집
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {currentUser.timetable.length > 0 ? (
              <Timetable timetable={currentUser.timetable} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">아직 시간표가 없습니다</p>
                <p className="text-sm mt-2 mb-4">
                  시간표를 등록하면 공강 시간이 겹치는 친구들을 찾을 수 있어요
                </p>
                <div className="flex justify-center space-x-2">
                  <Button onClick={addSampleTimetable}>
                    <Plus className="w-4 h-4 mr-2" />
                    샘플 시간표 추가
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onNavigate("profile")}
                  >
                    직접 추가하기
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 공강 시간 요약 - 개선된 버전 (여러 식사시간대 표시) */}
        {freeTime.length > 0 && (
          <Card id="free-time-section">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                이번 주 공강 시간
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {freeTime.map((slot, index) => {
                  const mealTypes = getMealTypes(slot.startTime, slot.endTime);

                  return (
                    <div
                      key={index}
                      className="bg-blue-50 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleCreateMatch(slot)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-blue-900">
                          {["월", "화", "수", "목", "금"][slot.day]}요일
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {slot.endTime - slot.startTime}시간
                        </Badge>
                      </div>

                      <div className="text-sm text-blue-700 mb-2">
                        {Math.floor(slot.startTime)}:
                        {((slot.startTime % 1) * 60)
                          .toString()
                          .padStart(2, "0")}{" "}
                        -{Math.floor(slot.endTime)}:
                        {((slot.endTime % 1) * 60).toString().padStart(2, "0")}
                      </div>

                      {/* 여러 식사시간대 표시 */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {mealTypes.map((meal, idx) => {
                          const MealIcon = meal.icon;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center px-2 py-1 rounded-full text-xs ${meal.color}`}
                            >
                              <MealIcon className="w-3 h-3 mr-1" />
                              {meal.type}
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-xs text-blue-600 hover:text-blue-800 text-center">
                        매칭 만들기 →
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 매칭 생성 다이얼로그 - 식사시간대 선택 추가 */}
        <Dialog open={isCreateMatchOpen} onOpenChange={setIsCreateMatchOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                매칭 요청 만들기
              </DialogTitle>
            </DialogHeader>

            {selectedTimeSlot && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-900">
                    {["월", "화", "수", "목", "금"][selectedTimeSlot.day]}요일{" "}
                    {Math.floor(selectedTimeSlot.startTime)}:
                    {((selectedTimeSlot.startTime % 1) * 60)
                      .toString()
                      .padStart(2, "0")}{" "}
                    -{Math.floor(selectedTimeSlot.endTime)}:
                    {((selectedTimeSlot.endTime % 1) * 60)
                      .toString()
                      .padStart(2, "0")}
                  </div>
                  <div className="text-sm text-blue-700 mt-1">
                    {selectedTimeSlot.endTime - selectedTimeSlot.startTime}시간
                    공강
                  </div>
                </div>

                {/* 식사 시간대 선택 */}
                <div>
                  <Label htmlFor="mealType">식사 시간대</Label>
                  <Select
                    value={selectedMealType}
                    onValueChange={handleMealTypeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="식사 시간대 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {getMealTypes(
                        selectedTimeSlot.startTime,
                        selectedTimeSlot.endTime
                      ).map((meal) => {
                        const MealIcon = meal.icon;
                        return (
                          <SelectItem key={meal.type} value={meal.type}>
                            <div className="flex items-center">
                              <MealIcon className="w-4 h-4 mr-2" />
                              {meal.type} ({meal.timeRange})
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message">메시지</Label>
                  <Textarea
                    id="message"
                    value={newMatchRequest.message}
                    onChange={(e) =>
                      setNewMatchRequest({
                        ...newMatchRequest,
                        message: e.target.value,
                      })
                    }
                    placeholder="함께 식사할 친구들에게 보낼 메시지를 작성하세요"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">선호 장소</Label>
                    <Select
                      value={newMatchRequest.location}
                      onValueChange={(value) =>
                        setNewMatchRequest({
                          ...newMatchRequest,
                          location: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="장소 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="학생회관">학생회관</SelectItem>
                        <SelectItem value="기숙사 식당">기숙사 식당</SelectItem>
                        <SelectItem value="카페테리아">카페테리아</SelectItem>
                        <SelectItem value="외부 식당">외부 식당</SelectItem>
                        <SelectItem value="편의점">편의점</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="foodType">선호 음식</Label>
                    <Select
                      value={newMatchRequest.foodType}
                      onValueChange={(value) =>
                        setNewMatchRequest({
                          ...newMatchRequest,
                          foodType: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="음식 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="한식">한식</SelectItem>
                        <SelectItem value="중식">중식</SelectItem>
                        <SelectItem value="일식">일식</SelectItem>
                        <SelectItem value="양식">양식</SelectItem>
                        <SelectItem value="분식">분식</SelectItem>
                        <SelectItem value="카페">카페</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={submitMatchRequest}
                    className="flex-1"
                    disabled={
                      !newMatchRequest.message.trim() || !selectedMealType
                    }
                  >
                    매칭 요청 생성
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateMatchOpen(false)}
                  >
                    취소
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
