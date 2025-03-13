export default function loopAlarms(d, alarms, callback_function, skip) {
  for (let i = 0; i < alarms.length; i++) {
    const alm = alarms[i];
    if (
      alm.hour == d.getHours() &&
      alm.minute == d.getMinutes() &&
      !alm.disabled &&
      (alm.repeat.length === 0 || alm.repeat.includes(d.getDay())) &&
      skip
    ) {
      callback_function(i);

      if (alm.repeat.length === 0) {
        alarms[i].disabled = true;
      }
    }
  }
}
