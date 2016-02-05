# Models

struct Employment {
  uint    id;
  uint    userId;
  uint    orgId;     // alias: employerId
  bytes32 role;
  bytes32 dateStart;
  bytes32 dateEnd;
  bytes32 reportsTo; // direct reports to
  bytes32 budget;    // budget responsibility
  bytes32 skills;    // csv
}

struct Org {
  // generic
  uint    id;
  bytes32 name;
  bytes32 publicKey;
  bytes32 orgType;    // school | college | uni | employer
  bytes32 location;   // physical address

  // specifics
  bytes32 industry;   // specific to type=employer
}


struct User {
  uint    id;
  bytes32 name;
  bytes32 publicKey;
  bytes32 location;
  bytes32 achievements; // academic achievements
  bytes32 birthDate;
  bytes32 gender;
  bytes32 nationality;
}
