// Structures use [x, y, width, height, artwork]. Cameras use [x, y, heading].
const courses = [
  {name:'Workshop', seconds:32, start:[94,250], pad:[855,250],
   gates:[[255,145],[480,115],[720,245]], walls:[[325,205,270,108,'hangar'],[655,340,140,70,'cargo'],[115,350,140,70,'cargo']], cameras:[[211,74,1.15,'green']], intro:'Hold in each numbered reticle to record intel, then hover over the pad. Green feeds record faster.'},
  {name:'Loading Bay', seconds:30, start:[94,405], pad:[860,100],
   gates:[[255,410],[480,80],[700,409]], walls:[[310,155,110,345,'cargo'],[545,0,100,336,'cargo'],[750,202,210,65,'hangar'],[75,55,120,145,'cargo']], cameras:[[239,199,1.52,'green'],[483,162,-1.25,'red']], intro:'Survey the loading lanes. Red cameras drain your battery while their beams track you.'},
  {name:'Crosswind', seconds:27, start:[90,110], pad:[865,410],
   gates:[[240,100],[470,378],[696,104]], walls:[[315,0,90,295,'hangar'],[530,195,109,305,'hangar'],[770,175,190,98,'tower'],[112,278,110,125,'cargo']], cameras:[[198,193,-1.4,'green'],[691,331,1.2,'red']], wind:true, intro:'Gusts push the drone sideways on this exposed service road.'},
  {name:'Rail Yard', seconds:34, start:[86,250], pad:[867,242],
   gates:[[235,125],[478,355],[716,133],[811,247]], walls:[[286,0,110,300,'train'],[560,206,108,294,'train'],[768,320,126,82,'cargo'],[95,333,130,80,'cargo']], cameras:[[440,90,1.3,'red'],[780,300,-1.25,'green']], intro:'Scan the rail sidings. Move through camera beams quickly or wait outside their sweep.'},
  {name:'Floodworks', seconds:34, start:[92,104], pad:[866,400],
   gates:[[235,123],[448,362],[684,113],[737,366]], walls:[[278,0,104,291,'water'],[503,192,120,308,'water'],[770,0,112,260,'tank'],[80,260,129,119,'tank']], cameras:[[441,210,1.6,'green'],[665,222,-1.4,'red']], intro:'Survey the reservoir and pump house. The basins and tanks are out of bounds.'},
  {name:'Relay Station', seconds:36, start:[92,392], pad:[873,98],
   gates:[[238,383],[459,119],[695,387],[724,113]], walls:[[284,187,116,313,'tower'],[523,0,119,319,'hangar'],[768,196,192,92,'tower'],[92,75,120,122,'tank']], cameras:[[449,242,1.45,'red'],[686,225,-1.3,'green'],[845,145,.65,'red']], wind:true, intro:'Map the relay network and extract through the north gate. Watch for gusts and overlapping patrols.'},
  {name:'Blackout Terminal', seconds:39, start:[85,128], pad:[871,389],
   gates:[[232,121],[446,382],[671,115],[752,371],[851,338]], walls:[[279,0,111,312,'hangar'],[504,182,106,318,'cargo'],[774,0,118,247,'tower'],[95,263,130,121,'train'],[773,438,142,62,'tank']], cameras:[[423,143,1.3,'green'],[689,227,-1.45,'red'],[845,277,1.6,'red']], intro:'Recover the terminal survey. Watch the last camera as you approach the extraction pad.'},
  {name:'Gale Warehouse', seconds:48, start:[78,246], exit:[250,156], wind:260,
   gates:[[192,245],[369,125],[542,249],[712,378],[835,250]],
   walls:[[116,127,43,70,'fan'],[142,324,55,47,'drum'],[232,202,52,56,'drum'],[251,331,72,48,'fan'],
     [289,45,48,38,'drum'],[350,221,62,45,'fan'],[365,361,43,52,'drum'],[441,93,54,43,'fan'],
     [464,303,63,41,'drum'],[528,136,54,53,'fan'],[582,55,66,47,'drum'],[596,275,56,56,'fan'],
     [647,152,56,49,'drum'],[683,447,62,37,'fan'],[742,263,56,57,'fan'],[754,100,68,38,'drum'],
     [845,351,46,53,'drum'],[882,115,52,47,'fan'],[891,326,44,52,'fan']],
   cameras:[[314,287,-1.6,'green'],[671,267,1.3,'red'],[873,72,1.3,'red']],
   intro:'Ride out strong crosswinds, scan five targets, then fly straight through the east loading door.'},
  ...chapters
];

const fleet = [
  {name:'Scout S1', color:'#8fffd2', thrust:455, battery:0, brake:9, size:17, exposure:1, arms:10, rotor:5, windResponse:1, desc:'Balanced handling'},
  {name:'Swift X2', color:'#ffc27d', thrust:590, battery:-3, brake:9.5, size:15, exposure:1.18, arms:8, rotor:5, windResponse:1.1, desc:'Fastest frame · shorter battery'},
  {name:'Warden L3', color:'#aebeff', thrust:395, battery:7, brake:10.5, size:18, exposure:.72, arms:13, rotor:7, windResponse:.55, desc:'Extended props · steadier in gusts'},
  {name:'Aurel G7', color:'#ffd771', thrust:414, battery:12, brake:15, size:17, exposure:.84, arms:13, rotor:7, windResponse:.21, stability:2.55, desc:'Gold endurance frame · long battery and low drift'},
  {name:'Vector B9', color:'#66caff', thrust:507, battery:5, brake:17, size:16, exposure:.78, arms:12, rotor:7, windResponse:.13, stability:2.8, desc:'Blue ducted frame · tight turns and gust resistance'}
];
const upgrades = [
  {name:'Extended battery', description:'+4 seconds per tier', cost:100, max:3},
  {name:'Motor tuning', description:'+7% thrust per tier', cost:125, max:3},
  {name:'Stabilizer', description:'Stronger braking and easier landings', cost:100, max:3}
];
const saveKey = 'hangar-hover-night-watch-v1';
function loadProgress() {
  const initial = {credits:100, cleared:[], selected:0, levels:fleet.map(() => [0,0,0])};
  try {
    const saved = JSON.parse(localStorage.getItem(saveKey));
    if (!saved) return initial;
    return {...initial,...saved,levels:fleet.map((_,index) => saved.levels?.[index] ?? [0,0,0])};
  }
  catch { return initial; }
}
let progress = loadProgress();
function saveProgress() {
  try { localStorage.setItem(saveKey,JSON.stringify(progress)); } catch {}
}
// Each mission can place one optional battery cell at [x, y].
const chargeCells = [null,[467,252],[454,270],[451,241],[707,293],[447,277],[730,283],[562,391],[440,238],[586,365],[587,346],[575,342]];
const spriteBounds = [[8, 20, 284, 260], [308, 24, 284, 252], [608, 25, 284, 249], [91, 308, 117, 284], [391, 308, 117, 284], [671, 308, 158, 284], [8, 658, 284, 184], [308, 656, 284, 188], [608, 612, 284, 276]];
const storyAtlas = new Image();
storyAtlas.src = 'assets/specialty-drones.webp';
const fleetArt = new Image();
fleetArt.src = 'assets/fleet-night.webp';
const atlas = new Image();
atlas.src = 'assets/sprite-atlas.webp';
function drawSprite(surface,index,x,y,w,h) {
  if (!atlas.complete || !atlas.naturalWidth) return false;
  surface.drawImage(atlas,...spriteBounds[index],x,y,w,h);
  return true;
}

const music = new Audio('assets/night-spy.mp3');
music.loop = true;
music.volume = .30;
const effects = Object.fromEntries(['launch','scan','jam','drain','charge','crash','complete','throttle','brake','land','race-win'].map(name => {
  const effect = new Audio('assets/' + name + '.wav');
  effect.volume = .64;
  return [name,effect];
}));
let soundEnabled = false;
function sound(name) {
  if (!soundEnabled) return;
  const player = effects[name];
  player.currentTime = 0;
  player.play().catch(() => {});
}

const get = selector => document.querySelector(selector);
const canvas = get('#field canvas');
const ctx = canvas.getContext('2d');
const overlay = get('.overlay');
const action = get('#action');
const keyboard = new Set();
const pointers = new Map();
const touchButtons = [...document.querySelectorAll('[data-key]')];
const courseButtons = courses.map((mission,index) => {
  const button = document.createElement('button');
  button.textContent = mission.name;
  button.addEventListener('click',() => {reset(index); showPage('flight');});
  get('#mission-list').append(button);
  return button;
});
const frameButtons = fleet.map((frame,index) => {
  const button = document.createElement('button');
  button.className = 'frame-option';
  button.addEventListener('click',() => {
    if (state === 'flying' || state === 'paused') return;
    progress.selected = index;
    saveProgress();
    reset(courseIndex,false,storyFlight);
  });
  get('#fleet').append(button);
  return button;
});
const modButtons = upgrades.map((upgrade,index) => {
  const button = document.createElement('button');
  button.addEventListener('click',() => buyUpgrade(index));
  const card = document.createElement('article');
  card.className = 'upgrade-option';
  const info = document.createElement('div');
  card.append(info,button);
  get('#mods').append(card);
  return {button,info};
});
let courseIndex, course, drone, elapsed, gate, landing, state, nextAction, record, airframe, stats, drained, cameraSignal, terrain;
let jam, jamsLeft, scan, cellCollected;
let missionPage = 0;
const missionsPerPage = 4;
const pageButtons = [...document.querySelectorAll('[data-page]')];
let currentPage = 'flight';
let storyFlight = false;
let race;
let nextRaceCall;
let raceCallouts = 0;
let wasBraking = false;
function raceLine(group) {
  const pool = racePilots[race.rival][group];
  const line = pick(pool.filter(quote => quote !== race.lastLine));
  race.lastLine = line;
  return line;
}
function selectRace() {
  race = generateRace(fleet[progress.selected],race?.rival);
  const [name,role,portrait] = crew[race.rival];
  get('#racePortrait').src = 'assets/crew-expression-' + portrait + '.webp';
  get('#racePortrait').alt = name;
  get('#raceSpeaker').textContent = name + ' · ' + role;
  get('#raceQuote').textContent = '“' + raceLine(0) + '”';
  get('#raceMatch').textContent = 'You versus ' + race.frame.name;
  reset(-1);
  showPage('race');
}
function concludeRace(cleared,message) {
  const time = race.finishTime;
  const won = cleared && elapsed < time;
  state = won ? 'won' : 'lost';
  sound(won ? 'race-win' : cleared ? 'complete' : 'crash');
  const quote = raceLine(won ? 1 : 2);
  const score = cleared ? 'Your time ' + elapsed.toFixed(2) + ' s · Rival ' + time.toFixed(2) + ' s.' : message + ' Rival target ' + time.toFixed(2) + ' s.';
  menu(won ? 'Race won' : cleared ? 'Rival wins' : 'Run ended',score+' “'+quote+'”','New matchup',selectRace);
}

let storyLines = [];
let lineIndex = 0;
let sceneTitle;
let afterDialogue;
let lastLineAction;

function renderStory() {
  const [speaker,dialogue] = storyLines[lineIndex];
  get('#storyTitle').textContent = sceneTitle;
  const image = get('#portrait');
  image.hidden = !speaker;
  const scene = get('.story-scene');
  scene.classList.toggle('credits-scene',!speaker);
  if (speaker) {
    const [name,role,portrait] = crew[speaker];
    const variant = speaker === 'rook' && sceneTitle.includes('Sable’s Signature') ? 7 : portrait;
    image.src = 'assets/crew-' + (storyLines.length > 1 ? 'expression-' : '') + variant + '.webp';
    image.alt = name + ', ' + role;
    get('#speaker').textContent = name + ' · ' + role;
  } else {
    get('#speaker').textContent = '';
  }
  const dialogueNode = get('#dialogue');
  dialogueNode.textContent = dialogue;
  if (!speaker && dialogueNode.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dialogueNode.getAnimations().forEach(animation => animation.cancel());
    dialogueNode.animate([{opacity:0,transform:'translateY(7px)'},{opacity:1,transform:'translateY(0)'}],{duration:650,easing:'ease-out'});
  }
  get('#storyStep').textContent = (lineIndex+1) + ' / ' + storyLines.length;
  get('#storyBack').disabled = lineIndex === 0;
  get('#storyNext').textContent = lineIndex < storyLines.length-1 ? 'Continue' : lastLineAction;
}
function presentScene(title,lines,label,callback) {
  sceneTitle = title;
  storyLines = lines;
  lineIndex = 0;
  lastLineAction = label;
  afterDialogue = callback;
  showPage('story');
}
function startBriefing(index) {
  const [chapter,speaker,line] = campaignBriefs[index];
  presentScene(chapter + ' / ' + courses[index].name,[[speaker,line]],'Open flight deck',() => {
    reset(index,false,true);
    showPage('flight');
  });
}
function resumeCampaign() {
  const index = Math.min(progress.campaignNext || 0,courses.length);
  if (campaignReveals[index] && (index === courses.length || progress.campaignRevealed !== index)) {
    const {title,lines} = campaignReveals[index];
    presentScene(title,lines,index === courses.length ? 'Mission select' : 'Next chapter',() => {
      if (index === courses.length) {showPage('missions'); return;}
      progress.campaignRevealed = index;
      saveProgress();
      startBriefing(index);
    });
  } else if (storyFlight && courseIndex === index && (state === 'ready' || state === 'paused' || state === 'flying' || state === 'lost')) {
    showPage('flight');
  } else {
    startBriefing(index);
  }
}

function showPage(page) {
  if (page !== 'flight' && state === 'flying') togglePause();
  currentPage = page;
  pageButtons.forEach(button => {
    const selected = button.dataset.page === (page === 'flight' ? (courseIndex === -1 ? 'race' : storyFlight ? 'story' : 'missions') : page);
    button.setAttribute('aria-pressed',selected);
    get('#page-' + button.dataset.page).hidden = button.dataset.page !== page;
  });
  get('#page-flight').hidden = page !== 'flight';
  if (page === 'flight') hud();
  if (page === 'story') renderStory();
  if (page === 'missions') {
    missionPage = Math.max(0,Math.floor(courseIndex/missionsPerPage));
    renderMissionPage();
  }
}
function renderMissionPage() {
  const last = Math.ceil(courses.length/missionsPerPage)-1;
  courseButtons.forEach((button,index) => button.hidden = Math.floor(index/missionsPerPage) !== missionPage);
  get('#missionPage').textContent = (missionPage+1) + ' / ' + (last+1);
  get('#prevMission').disabled = missionPage === 0;
  get('#nextMission').disabled = missionPage === last;
}
function activateJam() {
  if (currentPage !== 'flight' || state !== 'flying' || jam > 0 || jamsLeft === 0) return;
  jamsLeft--;
  jam = 2.5;
  sound('jam');
}


function buyUpgrade(index) {
  const modules = progress.levels[progress.selected];
  const upgrade = upgrades[index];
  const cost = upgrade.cost * (modules[index]+1);
  if (state === 'flying' || state === 'paused' || modules[index] >= upgrade.max || progress.credits < cost) return;
  progress.credits -= cost;
  modules[index]++;
  saveProgress();
  reset(courseIndex,false,storyFlight);
  get('#purchaseStatus').textContent = upgrade.name + ' installed on ' + airframe.name + '. ' + progress.credits + ' credits left.';
}
function renderHangar() {
  const active = state === 'flying' || state === 'paused';
  get('#campaign').textContent = progress.cleared.length + ' / ' + courses.length + ' missions cleared';
  renderLoadout();
  get('#upgradeTitle').textContent = airframe.name + ' upgrades';
  get('#funds').textContent = progress.credits.toLocaleString() + ' credits';
  get('#wallet').textContent = progress.credits.toLocaleString() + ' CR';
  get('#loadoutName').textContent = airframe.name;
  get('#loadoutStats').textContent = stats.seconds + ' s battery · ' + Math.round(stats.thrust) + ' thrust · ' + stats.brake.toFixed(1) + ' braking';
  get('#purchaseStatus').textContent = active ? 'Finish or restart the mission to change your loadout.' : '';
  courseButtons.forEach((button,index) => {
    button.textContent = String(index+1).padStart(2,'0') + '  ' + courses[index].name + (progress.cleared.includes(index) ? '  ✓' : '');
    button.setAttribute('aria-pressed',index === courseIndex);
  });
  frameButtons.forEach((button,index) => {
    const frame = fleet[index];
    const selected = index === progress.selected;
    button.disabled = active;
    button.setAttribute('aria-pressed',selected);
    button.innerHTML = '<strong>' + frame.name + '</strong><small>' + frame.desc + '</small><span>' + (selected ? '✓ EQUIPPED' : 'EQUIP') + '</span>';
  });
  modButtons.forEach(({button,info},index) => {
    const upgrade = upgrades[index];
    const level = progress.levels[progress.selected][index];
    const cost = upgrade.cost * (level+1);
    info.innerHTML = '<strong>' + upgrade.name + '</strong><small>' + upgrade.description + '</small><span>Tier ' + level + ' / ' + upgrade.max + '</span>';
    const shortfall = cost - progress.credits;
    button.textContent = level === upgrade.max ? 'Maxed' : shortfall > 0 ? 'Need ' + shortfall + ' CR more' : 'Buy next tier · ' + cost + ' CR';
    button.setAttribute('aria-label',upgrade.name + ': ' + button.textContent);
    button.disabled = active || level >= upgrade.max || progress.credits < cost;
  });
}

function storedBest() {
  try { return Number(localStorage.getItem('hangar-hover-best-' + courseIndex)) || 0; }
  catch { return 0; }
}
function clearInputs() {
  keyboard.clear();
  pointers.clear();
  touchButtons.forEach(button => button.classList.remove('held'));
}
function menu(title, message, label, callback) {
  get('#headline').textContent = title;
  get('#brief').textContent = message;
  action.textContent = label;
  nextAction = callback;
  overlay.hidden = false;
}
function reset(index, fly = false, chapterFlight = false) {
  storyFlight = chapterFlight;
  courseIndex = index;
  course = index === -1 ? race.course : courses[index];
  nextRaceCall = 3;
  raceCallouts = 0;
  wasBraking = false;
  get('#raceLive').hidden = index !== -1;
  if (index === -1) get('#raceLive').textContent = crew[race.rival][0] + ' · “' + raceLine(0) + '”';
  const [x,y] = course.start;
  drone = {x,y,vx:0,vy:0,angle:0};
  elapsed = gate = landing = drained = 0;
  cameraSignal = '';
  jam = scan = 0;
  jamsLeft = 2;
  cellCollected = false;
  terrain = paintTerrain();
  airframe = fleet[progress.selected];
  const [battery,motors,stabilizer] = progress.levels[progress.selected];
  stats = {seconds:course.seconds + airframe.battery + battery*4, thrust:airframe.thrust * (1+.07*motors),
    brake:airframe.brake + 2*stabilizer, landingSpeed:38+6*stabilizer};
  record = index === -1 ? 0 : storedBest();
  clearInputs();
  state = fly ? 'flying' : 'ready';
  renderHangar();
  if (fly) {
    sound('launch');
    overlay.hidden = true;
    action.blur();
  } else menu(course.name, course.intro, 'Launch drone', () => reset(index,true,storyFlight));
}
function finish(won, message) {
  if (courseIndex === -1) {concludeRace(won,message); return;}
  state = won ? 'won' : 'lost';
  sound(won ? 'complete' : 'crash');
  if (won && (!record || elapsed < record)) {
    record = elapsed;
    try { localStorage.setItem('hangar-hover-best-' + courseIndex, String(record)); } catch {}
  }
  if (won) {
    const firstClear = !progress.cleared.includes(courseIndex);
    const payout = firstClear ? 150 : 50;
    if (firstClear) progress.cleared.push(courseIndex);
    progress.credits += payout;
    if (storyFlight) progress.campaignNext = Math.max(progress.campaignNext || 0,courseIndex+1);
    saveProgress();
    message += ' +' + payout + ' credits.';
  }
  renderHangar();
  const hasNext = won && courseIndex < courses.length - 1;
  if (won && storyFlight) {
    const reveal = campaignReveals[courseIndex+1];
    const title = hasNext ? 'Intel secured' : 'MISSION ACCOMPLISHED';
    menu(title,message,reveal ? (hasNext ? 'Chapter reveal' : 'Epilogue') : 'Next briefing',resumeCampaign);
  } else {
    menu(won ? (course.exit ? 'Intel secured' : 'Touchdown!') : 'Flight ended',
      message,won ? 'Mission select' : 'Fly again',
      () => {
        if (won) showPage('missions');
        else reset(courseIndex,true,storyFlight);
      });
  }
}
function togglePause() {
  if (state === 'paused') {
    state = 'flying';
    overlay.hidden = true;
    action.blur();
  } else if (state === 'flying') {
    clearInputs();
    state = 'paused';
    menu('Flight paused','Your battery timer is paused.','Resume',togglePause);
  }
}
const pressed = (...keys) => keys.some(key => keyboard.has(key) || [...pointers.values()].includes(key));
const clamp = (value,min,max) => Math.max(min,Math.min(value,max));
// Flight physics. Steering changes velocity, so the drone drifts after release.
function update(dt) {
  elapsed += dt;
  jam = Math.max(0,jam-dt);
  const dx = +pressed('ArrowRight','d') - +pressed('ArrowLeft','a');
  const dy = +pressed('ArrowDown','s') - +pressed('ArrowUp','w');
  const diagonal = Math.max(1,Math.hypot(dx,dy));
  const braking = pressed(' ');
  if (braking && !wasBraking) sound('brake');
  wasBraking = braking;
  flightAudio(Math.hypot(drone.vx,drone.vy),Boolean(dx || dy),braking,true);
  if (courseIndex === -1 && elapsed >= nextRaceCall && raceCallouts < 4) {
    nextRaceCall += 3.2;
    raceCallouts++;
    const rival = rivalPosition(race,elapsed);
    const ahead = rival && drone.x >= rival[0];
    get('#raceLive').textContent = crew[race.rival][0] + ' · “' + raceLine(ahead || raceCallouts % 2 === 0 ? 1 : 2) + '”';
  }
  const gust = course.wind ? (course.wind === true ? 120 : course.wind) * airframe.windResponse : 0;
  const wind = gust * Math.sin(elapsed * 2.3);
  const crosswind = course.exit ? gust*.76 * Math.sin(elapsed*1.47+.8) : 0;
  const drag = Math.exp(-(braking ? stats.brake : ((dx || dy) ? 1.9 : airframe.stability || 1.9)) * dt);
  drone.vx = (drone.vx + (dx * stats.thrust / diagonal + wind) * dt) * drag;
  drone.vy = (drone.vy + (dy * stats.thrust / diagonal + crosswind) * dt) * drag;
  drone.x += drone.vx * dt;
  drone.y += drone.vy * dt;
  drone.angle = drone.vx / 500;
  const {x,y,vx,vy} = drone;
  const radius = airframe.size;
  const hitWall = course.walls.some(wall => touchesStructure(wall,x,y,radius));
  const doorOpen = course.exit && gate === course.gates.length &&
    Math.abs(y-course.exit[0]) < course.exit[1]/2-radius;
  if (hitWall || x<radius || (x>960-radius && !doorOpen) || y<radius || y>500-radius)
    return finish(false,'The drone hit an obstacle. Brake before tight turns.');
  // Use the strongest visible signal so overlapping red beams do not stack.
  const previousSignal = cameraSignal;
  cameraSignal = '';
  for (const [index,camera] of (course.cameras || []).entries()) {
    if ((camera[3] === 'red' && jam > 0) || !inBeam(camera,index,x,y)) continue;
    cameraSignal = camera[3];
    if (cameraSignal === 'red') break;
  }
  if (cameraSignal === 'red') {
    if (previousSignal !== 'red') sound('drain');
    drained += 2.5 * airframe.exposure * dt;
  }
  const cell = chargeCells[courseIndex];
  const chargeSpent = elapsed + drained;
  if (cell && !cellCollected && chargeSpent >= 4 && Math.hypot(x-cell[0],y-cell[1]) < 21) {
    drained -= 4;
    cellCollected = true;
    sound('charge');
  }
  if (elapsed + drained >= stats.seconds) {
    return finish(false, cameraSignal === 'red' ? 'Battery depleted under a red camera. Break its line of sight.' : 'Battery depleted. Press R or fly again.');
  }
  const target = course.gates[gate];
  const onTarget = target && Math.hypot(x-target[0],y-target[1]) < 29;
  scan = onTarget ? scan + dt*(cameraSignal === 'green' ? 1.6 : 1) : 0;
  if (scan >= .24 || (courseIndex === -1 && onTarget)) {
    gate++;
    scan = 0;
    sound('scan');
  }
  if (course.exit) {
    if (doorOpen && x >= 960) finish(true,'All ' + course.gates.length + ' targets recorded. Warehouse cleared in ' + elapsed.toFixed(1) + ' seconds.');
    return;
  }
  const [px,py] = course.pad;
  const steady = gate === course.gates.length && Math.hypot(x-px,y-py) < 29 && Math.hypot(vx,vy) < stats.landingSpeed;
  landing = steady ? landing + dt : 0;
  if (landing >= 0.65) {
    sound('land');
    finish(true,'Targets recorded and drone extracted in ' + elapsed.toFixed(1) + ' seconds.');
  }
}
const beamReach = 155;
const beamWidth = .34;
function beamHeading(camera,index) {
  return camera[2] + .85*Math.sin(elapsed*1.3+index*1.8);
}
function inBeam(camera,index,x,y) {
  const dx = x-camera[0], dy = y-camera[1];
  const delta = Math.atan2(dy,dx)-beamHeading(camera,index);
  if (Math.hypot(dx,dy) > beamReach || Math.cos(delta) < Math.cos(beamWidth)) return false;
  // Sample the short sightline so a solid structure can shield the drone.
  for (let t=.08;t<1;t+=.08) {
    const sx = camera[0]+dx*t, sy = camera[1]+dy*t;
    if (blockedAt(sx,sy)) return false;
  }
  return true;
}
function circle(x,y,r, surface = ctx) {
  surface.beginPath();
  surface.arc(x,y,r,0,Math.PI*2);
}
function label(content,x,y,color = '#d7e9ee',size = 14) {
  ctx.fillStyle = color;
  ctx.font = 'bold ' + size + 'px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(content,x,y);
}
// Canvas artwork is drawn to scale with the actual collision geometry.
function cornerRadius(w,h,type) {
  return Math.min(w,h) * (type === 'fan' || type === 'drum' ? .47 : type === 'rack' ? .08 : .16);
}
function touchesStructure([x,y,w,h,type],px,py,radius = 0) {
  const corner = cornerRadius(w,h,type);
  return Math.hypot(px-clamp(px,x+corner,x+w-corner),py-clamp(py,y+corner,y+h-corner)) < corner+radius;
}

// Mix warehouse props and legacy freight art across the campaign.
const warehouseVariants = {
  Workshop: {2:'pallet'}, 'Loading Bay': {2:'forklift'}, 'Rail Yard': {3:'pallet'},
  'Blackout Terminal': {1:'rack'}, 'Intake Dock': {0:'cargo',1:'cargo',2:'train',4:'cargo'},
  'Cold Storage': {0:'cargo',2:'cargo',3:'train',4:'cargo',5:'cargo'},
  'Sorting Floor': {2:'cargo',3:'train',4:'cargo',5:'cargo',6:'cargo'},
  'Outbound Vault': {1:'cargo',3:'train',4:'cargo',5:'cargo',6:'cargo',7:'train'}
};
function surfacePanel(ctx,x,y,w,h,top,bottom,radius = 3) {
  const depth = ctx.createLinearGradient(x,y,x,y+h);
  depth.addColorStop(0,top);
  depth.addColorStop(1,bottom);
  ctx.fillStyle = depth;
  ctx.beginPath();
  ctx.roundRect(x,y,w,h,radius);
  ctx.fill();
}
function hazardCone(ctx,x,y) {
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = '#08090e99';
  ctx.fillRect(-4,0,12,9);
  ctx.fillStyle = '#342b33';
  ctx.fillRect(-6,-3,12,11);
  circle(0,0,5.2,ctx);
  ctx.fillStyle = '#f16a31';
  ctx.fill();
  circle(-1,-1,3.5,ctx);
  ctx.fillStyle = '#ffe4be';
  ctx.fill();
  circle(-1.6,-2,2,ctx);
  ctx.fillStyle = '#ff9860';
  ctx.fill();
  ctx.restore();
}
function reservoir(ctx,w,h) {
  surfacePanel(ctx,5,6,w-10,h-12,'#6e8d9c','#253a47',10);
  surfacePanel(ctx,12,13,w-24,h-26,'#133c51','#061b31',7);
  const water = ctx.createLinearGradient(10,0,w-9,h);
  water.addColorStop(0,'#277f9c');
  water.addColorStop(.46,'#0d506c');
  water.addColorStop(1,'#182c58');
  ctx.fillStyle = water;
  ctx.beginPath();
  ctx.roundRect(17,18,w-34,h-36,5);
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let row=23;row<h-16;row+=7) {
    ctx.lineWidth = row%3 === 0 ? 1.4 : .65;
    ctx.strokeStyle = row%3 === 0 ? '#8cfaff80' : '#40a8c94a';
    ctx.beginPath();
    for (let col=15;col<w-14;col+=3) {
      const y = row+3*Math.sin(col/10+row*.24)+Math.cos(col/4+row*.28);
      if (col === 15) ctx.moveTo(col,y);
      else ctx.lineTo(col,y);
    }
    ctx.stroke();
  }
  ctx.restore();
  for (const x of [9,w-11]) {
    ctx.fillStyle = '#182b37';
    ctx.fillRect(x,18,3,h-36);
    for (let y=22;y<h-18;y+=18) {
      ctx.fillStyle = '#c4e3e6';
      ctx.fillRect(x,y,3,2);
    }
  }
  surfacePanel(ctx,w*.34,h*.47,w*.32,24,'#788c91','#283941',4);
  for (let x=w*.38;x<w*.64;x+=5) {
    ctx.fillStyle = '#111d27';
    ctx.fillRect(x,h*.47+4,2,16);
  }
}
function warehouseProp(ctx,w,h,type) {
  surfacePanel(ctx,5,6,w-10,h-12,'#384757','#111b29',7);
  if (type === 'forklift') {
    const wide = w >= h;
    ctx.save();
    ctx.translate(w/2,h/2);
    if (!wide) ctx.rotate(Math.PI/2);
    const length = Math.max(w,h);
    const width = Math.min(w,h);
    ctx.translate(-length/2,-width/2);
    for (const x of [length*.19,length*.58]) for (const y of [width*.22,width*.67])
      surfacePanel(ctx,x,y,length*.14,width*.15,'#4a515a','#10151e');
    surfacePanel(ctx,length*.16,width*.27,length*.58,width*.47,'#ffc46e','#8f4b27',5);
    surfacePanel(ctx,length*.36,width*.32,length*.27,width*.36,'#4b6673','#1a2733',3);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#f1c583';
    ctx.strokeRect(length*.36,width*.32,length*.27,width*.36);
    surfacePanel(ctx,length*.71,width*.24,length*.07,width*.55,'#8c9fa9','#343b44');
    for (const y of [width*.34,width*.61]) surfacePanel(ctx,length*.76,y,length*.19,width*.055,'#d2d9dd','#616f77',1);
    ctx.restore();
    return;
  }
  const rows = Math.max(1,Math.floor((h-16)/23));
  const rowHeight = (h-16)/rows;
  for (let row=0;row<rows;row++) {
    const y = 8+row*rowHeight;
    surfacePanel(ctx,8,y,w-16,rowHeight-3,'#b5916a','#614532');
    for (let x=10;x<w-9;x+=8) {
      ctx.fillStyle = '#3f29264e';
      ctx.fillRect(x,y+2,1,rowHeight-6);
    }
    const carton = (w-20)*(.29+(row%3)*.10);
    surfacePanel(ctx,w*.17,y+2,carton,Math.max(4,rowHeight-8),'#ecd099','#926343');
    ctx.fillStyle = '#f6e3ae';
    ctx.fillRect(w*.19+carton*.45,y+3,2,Math.max(2,rowHeight-10));
  }
  if (type === 'rack') {
    for (const x of [5,w-10]) surfacePanel(ctx,x,5,5,h-10,'#ffad53','#7f492d',1);
  }
}
function structure(ctx,[x,y,w,h,footprint],art = footprint) {
  const type = art;
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = '#070e14aa';
  const rounding = cornerRadius(w,h,footprint);
  ctx.beginPath();
  ctx.roundRect(6,8,w,h,rounding);
  ctx.fill();
  const flank = ctx.createLinearGradient(0,h-8,w,h+8);
  flank.addColorStop(0,'#293843');
  flank.addColorStop(.65,'#0d1b29');
  flank.addColorStop(1,'#111020');
  ctx.fillStyle = flank;
  ctx.beginPath();
  ctx.roundRect(2,7,w+4,h,rounding);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(0,0,w,h,rounding);
  ctx.clip();
  const colors = {hangar:'#334a54',cargo:'#675449',tower:'#444863',train:'#3b5960',water:'#153e4f',tank:'#535c60',fan:'#49676b',drum:'#875e4d',rack:'#304047',pallet:'#8d6446',forklift:'#c18c44'};
  const steel = ctx.createLinearGradient(0,0,w,h);
  steel.addColorStop(0,colors[type]);
  steel.addColorStop(.46,colors[type]);
  steel.addColorStop(1,'#15151d');
  ctx.fillStyle = steel;
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle = '#fff2e32e';
  ctx.fillRect(3,3,w-6,4);
  ctx.fillStyle = '#3cf8f061';
  ctx.fillRect(5,7,3,Math.max(0,h-20));
  ctx.fillStyle = '#ed55d54a';
  ctx.fillRect(w-7,8,3,Math.max(0,h-20));
  ctx.fillStyle = '#07070c88';
  ctx.fillRect(3,h-8,w-6,5);
  ctx.strokeStyle = '#98b5bc88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1,1,w-2,h-2,rounding);
  ctx.stroke();
  ctx.strokeStyle = '#abbec72e';
  ctx.lineWidth = 1;
  if (type === 'rack' || type === 'pallet' || type === 'forklift') {
    warehouseProp(ctx,w,h,type);
    ctx.restore();
    return;
  }
  if (type === 'fan' || type === 'drum') {
    const radius = Math.min(w,h)*.4;
    circle(w/2,h/2,radius,ctx);
    ctx.fillStyle = '#131e24';
    ctx.fill();
    ctx.strokeStyle = '#93c0b2';
    ctx.stroke();
    for (let blade=0;blade<6;blade++) {
      const angle = blade*Math.PI/3;
      ctx.beginPath();
      ctx.arc(w/2,h/2,radius*.72,angle,angle+.63);
      ctx.strokeStyle = type === 'fan' ? '#6a9e9a' : '#e2a47c';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
    circle(w/2,h/2,4,ctx);
    ctx.fillStyle = '#ddaa7d';
    ctx.fill();
    ctx.restore();
    return;
  }
  if (type === 'tank') {
    const tank = Math.min(w*.32,h*.21);
    for (const cy of [h*.27,h*.73]) {
      circle(w/2,cy,tank,ctx);
      ctx.fillStyle = '#77858a';
      ctx.fill();
      ctx.stroke();
      circle(w/2,cy,tank*.68,ctx);
      ctx.stroke();
      ctx.fillStyle = '#233137';
      ctx.fillRect(w/2-4,cy-7,8,14);
    }
  } else if (type === 'water') {
    reservoir(ctx,w,h);
  } else if (type === 'tower') {
    const cx = w/2, cy = h/2, r = Math.min(w,h)*.34;
    circle(cx,cy,r,ctx);
    ctx.fillStyle = '#202938';
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#cca7fd';
    ctx.beginPath();
    ctx.arc(cx,cy,r*.78,-2.8,-.3);
    ctx.stroke();
    ctx.fillStyle = '#f49783';
    ctx.fillRect(cx-3,cy-3,6,6);
  } else {
    for (let col=12;col<w-7;col+=12) {
      ctx.beginPath();
      ctx.moveTo(col,7);
      ctx.lineTo(col,h-7);
      ctx.stroke();
    }
    ctx.fillStyle = '#101d26';
    if (type === 'hangar') {
      ctx.fillRect(w*.18,h*.48,w*.64,7);
      ctx.fillStyle = '#77a4a6';
      for (let col=w*.2;col<w*.8;col+=14) ctx.fillRect(col,h*.48,8,3);
    } else if (type === 'train') {
      for (let row=14;row<h-9;row+=18) {
        ctx.fillRect(8,row,9,9);
        ctx.fillRect(w-17,row,9,9);
      }
    } else {
      for (let col=8;col<w-9;col+=18) ctx.fillRect(col,8,7,4);
    }
  }
  ctx.fillStyle = '#e7d9bd80';
  for (const bx of [6,w-8]) for (const by of [6,h-8]) ctx.fillRect(bx,by,2,2);
  ctx.fillStyle = '#111015ad';
  ctx.fillRect(12,h-25,Math.min(w-24,86),14);
  ctx.fillStyle = '#d4c6b0';
  ctx.font = '9px monospace';
  ctx.fillText({hangar:'SERVICE',cargo:'FREIGHT',tower:'RELAY',train:'METRO',water:'BASIN',tank:'PUMP'}[type],18,h-15);
  if (type === 'cargo' || type === 'hangar' || type === 'train') {
    sprayTag(ctx,type === 'train' ? 'AFTER' : type === 'hangar' ? 'NITE' : 'VOID',w/2,h*.32,Math.min(27,w*.23),type === 'cargo' ? '#e88ccb' : '#cfef78');
  }
  const sprite = {cargo:3,train:4,tank:5}[type];
  if (sprite !== undefined) {
    const inset = 5;
    if (w > h) {
      ctx.save();
      ctx.translate(w/2,h/2);
      ctx.rotate(Math.PI/2);
      drawSprite(ctx,sprite,-h/2+inset,-w/2+inset,h-2*inset,w-2*inset);
      ctx.restore();
    } else drawSprite(ctx,sprite,inset,inset,w-2*inset,h-2*inset);
  }
  ctx.restore();
}
function sprayTag(ctx,word,x,y,size,color) {
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(-.12);
  ctx.transform(1,0,-.17,1,0,0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 900 ' + size + 'px system-ui';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#140d1ec9';
  ctx.strokeText(word,0,0);
  ctx.fillStyle = color;
  ctx.fillText(word,0,0);
  for (let i=0;i<12;i++) {
    const dotX = (i*19 % 73)-36;
    const dotY = (i*13 % 33)-16;
    ctx.globalAlpha = .38;
    ctx.fillRect(dotX,dotY,i%3+1,i%4+1);
  }
  ctx.restore();
}
function paintTerrain() {
  const background = document.createElement('canvas');
  background.width = 960;
  background.height = 500;
  const floor = background.getContext('2d');
  const concrete = floor.createLinearGradient(20,0,960,500);
  concrete.addColorStop(0,'#262047');
  concrete.addColorStop(.55,'#152a39');
  concrete.addColorStop(1,'#190f25');
  floor.fillStyle = concrete;
  floor.fillRect(0,0,960,500);
  for (let n=0;n<4800;n++) {
    floor.fillStyle = n%2 ? '#d1b0a20c' : '#00000025';
    floor.fillRect((n*163+Math.floor(n/960)*47)%960,(n*87+Math.floor(n/500)*37)%500,2+n%7,1+n%3);
  }
  floor.strokeStyle = '#a2919630';
  for (let x=24;x<960;x+=96) floor.strokeRect(x,27,96,447);
  floor.strokeStyle = '#080911';
  floor.lineWidth = 8;
  floor.strokeRect(6,6,948,488);
  if (course.exit) {
    const [center,height] = course.exit;
    floor.clearRect(946,center-height/2,14,height);
    floor.fillStyle = '#090e15';
    floor.fillRect(946,center-height/2,14,height);
  }
  floor.fillStyle = '#9c795c72';
  for (let x=24;x<944;x+=24) {
    floor.fillRect(x,16,12,3);
    floor.fillRect(x,481,12,3);
  }
  const graffiti = ['SUBLEVEL','NO SLEEP','LOW SIGNAL','CUT LINE','DEEP END','STATIC','AFTER DARK','GALE WARNING'];
  sprayTag(floor,graffiti[courseIndex] || course.name.toUpperCase(),462,457,47,'#c787b87a');
  for (const [x,y] of [course.start,course.pad || [950,course.exit[0]]]) {
    const light = floor.createRadialGradient(x,y,4,x,y,118);
    light.addColorStop(0,'#cab8ff2e');
    light.addColorStop(1,'#cab8ff00');
    floor.fillStyle = light;
    floor.fillRect(x-118,y-118,236,236);
  }
  const variants = warehouseVariants[course.name] || {};
  course.walls.forEach((wall,index) => {
    structure(floor,wall,variants[index] || wall[4]);
    const [x,y,w,h] = wall;
    if (w >= 65 && h >= 42) {
      hazardCone(floor,x+13,y+h-15);
      hazardCone(floor,x+w-13,y+h-15);
    }
  });
  return background;
}
function drawCamera(camera,index) {
  const [x,y,,kind] = camera;
  const red = kind === 'red';
  const muted = red && jam > 0;
  const color = muted ? '#c293ff' : red ? '#ff657c' : '#8cf5a2';
  const heading = beamHeading(camera,index);
  const beam = ctx.createRadialGradient(x,y,4,x,y,beamReach);
  beam.addColorStop(0,color+(muted ? '30' : '78'));
  beam.addColorStop(1,color+(muted ? '08' : '22'));
  ctx.fillStyle = beam;
  ctx.strokeStyle = color+'8f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x,y);
  for (let i=0;i<=34;i++) {
    const angle = heading-beamWidth+i*beamWidth/17;
    let distance = beamReach;
    for (let length=4;length<beamReach;length+=4) {
      const sx = x+Math.cos(angle)*length;
      const sy = y+Math.sin(angle)*length;
      if (blockedAt(sx,sy)) {distance = length; break;}
    }
    ctx.lineTo(x+Math.cos(angle)*distance,y+Math.sin(angle)*distance);
  }
  ctx.closePath();
  ctx.fill();
  if (red) ctx.stroke();
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(heading);
  ctx.fillStyle = '#0c0a10';
  ctx.fillRect(-9,-7,20,14);
  ctx.fillStyle = '#978e9f';
  ctx.fillRect(-8,-6,13,2);
  ctx.fillStyle = color;
  ctx.fillRect(5,-5,5,10);
  drawSprite(ctx,red ? 6 : 7,-13,-9,26,18);
  ctx.restore();
  label(muted ? '×' : red ? '◆' : '●',x,y-14,color,13);
}
function blockedAt(x,y) {
  return course.walls.some(wall => touchesStructure(wall,x,y));
}
function paintDrone(ctx,frame,spin) {
  const index = fleet.indexOf(frame);
  const size = frame.size*2.25;
  if (index >= 3 && storyAtlas.complete && storyAtlas.naturalWidth) {
    ctx.drawImage(storyAtlas,(index-3)*256,0,256,256,-size/2,-size/2,size,size);
    return;
  }
  if (index < 3 && fleetArt.complete && fleetArt.naturalWidth) {
    ctx.drawImage(fleetArt,index*256,0,256,256,-size/2,-size/2,size,size);
    return;
  }
  if (index < 3 && drawSprite(ctx,index,-size/2,-size/2,size,size)) return;
  const {arms,rotor,color} = frame;
  const body = frame === fleet[1] ? 5 : 7;
  ctx.lineCap = 'round';
  for (const [x,y] of [[-arms,-arms*.65],[arms,-arms*.65],[-arms,arms*.65],[arms,arms*.65]]) {
    ctx.beginPath();
    ctx.moveTo(0,y*.42);
    ctx.lineTo(x,y);
    ctx.strokeStyle = '#101016';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = '#87928f';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    circle(x,y,rotor,ctx);
    ctx.fillStyle = color+'24';
    ctx.fill();
    ctx.strokeStyle = color+'ac';
    ctx.lineWidth = .75;
    ctx.stroke();
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(spin*(x<0 ? 1 : -1) + y);
    ctx.fillStyle = '#d9dfeb';
    ctx.fillRect(-rotor+1,-.7,rotor*2-2,1.4);
    ctx.restore();
    circle(x,y,1.7,ctx);
    ctx.fillStyle = '#101016';
    ctx.fill();
  }
  ctx.beginPath();
  ctx.moveTo(0,-11);
  ctx.lineTo(body,-5);
  ctx.lineTo(body,8);
  ctx.lineTo(body*.55,11);
  ctx.lineTo(-body*.55,11);
  ctx.lineTo(-body,8);
  ctx.lineTo(-body,-5);
  ctx.closePath();
  ctx.fillStyle = '#b8c0cb';
  ctx.fill();
  ctx.strokeStyle = '#17131d';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.fillStyle = '#332e3b';
  ctx.fillRect(-body*.57,-4,body*1.14,8);
  ctx.fillStyle = color;
  ctx.fillRect(-body*.56,5,body*1.12,1.7);
  circle(0,-7,2.4,ctx);
  ctx.fillStyle = '#080b11';
  ctx.fill();
  circle(.6,-7.6,.85,ctx);
  ctx.fillStyle = '#b7f4f7';
  ctx.fill();
}
function renderLoadout() {
  const preview = get('#loadout');
  const surface = preview.getContext('2d');
  surface.clearRect(0,0,440,168);
  surface.save();
  surface.translate(220,80);
  surface.scale(4.3,4.3);
  surface.rotate(-.22);
  paintDrone(surface,airframe,.5);
  surface.restore();
}
function drawWarehouseExit() {
  const [center,height] = course.exit;
  const top = center-height/2;
  const open = gate === course.gates.length;
  ctx.fillStyle = open ? '#9de9d72a' : '#10151e';
  ctx.fillRect(909,top,51,height);
  ctx.fillStyle = open ? '#9de9d7' : '#ed937e';
  ctx.fillRect(947,top-9,13,9);
  ctx.fillRect(947,top+height,13,9);
  if (!open) {
    for (let y=top+4;y<top+height;y+=10) ctx.fillRect(947,y,13,2);
  }
  label(open ? 'EXIT →' : 'SEALED',902,top-16,ctx.fillStyle,13);
  if (open) {
    ctx.strokeStyle = '#a1f8e4';
    ctx.lineWidth = 3;
    for (let y=top+31;y<top+height-10;y+=35) {
      ctx.beginPath();
      ctx.moveTo(916,y-7);
      ctx.lineTo(926,y);
      ctx.lineTo(916,y+7);
      ctx.stroke();
    }
  }
}
function drawLandingPad() {
  const [px,py] = course.pad;
  const armed = gate === course.gates.length;
  ctx.fillStyle = armed ? '#344b2b' : '#263940';
  ctx.fillRect(px-38,py-38,76,76);
  ctx.strokeStyle = armed ? '#c9fa74' : '#78929c';
  ctx.lineWidth = 2;
  ctx.strokeRect(px-38,py-38,76,76);
  ctx.save();
  ctx.globalAlpha = armed ? 1 : .38;
  if (!drawSprite(ctx,8,px-37,py-37,74,74)) label('H',px,py,'#c9fa74',37);
  ctx.restore();
  label(armed ? 'LAND' : 'PAD',px,py+54);
  if (landing > 0) {
    ctx.strokeStyle = '#c9fa74';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(px,py,45,-Math.PI/2,-Math.PI/2+Math.PI*2*Math.min(landing/0.65,1));
    ctx.stroke();
  }
}
function draw() {
  ctx.drawImage(terrain,0,0);
  if (course.exit) {
    const drift = 29 * Math.sin(elapsed * 2.3);
    ctx.strokeStyle = '#aedcc83a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i=0;i<34;i++) {
      const x = (960+i*97+drift)%960;
      const y = (i*53+elapsed*36)%500;
      if (blockedAt(x,y)) continue;
      ctx.moveTo(x,y);
      ctx.lineTo(x+drift*.55,y+7);
    }
    ctx.stroke();
  }
  (course.cameras || []).forEach(drawCamera);
  const cell = chargeCells[courseIndex];
  if (cell && !cellCollected) {
    const [x,y] = cell;
    ctx.fillStyle = '#18152c';
    ctx.fillRect(x-10,y-13,20,26);
    ctx.strokeStyle = '#c6abff';
    ctx.strokeRect(x-10,y-13,20,26);
    label('+',x,y,'#c6abff',16);
  }
  label(courseIndex === -1 ? 'RACE' : 'NODE ' + String(courseIndex+1).padStart(2,'0'),62,27,'#b6d9d5',15);
  label(state === 'flying' ? '● LIVE' : '○ STANDBY',884,27,'#acd2ce',15);
  course.gates.forEach(([x,y], index) => {
    const active = index === gate;
    const color = active ? '#e7ff73' : index < gate ? '#99dfa7' : '#a29aab';
    ctx.lineWidth = active ? 4 : 2;
    ctx.strokeStyle = color;
    for (const [sx,sy] of [[-1,-1],[1,-1],[-1,1],[1,1]]) {
      ctx.beginPath();
      ctx.moveTo(x+sx*15,y+sy*26);
      ctx.lineTo(x+sx*26,y+sy*26);
      ctx.lineTo(x+sx*26,y+sy*15);
      ctx.stroke();
    }
    label(index < gate ? '✓' : 'T' + String(index+1).padStart(2,'0'),x,y-41,color,14);
    label(index < gate ? 'REC' : '＋',x,y,color,12);
    if (active && scan > 0) {
      ctx.fillStyle = color;
      ctx.fillRect(x-21,y+18,42*Math.min(1,scan/.24),3);
    }
  });
  if (course.exit) drawWarehouseExit();
  else drawLandingPad();
  if (jam > 0) {
    const phase = ((2.5-jam)*2)%1;
    ctx.strokeStyle = 'rgba(208,160,255,' + (1-phase)*.65 + ')';
    ctx.lineWidth = 2;
    circle(drone.x,drone.y,25+phase*34);
    ctx.stroke();
  }
  ctx.save();
  if (courseIndex === -1 && state !== 'ready') {
    const rival = rivalPosition(race,elapsed);
    if (rival) {
      ctx.save();
      ctx.translate(rival[0],rival[1]);
      ctx.rotate(rival[2]);
      ctx.globalAlpha = .69;
      paintDrone(ctx,race.frame,elapsed*15);
      ctx.restore();
      label('CPU',rival[0],rival[1]-25,'#f3b9ff',10);
    }
  }
  ctx.translate(drone.x,drone.y);
  ctx.rotate(drone.angle);
  paintDrone(ctx,airframe,elapsed*35);
  ctx.restore();
}
function hud() {
  const battery = Math.max(0,Math.ceil(100*(1-(elapsed+drained)/stats.seconds)));
  get('meter').value = battery;
  get('#power b').textContent = battery + '%';
  get('#gates').textContent = (courseIndex === -1 ? 'Gates ' : 'Intel ') + gate + '/' + course.gates.length;
  get('#time').textContent = elapsed.toFixed(1) + ' s';
  get('#alert').textContent = cameraSignal === 'red' ? '◆ SIGNAL DRAIN' : cameraSignal === 'green' ? '● ALLIED FEED' : '○ SIGNAL CLEAR';
  get('#alert').classList.toggle('danger',cameraSignal === 'red');
  get('#power').classList.toggle('hostile',cameraSignal === 'red');
  get('#jamStatus').textContent = jam > 0 ? 'Jam ' + jam.toFixed(1) + 's' : 'Jams ' + jamsLeft + '/2';
  get('#jam').disabled = state !== 'flying' || jam > 0 || jamsLeft === 0;
  get('#best').textContent = courseIndex === -1 ? (elapsed >= race.finishTime ? 'Rival '+race.finishTime.toFixed(2)+' s' : 'Rival racing') : record ? 'Best ' + record.toFixed(1) + ' s' : 'Best —';
}
const flightKeys = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','w','a','s','d',' '];
window.addEventListener('keydown',event => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (currentPage !== 'flight' || event.altKey || event.ctrlKey || event.metaKey) return;
  if (flightKeys.includes(key) && state === 'flying') {
    event.preventDefault();
    keyboard.add(key);
  }
  if (event.repeat) return;
  if (key === 'p') togglePause();
  if (key === 'r') reset(courseIndex,true,storyFlight);
  if (key === 'c') activateJam();
});
window.addEventListener('keyup',event => keyboard.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener('blur',() => {
  clearInputs();
  if (state === 'flying') togglePause();
});
for (const button of touchButtons) {
  button.addEventListener('pointerdown',event => {
    event.preventDefault();
    if (state !== 'flying') return;
    button.setPointerCapture(event.pointerId);
    pointers.set(event.pointerId,button.dataset.key);
    button.classList.add('held');
  });
  const release = event => {
    pointers.delete(event.pointerId);
    button.classList.toggle('held',[...pointers.values()].includes(button.dataset.key));
  };
  button.addEventListener('pointerup',release);
  button.addEventListener('lostpointercapture',release);
}
pageButtons.forEach(button => button.addEventListener('click',() => button.dataset.page === 'race' ? selectRace() : button.dataset.page === 'story' ? (currentPage === 'story' ? renderStory() : resumeCampaign()) : showPage(button.dataset.page)));
get('#raceFly').addEventListener('click',() => {reset(-1); showPage('flight');});
get('#returnFlight').addEventListener('click',() => showPage('flight'));
get('#storyBack').addEventListener('click',() => {if (lineIndex > 0) {lineIndex--; renderStory();}});
get('#storyNext').addEventListener('click',() => {
  if (lineIndex >= storyLines.length-1) {afterDialogue(); return;}
  const advance = () => {lineIndex++; renderStory();};
  const node = get('#dialogue');
  if (storyLines[lineIndex+1][0] || !node.animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    advance();
    return;
  }
  const fromLines = storyLines;
  const fromLine = lineIndex;
  const button = get('#storyNext');
  button.disabled = true;
  node.animate([{opacity:1},{opacity:0}],{duration:260,easing:'ease-in'}).finished.then(() => {
    button.disabled = false;
    if (currentPage === 'story' && storyLines === fromLines && lineIndex === fromLine) advance();
  },() => {button.disabled = false;});
});
get('#restartStory').addEventListener('click',() => {
  progress.campaignNext = 0;
  progress.campaignRevealed = 0;
  storyFlight = false;
  saveProgress();
  startBriefing(0);
});
get('#prevMission').addEventListener('click',() => {missionPage--; renderMissionPage();});
get('#nextMission').addEventListener('click',() => {missionPage++; renderMissionPage();});
get('#jam').addEventListener('click',activateJam);
get('#openUpgrades').addEventListener('click',() => showPage('upgrades'));
get('#backToHangar').addEventListener('click',() => showPage('hangar'));
get('#audio').addEventListener('click',() => {
  soundEnabled = !soundEnabled;
  get('#audio').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  get('#audio').setAttribute('aria-pressed',soundEnabled);
  if (soundEnabled) {enableFlightAudio(); music.play().catch(() => {});}
  else {
    music.pause();
    Object.values(effects).forEach(effect => effect.pause());
  }
});
get('#pause').addEventListener('click',togglePause);
action.addEventListener('click',() => nextAction());
reset(0);
renderMissionPage();
resumeCampaign();
storyAtlas.addEventListener('load',renderLoadout);
fleetArt.addEventListener('load',renderLoadout);
atlas.addEventListener('load',() => {
  terrain = paintTerrain();
  renderLoadout();
});
let last = performance.now();
function frame(now) {
  if (state === 'flying') update(Math.min((now-last)/1000,1/30));
  else flightAudio(0,false,false,false);
  last = now;
  if (currentPage === 'flight') {draw(); hud();}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
