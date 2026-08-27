import type { MCQItem } from "./types";

export const reasoningItems: MCQItem[] = [
  {
    id: "r001",
    prompt: `All mammals are warm-blooded. All whales are mammals. Which conclusion necessarily follows?

A) All warm-blooded animals are whales
B) All whales are warm-blooded
C) Some mammals are not warm-blooded
D) Whales are the only warm-blooded mammals`,
    options: { A: "All warm-blooded animals are whales", B: "All whales are warm-blooded", C: "Some mammals are not warm-blooded", D: "Whales are the only warm-blooded mammals" },
    answer: "B", difficulty: "easy",
  },
  {
    id: "r002",
    prompt: `If no artists are bankers, and some bankers are chess players, which must be true?

A) Some artists are chess players
B) No chess players are artists
C) Some chess players are not artists
D) All chess players are bankers`,
    options: { A: "Some artists are chess players", B: "No chess players are artists", C: "Some chess players are not artists", D: "All chess players are bankers" },
    answer: "C", difficulty: "medium",
  },
  {
    id: "r003",
    prompt: `Book is to library as painting is to:

A) Canvas
B) Artist
C) Museum
D) Frame`,
    options: { A: "Canvas", B: "Artist", C: "Museum", D: "Frame" },
    answer: "C", difficulty: "easy",
  },
  {
    id: "r004",
    prompt: `A train leaves Station A at 9:00 AM traveling east at 60 km/h. Another train leaves Station B (300 km east of A) at 9:00 AM traveling west at 90 km/h. At what time do they meet?

A) 10:00 AM
B) 10:12 AM
C) 10:48 AM
D) 11:00 AM`,
    options: { A: "10:00 AM", B: "10:12 AM", C: "10:48 AM", D: "11:00 AM" },
    answer: "B", difficulty: "hard",
  },
  {
    id: "r005",
    prompt: `Which number comes next in the sequence: 2, 6, 18, 54, ___?

A) 108
B) 162
C) 216
D) 144`,
    options: { A: "108", B: "162", C: "216", D: "144" },
    answer: "B", difficulty: "easy",
  },
  {
    id: "r006",
    prompt: `All roses are flowers. Some flowers fade quickly. Which statement must be true?

A) All roses fade quickly
B) Some roses fade quickly
C) No roses fade quickly
D) None of the above must be true`,
    options: { A: "All roses fade quickly", B: "Some roses fade quickly", C: "No roses fade quickly", D: "None of the above must be true" },
    answer: "D", difficulty: "medium",
  },
  {
    id: "r007",
    prompt: `Doctor is to hospital as teacher is to:

A) Book
B) Knowledge
C) School
D) Student`,
    options: { A: "Book", B: "Knowledge", C: "School", D: "Student" },
    answer: "C", difficulty: "easy",
  },
  {
    id: "r008",
    prompt: `In a row of 5 people, Alice is immediately to the left of Bob. Carol is immediately to the right of Bob. Dave is at the leftmost position. Eve is between Dave and Alice. What is Carol's position from the left?

A) 3rd
B) 4th
C) 5th
D) 2nd`,
    options: { A: "3rd", B: "4th", C: "5th", D: "2nd" },
    answer: "B", difficulty: "medium",
  },
  {
    id: "r009",
    prompt: `Pointing to a photograph, a man says "She is the daughter of my grandfather's only son." How is the person in the photo related to the man?

A) Sister
B) Cousin
C) Niece
D) Daughter`,
    options: { A: "Sister", B: "Cousin", C: "Niece", D: "Daughter" },
    answer: "A", difficulty: "medium",
  },
  {
    id: "r010",
    prompt: `If MOUSE is coded as PRUQC, then what is the code for CHAIR?

A) EKDLT
B) FKDLT
C) EKELT
D) FKEIT`,
    options: { A: "EKDLT", B: "FKDLT", C: "EKELT", D: "FKEIT" },
    answer: "A", difficulty: "hard",
  },
  {
    id: "r011",
    prompt: `Every time it rains, the ground gets wet. The ground is wet. What can we conclude?

A) It rained
B) It did not rain
C) It may or may not have rained
D) It will rain again`,
    options: { A: "It rained", B: "It did not rain", C: "It may or may not have rained", D: "It will rain again" },
    answer: "C", difficulty: "medium",
  },
  {
    id: "r012",
    prompt: `Which word does NOT belong with the others?

A) Hammer
B) Screwdriver
C) Pliers
D) Saw`,
    options: { A: "Hammer", B: "Screwdriver", C: "Pliers", D: "Saw" },
    answer: "D", difficulty: "easy",
  },
  {
    id: "r013",
    prompt: `Complete the pattern: 1, 4, 9, 16, 25, ___

A) 30
B) 36
C) 49
D) 64`,
    options: { A: "30", B: "36", C: "49", D: "64" },
    answer: "B", difficulty: "easy",
  },
  {
    id: "r014",
    prompt: `If today is Wednesday, what day will it be 100 days from now?

A) Monday
B) Tuesday
C) Friday
D) Saturday`,
    options: { A: "Monday", B: "Tuesday", C: "Friday", D: "Saturday" },
    answer: "C", difficulty: "medium",
  },
  {
    id: "r015",
    prompt: `Statements: All cats are animals. Some animals are wild. Conclusion I: Some cats are wild. Conclusion II: Some wild things are animals. Which conclusion(s) follow?

A) Only Conclusion I
B) Only Conclusion II
C) Both conclusions
D) Neither conclusion`,
    options: { A: "Only Conclusion I", B: "Only Conclusion II", C: "Both conclusions", D: "Neither conclusion" },
    answer: "B", difficulty: "medium",
  },
  {
    id: "r016",
    prompt: `A causes B. B causes C. C prevents D. A occurred. Therefore:

A) D occurred
B) D did not occur
C) D may or may not have occurred
D) B did not occur`,
    options: { A: "D occurred", B: "D did not occur", C: "D may or may not have occurred", D: "B did not occur" },
    answer: "B", difficulty: "medium",
  },
  {
    id: "r017",
    prompt: `Find the odd one out: 121, 144, 169, 196, 204

A) 121
B) 169
C) 196
D) 204`,
    options: { A: "121", B: "169", C: "196", D: "204" },
    answer: "D", difficulty: "medium",
  },
  {
    id: "r018",
    prompt: `In a certain language, "pit dar pom" means "bring hot food", "dar tir fim" means "hot and sour", and "pom tir gol" means "food and drink". What word means "bring"?

A) pit
B) dar
C) pom
D) tir`,
    options: { A: "pit", B: "dar", C: "pom", D: "tir" },
    answer: "A", difficulty: "hard",
  },
  {
    id: "r019",
    prompt: `Which is a valid logical deduction? Premise: "If a student studies, they pass." Student A did not pass.

A) Student A studied
B) Student A did not study
C) Student A might have studied
D) Cannot conclude anything about Student A's studying`,
    options: { A: "Student A studied", B: "Student A did not study", C: "Student A might have studied", D: "Cannot conclude anything about Student A's studying" },
    answer: "B", difficulty: "medium",
  },
  {
    id: "r020",
    prompt: `Arrange these events in the correct causal order: (1) Fire extinguished (2) Building catches fire (3) Fire alarm sounds (4) Firefighters called

A) 2,3,4,1
B) 1,2,3,4
C) 3,2,4,1
D) 2,4,3,1`,
    options: { A: "2,3,4,1", B: "1,2,3,4", C: "3,2,4,1", D: "2,4,3,1" },
    answer: "A", difficulty: "easy",
  },
  {
    id: "r021",
    prompt: `Five friends sit in a circle. Alex is not next to Ben. Ben is next to Carol. Carol is not next to Dave. Dave is next to Eve. Eve is next to Alex. Who is next to Alex (other than Eve)?

A) Ben
B) Carol
C) Dave
D) Cannot be determined`,
    options: { A: "Ben", B: "Carol", C: "Dave", D: "Cannot be determined" },
    answer: "B", difficulty: "hard",
  },
  {
    id: "r022",
    prompt: `Water is to thirst as food is to:

A) Eating
B) Hunger
C) Nutrition
D) Stomach`,
    options: { A: "Eating", B: "Hunger", C: "Nutrition", D: "Stomach" },
    answer: "B", difficulty: "easy",
  },
  {
    id: "r023",
    prompt: `If all bloops are razzles and all razzles are lazzles, then:

A) All lazzles are bloops
B) All bloops are lazzles
C) Some razzles are not lazzles
D) No lazzles are bloops`,
    options: { A: "All lazzles are bloops", B: "All bloops are lazzles", C: "Some razzles are not lazzles", D: "No lazzles are bloops" },
    answer: "B", difficulty: "easy",
  },
  {
    id: "r024",
    prompt: `Next in series: AZ, BY, CX, DW, ___

A) EV
B) EU
C) FV
D) EW`,
    options: { A: "EV", B: "EU", C: "FV", D: "EW" },
    answer: "A", difficulty: "medium",
  },
  {
    id: "r025",
    prompt: `Three switches outside a room each control one of three bulbs inside. You may flip switches as many times as you want, then enter once. How can you determine which switch controls which bulb?

A) You cannot determine it in one entry
B) Turn on switch 1, wait, turn it off, turn on switch 2, enter and feel all bulbs
C) Turn on all switches, enter, check brightness levels
D) Flip switches in binary pattern then enter`,
    options: { A: "You cannot determine it in one entry", B: "Turn on switch 1, wait, turn it off, turn on switch 2, enter and feel all bulbs", C: "Turn on all switches, enter, check brightness levels", D: "Flip switches in binary pattern then enter" },
    answer: "B", difficulty: "hard",
  },
];
