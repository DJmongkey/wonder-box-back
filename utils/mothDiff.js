const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

exports.getMonthDiff = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffDate = endDate.getTime() - startDate.getTime();

  return Math.floor(Math.abs(diffDate / MILLISECONDS_PER_DAY));
};
