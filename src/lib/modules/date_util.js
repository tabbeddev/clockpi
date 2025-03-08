export function listWeekNames() {
  const days = {};
  for (let i = 1; i <= 7; i++) {
    days[i] = new Date(0, 0, i).toLocaleDateString(undefined, {
      weekday: "short",
    });
  }
  return days;
}

export function convWeekName(lst) {
  const days = listWeekNames();
  let names = "";
  for (const day of lst) {
    names += days[day] + ", ";
  }
  return names.slice(0, -2);
}

export function findNextAlarm(alarms) {
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay(); // 1 (Mon) - 7 (Sun)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let nextAlarmDate = null;
  let minTimeDifference = Infinity;

  alarms.forEach((alarm) => {
    if (alarm.disabled) return;

    const alarmTime = alarm.hour * 60 + alarm.minute;
    if (alarm.repeat.length === 0) { // one-time alarms
      const isToday = alarmTime > currentTime;
      const alarmDate = new Date(now);
      alarmDate.setHours(alarm.hour, alarm.minute, 0, 0);

      if (!isToday) alarmDate.setDate(alarmDate.getDate() + 1);

      const timeDifference = alarmDate - now;
      if (timeDifference < minTimeDifference) {
        minTimeDifference = timeDifference;
        nextAlarmDate = alarmDate;
      }
    } else { // recurring alarms
      alarm.repeat.forEach((day) => {
        let daysUntilAlarm = (day - currentDay + 7) % 7;
        if (daysUntilAlarm === 0 && alarmTime <= currentTime) {
          daysUntilAlarm = 7;
        }

        const alarmDate = new Date(now);
        alarmDate.setDate(alarmDate.getDate() + daysUntilAlarm);
        alarmDate.setHours(alarm.hour, alarm.minute, 0, 0);

        const timeDifference = alarmDate - now;
        if (timeDifference < minTimeDifference) {
          minTimeDifference = timeDifference;
          nextAlarmDate = alarmDate;
        }
      });
    }
  });

  return nextAlarmDate;
}

export function isToday(d) {
	const t = new Date()
	return t.getDate() == d.getDate() && t.getMonth() == d.getMonth() && t.getFullYear() == d.getFullYear();
}
