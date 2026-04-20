export const createClosedDay = () => ({
  open: null,
  close: null,
  isClosed: true,
});

export const createDefaultOperatingHours = () => ({
  monday: createClosedDay(),
  tuesday: createClosedDay(),
  wednesday: createClosedDay(),
  thursday: createClosedDay(),
  friday: createClosedDay(),
  saturday: createClosedDay(),
  sunday: createClosedDay(),
});
