import { TimeSlot } from '@/types';
import { timeToString, dayToString } from '@/lib/timetable';

interface TimetableProps {
  timetable: TimeSlot[];
  editable?: boolean;
  onAddSlot?: (slot: TimeSlot) => void;
  onRemoveSlot?: (index: number) => void;
}

export default function Timetable({ timetable, editable = false }: TimetableProps) {
  const days = ['월', '화', '수', '목', '금'];
  const hours = Array.from({ length: 10 }, (_, i) => i + 9); // 9시부터 18시까지

  const getSlotAtTime = (day: number, hour: number) => {
    return timetable.find(slot => 
      slot.day === day && 
      slot.startTime <= hour && 
      slot.endTime > hour
    );
  };

  const getSlotHeight = (slot: TimeSlot) => {
    return (slot.endTime - slot.startTime) * 60; // 1시간 = 60px
  };

  const getSlotTop = (slot: TimeSlot) => {
    return (slot.startTime - 9) * 60; // 9시 기준으로 계산
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="grid grid-cols-6 border-b border-gray-200">
        <div className="p-3 bg-gray-50 text-center text-sm font-medium text-gray-700">
          시간
        </div>
        {days.map((day, index) => (
          <div key={index} className="p-3 bg-gray-50 text-center text-sm font-medium text-gray-700">
            {day}
          </div>
        ))}
      </div>

      <div className="relative">
        <div className="grid grid-cols-6">
          {/* 시간 열 */}
          <div className="border-r border-gray-200">
            {hours.map(hour => (
              <div key={hour} className="h-[60px] border-b border-gray-100 p-2 text-xs text-gray-500 flex items-center">
                {timeToString(hour)}
              </div>
            ))}
          </div>

          {/* 요일별 열 */}
          {days.map((_, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200">
              {hours.map(hour => (
                <div key={hour} className="h-[60px] border-b border-gray-100 relative">
                  {/* 시간 슬롯이 있는 경우 표시 */}
                </div>
              ))}
              
              {/* 실제 수업 블록들 */}
              {timetable
                .filter(slot => slot.day === dayIndex)
                .map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className="absolute left-1 right-1 bg-red-100 border border-red-300 rounded p-1 z-10"
                    style={{
                      top: `${getSlotTop(slot)}px`,
                      height: `${getSlotHeight(slot)}px`
                    }}
                  >
                    <div className="text-xs font-medium text-red-800 truncate">
                      {slot.subject}
                    </div>
                    {slot.location && (
                      <div className="text-xs text-red-600 truncate">
                        {slot.location}
                      </div>
                    )}
                    {slot.professor && (
                      <div className="text-xs text-red-500 truncate">
                        {slot.professor}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}