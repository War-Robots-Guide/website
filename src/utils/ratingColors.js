import robotGuideData from '../data/robot_guide.json';

const defaultColors = {
  "<= -2": "#ef4444", // Red
  "-1": "#f97316",    // Orange
  "0": "#eab308",     // Yellow
  "+1": "#84cc16",    // Lime/light green
  "+2": "#22c55e",    // Green
  ">= +3": "#3b82f6"  // Blue
};

// Use colors from json if available, otherwise use default colors
const colors = (robotGuideData && robotGuideData.rating_colors) || defaultColors;

export const getRatingColor = (val) => {
  if (val <= 10) {
    if (val <= 2) return colors["<= -2"];
    if (val <= 4) return colors["-1"];
    if (val <= 6) return colors["0"];
    if (val <= 7) return colors["+1"];
    if (val <= 8) return colors["+2"];
    return colors[">= +3"];
  } else {
    if (val <= 15) return colors["<= -2"];
    if (val <= 20) return colors["-1"];
    if (val <= 25) return colors["0"];
    if (val <= 30) return colors["+1"];
    if (val <= 35) return colors["+2"];
    return colors[">= +3"];
  }
};

export const getRatingColorsList = () => {
  return [
    colors["<= -2"],
    colors["-1"],
    colors["0"],
    colors["+1"],
    colors["+2"],
    colors[">= +3"]
  ];
};
