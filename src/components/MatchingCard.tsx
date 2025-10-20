import { MatchResult, FreeTimeSlot } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, MapPin, Heart, MessageCircle } from "lucide-react";
import { dayToString, timeToString } from "@/lib/timetable";

interface MatchingCardProps {
  match: MatchResult;
  onSendRequest: (userId: number, timeSlot: FreeTimeSlot) => void;
}

export default function MatchingCard({
  match,
  onSendRequest,
}: MatchingCardProps) {
  const { user, commonFreeTime, matchScore } = match;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "매우 좋음";
    if (score >= 60) return "좋음";
    return "보통";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-red-100 text-red-700">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-sm text-gray-600">
                {user.department} {user.grade}학년
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getScoreColor(
                matchScore
              )}`}
            >
              {matchScore}점
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {getScoreText(matchScore)}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {user.bio && (
          <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
            {user.bio}
          </p>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            공통 공강 시간
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {commonFreeTime.slice(0, 3).map((slot, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-blue-50 p-2 rounded"
              >
                <span className="text-sm">
                  {dayToString(slot.day)} {timeToString(slot.startTime)} -{" "}
                  {timeToString(slot.endTime)}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSendRequest(user.id, slot)}
                  className="text-xs"
                >
                  <MessageCircle className="w-3 h-3 mr-1" />
                  신청
                </Button>
              </div>
            ))}
            {commonFreeTime.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{commonFreeTime.length - 3}개 더
              </p>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">선호 음식</h4>
          <div className="flex flex-wrap gap-1">
            {user.preferences.foodTypes.map((food, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {food}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            선호 장소
          </h4>
          <div className="flex flex-wrap gap-1">
            {user.preferences.locations.map((location, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {location}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
