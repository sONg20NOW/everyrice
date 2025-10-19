import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import MatchingCard from "@/components/MatchingCard";
import { User, MatchRequest, FreeTimeSlot, MatchResult } from "@/types";
import {
  generateSampleUsers,
  generateMatches,
  dayToString,
  timeToString,
} from "@/lib/timetable";
import {
  Users,
  Search,
  Filter,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface MatchingProps {
  currentUser: User;
  onLogout: () => void;
  onNavigate: (page: "dashboard" | "matching" | "profile") => void;
}

export default function Matching({
  currentUser,
  onLogout,
  onNavigate,
}: MatchingProps) {
  const [sampleUsers] = useState(() => generateSampleUsers());
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<FreeTimeSlot | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (currentUser.timetable.length > 0) {
      const matchResults = generateMatches(currentUser, sampleUsers);
      setMatches(matchResults);
    }
  }, [currentUser, sampleUsers]);

  const filteredMatches = matches.filter(
    (match) =>
      match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (userId: string, timeSlot: FreeTimeSlot) => {
    setSelectedUserId(userId);
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
  };

  const submitRequest = () => {
    if (selectedTimeSlot && selectedUserId) {
      const newRequest: MatchRequest = {
        id: Date.now().toString(),
        fromUserId: currentUser.id,
        toUserId: selectedUserId,
        proposedTime: selectedTimeSlot,
        message: requestMessage,
        status: "pending",
        createdAt: new Date(),
        type: "unidirectional",
      };

      setMatchRequests([...matchRequests, newRequest]);
      setIsDialogOpen(false);
      setRequestMessage("");
      setSelectedTimeSlot(null);
      setSelectedUserId("");
    }
  };

  const handleRequestAction = (
    requestId: string,
    action: "accepted" | "rejected"
  ) => {
    setMatchRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action } : req
      )
    );
  };

  // 샘플 받은 요청 생성
  const receivedRequests: MatchRequest[] = [
    {
      id: "sample1",
      fromUserId: "2",
      toUserId: currentUser.id,
      proposedTime: { day: 0, startTime: 12, endTime: 13 },
      message: "안녕하세요! 같이 점심 드실래요?",
      status: "pending",
      createdAt: new Date(),
      type: "unidirectional",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="w-7 h-7 mr-3 text-red-500" />
              매칭 찾기
            </h1>
            <p className="text-gray-600 mt-1">
              공강 시간이 겹치는 친구들을 찾아보세요
            </p>
          </div>
        </div>

        {currentUser.timetable.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                시간표를 먼저 등록해주세요
              </h3>
              <p className="text-gray-600 mb-4">
                시간표가 있어야 공강 시간이 겹치는 친구들을 찾을 수 있어요
              </p>
              <Button onClick={() => onNavigate("profile")}>
                프로필로 이동
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* 검색 및 필터 */}
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="이름이나 학과로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                필터
              </Button>
            </div>

            {/* 받은 매칭 요청 */}
            {receivedRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    받은 매칭 요청
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {receivedRequests.map((request) => {
                    const fromUser = sampleUsers.find(
                      (u) => u.id === request.fromUserId
                    );
                    return (
                      <div
                        key={request.id}
                        className="bg-blue-50 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">
                                {fromUser?.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {fromUser?.department}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 mb-2 flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {dayToString(request.proposedTime.day)}{" "}
                              {timeToString(request.proposedTime.startTime)} -{" "}
                              {timeToString(request.proposedTime.endTime)}
                            </div>
                            {request.message && (
                              <p className="text-sm text-gray-700 bg-white p-2 rounded">
                                {request.message}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() =>
                                handleRequestAction(request.id, "accepted")
                              }
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              수락
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleRequestAction(request.id, "rejected")
                              }
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              거절
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* 매칭 결과 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  추천 매칭 ({filteredMatches.length}명)
                </h2>
                <Badge variant="outline">매칭률 기반 정렬</Badge>
              </div>

              {filteredMatches.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-600">
                      {searchTerm
                        ? "검색 결과가 없습니다"
                        : "현재 매칭 가능한 사용자가 없습니다"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredMatches.map((match) => (
                    <MatchingCard
                      key={match.user.id}
                      match={match}
                      onSendRequest={handleSendRequest}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* 매칭 요청 다이얼로그 */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>매칭 요청 보내기</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedTimeSlot && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    선택한 시간
                  </p>
                  <p className="text-blue-700">
                    {dayToString(selectedTimeSlot.day)}{" "}
                    {timeToString(selectedTimeSlot.startTime)} -{" "}
                    {timeToString(selectedTimeSlot.endTime)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">메시지 (선택사항)</label>
                <Textarea
                  placeholder="간단한 인사말을 남겨보세요..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  취소
                </Button>
                <Button onClick={submitRequest}>요청 보내기</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
