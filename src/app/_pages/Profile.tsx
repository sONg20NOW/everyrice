import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Timetable from "@/components/Timetable";
import TimetableUploader from "@/components/TimetableUploader";
import { User, TimeSlot } from "@/types";
import {
  User as UserIcon,
  Edit,
  X,
  Clock,
  MapPin,
  Utensils,
  Camera,
  TimerIcon,
  TableIcon,
} from "lucide-react";
import AddClassDialog from "@/components/AddClassDialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

const foodTypes = [
  "한식",
  "중식",
  "일식",
  "양식",
  "분식",
  "치킨",
  "피자",
  "햄버거",
  "카페",
  "디저트",
];
const locations = [
  "학생회관",
  "기숙사 식당",
  "카페테리아",
  "외부 식당",
  "편의점",
  "학과 건물",
];
const mealTimes = [
  { value: 11, label: "11:00" },
  { value: 11.5, label: "11:30" },
  { value: 12, label: "12:00" },
  { value: 12.5, label: "12:30" },
  { value: 13, label: "13:00" },
  { value: 17.5, label: "17:30" },
  { value: 18, label: "18:00" },
  { value: 18.5, label: "18:30" },
];

interface ProfileProps {
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

export default function Profile({ currentUser, onUpdateUser }: ProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingTimeTable, setIsEditingTimeTable] = useState(false);

  const [editedProfile, setEditedProfile] = useState<User>(currentUser);
  const [editedTimeTable, setEditedTimeTable] = useState<TimeSlot[]>(
    currentUser.timetable
  );

  const handleSaveUser = () => {
    onUpdateUser({ ...editedProfile, timetable: currentUser.timetable });
    setIsEditingProfile(false);
  };

  const handleSaveTimeTable = () => {
    console.log(editedTimeTable);
    onUpdateUser({ ...currentUser, timetable: editedTimeTable });
    setIsEditingTimeTable(false);
  };

  const addPreference = (type: "foodTypes" | "locations", value: string) => {
    if (!editedProfile.preferences[type].includes(value)) {
      setEditedProfile({
        ...editedProfile,
        preferences: {
          ...editedProfile.preferences,
          [type]: [...editedProfile.preferences[type], value],
        },
      });
    }
  };

  const removePreference = (type: "foodTypes" | "locations", value: string) => {
    setEditedProfile({
      ...editedProfile,
      preferences: {
        ...editedProfile.preferences,
        [type]: editedProfile.preferences[type].filter(
          (item) => item !== value
        ),
      },
    });
  };

  const toggleMealTime = (time: number) => {
    const mealTimes = editedProfile.preferences.mealTimes;
    if (mealTimes.includes(time)) {
      setEditedProfile({
        ...editedProfile,
        preferences: {
          ...editedProfile.preferences,
          mealTimes: mealTimes.filter((t) => t !== time),
        },
      });
    } else {
      setEditedProfile({
        ...editedProfile,
        preferences: {
          ...editedProfile.preferences,
          mealTimes: [...mealTimes, time].sort(),
        },
      });
    }
  };

  // editedTimeTable에 수업 다건 추가 함수
  const addTimeSlot = (time: TimeSlot) => {
    for (const i of editedTimeTable) {
      if (i.day !== time.day) continue;
      if (
        (i.startTime < time.startTime && time.startTime < i.endTime) ||
        (i.startTime < time.endTime && time.endTime < i.endTime) ||
        (i.startTime <= time.startTime && time.endTime <= i.endTime)
      ) {
        console.log("duplicate classes\n", i, time);
        toast.error("시간이 겹치는 다른 수업이 존재합니다!", {
          duration: 1500,
        });
        return false;
      }
    }

    const timeWithId: TimeSlot = {
      ...time,
      id: Date.now() + Math.floor(Math.random() * 1000),
    };

    setEditedTimeTable((prev) => [...prev, { ...timeWithId }]);
    console.log("수업 추가 완료", timeWithId);
    return true;
  };

  const removeClass = (id: number) => {
    setEditedTimeTable(editedTimeTable.filter((v) => v.id !== id));
  };

  const handleScheduleParsed = (schedule: TimeSlot[]) => {
    for (const time of schedule) {
      addTimeSlot(time);
    }
  };

  const clearTimetable = () => {
    setEditedTimeTable([]);
    toast.success("모든 수업이 삭제되었습니다.");
  };

  const addSampleTimetable = () => {
    const sampleTimetable: TimeSlot[] = [
      {
        id: 0,
        day: 0,
        startTime: 9,
        endTime: 10.5,
        subject: "웹프로그래밍",
        location: "공학관 301",
        professor: "김교수",
      },
      {
        id: 1,
        day: 0,
        startTime: 14,
        endTime: 15.5,
        subject: "데이터베이스",
        location: "공학관 201",
        professor: "이교수",
      },
      {
        id: 2,
        day: 2,
        startTime: 11,
        endTime: 12.5,
        subject: "소프트웨어공학",
        location: "공학관 401",
        professor: "박교수",
      },
      {
        id: 3,
        day: 4,
        startTime: 13,
        endTime: 14.5,
        subject: "네트워크보안",
        location: "공학관 501",
        professor: "최교수",
      },
    ];

    setEditedTimeTable(sampleTimetable);

    toast.success("샘플 시간표가 추가되었습니다! 🎉", {
      position: "top-right",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserIcon className="w-7 h-7 mr-3 text-red-500" />
            프로필 관리
          </h1>
          {!isEditingProfile ? (
            <Button onClick={() => setIsEditingProfile(true)}>
              <Edit className="w-4 h-4 mr-2" />
              편집
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditedProfile(currentUser);
                  setIsEditingProfile(false);
                }}
              >
                취소
              </Button>
              <Button onClick={handleSaveUser}>저장</Button>
            </div>
          )}
        </div>

        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-red-100 text-red-700 text-2xl">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditingProfile ? (
                  <div className="space-y-3">
                    <div className="grid gap-1">
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor="bio">자기소개</Label>
                      <Textarea
                        id="bio"
                        value={editedProfile.bio || ""}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            bio: e.target.value,
                          })
                        }
                        placeholder="간단한 자기소개를 작성해보세요"
                        rows={2}
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-semibold">
                      {currentUser.name}
                    </h2>
                    <p className="text-gray-600">
                      {currentUser.department} {currentUser.grade}학년
                    </p>
                    <p className="text-gray-600">{currentUser.email}</p>
                    {currentUser.bio && (
                      <p className="text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                        {currentUser.bio}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 선호 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>선호 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 선호 식사 시간 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                <Clock className="w-4 h-4 mr-2" />
                선호 식사 시간
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {mealTimes.map((time) => (
                  <Button
                    key={time.value}
                    variant={
                      editedProfile.preferences.mealTimes.includes(time.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() =>
                      isEditingProfile && toggleMealTime(time.value)
                    }
                    disabled={!isEditingProfile}
                    className="text-xs"
                  >
                    {time.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 선호 음식 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                <Utensils className="w-4 h-4 mr-2" />
                선호 음식
              </Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {editedProfile.preferences.foodTypes.map((food) => (
                    <Badge
                      key={food}
                      variant="default"
                      className="flex items-center space-x-1"
                    >
                      <span>{food}</span>
                      {isEditingProfile && (
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removePreference("foodTypes", food)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditingProfile && (
                  <Select
                    onValueChange={(value) => addPreference("foodTypes", value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="음식 추가" />
                    </SelectTrigger>
                    <SelectContent>
                      {foodTypes
                        .filter(
                          (food) =>
                            !editedProfile.preferences.foodTypes.includes(food)
                        )
                        .map((food) => (
                          <SelectItem key={food} value={food}>
                            {food}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>

            {/* 선호 장소 */}
            <div>
              <Label className="text-sm font-medium text-gray-700 flex items-center mb-3">
                <MapPin className="w-4 h-4 mr-2" />
                선호 식사 장소
              </Label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {editedProfile.preferences.locations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{location}</span>
                      {isEditingProfile && (
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() =>
                            removePreference("locations", location)
                          }
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditingProfile && (
                  <Select
                    onValueChange={(value) => addPreference("locations", value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="장소 추가" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        .filter(
                          (loc) =>
                            !editedProfile.preferences.locations.includes(loc)
                        )
                        .map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <TimerIcon className="w-7 h-7 mr-3 text-red-500" />
            시간표 관리
          </h1>
          {!isEditingTimeTable ? (
            <Button onClick={() => setIsEditingTimeTable(true)}>
              <Edit className="w-4 h-4 mr-2" />
              편집
            </Button>
          ) : (
            <div className="space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditedTimeTable(currentUser.timetable);
                  setIsEditingTimeTable(false);
                }}
              >
                취소
              </Button>
              <Button onClick={handleSaveTimeTable}>저장</Button>
            </div>
          )}
        </div>
        {/* 시간표 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>시간표</CardTitle>
              {isEditingTimeTable && (
                <div className="flex space-x-2">
                  {editedTimeTable.length > 0 && (
                    <div className="flex gap-2">
                      <AddClassDialog addTimeSlot={addTimeSlot} />
                      <ClearTimeTableDialog clearTimetable={clearTimetable} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editedTimeTable.length > 0 ? (
              <div className="space-y-4">
                <Timetable
                  timetable={editedTimeTable}
                  removeClass={removeClass}
                  editable={isEditingTimeTable}
                />
                {/* {isEditingTimeTable && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">등록된 수업</h4>
                    {editedTimeTable.map((slot, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <span className="text-sm">
                          {`${slot.subject} - ${
                            ["월", "화", "수", "목", "금"][slot.day]
                          } ${CalculateTime(slot.startTime)} ~ ${CalculateTime(
                            slot.endTime
                          )}`}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeClass(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  등록된 시간표가 없습니다
                </p>
                {isEditingTimeTable ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      시간표 이미지를 업로드하거나 직접 수업을 추가해보세요
                    </p>
                    <div className="flex justify-center space-x-2">
                      {/* 시간표 업로더 다이얼로그 */}
                      <TimetableUploader
                        onTimetableExtracted={handleScheduleParsed}
                      />
                      <AddClassDialog addTimeSlot={addTimeSlot} />
                    </div>
                    <p className="text-sm">혹은...</p>
                    <Button variant={"secondary"} onClick={addSampleTimetable}>
                      <TableIcon />
                      샘플시간표 추가
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm mt-2">
                    편집 모드에서 시간표를 추가할 수 있습니다
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClearTimeTableDialog({
  clearTimetable,
}: {
  clearTimetable: () => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="destructive">
          전체 삭제
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>시간표 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            모든 시간표를 삭제하시겠습니까?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button type="button" onClick={clearTimetable}>
            확인
          </Button>
          <AlertDialogCancel>취소</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
