module.exports = (inputDate) => {
  if(!inputDate) return null
  const parts = inputDate.split("/");
  const date = new Date(Date.UTC(parts[2], parts[1] - 1, parts[0], 0, 0, 0));
  const formattedDate = date.toISOString();
  console.log("FORMAT", formattedDate);
  return formattedDate;
};
