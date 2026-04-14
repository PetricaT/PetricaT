import React from "react";

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

import "../css/calendar.css";

function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const startOffset = (firstDay.getDay() + 6) % 7;
  const endOffset = (7 - ((lastDay.getDay() + 6) % 7 + 1)) % 7;

  const days: Date[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  for (let i = 1; i <= endOffset; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export const Calendar = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const days = getCalendarDays(year, month);

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isCurrentMonth = (date: Date) => date.getMonth() === month;

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="wrapper">
      <div className="card">
        <div className="header">
          <span className="monthName">{MONTH_NAMES[month]}</span>
          <span className="year">{year}</span>
        </div>

        <div className="divider" />

        <table>
          <thead>
            <tr>
              {DAYS_OF_WEEK.map((day) => (
                <th key={day}>{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((date, di) => {
                  const tod = isToday(date);
                  const cur = isCurrentMonth(date);
                  return (
                    <td key={di}>
                      <div
                        className={
                          `dayCell ${tod ? 'todayCell' : ''} ${!cur ? 'outsideCell' : ''}`
                        }
                      >
                        {date.getDate()}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
