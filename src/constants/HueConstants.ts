export const maxValueOfStates: StateUpdate = {
  'hue': 65535,
  'bri': 254,
  'sat': 254,
  'xy': [0.5, 0.5],
  'ct': 500
}

export const minValueOfStates: StateUpdate = {
  'hue': 0,
  'bri': 1,
  'sat': 0,
  'xy': [0.0, 0.0],
  'ct': 153
}

export const minMaxValueStates = {
  'hue': true,
  'bri': true,
  'sat': true,
  'xy': true,
  'ct': true,
}
export const possibleStates = {
  ...minMaxValueStates,
  'on': true,
  'effect': true,
  'alert': true
}