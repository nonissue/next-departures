export const getCurrentDate = () => {
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear() * 10000 +
    (currentDate.getMonth() + 1) * 100 +
    currentDate.getDate();
  return formattedDate;
};

export const getCurrentTime = () => {
  const currentTime = new Date();
  const currentTimeFormatted = currentTime.toLocaleTimeString('eo', {
    hour12: false,
  });

  return currentTimeFormatted;
};
