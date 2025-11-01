import { User } from "@/generated/prisma";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { getUserById, updateMatchStatus } from "@/actions";
import { useEffect, useState } from "react";
import { Badge } from "./ui/badge";
import { ArrowRightIcon, CheckCircle, Clock, XCircle } from "lucide-react";
import { MatchRequest } from "@/types";
import dayjs from "dayjs";
import { dayToString, timeToString } from "@/lib/timetable";

interface MatchingDialogProps {
  match: MatchRequest;
  refresh: () => Promise<void>;
}

export default function MatchingDialog({
  match,
  refresh,
}: MatchingDialogProps) {
  const [fromUser, setFromUser] = useState<User>();
  const [toUser, setToUser] = useState<User>();

  useEffect(() => {
    async function getUsers() {
      const resFrom = await getUserById(match.fromUserId);
      const resTo = await getUserById(match.toUserId);

      setFromUser(resFrom);
      setToUser(resTo);
    }

    getUsers();
  }, [match]);

  const handleRequestAction = async (
    requestId: number,
    status: "ACCEPTED" | "REJECTED"
  ) => {
    const response = await updateMatchStatus(requestId, status);

    console.log("status updated:", response);

    await refresh();

    return;
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button size="sm">응답하기</Button>
      </AlertDialogTrigger>
      {fromUser && toUser && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="relative">
              <span className="font-medium flex gap-3 items-center">
                <div>
                  {fromUser?.name}
                  <Badge variant="secondary" className="text-xs">
                    {fromUser?.department}
                  </Badge>
                </div>
                <ArrowRightIcon /> {"나"}
              </span>
              <span className="text-sm absolute right-0 top-0">
                {dayjs(match.createdAt).format("YYYY-MM-DD")} 생성됨
              </span>
            </AlertDialogTitle>
            <div className="text-sm text-gray-600 mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {dayToString(match.proposedTime.day)}{" "}
              {timeToString(match.proposedTime.startTime)} -{" "}
              {timeToString(match.proposedTime.endTime)}
            </div>

            <div className="grid gap-2 mt-5">
              <span className="text-base">요청 메세지</span>
              <div className="border rounded-xl p-2">
                {match.message && (
                  <span className="text-sm text-gray-700 bg-white p-2 rounded flex-1">
                    {match.message}
                  </span>
                )}
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => handleRequestAction(match.id, "ACCEPTED")}
              className="bg-green-500 hover:bg-green-600"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              수락
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleRequestAction(match.id, "REJECTED")}
              className="bg-red-500 hover:bg-red-600"
            >
              <XCircle className="w-4 h-4 mr-1" />
              거절
            </AlertDialogAction>
            <AlertDialogCancel>취소</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
