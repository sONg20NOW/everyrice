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
import Navigation from "@/components/Navigation";
import Timetable from "@/components/Timetable";
import TimetableUploader from "@/components/TimetableUploader";
import { User, TimeSlot } from "@/types";
import {
  User as UserIcon,
  Edit,
  Plus,
  X,
  Clock,
  MapPin,
  Utensils,
  Camera,
  Upload,
} from "lucide-react";
import { CalculateTime } from "@/lib/calculateTime";
import { useForm } from "react-hook-form";
import AddClassDialog from "@/components/AddClassDialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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

interface ProfileProps {
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onNavigate: (page: "dashboard" | "matching" | "profile") => void;
}

export default function Profile({
  currentUser,
  onLogout,
  onUpdateUser,
  onNavigate,
}: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(currentUser);
  const [isAddingClass, setIsAddingClass] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

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

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser(currentUser);
    setIsEditing(false);
  };

  const addPreference = (type: "foodTypes" | "locations", value: string) => {
    if (!editedUser.preferences[type].includes(value)) {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          [type]: [...editedUser.preferences[type], value],
        },
      });
    }
  };

  const removePreference = (type: "foodTypes" | "locations", value: string) => {
    setEditedUser({
      ...editedUser,
      preferences: {
        ...editedUser.preferences,
        [type]: editedUser.preferences[type].filter((item) => item !== value),
      },
    });
  };

  const toggleMealTime = (time: number) => {
    const mealTimes = editedUser.preferences.mealTimes;
    if (mealTimes.includes(time)) {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          mealTimes: mealTimes.filter((t) => t !== time),
        },
      });
    } else {
      setEditedUser({
        ...editedUser,
        preferences: {
          ...editedUser.preferences,
          mealTimes: [...mealTimes, time].sort(),
        },
      });
    }
  };

  const removeClass = (index: number) => {
    setEditedUser({
      ...editedUser,
      timetable: editedUser.timetable.filter((_, i) => i !== index),
    });
  };

  const handleScheduleParsed = (schedule: TimeSlot[]) => {
    setEditedUser({
      ...editedUser,
      timetable: [...editedUser.timetable, ...schedule],
    });
    setIsUploaderOpen(false);
  };

  const clearTimetable = () => {
    setEditedUser({
      ...editedUser,
      timetable: [],
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation
        currentUser={currentUser}
        currentPage="profile"
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserIcon className="w-7 h-7 mr-3 text-red-500" />
            프로필 관리
          </h1>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              편집
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave}>저장</Button>
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
                {isEditing ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        value={editedUser.name}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio">자기소개</Label>
                      <Textarea
                        id="bio"
                        value={editedUser.bio || ""}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, bio: e.target.value })
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
                      editedUser.preferences.mealTimes.includes(time.value)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => isEditing && toggleMealTime(time.value)}
                    disabled={!isEditing}
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
                  {editedUser.preferences.foodTypes.map((food) => (
                    <Badge
                      key={food}
                      variant="default"
                      className="flex items-center space-x-1"
                    >
                      <span>{food}</span>
                      {isEditing && (
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removePreference("foodTypes", food)}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
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
                            !editedUser.preferences.foodTypes.includes(food)
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
                  {editedUser.preferences.locations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className="flex items-center space-x-1"
                    >
                      <span>{location}</span>
                      {isEditing && (
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
                {isEditing && (
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
                            !editedUser.preferences.locations.includes(loc)
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

        {/* 시간표 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>시간표</CardTitle>
              {isEditing && (
                <div className="flex space-x-2">
                  {editedUser.timetable.length > 0 && (
                    <div className="flex gap-2">
                      <AddClassDialog setEditedUser={setEditedUser} />
                      <ClearTimeTableDialog clearTimetable={clearTimetable} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editedUser.timetable.length > 0 ? (
              <div className="space-y-4">
                <Timetable timetable={editedUser.timetable} />
                {isEditing && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">등록된 수업</h4>
                    {editedUser.timetable.map((slot, index) => (
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
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  등록된 시간표가 없습니다
                </p>
                {isEditing ? (
                  <div className="space-y-2">
                    <p className="text-sm">
                      시간표 이미지를 업로드하거나 직접 수업을 추가해보세요
                    </p>
                    <div className="flex justify-center space-x-2">
                      {/* 시간표 업로더 다이얼로그 */}
                      <TimetableUploader
                        onTimetableExtracted={handleScheduleParsed}
                      />
                      <AddClassDialog setEditedUser={setEditedUser} />
                    </div>
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
