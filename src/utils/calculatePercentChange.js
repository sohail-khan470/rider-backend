function calculatePercentageChange(previous, current) {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

module.exports = {
  calculatePercentageChange,
};
