export const getResponsiveValue = (screen, values) => {
  if (screen.isXs) return values.xs || values.default;
  if (screen.isSm) return values.sm || values.default;
  if (screen.isMd) return values.md || values.default;
  if (screen.isLg) return values.lg || values.default;
  if (screen.isLaptop) return values.laptop || values.default;
  if (screen.isXl) return values.xl || values.default;
  if (screen.isXxl) return values.xxl || values.default;
  if (screen.is2k) return values["2k"] || values.default;
  if (screen.is4k) return values["4k"] || values.default;
  if (screen.is8k) return values["8k"] || values.default;
  return values.default;
};
