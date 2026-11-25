// Fictional campaign. Practice flights remain available in the mission list.
const crew = {
  rook: ['Mara “Rook” Vale','Drone pilot',0],
  cipher: ['Jun “Cipher” Sato','Signals specialist',1],
  patch: ['Rafael “Patch” Reyes','Drone technician',2],
  director: ['Elena Voss','Investigation lead',3],
  sable: ['Adrian Sable','Freight company director',4],
  iman: ['Iman Cruz','Warehouse dispatcher',5],
  reed: ['Special Agent Simone Reed','FBI',6]
};
const chapters = [
  {name:'Intake Dock', seconds:42, start:[75,250], exit:[250,160], wind:0,
   gates:[[218,251],[448,122],[668,241],[836,258]],
   walls:[[166,91,135,70,'pallet'],[289,274,142,79,'rack'],[486,284,132,88,'forklift'],[533,19,101,81,'rack'],[709,107,93,72,'pallet'],[762,345,140,73,'rack']],
   cameras:[[369,75,1.1,'green'],[737,301,-1.1,'red']],
   intro:'Enter through the intake lane and record the mislabeled freight.'},
  {name:'Cold Storage', seconds:40, start:[77,327], exit:[112,140], wind:105,
   gates:[[218,335],[411,139],[560,314],[736,344],[852,111]],
   walls:[[274,192,82,308,'rack'],[456,0,84,235,'rack'],[627,187,72,97,'pallet'],[764,175,75,116,'forklift'],[108,70,96,93,'pallet'],[854,365,64,82,'pallet']],
   cameras:[[397,254,-1.43,'red'],[582,209,1.29,'green'],[799,128,2.52,'red']],
   intro:'Thread the refrigeration aisles and collect the temperature logs before the feed drops.'},
  {name:'Sorting Floor', seconds:45, start:[84,123], exit:[370,140], wind:180,
   gates:[[199,120],[419,364],[539,126],[707,348],[844,373]],
   walls:[[259,0,74,282,'rack'],[472,185,71,315,'rack'],[628,0,70,244,'rack'],[786,128,144,112,'forklift'],[112,312,73,86,'pallet'],[363,58,49,67,'pallet'],[728,408,51,54,'pallet']],
   cameras:[[369,172,1.4,'red'],[588,265,-1.45,'red'],[732,281,1.23,'red'],[839,311,1.4,'green']],
   intro:'Trace the hidden pallet route across the sorting lanes. Save a jammer charge for the east cameras.'},
  {name:'Outbound Vault', seconds:49, start:[80,373], exit:[235,124], wind:235,
   gates:[[208,373],[398,122],[550,362],[715,127],[811,235],[890,235]],
   walls:[[268,199,78,301,'rack'],[450,0,76,279,'rack'],[623,190,72,310,'rack'],[754,36,65,83,'forklift'],[791,325,92,93,'pallet'],[111,152,78,92,'pallet'],[857,114,58,45,'pallet'],[868,306,58,48,'forklift']],
   cameras:[[383,248,-1.45,'red'],[575,188,1.52,'red'],[719,237,-1.38,'red'],[872,281,-1.3,'red']],
   intro:'Recover the master manifest and fly it out through the east shutter. The narrow exit is exposed to strong gusts.'}
];

const campaignBriefs = [
  ['The Empty Trailers','director','Sable Freight reports empty trailers. Their outbound weights say otherwise. Rook, calibrate the workshop drone. We’ll start with what it can see.'],
  ['The Empty Trailers','rook','The recorder is steady. I’m moving to the loading bay to film the labels before the night shift clears them.'],
  ['The Empty Trailers','patch','Wind cuts straight across the service road. Brake early. The far scan should show us where those trailers really go.'],
  ['The Second Route','cipher','The phantom trailers lead to a rail siding. Record the transfer marks and I’ll compare them with the dock footage.'],
  ['The Second Route','iman','Dispatch has two schedules. Mine says the pumps shut down at midnight. The private schedule starts a shift at the same time.'],
  ['The Second Route','rook','The relay feeds link both schedules. I’ll get close enough to record what’s being moved.'],
  ['Eyes Inside','reed','We’re opening a federal investigation. Your job is the camera feed. I’ll handle the evidence and the people.'],
  ['Eyes Inside','patch','The warehouse fans will shove you sideways. The gold Aurel and blue Vector both stay steadier in gusts.'],
  ['Eyes Inside','director','We finally have eyes past the intake. Record the freight labels as they come off the line.'],
  ['The Outbound Order','iman','That metal cabinet on the old plans is missing. The cold room is where Sable keeps the records he doesn’t show dispatch.'],
  ['The Outbound Order','cipher','The rail marks and the cold-room records point to the same account. Follow the pallet route to the outbound vault.'],
  ['The Outbound Order','reed','The team is in position. Fly the last pass, bring the drone out, and leave the arrest to us.']
];
const campaignReveals = {
  3: {title:'Chapter 1 · The Phantom Freight', lines:[
    ['cipher','Every trailer is booked twice. One record says empty. The other has a private routing number.'],
    ['sable','If anyone asks about the second record, tell them it belongs to a different company. They don’t need to know which one.']
  ]},
  6: {title:'Chapter 2 · A Witness Comes Forward', lines:[
    ['iman','I saw the contents during a damaged shipment inspection. Those weren’t produce crates. I think the warehouse is moving illegal drugs.'],
    ['reed','The information you’ve gathered supports that suspicion. Keep recording what you can see. The bureau will take it from here when we have enough evidence.']
  ]},
  9: {title:'Chapter 3 · Sable’s Signature', lines:[
    ['rook','The label on the intake feed matches Iman’s record. Adrian Sable signed the order himself.'],
    ['sable','That shipment goes out tonight. I want the vault empty before anyone starts asking questions.'],
    ['reed','We have the witness and the intake footage. The master manifest will tie the separate shipments together.']
  ]},
  12: {title:'Chapter 4 · Mission Accomplished', lines:[
    ['rook','Drone clear. All six records came through, including the master manifest.'],
    ['reed','The FBI assisted local officers at the warehouse. Adrian Sable is in custody, and the suspected narcotics are secured as evidence.'],
    ['director','Iman’s testimony and your flight recordings gave investigators the whole picture. The case can move forward.'],
    ['patch','You brought the drone back through every bad turn. Thanks for flying with us.'],
    [null,'THANK YOU FOR PLAYING'],
    [null,'@OfficialFRP\nA Feather Rock Production\n\nIn association with Team Inspire - @OFFICIALINSPIRE777']
  ]}
};
