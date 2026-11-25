// North Quay's decommissioned ferry warehouse. Alternating bays form a
// continuous flight corridor; padded freight and boat fenders line its edges.
const quayPlans = [
  ['Ferry Intake', 35, 0, [245,180,260], 'Record the ferry intake seals. Cyan padded objects absorb a slow bump.'],
  ['Wet Freight', 37, 65, [178,305,210], 'Follow the dock scanners across the wet freight bays.'],
  ['Fender Alley', 37, 80, [315,165,310], 'Thread the fender-lined aisles and scan the transfer receipts.'],
  ['Sling Deck', 39, 95, [193,327,174], 'Pass the suspended freight frames and record the crane schedule.'],
  ['Customs Annex', 40, 105, [318,204,327], 'Read the annex records and leave before the overnight sweep turns.'],
  ['Pump Gallery', 41, 125, [159,326,177], 'Trace the supplier’s shipments through the pump gallery.'],
  ['Cable Lockers', 42, 150, [299,163,317,222], 'Weave around cable reels to capture the locker tags.'],
  ['Breakwater Hall', 43, 175, [177,309,165,302], 'Work across the exposed face of the breakwater. Expect side gusts.'],
  ['Manifest Cage', 44, 185, [313,182,324,178], 'Record the master ledger inside the freight cage.'],
  ['Tide Gate', 45, 200, [166,330,170,329], 'The tide gate is open. Correct for wind between the divided bays.'],
  ['Black Crane', 47, 225, [331,158,331,169], 'Cameras overlap at the crane. Save a jam for the last two bays.'],
  ['Morrow Terminal', 49, 245, [165,333,160,335], 'Complete the evidence chain at the ferry terminal.']
];
const quayEquipment = ['winch','crane','rack','cargo','pallet','forklift'];
const northQuayMissions = quayPlans.map(([name,seconds,wind,lanes,intro],level) => {
  const start = [72,lanes[0]];
  const exit = [lanes.at(-1),level >= 9 ? 132 : 158];
  const gates = [];
  const walls = [];
  const cameras = [];
  const columns = lanes.length === 3 ? [216,446,685] : [184,372,560,748];
  lanes.forEach((y,i) => {
    const x = columns[i] + ((level*13+i*17)%23)-11;
    const width = 63 + ((level*7+i*19)%23);
    const gap = 77 - Math.floor(level/4)*4;
    const top = y-gap;
    const bottom = y+gap;
    const upperType = quayEquipment[(level+i*2)%quayEquipment.length];
    const lowerType = quayEquipment[(level+i*2+3)%quayEquipment.length];
    gates.push([x,y]);
    walls.push([x-width/2,20,width,top-20,upperType],[x-width/2,bottom,width,480-bottom,lowerType]);
    const bumperY = i%2 ? top : bottom-20;
    walls.push([x-width/2+5,bumperY,width-10,20,i%2 ? 'fender' : 'foam']);
    if ((level+i)%2 === 1 || level>=8) {
      cameras.push([x+(i%2 ? 58 : -58),i%2 ? top+7 : bottom-7,i%2 ? 1.22 : -1.22,level<2 && i===1 ? 'green' : 'red']);
    }
  });
  gates.push([867,exit[0]]);
  if (level>=9) gates.splice(gates.length-1,0,[810,exit[0]]);
  return {name,seconds,start,exit,wind,gates,walls,cameras,intro:intro+' Fly through the east door after the final scan.',quay:true};
});
