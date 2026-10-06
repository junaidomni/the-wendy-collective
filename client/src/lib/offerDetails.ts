// Recovered project sources, not promotional artwork. See local review handoff.
export const offerDetails = {
 "love-is-in-the-air-and-sea":{
 lead:"A little romance. A beautiful change of scenery.",
 itinerary:[["Feb. 12","Miami","Depart 3:30 PM"],["Feb. 13","At sea",""],["Feb. 14","Celebration Key","8:00 AM–4:00 PM"],["Feb. 15","Miami","Arrive 8:00 AM"]],
 source:"Recovered Carnival group statement issued September 13, 2026. Reconfirm the schedule before arranging travel.",
 cabins:["Interior","Ocean View","Balcony"],
 cabinNote:"Categories recorded in the recovered statement. These are requests, not a promise of current inventory.",
 pending:["Current fares, taxes, fees and availability","Deposit, final payment and cancellation terms","Confirmation of the Valentine’s extras and their eligibility"],
 },
 "spring-break-unleashed":{
 lead:"Your people. Your spring break. Departing Baltimore.",itinerary:[["Mar. 14","Baltimore","Depart 4:30 PM"],["Mar. 15","At sea",""],["Mar. 16","At sea",""],["Mar. 17","RelaxAway, Half Moon Cay","8:00 AM–4:00 PM"],["Mar. 18","Nassau","8:00 AM–5:00 PM"],["Mar. 19","Celebration Key","7:00 AM–1:00 PM"],["Mar. 20","At sea",""],["Mar. 21","Baltimore","Arrive 10:00 AM"]],
 source:"Carnival Pride itinerary supplied by Wendy on September 28, 2026; March 14–21 roundtrip Baltimore. Port times are subject to change.",
 cabins:["Interior","Ocean View","Obstructed View Balcony","Balcony"],
 cabinNote:"Categories listed in the recovered booking reference. Current availability and specific cabin details need confirmation.",
 pending:["Current fares, taxes, fees and stateroom availability","Fare inclusions, group benefits, deposits and booking terms"],
 },
 "spring-break-mardi-gras-takeover":{
 lead:"A brighter kind of spring break. From Port Canaveral.",
 itinerary:[["Mar. 13","Port Canaveral (Orlando)","Depart 3:30 PM"],["Mar. 14","Nassau","10:00 AM–6:00 PM"],["Mar. 15","RelaxAway, Half Moon Cay","8:00 AM–5:00 PM"],["Mar. 16","At sea",""],["Mar. 17","Amber Cove","8:00 AM–5:00 PM"],["Mar. 18","At sea",""],["Mar. 19","Celebration Key","8:00 AM–4:00 PM"],["Mar. 20","Port Canaveral (Orlando)","Arrive 8:00 AM"]],
 source:"From the supplied Carnival itinerary agenda for March 13–20, 2027. Reconfirm the schedule before arranging travel.",
 cabins:["Interior","Ocean View","Cove Balcony"],
 cabinNote:"Categories listed in the recovered booking reference. Current availability and specific cabin details need confirmation.",
 pending:["Current fares, taxes, fees and stateroom availability","Fare inclusions and any eligible group benefits","Deposit, final payment and cancellation terms"],
 }
} satisfies Record<string,{lead:string;itinerary:string[][];source:string;cabins:string[];cabinNote:string;pending:string[]}>;

// General room features checked against Carnival's Conquest ship page, September 28, 2026.
// https://www.carnival.com/cruise-ships/carnival-conquest
export const conquestCabinDescriptions: Record<string,string> = {
 Interior: "A cozy retreat after a day of exploring and an evening together. Enjoy comfortable surroundings and a welcoming place to recharge, with more of your vacation budget left for the moments you love.",
 "Ocean View": "Let the sea become part of your stay. A picture window brings ocean scenery into your room, giving you a lovely place to pause, unwind, and watch the world drift by.",
 Balcony: "Step outside to your own balcony for fresh sea air and time together with an ocean backdrop. A beautiful choice for slow mornings and a few quiet moments at the end of the day.",
};

// General features from Carnival's official Pride and Mardi Gras stateroom pages.
export const springCabinDescriptions: Record<string,string> = {
 Interior: "A comfortable retreat between adventures. Settle in, recharge, and make the most of days exploring and evenings together aboard the ship.",
 "Ocean View": "Bring the scenery into your stay. Enjoy a window onto the sea and a welcoming space to unwind as your voyage unfolds.",
 Balcony: "Make time for fresh sea air on your own balcony. Step outside for a quiet morning or a relaxing pause with an ocean backdrop.",
 "Obstructed View Balcony": "Enjoy your own outdoor space, with value in mind. Step onto your balcony for fresh sea air and a quiet moment between adventures. The ocean view is obstructed, making this an option to explore if balcony time matters more to you than an uninterrupted outlook. Wendy will compare current fares and explain your specific cabin’s view before you choose.",
 "Cove Balcony": "Get closer to the sea with a balcony near the waterline. Enjoy a fresh perspective on the waves and seafoam as Mardi Gras sails along, with a comfortable retreat just inside.",
};
