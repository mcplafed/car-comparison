export function projectMileage(current, annual, years) {
  return current == null ? null : current + annual * years;
}

export function depreciation(price, importCost, resaleLow, resaleHigh, years) {
  if (![price, importCost, resaleLow, resaleHigh, years].every(Number.isFinite) ||
      price < 0 || importCost < 0 || resaleLow < 0 || resaleHigh < resaleLow || years <= 0) return null;
  const low = price + importCost - resaleHigh;
  const high = price + importCost - resaleLow;
  return {low, high, monthlyLow: low / (years * 12), monthlyHigh: high / (years * 12)};
}
