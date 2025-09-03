// components/Calendar/CalendarEvent.js
import React from 'react';
import { MoreHorizontal } from 'lucide-react';

const CalendarEvent = ({ event }) => (
  <div className="flex items-start space-x-4 py-2">
    <div className="text-sm font-medium text-gray-900 w-12">{event.time}</div>
    <div className="flex-1">
      <p className="text-sm text-gray-600">{event.title}</p>
      <p className="text-sm font-medium text-gray-900">{event.subtitle}</p>
    </div>
    <MoreHorizontal className="w-4 h-4 text-gray-400" />
  </div>
);

export default CalendarEvent;