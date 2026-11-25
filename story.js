// Fictional campaign. Practice flights remain available in the mission list.
const crew = {
  rook: ['Mara “Rook” Vale','Drone pilot',0],
  cipher: ['Jun “Cipher” Sato','Signals specialist',1],
  patch: ['Rafael “Patch” Reyes','Drone technician',2],
  director: ['Elena Voss','Investigation lead',3]
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
const briefings = [
  [['director','The warehouse reports empty trailers. Its outbound weights tell a different story. I need eyes inside.'],
   ['cipher','I can read our drone feed. The building’s cameras will show up as red arcs on your display.'],
   ['rook','I’ll record the freight labels from inside the dock. If the manifests are wrong, we’ll have proof.']],
  [['rook','Those crates are warm on the camera, but the labels say frozen produce. What’s in Cold Storage?'],
   ['patch','Refrigeration ducts will shove the airframe sideways. The gold Aurel is our endurance build.'],
   ['director','Record the temperature logs. One mislabeled crate could be a mistake. A whole shipment is a pattern.']],
  [['cipher','The cold-room log lists a second destination. The sorting floor is routing pallets to a bay the public plans leave blank.'],
   ['patch','Take the blue Vector if the turns are giving you trouble. It settles quickly when you let go of the controls.'],
   ['rook','I’ll follow the pallets. If they cross under a red sweep, I’ll wait for a gap.']],
  [['director','Your scans identify the cargo. The master manifest tells us who ordered it.'],
   ['cipher','We have one clear route out. The east shutter. The last camera overlooks it.'],
   ['rook','Understood. Six scans, then straight through the door. Keep the recorder running.']]
];
const epilogue = [
  ['rook','Drone is clear. Recorder held all the way to extraction.'],
  ['cipher','I matched the outbound order numbers to the intake footage. The warehouse can’t explain those away.'],
  ['director','We have the chain of evidence. Send it to the review team. Good work, everyone.']
];
