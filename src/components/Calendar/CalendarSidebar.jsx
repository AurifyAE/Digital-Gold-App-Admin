import React from 'react';
import { Bell, MoreHorizontal } from 'lucide-react';
import CalendarEvent from './CalendarEvent';

const CalendarSidebar = ({ events }) => {
  const groupEventsByDate = (events) => {
    const grouped = {};
    events.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date].push(event);
    });
    return grouped;
  };

  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Calendar</h2>
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-gray-400" />
          <MoreHorizontal className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {Object.entries(groupedEvents).map(([date, events]) => (
        <div key={date} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">{date}</h3>
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-1">
            {events.map((event, index) => (
              <CalendarEvent key={index} event={event} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarSidebar;