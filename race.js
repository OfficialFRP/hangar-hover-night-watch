const racePilots = {
  rook: [['Let’s see who reads the lane faster.','First one through the shutter buys coffee.'],['Nice line. Keep that pace.','You’re making me work for it.'],['That turn cost you. Catch me if you can.','Still looking at my tail lights?']],
  cipher: [['Your telemetry looks predictable. Prove me wrong.','I got a good feeling about this route.'],['Solid correction. Keep it tidy.','Your split just got interesting.'],['I’ve seen faster progress bars.','You’re taking the scenic route.']],
  patch: [['I tuned both rigs myself. No excuses.','Show me what you can do with that airframe.'],['That throttle work was clean.','Good rhythm through those shelves.'],['Careful, or I’ll have to tune your thumbs.','Are you racing or taking inventory?']],
  director: [['This run is off the record.','Let’s see what your training bought you.'],['Excellent clearance. Stay focused.','Good judgment through that gate.'],['I’m putting that split in your file.','You can do better than that.']],
  sable: [['I know every aisle in this building.','Try to keep up with my schedule.'],['You found a good line. I’ll give you that.','Not bad. Make the next one count.'],['Late again. That won’t do.','I’ll be at the shutter when you’re ready.']],
  iman: [['I’ve wanted to race this floor for years.','Let’s put these empty aisles to work.'],['Nice! You took that gap clean.','That’s the line I’d have picked.'],['You’re drifting into my delivery window.','The last pallet moved faster.']],
  reed: [['Keep it clean. The clock is the only opponent.','I’m treating this like a qualification run.'],['Good execution. Finish strong.','You kept your head in that turn.'],['I’m pulling ahead. Show me another gear.','That split won’t make the cut.']]
};
const randomBetween = (min,max) => min + (max-min)*Math.random();
const pick = options => options[Math.floor(Math.random()*options.length)];
function generateRace(playerFrame, previousRival) {
  const rival = pick(Object.keys(racePilots).filter(name => name !== previousRival));
  const frame = pick(fleet.filter(frame => frame !== playerFrame));
  const start = [64,250];
  const exit = [Math.round(randomBetween(168,332)),152];
  const gates = [];
  const walls = [];
  const path = [start];
  const props = ['cargo','rack','pallet','forklift'];
  for (let column=0;column<4;column++) {
    const x = 172 + column*187 + randomBetween(-12,12);
    const y = randomBetween(165,335);
    const gap = randomBetween(75,86);
    const width = randomBetween(58,92);
    gates.push([x,y]);
    walls.push([x-width/2,20,width,y-gap-20,pick(props)]);
    walls.push([x-width/2,y+gap,width,480-y-gap,pick(props)]);
    const line = y+randomBetween(-16,16);
    path.push([x-width/2-25,line],[x+width/2+25,line]);
  }
  path.push([902,exit[0]],[971,exit[0]]);
  const speed = randomBetween(99,119);
  const splits = [0];
  for (let i=1;i<path.length;i++) {
    const [x,y] = path[i];
    const [px,py] = path[i-1];
    splits.push(splits[i-1]+Math.hypot(x-px,y-py)/(speed*randomBetween(.87,1.12)));
  }
  return {
    rival,frame,path,splits,finishTime:splits[splits.length-1],
    course:{name:'Warehouse Sprint',seconds:38,start,exit,gates,walls,wind:0,
      intro:'Fly through the four checkpoints in order, then cross the east shutter. Fastest time wins.'}
  };
}
function rivalPosition(race,time) {
  const next = race.splits.findIndex(split => split > time);
  if (next < 0) return null;
  const ratio = (time-race.splits[next-1])/(race.splits[next]-race.splits[next-1]);
  const [x,y] = race.path[next-1];
  const [nx,ny] = race.path[next];
  return [x+(nx-x)*ratio,y+(ny-y)*ratio,Math.atan2(ny-y,nx-x)+Math.PI/2];
}
