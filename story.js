// Fictional campaign. Practice flights remain available in the mission list.
const crew = {
  rook: ['Mara “Rook” Vale','Drone pilot',0],
  cipher: ['Jun “Cipher” Sato','Signals specialist',1],
  patch: ['Rafael “Patch” Reyes','Drone technician',2],
  director: ['Elena Voss','Investigation lead',3],
  sable: ['Adrian Sable','Freight company director',4],
  iman: ['Iman Cruz','Warehouse dispatcher',5],
  reed: ['Special Agent Simone Reed','FBI',6],
  morrow: ['Lucian Morrow','North Quay logistics chairman',8],
  kade: ['Nico “Wake” Kade','Tug mechanic and drone pilot',9],
  vey: ['Dorian Vey','International freight magnate',10],
  leena: ['Commander Leena Sato','Maritime rescue coordinator',11],
  mateo: ['Mateo Reyes','Freighter deckhand and witness',12]
};
const crewBios = {
  rook: 'Mara Vale pilots the covert drones that give the Night Watch team eyes on the ground. From the Sable Freight workshop to the decks of the Orison, she threads tight routes, records evidence, and scouts safe passages for the people moving in behind her.',
  cipher: 'Jun Sato reads the signals and paperwork behind each mission. He spots the fingerprints of a larger operation in duplicate freight records, transfer accounts, and suspicious manifests, then relays what he finds to Rook and the field team.',
  patch: 'Rafael Reyes keeps the Night Watch fleet in flying shape. He tunes the airframes, helps Rook match equipment to the route, and occasionally puts his own work to the test as a Race rival.',
  director: 'Elena Voss leads the investigation and turns incoming evidence into practical flight assignments. She coordinates the team’s work across the freight yards and harbor and keeps the people affected by the cases in view.',
  sable: 'Adrian Sable runs the freight company at the center of Case 01. His name turns up on a disputed intake order, drawing the team into a network of doubled records and cargo moving under false descriptions.',
  iman: 'Iman Cruz dispatches freight and knows what belongs in a normal shipment. A damaged consignment puts Iman in a position to describe what the paperwork leaves out, giving the investigators a firsthand account.',
  reed: 'Special Agent Simone Reed works with the Night Watch crew, local officers, and international partners. She checks what the drone footage and witness statements can establish and coordinates enforcement support as the cases expand.',
  morrow: 'Lucian Morrow chairs the logistics operation associated with North Quay. The shuttered ferry site, its leases, and its surviving freight records lead the team to examine his connection to Sable’s supply chain.',
  kade: 'Nico Kade repairs tugs and flies drones around the harbor. Known as Wake, he knows the old ferry routes and industrial equipment at North Quay well enough to guide Rook through unfamiliar lanes and difficult gusts.',
  vey: 'Dorian Vey is a freight magnate whose shipping network spans three oceans. An account buried in North Quay’s ledger brings his operation under scrutiny and leads the team to the freighter Orison.',
  leena: 'Commander Leena Sato coordinates the maritime rescue aboard the Orison. She keeps contact with the deckhand, prepares crews and medics, and times their movement using the passages Rook confirms from above.',
  mateo: 'Mateo Reyes is a deckhand aboard the Orison. He calls for help after hearing people below deck and listens to what they are willing to share, keeping notes the rescuers can use to account for them.'
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
    ['cipher','There’s one name the warehouse records won’t account for. The same supplier signature paid for the first shipment and every one after it.'],
    ['reed','Sable is in custody. The supplier is still out there. We’re reopening the trail at North Quay.']
  ]}
};

const quayBriefs = [
  ['Departure Records','reed','Sable’s seized invoices lead to a decommissioned ferry warehouse across the harbor. North Quay is our next case.'],
  ['Departure Records','kade','I used to fix the tugs here. The light-blue fenders and foam guards will push you back if you brush them slowly. Give steel a wider berth.'],
  ['Departure Records','rook','The seals on this quay match Sable’s outbound footage. I’ll record the transfer receipts before we leave.'],
  ['The Quiet Owner','director','The receipts belong to a company that officially stopped trading years ago. Let’s see who kept the lights on.'],
  ['The Quiet Owner','cipher','The annex listed a chairman with no public business address. The crane schedule might tie him to a real shipment.'],
  ['The Quiet Owner','morrow','The quay keeps its own hours. I expect to see my next shipment on the evening report.'],
  ['Pressure on the Quay','patch','If you need more control, the Kestrel and Breaker are in the hangar. Buy either with credits and it’s yours.'],
  ['Pressure on the Quay','kade','Wind comes right through the old ferry doors. I’ll call out what I recognize from the tug lane.'],
  ['Pressure on the Quay','reed','Morrow’s signature is on the invoices. The ledger can tell us how far back his supply operation goes.'],
  ['Final Berth','rook','I’m taking the drone through the tide gate. Keep the recorder on. We need a clean view of all the tags.'],
  ['Final Berth','cipher','The crane records confirm which shipments left this quay. One final set of seals should close the gap.'],
  ['Final Berth','reed','Our team is outside. Bring the drone back after the last scan. We’ll take Morrow into custody.']
];
campaignBriefs.push(...quayBriefs);
Object.assign(campaignReveals,{
  15:{title:'Chapter 1 · The Ferry Trail',lines:[
    ['kade','Those receipts list dead ferry routes. The ships weren’t running, but the freight kept moving.'],
    ['cipher','Every transfer links back to one account. Sable was buying stock from someone at this quay.']
  ]},
  18:{title:'Chapter 2 · The Quiet Owner',lines:[
    ['director','The quay lease names Lucian Morrow. His name is also on the freight invoices we recovered from Sable.'],
    ['reed','Morrow appears to be the primary supplier. We still need a complete record connecting him to the seized narcotics.']
  ]},
  21:{title:'Chapter 3 · Evidence at the Waterline',lines:[
    ['morrow','Sable’s arrangement ended when he got caught. I expect the outgoing cargo to be ready all the same.'],
    ['cipher','That recording matches the signed orders. His own ledger also lists earlier shipments to Sable.'],
    ['reed','We have enough to move. One last flight links the current cargo to the ledger.']
  ]},
  24:{title:'Chapter 4 · North Quay Closed',lines:[
    ['rook','Drone recovered. I have the final seal numbers and the complete footage.'],
    ['reed','The FBI and harbor police took Lucian Morrow into custody at North Quay. The warehouse and its records are secured.'],
    ['cipher','Morrow’s ledger includes a separate account tied to Dorian Vey. His shipping network spans three oceans. One entry lists people as cargo.'],
    ['vey','Once we’re past the lights, no one will hear them. Keep the deck clear.'],
    ['mateo','I’m calling from the freighter Orison. There are people below deck. I heard them asking for water. Please tell me someone’s coming.'],
    ['leena','We’re coming, Mateo. Stay where you’re safe. Rook, we need eyes on the deck before we move.']
  ]},
  27:{title:'The Orison · Voices Below Deck',lines:[
    ['mateo','I called through the bulkhead. Someone answered. They wanted to know if we could hear everyone on their side.'],
    ['leena','Tell them we heard. We’re still here.'],
    ['reed','The records and Mateo’s account confirm we’re investigating trafficking. The rescue stays our priority.']
  ]},
  30:{title:'The Orison · The Missing Names',lines:[
    ['cipher','The company logs omit the people below deck. Mateo kept his own notes. We can use them to check who’s accounted for.'],
    ['mateo','Some of them gave me names. Some didn’t want to. I wrote down what they trusted me with.'],
    ['leena','We’ll protect that list. The medics are ready.']
  ]},
  33:{title:'The Orison · Before Dawn',lines:[
    ['vey','You can have the ship. My name doesn’t appear anywhere on it.'],
    ['reed','The records connect him to the voyage. Our partners are ready to take him into custody.'],
    ['leena','Waves are breaking over the bow. We’ll move as soon as Rook confirms the last passage.']
  ]},
  36:{title:'The Orison · All Accounted For',lines:[
    ['rook','Last marker confirmed. The passage to the rescue station is clear.'],
    ['leena','We have everyone from the hold. The medics are with them now. One woman asked me to stay until she fell asleep. I told her I would.'],
    ['reed','Dorian Vey is in custody. Our international partners are preserving the ship’s records. We’ll take statements when people are ready.'],
    ['mateo','I heard them call back when I knocked. Tonight, I heard them say their names.'],
    ['director','We’ll make sure they have somewhere safe to go and someone to call. You can bring the drone home, Rook.'],
    [null,'ALL ACCOUNTED FOR',null,{src:'assets/orison-rescue-team.webp',alt:'Rook and the rescue team together on the Orison at dawn after the operation.'}],
    [null,'THANK YOU FOR PLAYING'],
    [null,'@OfficialFRP\nA Feather Rock Production\n\nIn association with Team Inspire - @OFFICIALINSPIRE777','https://www.inspireclothing.art/']
  ]}
});

const carrierFinale = {
  name:'Orison at Sea',seconds:47,start:[76,345],exit:[218,132],wind:153,
  sea:true,sentinels:2,
  gates:[[180,339],[344,135],[491,345],[634,153],[777,345],[879,217]],
  walls:[
    [109,65,129,52,'deckGantry'],[231,117,62,193,'shipExhaust'],
    [305,392,125,55,'cargoLift'],[397,194,61,246,'steelHatches'],
    [490,53,136,49,'shipCrane'],[540,55,63,255,'fireMain'],
    [684,244,60,197,'radarMast'],[722,71,128,50,'davitRail'],
    [812,281,68,105,'deckReels'],[822,407,103,39,'lifeboat']
  ],
  cameras:[[303,186,-.9,'red'],[518,258,1.15,'red'],[710,220,1.55,'red']],
  intro:'Verify six rescue markers across the bow and fly through the opening. Save a jam for the last crossing.'
};
// Authored lane centers and hazard budgets keep each deck crossing readable.
const orisonPlans = [
  {name:'Weather Deck', chapter:'Distress Call', speaker:'leena', line:'Start with the open deck. I need to know where the rescue crew can stand safely.', lanes:[217,261,230], seconds:62, wind:22, cameras:0},
  {name:'Container Rows', chapter:'Distress Call', speaker:'rook', line:'I can see the stacked containers. Mateo, keep talking. I’m checking the passages between them.', lanes:[196,278,224], seconds:62, wind:32, cameras:1},
  {name:'Crew Passage', chapter:'Distress Call', speaker:'mateo', line:'I can hear people on the other side of the bulkhead. The marked passage will take your team toward them.', lanes:[266,200,278], seconds:64, wind:39, cameras:1},
  {name:'Ventilation Deck', chapter:'The Missing Names', speaker:'patch', line:'Stay clear of the fan housings. They’re shaking hard enough to rattle the feed.', lanes:[194,276,211], seconds:62, wind:49, cameras:1},
  {name:'Ballast Gallery', chapter:'The Missing Names', speaker:'cipher', line:'The deck drawings and the actual ship disagree here. Mark the route you can see.', lanes:[278,211,272], seconds:64, wind:53, cameras:1},
  {name:'Service Hatches', chapter:'The Missing Names', speaker:'mateo', line:'Someone inside asked if their sister was coming too. Tell the rescue crew to check both hatches.', lanes:[193,280,205,262], seconds:65, wind:60, cameras:1},
  {name:'Rescue Stations', chapter:'Before Dawn', speaker:'leena', line:'Pick out the clear deck space beside the lifeboats. The medics need somewhere safe to work.', lanes:[251,185,276,214], seconds:65, wind:68, cameras:1},
  {name:'Crane Traverse', chapter:'Before Dawn', speaker:'rook', line:'The crane blocks the short route. I’ll take the wider turn and keep the camera steady.', lanes:[190,282,213,280], seconds:66, wind:74, cameras:2},
  {name:'Bridge Approach', chapter:'Before Dawn', speaker:'reed', line:'We have people ready for the bridge and the hold. Give us one more look at the approach.', lanes:[288,193,281,222], seconds:68, wind:83, cameras:2},
  {name:'Forward Winches', chapter:'The Rescue', speaker:'patch', line:'The wind’s stronger forward of the bridge. Brake before the winches and use the battery pack if you need it.', lanes:[193,292,201,277], seconds:69, wind:101, cameras:2},
  {name:'Evacuation Lane', chapter:'The Rescue', speaker:'mateo', line:'I’m at the muster point. I’ll stay here so the people coming up can see a familiar face.', lanes:[285,188,294,208], seconds:70, wind:116, cameras:2}
];
const orisonDeckGear = [
  'deckCargo','deckGantry','shipVent','cargoLift','lifeboat','deckReels',
  'anchorWinch','davitRail','deckGenerator','sensorPod','shipCrane','ballastPump'
];
const orisonVerticalGear = ['shipExhaust','gangway','steelHatches','bollardBank','fireMain','radarMast'];
const orisonMissions = orisonPlans.map((plan,index) => {
  const gates = [];
  const walls = [];
  const cameras = [];
  const columns = plan.lanes.length === 3 ? [218,460,710] : [183,376,568,759];
  const gap = index < 3 ? 76 : index < 9 ? 68 : 61;
  const horizontalGear = ['deckGantry','cargoLift','shipCrane','davitRail'];
  function deckObstacle(x,top,width,height,type,upper,lane) {
    if (!horizontalGear.includes(type)) {
      const variant = orisonVerticalGear[(index+lane*2+(upper ? 0 : 1))%orisonVerticalGear.length];
      return [x-width/2,top,width,height,height >= width*1.25 ? variant : type];
    }
    const wide = width+40;
    const shallow = Math.min(56,height);
    return [x-wide/2,upper ? top+height-shallow : top,wide,shallow,type];
  }
  for (const [lane,y] of plan.lanes.entries()) {
    const x = columns[lane];
    const width = 62+((index*7+lane*5)%15);
    const north = orisonDeckGear[(index+lane*2)%orisonDeckGear.length];
    const south = orisonDeckGear[(index+lane*2+3)%orisonDeckGear.length];
    gates.push([x,y]);
    walls.push(deckObstacle(x,46,width,y-gap-46,north,true,lane),deckObstacle(x,y+gap,width,454-y-gap,south,false,lane));
    if (lane < Math.max(1,plan.cameras)) {
      const offset = lane%2 ? -1 : 1;
      cameras.push([x+54,y+offset*(gap-16),offset*-1.3,index === 1 ? 'green' : 'red']);
    }
  }
  if (index >= 5) {
    const y = index%2 ? 350 : 105;
    const x = (columns[1]+columns[2])/2;
    walls.push([x-50,y-21,100,42,index === 8 ? 'sensorPod' : index%2 ? 'deckReels' : 'deckGenerator']);
  }
  const exitY = Math.round((plan.lanes.at(-1)+250)/2);
  gates.push([872,exitY]);
  return {
    name:plan.name,seconds:plan.seconds-(index < 3 ? 18 : 20),start:[76,plan.lanes[0]],exit:[exitY,index < 9 ? 168 : 152],
    wind:plan.wind+31+index*2,sea:true,sentinels:index>=8 && index%2 === 0 ? 2 : 1,gates,walls,cameras,
    intro:'Verify the rescue markers in order, then fly through the bow opening.'
  };
});
orisonMissions.push(carrierFinale);
campaignBriefs.push(...orisonPlans.map(({chapter,speaker,line}) => [chapter,speaker,line]),['The Rescue','leena','The team is at the hatch. Mark the last safe passage across the bow, then bring the drone home.']);
