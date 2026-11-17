/**
 * CENTRAL WEDDING CONFIGURATION
 * Every editable detail of the invitation lives here.
 * Sample wedding details for Olivia & Ethan.
 * Replace the values below with the real wedding details.
 */

export type WeddingEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  icon: "crescent" | "rings" | "lantern" | "dinner";
};

export const wedding = {
  bride: {
    firstName: "Olivia",
    fullName: "Olivia Bennett",
    parents: "Daughter of Mr. Oliver Bennett & Mrs. Sophia Bennett",
  },

  groom: {
    firstName: "Ethan",
    fullName: "Ethan Mitchell",
    parents: "Son of Mr. William Mitchell & Mrs. Charlotte Mitchell",
  },

  initials: "O & E",

  /** Human readable date + time */
  date: "Saturday, 20 November 2027",

  dayName: "Saturday",
  dayNumber: "20",
  monthName: "November",
  year: "2027",

  time: "4:30 PM onwards",

  /** Used by countdown + calendar */
  dateISO: "2027-11-20T16:30:00",
  endISO: "2027-11-20T22:30:00",

  welcomeLine: "With love from our families",

  welcomeTitle: "A Celebration of Love",

  welcomeJoin: "between",

  venue: {
    name: "The Willow Creek Manor",
    address: "Rosewood Avenue, Vyttila, Kochi, Kerala 682019",
    mapsQuery: "The Willow Creek Manor, Vyttila, Kochi, Kerala",
  },

  events: [
    {
      id: "welcome",
      title: "Welcome Evening",
      date: "Friday, 19 November 2027",
      time: "6:00 PM",
      venue: "The Willow Creek Manor, Garden Pavilion",
      icon: "lantern",
    },

    {
      id: "ceremony",
      title: "Wedding Ceremony",
      date: "Saturday, 20 November 2027",
      time: "4:30 PM",
      venue: "The Willow Creek Manor, Garden",
      icon: "crescent",
    },

    {
      id: "reception",
      title: "Dinner & Reception",
      date: "Saturday, 20 November 2027",
      time: "6:00 PM",
      venue: "The Willow Creek Manor, Grand Hall",
      icon: "rings",
    },

    {
      id: "brunch",
      title: "Farewell Brunch",
      date: "Sunday, 21 November 2027",
      time: "10:00 AM",
      venue: "The Willow Creek Manor, Garden Terrace",
      icon: "dinner",
    },
  ] satisfies WeddingEvent[],

  dressCode: {
    description:
      "Join us in celebrating our special day in timeless attire inspired by romantic garden hues, muted pastels, and elegant natural tones.",

    colors: [
      {
        name: "Pearl White",
        hex: "#F5F1E8",
      },
      {
        name: "Terracotta",
        hex: "#C47D63",
      },
      {
        name: "Olive Green",
        hex: "#7B8060",
      },
      {
        name: "Midnight Blue",
        hex: "#293B56",
      },
      {
        name: "Blush Pink",
        hex: "#E2B8B0",
      },
      {
        name: "Soft Lavender",
        hex: "#B9A8C9",
      },
      {
        name: "Golden Sand",
        hex: "#C8AC7D",
      },
    ],
  },

  invitationMessage:
    "Some moments become memories, and some memories become forever. With grateful hearts and the blessings of our families, we invite you to join Olivia and Ethan as they begin their beautiful journey together. Your presence will make our celebration even more meaningful.",

  quote:
    "“The best thing to hold onto in life is each other.” — Audrey Hepburn",

  guestInformation: [
    {
      title: "Arrival",
      body: "We would love for you to arrive 20–30 minutes before the ceremony so you can settle in and enjoy the occasion.",
    },

    {
      title: "Dress Code",
      body: "Garden-inspired formal or semi-formal attire in pearl white, terracotta, olive, blush, and other muted tones is encouraged.",
    },

    {
      title: "Family",
      body: "Our celebration is made more special by the people we love. Families and children are warmly welcome.",
    },

    {
      title: "Parking",
      body: "Guest parking will be available at the venue. Our team will be happy to guide you upon arrival.",
    },

    {
      title: "Photography",
      body: "Please feel free to capture the joyful moments. During the ceremony, we kindly request that guests avoid flash photography and keep the aisle clear.",
    },

    {
      title: "Gifts",
      body: "Your love, blessings, and presence are the most precious gifts we could receive.",
    },
  ],

  /** Optional background music */
  musicSrc: "",

  footer: {
    signOff: "With Love, Olivia & Ethan",
    thanks:
      "Thank you for being part of our story. We cannot wait to celebrate this unforgettable beginning with you.",
  },
} as const;

export type Wedding = typeof wedding;