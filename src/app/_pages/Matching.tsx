import { useState, useEffect, useMemo } from "react";
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
} from "@/components/ui/dialog";
import MatchingCard from "@/components/MatchingCard";
import { User, MatchRequest, FreeTimeSlot, MatchResult } from "@/types";
import { generateMatches, dayToString, timeToString } from "@/lib/timetable";
import {
  Users,
  Search,
  Filter,
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  getMatchRequestsFromUserId,
  getMatchRequestsToUserId,
  getUsersExceptUserId,
} from "@/actions";

interface MatchingProps {
  currentUser: User;
  onNavigate: (page: "dashboard" | "matching" | "profile") => void;
}

export default function Matching({ currentUser, onNavigate }: MatchingProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<FreeTimeSlot | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [requestMessage, setRequestMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<MatchRequest[]>([]);
  const [sendedRequests, setSendedRequests] = useState<MatchRequest[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const usersResponse = await getUsersExceptUserId(currentUser.id);

      setUsers(
        usersResponse.map((v) => ({
          ...v,
          preferences: JSON.parse(v.preferencesJson),
        }))
      );
    };

    getUsers();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && currentUser.timetable.length > 0) {
      const matchResults = generateMatches(currentUser, users);
      setMatches(matchResults);
    }
  }, [currentUser, users]);

  const filteredMatches = matches.filter(
    (match) =>
      match.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendRequest = (userId: number, timeSlot: FreeTimeSlot) => {
    setSelectedUserId(userId);
    setSelectedTimeSlot(timeSlot);
    setIsDialogOpen(true);
  };

  const submitRequest = () => {
    if (selectedTimeSlot && selectedUserId) {
      const newRequest: MatchRequest = {
        id: Date.now(),
        fromUserId: currentUser.id,
        toUserId: selectedUserId,
        proposedTime: selectedTimeSlot,
        message: requestMessage,
        status: "PENDING",
        createdAt: new Date(),
        type: "unidirectional",
      };

      setMatchRequests([...matchRequests, newRequest]);
      setIsDialogOpen(false);
      setRequestMessage("");
      setSelectedTimeSlot(null);
      setSelectedUserId(0);
    }
  };

  const handleRequestAction = (
    requestId: number,
    action: "accepted" | "rejected"
  ) => {
    setMatchRequests((prev) =>
      prev.map((req) =>
        req.id === requestId ? { ...req, status: action } : req
      )
    );
  };

  useEffect(() => {
    const getMatchRequestsToMe = async () => {
      const matchRequestsToMe = await getMatchRequestsToUserId(currentUser.id);
      console.log("matchReqestToMe:", matchRequestsToMe);
      setReceivedRequests(
        matchRequestsToMe.map((v) => ({
          ...v,
          proposedTime: JSON.parse(v.proposedTimeJson),
        }))
      );
    };

    const getMatchRequestsByMe = async () => {
      const matchRequestsToMe = await getMatchRequestsFromUserId(
        currentUser.id
      );
      console.log("matchReqestByMe:", matchRequestsToMe);
      setSendedRequests(
        matchRequestsToMe.map((v) => ({
          ...v,
          proposedTime: JSON.parse(v.proposedTimeJson),
        }))
      );
    };

    getMatchRequestsToMe();
    getMatchRequestsByMe();
  }, [currentUser]);

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
                    const fromUser = request.fromUser;
                    return (
                      <div
                        key={request.id}
                        className="bg-blue-50 p-4 rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="font-medium">From. </span>
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
                            <div className="flex gap-4 justify-between items-center">
                              {request.message && (
                                <p className="text-sm text-gray-700 bg-white p-2 rounded flex-1">
                                  {request.message}
                                </p>
                              )}
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
        {/* 보낸 매칭 요청 */}
        {sendedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="w-5 h-5 mr-2" />
                내가 보냈던 매칭 요청
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sendedRequests.map((request) => {
                const toUser = request.toUser;
                return (
                  <div key={request.id} className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">To. </span>
                          <span className="font-medium">{toUser?.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {toUser?.department}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mb-2 flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {dayToString(request.proposedTime.day)}{" "}
                          {timeToString(request.proposedTime.startTime)} -{" "}
                          {timeToString(request.proposedTime.endTime)}
                        </div>
                        <div className="flex gap-4 justify-between items-center">
                          {request.message && (
                            <p className="text-sm text-gray-700 bg-white p-2 rounded flex-1">
                              {request.message}
                            </p>
                          )}
                          {
                            {
                              PENDING: (
                                <p className="text-sm text-white bg-gray-500 p-2 rounded-xl ">
                                  대기중
                                </p>
                              ),
                              REJECTED: (
                                <p className="text-sm text-white bg-red-500 p-2 rounded-xl ">
                                  거절됨
                                </p>
                              ),
                              ACCEPTED: (
                                <p className="text-sm text-white bg-green-500 p-2 rounded-xl ">
                                  수락됨
                                </p>
                              ),
                            }[request.status]
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
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
