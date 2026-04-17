window.RegionalBadgePositionConfig = {
  // Global defaults used by all regional badge merges.
  defaults: {
    flagScale: 1.2,
    offsetX: 0,
    offsetY: 0,
  },

  // Per regional badge type (badge ID normalized, e.g. local_gold -> localgold).
  byBadge: {
    localgold: { offsetX: -3, offsetY: -10 },
    localsilver: { offsetX: 0, offsetY: 10 },
    localbronze: { offsetX: 5, offsetY: -10 },
  },

  // Optional fine-tuning per country code for each regional badge type.
  // Example:
  // byBadgeCountry: {
  //   localgold: {
  //     US: { offsetX: 2, offsetY: -1 },
  //     GB: { offsetX: -1, offsetY: 1 }
  //   }
  // }
  byBadgeCountry: {
    localgold: {},
    localsilver: {},
    localbronze: {},
  },
};
