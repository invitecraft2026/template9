
/**
 * CENTRAL WEDDING CONFIGURATION
 * Every editable detail of the invitation lives here.
 * Sample wedding details for Isabella & Noah.
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
    firstName: "Isabella",
    fullName: "Isabella Rose Anderson",
    parents: "Daughter of Mr. James Anderson & Mrs. Emily Anderson",
  },

  groom: {
    firstName: "Noah",
    fullName: "Noah Alexander Carter",
    parents: "Son of Mr. Daniel Carter & Mrs. Grace Carter",
  },

  initials: "I & N",

  /** Human readable date + time */
  date: "Saturday, 12 December 2026",

  dayName: "Saturday",
  dayNumber: "12",
  monthName: "December",
  year: "2026",

  time: "5:00 PM onwards",

  /** Used by countdown + calendar */
  dateISO: "2026-12-12T17:00:00",
  endISO: "2026-12-12T23:00:00",

  welcomeLine: "Together with our beloved families",

  welcomeTitle: "Forever Starts Here",

  welcomeJoin: "between",

  venue: {
    name: "The Ivory Garden Estate",
    address: "Palm Grove Road, Kakkanad, Kochi, Kerala 682030",
    mapsQuery: "The Ivory Garden Estate, Kakkanad, Kochi, Kerala",
  },

  events: [
    {
      id: "welcome",
      title: "Welcome Celebration",
      date: "Friday, 11 December 2026",
      time: "6:30 PM",
      venue: "The Ivory Garden Estate, Rose Garden",
      icon: "lantern",
    },

    {
      id: "ceremony",
      title: "Wedding Ceremony",
      date: "Saturday, 12 December 2026",
      time: "5:00 PM",
      venue: "The Ivory Garden Estate, Garden Pavilion",
      icon: "crescent",
    },

    {
      id: "reception",
      title: "Wedding Reception",
      date: "Saturday, 12 December 2026",
      time: "7:00 PM",
      venue: "The Ivory Garden Estate, Grand Ballroom",
      icon: "rings",
    },

    {
      id: "brunch",
      title: "Farewell Brunch",
      date: "Sunday, 13 December 2026",
      time: "10:30 AM",
      venue: "The Ivory Garden Estate, Garden Terrace",
      icon: "dinner",
    },
  ] satisfies WeddingEvent[],

  dressCode: {
    description:
      "Celebrate with us in elegant attire inspired by soft ivory, champagne gold, dusty rose, and the timeless beauty of a romantic garden.",

    colors: [
      {
        name: "Ivory",
        hex: "#F5F0E6",
      },
      {
        name: "Champagne Gold",
        hex: "#D6BC8B",
      },
      {
        name: "Dusty Rose",
        hex: "#C98F91",
      },
      {
        name: "Sage Green",
        hex: "#A3AD91",
      },
      {
        name: "Mocha Brown",
        hex: "#8A7163",
      },
      {
        name: "Misty Blue",
        hex: "#A9BBCD",
      },
      {
        name: "Burgundy",
        hex: "#783F4D",
      },
    ],
  },

  invitationMessage:
    "Two hearts, two stories, and one beautiful forever. With the love and blessings of our families, we joyfully invite you to celebrate as Isabella and Noah begin their journey as one. Your presence will make our special day truly unforgettable.",

  quote:
    "“Whatever our souls are made of, his and mine are the same.” — Emily Brontë",

  guestInformation: [
    {
      title: "Arrival",
      body: "Please arrive 20–30 minutes before the ceremony to settle in and enjoy the celebration.",
    },

    {
      title: "Dress Code",
      body: "Elegant formal or semi-formal attire in ivory, champagne, dusty rose, sage, and other soft, complementary tones is encouraged.",
    },

    {
      title: "Family",
      body: "Our celebration is all about love and togetherness. Families and children are warmly welcome.",
    },

    {
      title: "Parking",
      body: "Parking facilities will be available at the venue. Please follow the signs and directions from our venue team.",
    },

    {
      title: "Photography",
      body: "We would love for you to capture beautiful memories. During the ceremony, please avoid flash photography and keep the aisle clear.",
    },

    {
      title: "Gifts",
      body: "Your love, blessings, and presence are the greatest gifts we could ever ask for.",
    },
  ],

  /** Optional background music */
  musicSrc: "",

  footer: {
    signOff: "With Love, Isabella & Noah",
    thanks:
      "Thank you for being part of our love story. We look forward to celebrating a beautiful new beginning with you.",
  },
} as const;

export type Wedding = typeof wedding;
