const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

exports.getMonthDiff = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffDate = endDate.getTime() - startDate.getTime();

  return Math.floor(Math.abs(diffDate / MILLISECONDS_PER_DAY));
};

exports.formatDateKrTime = (date) => {
  const localDate = new Date(date).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return localDate.split('. ').join('-').slice(0, -1);
};
