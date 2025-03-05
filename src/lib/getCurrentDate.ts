const getCurrentDate = () => {
  const currentDate = new Date();
  const formattedDate =
    currentDate.getFullYear() * 10000 +
    (currentDate.getMonth() + 1) * 100 +
    currentDate.getDate();
  return formattedDate;
};

export default getCurrentDate;
