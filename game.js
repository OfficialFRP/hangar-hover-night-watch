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
  ...chapters,
  ...northQuayMissions,
  ...orisonMissions
];

const fleet = [
  {name:'Scout S1', color:'#8fffd2', thrust:455, battery:0, brake:9, size:17, exposure:1, arms:10, rotor:5, windResponse:1, desc:'Balanced handling'},
  {name:'Swift X2', color:'#ffc27d', thrust:590, battery:-3, brake:9.5, size:15, exposure:1.18, arms:8, rotor:5, windResponse:1.1, desc:'Fastest frame · shorter battery'},
  {name:'Warden L3', color:'#aebeff', thrust:395, battery:7, brake:10.5, size:18, exposure:.72, arms:13, rotor:7, windResponse:.55, desc:'Extended props · steadier in gusts'},
  {name:'Aurel G7', color:'#ffd771', thrust:414, battery:12, brake:15, size:17, exposure:.84, arms:13, rotor:7, windResponse:.21, stability:2.55, desc:'Gold endurance frame · long battery and low drift'},
  {name:'Vector B9', color:'#66caff', thrust:507, battery:5, brake:17, size:16, exposure:.78, arms:12, rotor:7, windResponse:.13, stability:2.8, desc:'Blue ducted frame · tight turns and gust resistance'},
  {name:'Kestrel N12', color:'#79ffdb', thrust:580, battery:13, brake:19, size:15, exposure:.64, arms:12, rotor:7, windResponse:.11, stability:3.1, cost:950, desc:'Stealth interceptor · compact, fast, and stable'},
  {name:'Breaker X14', color:'#ffac72', thrust:645, battery:19, brake:21, size:17, exposure:.55, arms:13, rotor:7, windResponse:.08, stability:3.4, cost:1450, desc:'Heavy rescue frame · exceptional power and endurance'},
  {name:'Onyx M15', color:'#f6f8ff', thrust:475, battery:11, brake:25, size:16, exposure:.7, arms:12, rotor:7, windResponse:.035, stability:5.8, cost:1800, onyx:true, desc:'Gloss black and white · ducted rotors, strongest braking and stability'},
  {name:'Ember E6',color:'#ff906a',thrust:468,battery:5,brake:14,size:16,exposure:.9,arms:12,rotor:7,windResponse:.6,stability:2.5,cost:325,desc:'Responsive everyday frame'},
  {name:'Harbor H8',color:'#7bead6',thrust:430,battery:8,brake:17,size:16,exposure:.86,arms:12,rotor:7,windResponse:.4,stability:2.9,cost:375,desc:'Steady handling and extra battery'},
  {name:'Nova N8',color:'#d49eff',thrust:492,battery:4,brake:15,size:16,exposure:.94,arms:12,rotor:7,windResponse:.55,stability:2.6,cost:425,desc:'Midweight sprint frame'},
  {name:'Cirrus C9',color:'#a4c7ff',thrust:450,battery:7,brake:18,size:16,exposure:.81,arms:12,rotor:7,windResponse:.32,stability:3.2,cost:475,desc:'Crosswind control and strong braking'}
];
const upgrades = [
  {name:'Extended battery', description:'+4 seconds per tier', cost:100, max:5},
  {name:'Motor tuning', description:'+7% thrust per tier', cost:125, max:5},
  {name:'Stabilizer', description:'Stronger braking and easier landings', cost:100, max:5}
];
const raceWinCredits = 160;
const raceFinishCredits = 50;
const achievements = [
  ['first-clear','First Extraction','Clear a mission in Story or Practice.',75,() => progress.cleared.length > 0],
  ['silent','Radio Silence','Clear a mission without using Jam.',90,flight => flight?.noJams],
  ['silent-five','Ghost Signal','Clear five different missions without using Jam.',175,() => progress.noJamClears.length >= 5],
  ['power','Power Reserve','Clear a mission with more than 40% battery remaining.',100,flight => flight?.battery > .4],
  ['clean','Clean Getaway','Clear a mission without taking camera or sentinel battery damage.',100,flight => flight?.clean],
  ['upgrade','Bench Test','Buy any drone upgrade.',50,() => progress.levels.some(tiers => tiers.some(Boolean))],
  ['max-module','Master Tuner','Reach tier 5 in any module on one drone.',200,() => progress.levels.some(tiers => tiers.includes(5))],
  ['max-frame','Fully Tuned','Reach tier 5 in all three modules on the same drone.',300,() => progress.levels.some(tiers => tiers.every(tier => tier === 5))],
  ['new-frame','Fleet Expansion','Buy a premium drone in the Hangar.',100,() => progress.ownedFrames.length > 0],
  ['first-race','First Checkered Flag','Finish all three sections of a Race.',75,() => progress.raceFinishes > 0],
  ['race-win','Beat the Rival','Win a Race.',150,() => progress.raceWins > 0],
  ['race-five','Circuit Regular','Win five Races.',250,() => progress.raceWins >= 5],
  ['case-one','Sable Freight Closed','Finish Case 01 in Story.',150,() => progress.campaignNext >= 12],
  ['case-two','North Quay Closed','Finish Case 02 in Story.',200,() => progress.campaignNext >= 24],
  ['case-three','All Accounted For','Finish Case 03 in Story.',300,() => progress.campaignNext >= 36],
  ['ten-missions','Flight Log','Clear ten different Story or Practice missions.',125,() => progress.cleared.length >= 10],
  ['twenty-missions','Veteran Pilot','Clear twenty different Story or Practice missions.',175,() => progress.cleared.length >= 20],
  ['full-map','Every Airspace','Clear all 36 Story or Practice missions.',275,() => progress.cleared.length >= courses.length],
  ['silent-dozen','Dead Air','Clear twelve different missions without Jam.',225,() => progress.noJamClears.length >= 12],
  ['power-sixty','Efficient Operator','Clear a mission with over 60% battery.',160,flight => flight?.battery > .6],
  ['battery-pack','Field Recharge','Pick up a battery pack and clear the mission.',90,flight => flight?.pack],
  ['one-percent','Last Charge','Clear a mission with less than 5% battery.',125,flight => flight?.battery < .05 && flight?.battery > 0],
  ['storm','Gust Rider','Clear a crosswind mission.',100,flight => flight?.wind],
  ['sentinel','Radar Runner','Clear a mission with a sentinel on patrol.',100,flight => flight?.sentinels],
  ['three-frames','Full Hangar','Purchase three additional drones.',150,() => progress.ownedFrames.length >= 3],
  ['all-pilots','Full Roster','Unlock every pilot through Story.',160,() => unlockedPilots().length === Object.keys(pilotUnlocks).length],
  ['clean-race','No Interference','Win a race without jamming.',125,flight => flight?.raceWin && flight.noJams],
  ['free-first','Open Skies','Clear your first Free Flight sector.',75,() => progress.freeBest >= 1],
  ['free-five','Long Haul','Clear five Free Flight sectors in one run.',175,() => progress.freeBest >= 5],
  ['free-ten','Beyond the Horizon','Clear ten Free Flight sectors in one run.',300,() => progress.freeBest >= 10]
];
const pilotUnlocks = {rook:1,cipher:3,patch:2,director:1,sable:3,iman:6,reed:6,morrow:18,kade:12,vey:24,leena:24,mateo:24};
const freeFlightIndex = -2;
const allObstacles = [...new Set(courses.flatMap(mission => mission.walls.map(wall => wall[4])))];
const freeFlightBattery = 37;
const saveKey = 'hangar-hover-night-watch-v1';
const slotKeys = [saveKey,saveKey+'-slot-2',saveKey+'-slot-3'];
const optionsKey = saveKey+'-options';
const sessionStorageFallback = new Map();
let storageAvailable = true;
function readData(key) {
  if (sessionStorageFallback.has(key)) return sessionStorageFallback.get(key);
  try { return JSON.parse(localStorage.getItem(key)); }
  catch (error) {
    if (!(error instanceof SyntaxError)) storageAvailable = false;
    return null;
  }
}
function writeData(key,value) {
  try {
    localStorage.setItem(key,JSON.stringify(value));
    sessionStorageFallback.delete(key);
  } catch {
    storageAvailable = false;
    sessionStorageFallback.set(key,JSON.parse(JSON.stringify(value)));
  }
}
function freshProgress() {
  const modules = () => fleet.map(() => [0,0,0]);
  return {orisonExpanded:true,credits:100,cleared:[],selected:0,ownedFrames:[],activeLevels:modules(),levels:modules(),bests:{},achievements:[],noJamClears:[],raceFinishes:0,raceWins:0,pilotFrames:{},freeBest:0};
}
function loadProgress(key) {
  const saved = readData(key);
  if (!saved || !Array.isArray(saved.cleared)) return null;
  const defaults = freshProgress();
  const missionIds = list => Array.isArray(list) ? [...new Set(list.filter(index =>
    Number.isInteger(index) && index >= 0 && index < courses.length &&
    (saved.orisonExpanded || index !== 24)))] : [];
  const validCount = (value,fallback = 0) => Number.isSafeInteger(value) && value >= 0 ? value : fallback;
  // The original one-mission Orison finale occupied slot 25.
  const lastCheckpoint = saved.orisonExpanded ? courses.length : 24;
  const next = Math.min(lastCheckpoint,validCount(saved.campaignNext));
  const levels = fleet.map((_,frame) => upgrades.map(({max},index) =>
    Math.max(0,Math.min(max,Math.trunc(saved.levels?.[frame]?.[index]) || 0))));
  const activeLevels = levels.map((modules,frame) => modules.map((owned,index) => {
    const active = saved.activeLevels?.[frame]?.[index];
    return Number.isInteger(active) ? Math.max(0,Math.min(owned,active)) : owned;
  }));
  const priorRaceWin = saved.raceMatch?.defeated === true ? 1 : 0;
  const ownedFrames = Array.isArray(saved.ownedFrames) ? [...new Set(saved.ownedFrames.filter(index =>
    Number.isInteger(index) && fleet[index]?.cost))] : [];
  const selected = Number.isInteger(saved.selected) && fleet[saved.selected] &&
    (!fleet[saved.selected].cost || ownedFrames.includes(saved.selected)) ? saved.selected : 0;
  const bests = {};
  for (const mode of ['normal','easy']) {
    bests[mode] = Object.fromEntries(Object.entries(saved.bests?.[mode] || {})
      .filter(([name,time]) => /^(?:orison-)?\d+$/.test(name) && Number.isFinite(time) && time > 0));
  }
  return {...defaults,...saved,orisonExpanded:true,levels,activeLevels,selected,ownedFrames,bests,
    credits:validCount(saved.credits,defaults.credits),freeBest:validCount(saved.freeBest),
    cleared:missionIds(saved.cleared),noJamClears:missionIds(saved.noJamClears),
    achievements:Array.isArray(saved.achievements) ? [...new Set(saved.achievements.filter(key =>
      achievements.some(([id]) => id === key)))] : [],
    raceWins:validCount(saved.raceWins,priorRaceWin),raceFinishes:validCount(saved.raceFinishes,priorRaceWin),
    campaignNext:next,campaignCursor:Math.min(lastCheckpoint,validCount(saved.campaignCursor,next))};
}
let activeSlot = null;
let progress = freshProgress();
function saveProgress() {
  writeData(activeSlot,progress);
}
function unlockedPilots() {
  return Object.keys(pilotUnlocks).filter(key => progress.campaignNext >= pilotUnlocks[key]);
}
function assignPilotFrames() {
  const keys = Object.keys(pilotUnlocks);
  const saved = keys.map(key => progress.pilotFrames?.[key]);
  if (new Set(saved).size === keys.length && saved.every(index => Number.isInteger(index) && fleet[index])) return false;
  const available = fleet.map((_,index) => index);
  progress.pilotFrames = Object.fromEntries(keys.map(key =>
    [key,available.splice(Math.floor(Math.random()*available.length),1)[0]]));
  return true;
}
const arcadeChoice = {race:'equipped',free:'equipped'};
function arcadeOptions(mode) {
  const select = get('#'+mode+'Pilot');
  select.replaceChildren();
  const add = (value,label,disabled = false) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    option.disabled = disabled;
    select.append(option);
  };
  add('equipped','Equipped · '+fleet[progress.selected].name);
  fleet.forEach((frame,index) => {
    if (!frame.cost || progress.ownedFrames.includes(index)) add('owned-'+index,frame.name);
  });
  for (const [key,mission] of Object.entries(pilotUnlocks)) {
    const unlocked = progress.campaignNext >= mission;
    add(key,crew[key][0]+' · '+(unlocked ? fleet[progress.pilotFrames[key]].name : 'Unlock after Story '+mission),!unlocked);
  }
  select.value = arcadeChoice[mode];
  if (!select.value || select.selectedOptions[0]?.disabled) select.value = 'equipped';
  arcadeChoice[mode] = select.value;
}
function arcadeLoadout(index) {
  const mode = index === -1 ? 'race' : 'free';
  const choice = arcadeChoice[mode];
  if (unlockedPilots().includes(choice)) return {frame:progress.pilotFrames[choice],pilot:choice};
  const owned = choice.startsWith('owned-') ? Number(choice.slice(6)) : progress.selected;
  return {frame:fleet[owned] && (!fleet[owned].cost || progress.ownedFrames.includes(owned)) ? owned : progress.selected};
}
function awardAchievements(flight) {
  let total = 0;
  for (const [key,,,credits,qualifies] of achievements) {
    if (progress.achievements.includes(key) || !qualifies(flight)) continue;
    progress.achievements.push(key);
    total += credits;
  }
  progress.credits += total;
  return total;
}
function achievementMessage(bonus) {
  return bonus ? ' Achievement bonus: +' + bonus + ' CR.' : '';
}
const savedOptions = readData(optionsKey);
const options = {
  difficulty:savedOptions?.difficulty === 'easy' ? 'easy' : 'normal',
  sensitivity:Number.isFinite(savedOptions?.sensitivity) ? Math.max(50,Math.min(150,savedOptions.sensitivity)) : 100,
  sound:savedOptions?.sound === true
};
// Each mission can place one optional battery cell at [x, y].
const chargeCells = [null,[467,252],[454,270],[451,241],[707,293],[447,277],[730,283],[562,391],[440,238],[586,365],[587,346],[575,342]];
const spriteBounds = [[8, 20, 284, 260], [308, 24, 284, 252], [608, 25, 284, 249], [91, 308, 117, 284], [391, 308, 117, 284], [671, 308, 158, 284], [8, 658, 284, 184], [308, 656, 284, 188], [608, 612, 284, 276]];
const quayAtlas = new Image();
quayAtlas.src = 'assets/north-quay-drones.webp';
const onyxArt = new Image();
onyxArt.src = 'assets/onyx-m15.webp?v=3';
const clubAtlas = new Image();
clubAtlas.src = 'assets/club-drones.webp';
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

const effects = Object.fromEntries(['launch','scan','jam','drain','charge','crash','complete','throttle','brake','land','race-win'].map(name => {
  const effect = new Audio();
  effect.preload = 'none';
  effect.src = 'assets/' + name + '.wav';
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
const batteryMeter = get('#power meter');
const phoneLayout = window.matchMedia('(max-width: 650px), (pointer: coarse) and (max-height: 600px)');
batteryMeter.setAttribute('aria-label','Battery remaining');
const keyboard = new Set();
const brakePointers = new Set();
const stick = {pointer:null,x:0,y:0};
const courseButtons = courses.map((mission,index) => {
  const button = document.createElement('button');
  button.textContent = mission.name;
  button.addEventListener('click',() => {
    if (!canPractice(index)) return;
    reset(index);
    showPage('flight');
  });
  get('#mission-list').append(button);
  return button;
});
const frameButtons = fleet.map((frame,index) => {
  const button = document.createElement('button');
  button.className = 'frame-option';
  button.addEventListener('click',() => {
    if (state === 'flying' || state === 'paused') return;
    if (frame.cost && !progress.ownedFrames.includes(index)) {
      if (progress.credits < frame.cost) return;
      progress.credits -= frame.cost;
      progress.ownedFrames.push(index);
      awardAchievements();
    }
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
  const selector = document.createElement('div');
  selector.className = 'tier-selector';
  selector.setAttribute('role','group');
  selector.setAttribute('aria-label',upgrade.name + ' active tier');
  const tiers = Array.from({length:upgrade.max+1},(_,tier) => {
    const option = document.createElement('button');
    option.textContent = tier;
    option.setAttribute('aria-label',upgrade.name + ' tier ' + tier);
    option.addEventListener('click',() => setUpgradeTier(index,tier));
    selector.append(option);
    return option;
  });
  card.append(info,selector,button);
  get('#mods').append(card);
  return {button,info,tiers};
});
let courseIndex, course, drone, elapsed, gate, landing, state, nextAction, record, airframe, stats, drained, cameraSignal, terrain;
const maxJams = 3;
const redCameraDrain = 5;
let jam, jamsLeft, scan, cellCollected;
let patrols = [];
let radarLocked = false;
let rechargePack, packCollected, rechargeFlash;
const rechargeAmount = 12;
let missionPage = 0;
const missionsPerPage = 4;
const pageButtons = [...document.querySelectorAll('[data-page]')];
let currentPage = 'menu';
let gamePage = 'story';
let easyFlight = false;
let storyFlight = false;
let race;
let raceSection = 0;
let freeSector = 0;
let freeBonus = 0;
let flightLoadout;
let rivalAngle = 0;
let tookSignalDamage = false;
const droneTrail = [];
const trailLifetime = .74;
const trailSampleInterval = 1/30;
let nextRaceCall;
let raceCallouts = 0;
let wasBraking = false;
function raceLine(group) {
  const pool = racePilots[race.rival][group];
  const line = pick(pool.filter(quote => quote !== race.lastLine));
  race.lastLine = line;
  return line;
}
function validRaceSections(saved) {
  const pair = value => Array.isArray(value) && value.length === 2 && value.every(Number.isFinite);
  const coordinates = (values,count) => Array.isArray(values) && values.length >= count &&
    values.slice(0,count).every(Number.isFinite);
  return Number.isFinite(saved.finishTime) && saved.finishTime > 0 &&
    Array.isArray(saved.sections) && saved.sections.length === raceSectionCount &&
    saved.sections.every((section,index,sections) => {
      const course = section?.course;
      return course && typeof course.name === 'string' && Number.isFinite(course.seconds) && course.seconds > 0 &&
        pair(course.start) && pair(course.exit) && Array.isArray(course.gates) && course.gates.length > 0 &&
        course.gates.every(pair) && Array.isArray(course.walls) && course.walls.every(wall =>
          coordinates(wall,4) && typeof wall[4] === 'string') &&
        Array.isArray(course.cameras) && course.cameras.every(camera => coordinates(camera,3)) &&
        section.startTime === (index === 0 ? 0 : sections[index-1].startTime+sections[index-1].splits.at(-1)) &&
        Array.isArray(section.path) && section.path.every(pair) &&
        Array.isArray(section.splits) && section.splits.length === section.path.length &&
        section.splits.length > 1 && section.splits.every((split,index) =>
          Number.isFinite(split) && (index === 0 ? split === 0 : split > section.splits[index-1])) &&
        (index !== sections.length-1 || saved.finishTime === section.startTime+section.splits.at(-1));
    });
}
function selectRace() {
  const loadout = arcadeLoadout(-1);
  if (!race && progress.raceMatch) {
    const saved = progress.raceMatch;
    const frame = fleet[progress.pilotFrames?.[saved.rival]] || fleet.find(frame => frame.name === saved.frame?.name);
    if (frame && Object.hasOwn(racePilots,saved.rival)) {
      race = validRaceSections(saved) ? {...saved,frame} :
        generateRace(fleet[progress.selected],null,null,saved.rival,frame);
      race.defeated = saved.defeated === true;
      progress.raceMatch = race;
      saveProgress();
    }
  }
  if (!race || race.defeated || race.rival === loadout.pilot) {
    const opponent = pick(Object.keys(racePilots).filter(key => key !== loadout.pilot && key !== race?.rival));
    race = generateRace(fleet[loadout.frame],race?.rival,race?.sections[0].course.name,opponent);
    progress.raceMatch = race;
    saveProgress();
  }
  const [name,role,portrait] = crew[race.rival];
  get('#racePortrait').src = 'assets/crew-' + (portrait < 8 ? 'expression-' : '') + portrait + '.webp';
  get('#racePortrait').alt = name;
  get('#raceSpeaker').textContent = name + ' · ' + role;
  get('#raceQuote').textContent = '“' + raceLine(0) + '”';
  get('#raceTitle').textContent = 'Three-section race';
  get('#raceMatch').textContent = 'Rival drone: ' + race.frame.name + ' · 3 sections · ' + raceWinCredits + ' CR win / ' + raceFinishCredits + ' CR finish';
  reset(-1);
  showPage('race');
}
function concludeRace(cleared,message) {
  const time = race.finishTime;
  const won = cleared && elapsed < time;
  const reward = cleared && !race.defeated ? (won ? raceWinCredits : raceFinishCredits) : 0;
  if (reward) progress.raceFinishes++;
  if (reward && won) progress.raceWins++;
  if (won) race.defeated = true;
  progress.credits += reward;
  progress.raceMatch = race;
  const bonus = awardAchievements({raceWin:won,noJams:jamsLeft === maxJams});
  saveProgress();
  state = won ? 'won' : 'lost';
  renderHangar();
  sound(won ? 'race-win' : cleared ? 'complete' : 'crash');
  const quote = raceLine(won ? 1 : 2);
  const score = cleared ? 'Your time ' + elapsed.toFixed(2) + ' s · Rival ' + time.toFixed(2) + ' s.' : message + ' Rival target ' + time.toFixed(2) + ' s.';
  const payout = reward ? ' +' + reward + ' CR.' : '';
  menu(won ? 'Race won' : cleared ? 'Rival wins' : 'Run ended',score+payout+achievementMessage(bonus)+' “'+quote+'”',
    won ? 'New matchup' : 'Race same rival',won ? selectRace : () => reset(-1,true));
  get('#backToRacePilots').hidden = false;
}

const storyCases = [['#caseOne',0],['#caseTwo',12],['#caseThree',24]];
let storyLines = [];
let lineIndex = 0;
let sceneTitle;
let afterDialogue;
let lastLineAction;

function campaignPosition() {
  return Math.min(progress.campaignCursor ?? progress.campaignNext ?? 0,courses.length);
}
function selectStoryMission(index) {
  if (!courses[index] || !canPractice(index)) return;
  progress.campaignCursor = index;
  saveProgress();
  startBriefing(index);
}
function renderStory() {
  const [speaker,dialogue,link,illustration] = storyLines[lineIndex];
  get('#storyTitle').textContent = sceneTitle;
  const position = campaignPosition();
  const shownCase = storyLines === campaignReveals[12].lines ? 0 :
    storyLines === campaignReveals[24].lines ? 1 : Math.min(2,Math.floor(position/12));
  storyCases.forEach(([selector,first],index) => {
    const button = get(selector);
    button.setAttribute('aria-pressed',String(index === shownCase));
    button.disabled = (progress.campaignNext || 0) < first;
  });
  const picker = get('#storyMission');
  picker.replaceChildren(...courses.flatMap((mission,index) => {
    if (!canPractice(index)) return [];
    const option = document.createElement('option');
    option.value = String(index);
    option.textContent = String(index+1).padStart(2,'0') + ' · ' + mission.name;
    return [option];
  }));
  picker.value = position < courses.length ? String(position) : '';
  const image = get('#portrait');
  image.hidden = !speaker && !illustration;
  const scene = get('.story-scene');
  scene.classList.toggle('credits-scene',!speaker && !illustration);
  scene.classList.toggle('team-scene',Boolean(illustration));
  if (speaker) {
    const [name,role,portrait] = crew[speaker];
    const variant = speaker === 'rook' && sceneTitle.includes('Sable’s Signature') ? 7 : portrait;
    image.src = 'assets/crew-' + (storyLines.length > 1 && variant < 8 ? 'expression-' : '') + variant + '.webp';
    image.alt = name + ', ' + role;
    get('#speaker').textContent = name + ' · ' + role;
  } else {
    get('#speaker').textContent = '';
    if (illustration) {
      image.src = illustration.src;
      image.alt = illustration.alt;
    }
  }
  const dialogueNode = get('#dialogue');
  dialogueNode.textContent = dialogue;
  if (link) {
    const website = document.createElement('a');
    website.href = link;
    website.textContent = link;
    website.rel = 'noopener noreferrer';
    website.target = '_blank';
    dialogueNode.append(document.createElement('br'),website);
  }
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
  presentScene('Case 0' + (Math.floor(index/12)+1) + ' · ' + chapter + ' / ' + courses[index].name,[[speaker,line]],'Open flight deck',() => {
    reset(index,false,true);
    showPage('flight');
  });
}
function resumeCampaign() {
  const index = campaignPosition();
  if (campaignReveals[index] && (index === courses.length || progress.campaignRevealed !== index)) {
    const {title,lines} = campaignReveals[index];
    presentScene(title,lines,index === courses.length ? 'Mission select' : index === 12 ? 'Open Case 02' : index === 24 ? 'Open Case 03' : 'Next chapter',() => {
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
    const selected = button.dataset.page === (page === 'flight' ? (courseIndex === freeFlightIndex ? 'free' : courseIndex === -1 ? 'race' : storyFlight ? 'story' : 'missions') : page);
    button.setAttribute('aria-pressed',selected);
    get('#page-' + button.dataset.page).hidden = button.dataset.page !== page;
  });
  get('#page-flight').hidden = page !== 'flight';
  if (page === 'flight') {hud(); flightNeedsRender = true;}
  if (page === 'story') renderStory();
  if (page === 'race' || page === 'free') arcadeOptions(page);
  if (page === 'free') get('#freeRecord').textContent = 'Best: '+progress.freeBest+' sectors';
  if (page === 'characters') renderCharacterFiles();
  if (page === 'missions') {
    missionPage = Math.max(0,Math.floor(courseIndex/missionsPerPage));
    renderMissionPage();
  }
}
function canPractice(index) {
  return progress.cleared.includes(index) || index === (progress.campaignNext || 0) || index === campaignPosition();
}
function renderMissionPage() {
  const last = Math.ceil(courses.length/missionsPerPage)-1;
  courseButtons.forEach((button,index) => {
    button.hidden = Math.floor(index/missionsPerPage) !== missionPage;
    button.textContent = String(index+1).padStart(2,'0') + '  ' + courses[index].name + (progress.cleared.includes(index) ? '  ✓' : '');
    button.disabled = !canPractice(index);
    if (button.disabled) button.textContent += ' · Locked';
    button.setAttribute('aria-pressed',index === courseIndex);
  });
  get('#missionPage').textContent = (missionPage+1) + ' / ' + (last+1);
  get('#prevMission').disabled = missionPage === 0;
  get('#nextMission').disabled = missionPage === last;
}
function activateJam() {
  if (currentPage !== 'flight' || state !== 'flying' || jam > 0 || jamsLeft === 0) return;
  if (courseIndex !== freeFlightIndex) jamsLeft--;
  jam = 2.5;
  sound('jam');
}


function setUpgradeTier(index,tier) {
  const frame = progress.selected;
  if (state === 'flying' || state === 'paused' || tier > progress.levels[frame][index]) return;
  progress.activeLevels[frame][index] = tier;
  saveProgress();
  refreshLoadout();
}
function buyUpgrade(index) {
  const modules = progress.levels[progress.selected];
  const upgrade = upgrades[index];
  const cost = upgrade.cost * (modules[index]+1);
  if (state === 'flying' || state === 'paused' || modules[index] >= upgrade.max || progress.credits < cost) return;
  progress.credits -= cost;
  modules[index]++;
  const bonus = awardAchievements();
  setUpgradeTier(index,modules[index]);
  get('#purchaseStatus').textContent = upgrade.name + ' installed on ' + fleet[progress.selected].name + '. ' + progress.credits + ' credits left.' + achievementMessage(bonus);
}
function refreshLoadout() {
  const index = flightLoadout?.frame ?? progress.selected;
  airframe = fleet[index];
  const [battery,motors,stabilizer] = flightLoadout?.pilot ? [0,0,0] : progress.activeLevels[index];
  stats = {seconds:Math.round((course.seconds + airframe.battery + battery*4)*(easyFlight ? 1.3 : 1)), thrust:airframe.thrust * (1+.07*motors),
    brake:airframe.brake + 2*stabilizer, landingSpeed:38+6*stabilizer};
  renderHangar();
}
function renderHangar() {
  const active = state === 'flying' || state === 'paused';
  renderAchievements();
  get('#campaign').textContent = progress.cleared.length + ' / ' + courses.length + ' missions cleared';
  renderLoadout();
  get('#upgradeTitle').textContent = fleet[progress.selected].name + ' upgrades';
  get('#funds').textContent = progress.credits.toLocaleString() + ' credits';
  get('#wallet').textContent = progress.credits.toLocaleString() + ' CR';
  get('#loadoutName').textContent = fleet[progress.selected].name;
  const equippedFrame = fleet[progress.selected];
  const [battery,motors,stabilizer] = progress.activeLevels[progress.selected];
  get('#loadoutStats').textContent = Math.round((course.seconds+equippedFrame.battery+battery*4)*(easyFlight ? 1.3 : 1)) +
    ' s battery · ' + Math.round(equippedFrame.thrust*(1+.07*motors)) + ' thrust · ' +
    (equippedFrame.brake+2*stabilizer).toFixed(1) + ' braking';
  get('#purchaseStatus').textContent = active ? 'Finish or restart the mission to change your loadout.' : '';
  frameButtons.forEach((button,index) => {
    const frame = fleet[index];
    const selected = index === progress.selected;
    const locked = frame.cost && !progress.ownedFrames.includes(index);
    button.disabled = active || (locked && progress.credits < frame.cost);
    button.setAttribute('aria-pressed',selected);
    button.innerHTML = '<strong>' + frame.name + '</strong><small>' + frame.desc + '</small><span>' + (selected ? '✓ EQUIPPED' : locked ? 'UNLOCK · '+frame.cost+' CR' : 'EQUIP') + '</span>';
  });
  modButtons.forEach(({button,info,tiers},index) => {
    const upgrade = upgrades[index];
    const level = progress.levels[progress.selected][index];
    const cost = upgrade.cost * (level+1);
    const equipped = progress.activeLevels[progress.selected][index];
    info.innerHTML = '<strong>' + upgrade.name + '</strong><small>' + upgrade.description + '</small><span>Active ' + equipped + ' · Owned through ' + level + '</span>';
    tiers.forEach((option,tier) => {
      option.disabled = active || tier > level;
      option.setAttribute('aria-pressed',tier === equipped);
    });
    const shortfall = cost - progress.credits;
    button.textContent = level === upgrade.max ? 'Maxed' : shortfall > 0 ? 'Need ' + shortfall + ' CR more' : 'Buy next tier · ' + cost + ' CR';
    button.setAttribute('aria-label',upgrade.name + ': ' + button.textContent);
    button.disabled = active || level >= upgrade.max || progress.credits < cost;
  });
}

function renderAchievements() {
  get('#achievementCount').textContent = progress.achievements.length + ' / ' + achievements.length + ' unlocked';
  get('#achievementList').replaceChildren(...achievements.map(([key,title,description,credits]) => {
    const item = document.createElement('li');
    const earned = progress.achievements.includes(key);
    item.classList.toggle('earned',earned);
    const name = document.createElement('strong');
    name.textContent = title;
    const goal = document.createElement('p');
    goal.textContent = description;
    const award = document.createElement('span');
    award.textContent = (earned ? 'Earned' : 'Locked') + ' · ' + credits + ' CR';
    item.append(name,goal,award);
    return item;
  }));
}

function bestKey() {
  return (course.sea ? 'orison-' : '') + courseIndex;
}
function storedBest() {
  const key = bestKey();
  if (easyFlight) return progress.bests.easy?.[key] || 0;
  return progress.bests.normal?.[key] ||
    (activeSlot === saveKey && !progress.ignoreLegacyBests ? Number(readData('hangar-hover-best-' + key)) || 0 : 0);
}
function clearInputs() {
  keyboard.clear();
  const brakeIds = [...brakePointers];
  brakePointers.clear();
  for (const pointer of brakeIds) {
    if (brakeButton.hasPointerCapture(pointer)) brakeButton.releasePointerCapture(pointer);
  }
  centerJoystick();
  brakeButton.classList.remove('held');
}
function menu(title, message, label, callback) {
  get('#headline').textContent = title;
  get('#brief').textContent = message;
  action.textContent = label;
  nextAction = callback;
  get('#backToRacePilots').hidden = true;
  overlay.hidden = false;
  flightNeedsRender = true;
}
function racePortrait(image,key) {
  const [, ,portrait] = crew[key];
  image.src = 'assets/crew-' + (portrait < 8 ? 'expression-' : '') + portrait + '.webp';
}
function drawRaceLoadout() {
  const preview = get('#playerRacerDrone');
  if (courseIndex !== -1 || flightLoadout?.pilot || !airframe) return;
  const surface = preview.getContext('2d');
  surface.clearRect(0,0,96,96);
  surface.save();
  surface.translate(48,48);
  surface.scale(2,2);
  paintDrone(surface,airframe,.45);
  surface.restore();
}
function configureRaceHud() {
  const racing = courseIndex === -1;
  get('#raceDuel').hidden = !racing;
  get('#power').hidden = racing;
  if (!racing) return;
  const pilot = flightLoadout?.pilot;
  const portrait = get('#playerRacerPortrait');
  portrait.hidden = !pilot;
  get('#playerRacerDrone').hidden = Boolean(pilot);
  if (pilot) racePortrait(portrait,pilot);
  else drawRaceLoadout();
  racePortrait(get('#rivalRacerPortrait'),race.rival);
  updateHudText('#playerRacerName',pilot ? crew[pilot][0] : 'Custom pilot');
  updateHudText('#playerRacerFrame',airframe.name);
  updateHudText('#rivalRacerName',crew[race.rival][0]);
  updateHudText('#rivalRacerFrame',race.frame.name);
}
function reset(index, fly = false, chapterFlight = false) {
  storyFlight = chapterFlight;
  courseIndex = index;
  flightLoadout = index < 0 ? arcadeLoadout(index) : null;
  freeSector = freeBonus = 0;
  easyFlight = index >= 0 && options.difficulty === 'easy';
  raceSection = 0;
  rivalAngle = 0;
  course = index === freeFlightIndex ? generateFreeSector() : index === -1 ? race.sections[0].course : courses[index];
  nextRaceCall = 3;
  raceCallouts = 0;
  wasBraking = false;
  get('#raceLive').hidden = index >= 0;
  if (index === freeFlightIndex) get('#raceLive').textContent = 'Sector 1 · '+course.name;
  if (index === -1) get('#raceLive').textContent = crew[race.rival][0] + ' · “' + raceLine(0) + '”';
  const [x,y] = course.start;
  drone = {x,y,vx:0,vy:0,angle:0};
  elapsed = gate = landing = drained = 0;
  tookSignalDamage = false;
  droneTrail.length = 0;
  cameraSignal = '';
  radarLocked = false;
  patrols = planPatrols();
  rechargePack = planRechargePack();
  rechargeFlash = 0;
  packCollected = false;
  jam = scan = 0;
  jamsLeft = maxJams;
  cellCollected = false;
  terrain = paintTerrain();
  record = index < 0 ? 0 : storedBest();
  clearInputs();
  state = fly ? 'flying' : 'ready';
  flightNeedsRender = true;
  refreshLoadout();
  configureRaceHud();
  if (fly) {
    sound('launch');
    overlay.hidden = true;
    action.blur();
  } else {
    const warning = (patrols.length || index === -1) ? ' Sentinels chase on radar lock. Break line of sight or use Jam.' : '';
    const recharge = rechargePack ? ' Fly through the battery pack for a top-up.' : '';
    const pilot = flightLoadout?.pilot ? crew[flightLoadout.pilot][0]+' · '+airframe.name+'. ' : '';
    menu(course.name,pilot+course.intro+warning+recharge,'Launch drone',() => reset(index,true,storyFlight));
  }
}
function finish(won, message) {
  if (courseIndex === -1) {concludeRace(won,message); return;}
  if (courseIndex === freeFlightIndex) {
    state = 'lost';
    clearInputs();
    sound('crash');
    menu('Free Flight ended',message+' Sectors cleared: '+freeSector+'. '+freeBonus+' bonus CR.','Free Flight setup',() => showPage('free'));
    return;
  }
  state = won ? 'won' : 'lost';
  sound(won ? 'complete' : 'crash');
  if (won && (!record || elapsed < record)) {
    record = elapsed;
    const mode = easyFlight ? 'easy' : 'normal';
    (progress.bests[mode] ??= {})[bestKey()] = record;
  }
  if (won) {
    const firstClear = !progress.cleared.includes(courseIndex);
    const payout = firstClear ? 150 : 50;
    if (firstClear) progress.cleared.push(courseIndex);
    progress.credits += payout;
    if (storyFlight) {
      progress.campaignCursor = courseIndex+1;
      progress.campaignNext = Math.max(progress.campaignNext || 0,courseIndex+1);
      if (progress.campaignRevealed === courseIndex+1) delete progress.campaignRevealed;
    }
    const noJams = jamsLeft === maxJams;
    if (noJams && !progress.noJamClears.includes(courseIndex)) progress.noJamClears.push(courseIndex);
    const bonus = awardAchievements({noJams,battery:remainingBattery(),clean:!tookSignalDamage,pack:packCollected || cellCollected,wind:Boolean(course.wind),sentinels:patrols.length>0});
    saveProgress();
    message += ' +' + payout + ' credits.' + achievementMessage(bonus);
  }
  renderHangar();
  const hasNext = won && courseIndex < courses.length - 1;
  if (won && storyFlight) {
    const reveal = campaignReveals[courseIndex+1];
    const title = hasNext ? (courseIndex === 11 ? 'Case 01 closed' : courseIndex === 23 ? 'Case 02 closed' : 'Intel secured') : 'MISSION ACCOMPLISHED';
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
const pressed = (...keys) => keys.some(key => keyboard.has(key));
const clamp = (value,min,max) => Math.max(min,Math.min(value,max));
// Flight physics. Steering changes velocity, so the drone drifts after release.
// Ease toward the shortest turn. Hover recovery has a slower turn and ease-out.
function easeNose(angle,target,dt,hovering = false) {
  const difference = target-angle;
  const turn = Math.atan2(Math.sin(difference),Math.cos(difference));
  if (Math.abs(turn) < .006) return target;
  const maxStep = (hovering ? 2.5 : 5.3)*dt;
  return angle+clamp(turn*(1-Math.exp(-(hovering ? 4.4 : 7.4)*dt)),-maxStep,maxStep);
}
function turnNose(angle,dx,dy,dt) {
  const moving = Boolean(dx || dy);
  return easeNose(angle,moving ? Math.atan2(dx,-dy) : 0,dt,!moving);
}
function update(dt) {
  elapsed += dt;
  jam = Math.max(0,jam-dt);
  rechargeFlash = Math.max(0,rechargeFlash-dt);
  const dx = clamp(+pressed('ArrowRight','d') - +pressed('ArrowLeft','a') + stick.x,-1,1);
  const dy = clamp(+pressed('ArrowDown','s') - +pressed('ArrowUp','w') + stick.y,-1,1);
  const diagonal = Math.max(1,Math.hypot(dx,dy));
  const braking = pressed(' ') || brakePointers.size > 0;
  if (braking && !wasBraking) sound('brake');
  wasBraking = braking;
  flightAudio(Math.hypot(drone.vx,drone.vy),Boolean(dx || dy),braking,true);
  if (courseIndex === -1) {
    const rival = rivalPosition(race,elapsed);
    if (rival) rivalAngle = easeNose(rivalAngle,rival[2],dt);
    if (elapsed >= nextRaceCall && raceCallouts < 4) {
      nextRaceCall += 3.2;
      raceCallouts++;
      const ahead = rival && (raceSection > rival[3] || (raceSection === rival[3] && drone.x >= rival[0]));
      get('#raceLive').textContent = crew[race.rival][0] + ' · “' + raceLine(ahead || raceCallouts % 2 === 0 ? 1 : 2) + '”';
    }
  }
  const gust = course.wind ? (course.wind === true ? 120 : course.wind) * airframe.windResponse * (easyFlight ? .55 : 1) : 0;
  const wind = gust * Math.sin(elapsed * 2.3);
  const crosswind = course.exit || course.quay ? gust*.76 * Math.sin(elapsed*1.47+.8) : 0;
  const restricted = radarLocked && jam === 0;
  const damping = braking ? stats.brake : ((dx || dy) ? 1.9 : airframe.stability || 1.9);
  const drag = Math.exp(-(damping+(restricted ? 2.1 : 0))*dt);
  const steering = stats.thrust * (restricted ? .32 : 1);
  drone.vx = (drone.vx + (dx * steering / diagonal + wind) * dt) * drag;
  drone.vy = (drone.vy + (dy * steering / diagonal + crosswind) * dt) * drag;
  const previousX = drone.x;
  const previousY = drone.y;
  drone.x += drone.vx * dt;
  drone.y += drone.vy * dt;
  const radius = airframe.size;
  const strikes = course.walls.filter(wall => touchesStructure(wall,drone.x,drone.y,radius));
  if (strikes.length && (strikes.some(wall => !isPadded(wall[4])) || !bounceOff(strikes[0],previousX,previousY))) {
    return finish(false,'The drone hit an obstacle. Brake before tight turns.');
  }
  const {x,y,vx,vy} = drone;
  const drifting = Math.hypot(vx,vy) > 12;
  drone.angle = dx || dy ? turnNose(drone.angle,dx,dy,dt) :
    drifting ? turnNose(drone.angle,vx,vy,dt) : turnNose(drone.angle,0,0,dt);
  while (droneTrail.length && elapsed-droneTrail[0].time >= trailLifetime) droneTrail.shift();
  const lastTrailPoint = droneTrail.at(-1);
  if (Math.hypot(vx,vy) > 10 && (!lastTrailPoint || elapsed-lastTrailPoint.time >= trailSampleInterval)) {
    droneTrail.push({x,y,time:elapsed});
  }
  const doorOpen = course.exit && gate === course.gates.length &&
    Math.abs(y-course.exit[0]) < course.exit[1]/2-radius;
  if (x<radius || (x>960-radius && !doorOpen) || y<radius || y>500-radius)
    return finish(false,'The drone hit the perimeter.');
  // Use the strongest visible signal so overlapping red beams do not stack.
  const previousSignal = cameraSignal;
  cameraSignal = '';
  for (const [index,camera] of (course.cameras || []).entries()) {
    if ((camera[3] === 'red' && jam > 0) || !inBeam(camera,index,x,y)) continue;
    cameraSignal = camera[3];
    if (cameraSignal === 'red') break;
  }
  const underThreat = previousSignal === 'red' || radarLocked;
  for (const patrol of patrols) updatePatrol(patrol,x,y,dt);
  radarLocked = jam === 0 && patrols.some(patrol => patrol.pursuing && inPatrolRadar(patrol,x,y));
  if (radarLocked || cameraSignal === 'red') {
    tookSignalDamage = true;
    if (!underThreat) sound('drain');
    drained += (radarLocked ? 7 : redCameraDrain) * airframe.exposure * dt * (easyFlight ? .5 : 1);
  }
  const cell = chargeCells[courseIndex];
  const chargeSpent = elapsed + drained;
  if (cell && !cellCollected && chargeSpent >= 4 && Math.hypot(x-cell[0],y-cell[1]) < 21) {
    drained -= 4;
    cellCollected = true;
    sound('charge');
  }
  collectRechargePack(x,y);
  if (elapsed + drained >= stats.seconds) {
    return finish(false, radarLocked ? 'Battery depleted under patrol radar. Break line of sight or use Jam.' : cameraSignal === 'red' ? 'Battery depleted under a red camera. Break its line of sight.' : 'Battery depleted. Press R or fly again.');
  }
  const target = course.gates[gate];
  const onTarget = target && Math.hypot(x-target[0],y-target[1]) < (easyFlight ? 36 : 29);
  scan = onTarget ? scan + dt*(cameraSignal === 'green' ? 1.6 : 1) : 0;
  if (scan >= .24 || (courseIndex < 0 && onTarget)) {
    gate++;
    scan = 0;
    sound('scan');
  }
  if (course.exit) {
    if (doorOpen && x >= 960) {
      if (courseIndex === freeFlightIndex) advanceFreeSector();
      else if (courseIndex === -1 && raceSection < race.sections.length-1) advanceRaceSection();
      else finish(true,(course.sea ? 'Rescue route confirmed in ' : 'Warehouse cleared in ') + elapsed.toFixed(1) + ' seconds.');
    }
    return;
  }
  const [px,py] = course.pad;
  const steady = gate === course.gates.length && Math.hypot(x-px,y-py) < (easyFlight ? 36 : 29) &&
    Math.hypot(vx,vy) < stats.landingSpeed + (easyFlight ? 15 : 0);
  landing = steady ? landing + dt : 0;
  if (landing >= 0.65) {
    sound('land');
    finish(true,'Targets recorded and drone extracted in ' + elapsed.toFixed(1) + ' seconds.');
  }
}
function generateFreeSector() {
  const theme = pick(courses);
  const district = {name:theme.name,props:allObstacles,y:[250,250,250,250].map(y => y+randomBetween(-85,85)),
    wind:Math.random()<.45 ? pick([85,120,175,230]) : 0};
  const {course:sector} = generateRaceSection(district,freeSector);
  sector.seconds = freeFlightBattery;
  sector.sea = Boolean(theme.sea);
  sector.quay = Boolean(theme.quay);
  sector.sentinels = Math.random()<.24 ? 2 : Math.random()<.65 ? 1 : 0;
  while (sector.cameras.length < 2) {
    const [x,y] = pick(sector.gates);
    sector.cameras.push([x-44,y-34,.8,Math.random()<.72 ? 'red' : 'green']);
  }
  sector.intro = 'Clear four checkpoints and exit east. Each new sector refills your battery. Unlimited Jams have a short cooldown.';
  return sector;
}
function advanceFreeSector() {
  freeSector++;
  progress.freeBest = Math.max(progress.freeBest,freeSector);
  const bonus = awardAchievements();
  freeBonus += bonus;
  saveProgress();
  course = generateFreeSector();
  drained = -elapsed;
  moveToNextSector();
  rechargeFlash = 1.1;
  get('#raceLive').textContent = 'Sector '+(freeSector+1)+' · '+course.name+achievementMessage(bonus);
}
function advanceRaceSection() {
  raceSection++;
  course = race.sections[raceSection].course;
  moveToNextSector();
  get('#raceLive').textContent = 'Section ' + (raceSection+1) + ' / ' + raceSectionCount + ' · ' + course.name;
}
function moveToNextSector() {
  const [x,y] = course.start;
  drone = {x,y,vx:Math.min(drone.vx,115),vy:0,angle:drone.angle};
  gate = scan = 0;
  droneTrail.length = 0;
  cameraSignal = '';
  radarLocked = false;
  patrols = planPatrols();
  rechargePack = planRechargePack();
  packCollected = false;
  terrain = paintTerrain();
  sound('scan');
}
function planRechargePack() {
  const anchors = [course.gates[Math.floor(course.gates.length/2)],course.start];
  const offsets = [[-54,0],[54,0],[0,52],[0,-52],[-48,47],[48,-47],[46,46],[-46,-46]];
  for (const [ax,ay] of anchors) {
    for (const [ox,oy] of offsets) {
      const x = ax+ox, y = ay+oy;
      if (x < 40 || x > 920 || y < 48 || y > 445) continue;
      if (course.walls.some(wall => touchesStructure(wall,x,y,37))) continue;
      if (course.gates.some(([gx,gy]) => Math.hypot(x-gx,y-gy)<49)) continue;
      if (course.pad && Math.hypot(x-course.pad[0],y-course.pad[1])<82) continue;
      const cell = chargeCells[courseIndex];
      if (cell && Math.hypot(x-cell[0],y-cell[1])<45) continue;
      return [x,y];
    }
  }
  return null;
}
function collectRechargePack(x,y) {
  if (!rechargePack || packCollected) return;
  const [px,py] = rechargePack;
  const spent = elapsed+drained;
  if (spent < 2 || Math.hypot(x-px,y-py) >= 24) return;
  drained -= Math.min(rechargeAmount,spent);
  packCollected = true;
  rechargeFlash = 1.2;
  sound('charge');
}
const patrolRadius = 66;
function planPatrols() {
  const count = course.sentinels ?? ((courseIndex+1)%3 === 0 ? (courseIndex >= 14 ? 2 : 1) : 0);
  if (!count) return [];
  const patrolGates = count === 1 ? [1] : [1,course.gates.length-2];
  return patrolGates.map((gateIndex,index) => {
    const [gx,gy] = course.gates[gateIndex];
    const candidates = [[-46,-36],[46,36],[-44,37],[44,-37],[0,42],[0,-42],[0,0]];
    const [ox,oy] = candidates.find(([ox,oy]) =>
      [-20,-10,0,10,20].every(dy => {
        const x = gx+ox, y = gy+oy+dy;
        return x > 35 && x < 925 && y > 35 && y < 465 &&
          !course.walls.some(wall => touchesStructure(wall,x,y,13));
      })) || [0,0];
    const x = gx+ox, y = gy+oy;
    const amplitude = [-20,-10,0,10,20].every(dy =>
      !course.walls.some(wall => touchesStructure(wall,x,y+dy,13))) ? 20 : 0;
    return {x,y,homeX:x,homeY:y,amplitude,phase:index*Math.PI,heading:index*Math.PI,angle:0,pursuing:false};
  });
}
function patrolPosition(patrol) {
  return [patrol.x,patrol.y,patrol.heading];
}
function inPatrolRadar(patrol,x,y) {
  const dx = x-patrol.x, dy = y-patrol.y;
  const angle = Math.atan2(dy,dx)-patrol.heading;
  const reach = patrol.pursuing ? 104 : patrolRadius;
  if (Math.hypot(dx,dy) > reach || Math.cos(angle) < .48) return false;
  for (let t=.12;t<1;t+=.12) if (blockedAt(patrol.x+dx*t,patrol.y+dy*t)) return false;
  return true;
}
function updatePatrol(patrol,x,y,dt) {
  if (patrol.pursuing) patrol.heading = Math.atan2(y-patrol.y,x-patrol.x);
  patrol.pursuing = jam === 0 && inPatrolRadar(patrol,x,y);
  const phase = elapsed*1.4+patrol.phase;
  const targetX = patrol.pursuing ? x : patrol.homeX;
  const targetY = patrol.pursuing ? y : patrol.homeY+patrol.amplitude*Math.sin(phase);
  const dx = targetX-patrol.x, dy = targetY-patrol.y;
  const distance = Math.hypot(dx,dy);
  const step = Math.min(Math.max(0,distance-(patrol.pursuing ? 33 : 0)),(patrol.pursuing ? 121 : 74)*dt);
  if (!patrol.pursuing) patrol.heading = phase;
  if (!step) {
    patrol.angle = turnNose(patrol.angle,0,0,dt);
    return;
  }
  const nextX = patrol.x+dx/distance*step;
  const nextY = patrol.y+dy/distance*step;
  if (nextX < 14 || nextX > 946 || nextY < 14 || nextY > 486 ||
      course.walls.some(wall => touchesStructure(wall,nextX,nextY,11))) {
    patrol.angle = turnNose(patrol.angle,0,0,dt);
    return;
  }
  patrol.angle = turnNose(patrol.angle,dx,dy,dt);
  patrol.x = nextX;
  patrol.y = nextY;
}
function drawPatrol(patrol) {
  const [x,y,phase] = patrolPosition(patrol);
  const muted = jam > 0;
  const color = muted ? '#ba8eff' : patrol.pursuing ? '#ff637c' : '#ffad67';
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color+(muted ? '16' : '36');
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x,y);
  const rays = phoneLayout.matches ? 12 : 20;
  for (let ray=0;ray<=rays;ray++) {
    const angle = phase-1.07+ray*2.14/rays;
    let reach = patrol.pursuing ? 104 : patrolRadius;
    for (let distance=4;distance<reach;distance+=4) {
      if (!blockedAt(x+Math.cos(angle)*distance,y+Math.sin(angle)*distance)) continue;
      reach = distance;
      break;
    }
    ctx.lineTo(x+Math.cos(angle)*reach,y+Math.sin(angle)*reach);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.translate(x,y);
  ctx.rotate(patrol.angle);
  paintDrone(ctx,{name:'Sentinel',color,size:14,arms:10,rotor:5},elapsed*20);
  ctx.restore();
  label(muted ? 'JAMMED' : patrol.pursuing ? 'PURSUIT' : 'SENTINEL',x,y-23,color,10);
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
  Workshop: {0:'laser',2:'pallet'}, 'Loading Bay': {2:'forklift'}, 'Rail Yard': {3:'pallet'},
  'Relay Station': {2:'switchgear'}, 'Floodworks': {3:'pump'}, 'Blackout Terminal': {1:'rack'}, 'Intake Dock': {0:'cargo',1:'cargo',2:'train',4:'cargo'},
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
const shipFallback = {deckCargo:'cargo',anchorWinch:'lift',shipVent:'conveyor',lifeboat:'jack',shipCrane:'lift',ballastPump:'server',deckGantry:'lift',cargoLift:'lift',davitRail:'conveyor',deckReels:'cargo',deckGenerator:'server',sensorPod:'cargo',shipExhaust:'conveyor',gangway:'lift',steelHatches:'cargo',bollardBank:'server',fireMain:'conveyor',radarMast:'server'};
const equipmentArt = {
  cargo: ['cargo', 'pallet', 'jack'],
  hangar: ['conveyor', 'lift'],
  tower: ['server'],
  rack: ['server', 'cargo'],
  pallet: ['pallet'],
  forklift: ['jack'],
  crane: ['lift'],
  drum: ['cargo', 'jack', 'pallet'],
  fan: ['conveyor', 'server', 'lift']
};
const factoryVariants = {
  cargo:['cargo','pallet','jack','toolbox'],
  hangar:['conveyor','lift','mill','press','laser','assembly'],
  tower:['server','transformer','switchgear'],
  rack:['server','cargo','toolbox'],
  drum:['compressor','turntable','robot','pallet'],
  fan:['blower','transformer','manifold','press','turntable'],
  tank:['tank','compressor','manifold','pump'],
  winch:['winch','robot','pump'],
  forklift:['forklift']
};
const equipmentAtlas = new Image();
equipmentAtlas.src = 'assets/warehouse-equipment.webp';
const factoryAtlas = new Image();
factoryAtlas.src = 'assets/factory-machinery.webp';
const workcellAtlas = new Image();
workcellAtlas.src = 'assets/factory-workcells.webp';
const equipmentSprites = {
  cargo:[4,19,212,102],pallet:[224,14,212,112],jack:[444,11,212,117],
  conveyor:[4,162,212,96],lift:[224,155,212,110],server:[449,144,202,132],
  train:[4,307,212,86],tank:[224,288,212,124],winch:[444,300,212,99]
};
const factorySprites = {
  robot:[3,15,214,110],press:[260,3,140,134],transformer:[453,3,193,134],
  blower:[3,162,214,96],mill:[223,163,214,94],compressor:[443,143,214,134],
  manifold:[3,296,214,107],toolbox:[223,284,214,132],battery:[467,283,166,134]
};
const workcellSprites = {
  forklift:[3,4,214,141],laser:[228,3,203,144],assembly:[443,5,214,140],
  switchgear:[27,153,165,144],pump:[234,153,192,144],turntable:[443,156,214,137]
};
const shipAtlas = new Image();
shipAtlas.src = 'assets/orison-deck.webp';
const shipSprites = {"deckCargo":[5,23,210,103],"anchorWinch":[225,28,210,94],"shipVent":[445,25,210,100],"lifeboat":[5,172,210,106],"shipCrane":[225,178,210,93],"ballastPump":[445,177,210,96]};
const shipMachineryAtlas = new Image();
shipMachineryAtlas.src = 'assets/orison-machinery.webp';
const shipMachinerySprites = {"deckGantry":[5,32,210,85],"cargoLift":[242,4,176,141],"davitRail":[445,44,210,62],"deckReels":[5,168,210,113],"deckGenerator":[230,154,200,141],"sensorPod":[445,154,209,141]};
const verticalShipAtlas = new Image();
verticalShipAtlas.src = 'assets/orison-vertical.webp';
const verticalShipSprites = {"shipExhaust":[33,4,73,202],"gangway":[169,4,81,202],"steelHatches":[319,4,61,202],"bollardBank":[41,214,58,202],"fireMain":[167,214,85,202],"radarMast":[297,214,106,202]};
const horizontalHandling = type => type === 'forklift' || type === 'jack';
function drawEquipmentSprite(ctx,w,h,type) {
  const rect = verticalShipSprites[type] || shipMachinerySprites[type] || shipSprites[type] || workcellSprites[type] || factorySprites[type] || equipmentSprites[type];
  const image = verticalShipSprites[type] ? verticalShipAtlas : shipMachinerySprites[type] ? shipMachineryAtlas : shipSprites[type] ? shipAtlas : workcellSprites[type] ? workcellAtlas : factorySprites[type] ? factoryAtlas : equipmentAtlas;
  if (!rect || !image.complete || !image.naturalWidth) return false;
  ctx.save();
  const rotate = !verticalShipSprites[type] && !horizontalHandling(type) && !['press','switchgear','turntable','shipCrane','deckGantry','cargoLift','davitRail'].includes(type) && h > w*1.25 && rect[2] > rect[3]*1.48;
  if (rotate) {
    ctx.translate(w,0);
    ctx.rotate(Math.PI/2);
    [w,h] = [h,w];
  }
  const aspect = rect[2]/rect[3];
  const columns = Math.max(1,Math.round(w/(h*aspect)));
  const rows = horizontalHandling(type) || orisonVerticalGear.includes(type) ? 1 : Math.max(1,Math.round(h/(w/aspect)));
  const width = w/columns;
  const height = h/rows;
  const gap = Math.min(width,height)*.025;
  ctx.shadowColor = '#080a10c9';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetY = 3;
  for (let row=0;row<rows;row++) {
    for (let col=0;col<columns;col++) {
      ctx.drawImage(image,...rect,col*width+gap,row*height+gap,width-gap*2,height-gap*2);
    }
  }
  ctx.restore();
  return true;
}
function paintEquipment(ctx,w,h,type,seed) {
  ctx.save();
  if (h > w) {
    ctx.translate(w,0);
    ctx.rotate(Math.PI/2);
    [w,h] = [h,w];
  }
  ctx.scale(w/120,h/60);
  const plate = (x,y,w,h,light='#94705b',dark='#3f2e2b') => surfacePanel(ctx,x,y,w,h,light,dark,2);
  // Oxidized steel base, recessed fasteners, and worn edges.
  plate(3,4,114,52,'#5e534d','#292321');
  ctx.fillStyle = '#b5957b';
  for (const x of [9,110]) for (const y of [9,50]) ctx.fillRect(x,y,3,2);
  if (type === 'server') {
    for (const x of [13,46,79]) {
      plate(x,9,29,41,'#84969a','#2c3538');
      for (let y=13;y<46;y+=5) {
        plate(x+3,y,23,4,'#384045','#171c21');
        ctx.fillStyle = y%2 ? '#9cd9b5' : '#c47049';
        ctx.fillRect(x+22,y+1,2,1);
      }
    }
  } else if (type === 'cargo') {
    for (const x of [12,64]) {
      plate(x,10,45,39,'#a5795f','#4b352e');
      for (let rib=x+5;rib<x+41;rib+=6) plate(rib,12,3,35,'#b18a70','#58433a');
      plate(x,12,45,3,'#8a8d83','#51423a');
      plate(x,44,45,3,'#8a8d83','#51423a');
      ctx.fillStyle = '#c3bbb0';
      ctx.fillRect(x+29,18,9,5);
    }
  } else if (type === 'pallet') {
    for (const x of [12,65]) {
      plate(x,10,42,40,'#795f4d','#352c22');
      for (let slat=x+2;slat<x+41;slat+=7) plate(slat,12,5,36);
      for (const y of [15,42]) plate(x,y,42,3,'#a79a8d','#57514a');
    }
  } else if (type === 'jack') {
    for (const y of [9,43]) {
      plate(15,y,18,8,'#3f4747','#151718');
      plate(74,y+4,34,5,'#9aa7a7','#414649');
      plate(102,y+3,7,8,'#555d5c','#272b2b');
    }
    plate(12,15,62,31,'#aa7352','#55382d');
    plate(24,20,40,21,'#55646b','#283036');
    plate(64,11,11,39,'#87827a','#3e3934');
    ctx.fillStyle = '#8ad6c7';
    ctx.fillRect(17,25,3,11);
    ctx.fillStyle = '#cb754f';
    ctx.fillRect(74,23,3,2);
  } else if (type === 'lift') {
    for (const y of [10,44]) {
      plate(10,y,100,5,'#a1a69b','#4e4b44');
      for (let x=17;x<105;x+=11) plate(x,y-2,3,9);
    }
    plate(46,8,29,44,'#98674f','#493431');
    plate(42,20,37,22,'#a3a6a1','#3c4a4c');
    ctx.strokeStyle = '#1c2224';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(61,32,6,0,Math.PI*1.65);
    ctx.stroke();
  } else if (type === 'conveyor') {
    plate(10,11,100,39,'#596363','#272c2d');
    for (let x=15;x<108;x+=5) plate(x,17,4,26,'#8a9899','#363d42');
    for (const y of [11,46]) plate(10,y,100,4);
    plate(83,40,20,12,'#8d6953','#463831');
  }
  // Repeatable paint chips add texture without changing from frame to frame.
  for (let chip=0;chip<58;chip++) {
    const x = 7+(chip*37+seed*13)%106;
    const y = 7+(chip*23+seed*17)%47;
    ctx.fillStyle = ['#b0623c88','#231a1b81','#d2b6a04c'][chip%3];
    ctx.fillRect(x,y,1+chip%5,1+chip%2);
  }
  ctx.restore();
}
const isPadded = type => type === 'foam' || type === 'fender';
function bounceOff(wall,previousX,previousY) {
  const [x,y,w,h,type] = wall;
  const corner = cornerRadius(w,h,type);
  const dx = drone.x-clamp(drone.x,x+corner,x+w-corner);
  const dy = drone.y-clamp(drone.y,y+corner,y+h-corner);
  const distance = Math.hypot(dx,dy);
  if (!distance) return false;
  const nx = dx/distance, ny = dy/distance;
  const inbound = drone.vx*nx + drone.vy*ny;
  if (inbound < -132) return false;
  drone.x = previousX;
  drone.y = previousY;
  if (inbound < 0) {
    drone.vx -= 1.36*inbound*nx;
    drone.vy -= 1.36*inbound*ny;
    sound('brake');
  }
  return true;
}
function quayProp(ctx,w,h,type) {
  if (isPadded(type)) {
    const round = type === 'fender' ? h/2 : 4;
    surfacePanel(ctx,2,2,w-4,h-4,'#87ebed','#1d5d72',round);
    ctx.strokeStyle = '#123747';
    ctx.lineWidth = 2;
    for (let x=9;x<w-6;x+=10) {
      ctx.beginPath();
      ctx.moveTo(x,5);
      ctx.lineTo(x-3,h-6);
      ctx.stroke();
    }
    return;
  }
  surfacePanel(ctx,5,6,w-10,h-12,'#60777d','#233b40',6);
  const radius = Math.min(w,h)*.29;
  for (const y of [h*.28,h*.72]) {
    circle(w/2,y,radius,ctx);
    ctx.fillStyle = '#1d292c';
    ctx.fill();
    for (let ring=radius*.45;ring<=radius;ring+=3) {
      circle(w/2,y,ring,ctx);
      ctx.strokeStyle = '#a7b79e';
      ctx.stroke();
    }
  }
}
function structure(ctx,[x,y,w,h,footprint],art = footprint) {
  // Use stationary storage in narrow bays where a forklift cannot sit horizontally.
  const type = art === 'forklift' && w < h*1.2 ? 'rack' : art;
  ctx.save();
  ctx.translate(x,y);
  const seed = Math.round(x+y);
  const original = equipmentArt[type];
  const variants = (factoryVariants[type] || original || [type])
    .filter(variant => w >= h*1.2 || !horizontalHandling(variant));
  const equipment = variants[seed%variants.length];
  if (drawEquipmentSprite(ctx,w,h,equipment)) {
    ctx.restore();
    return;
  }
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
  const fallbackArt = original || equipmentArt[footprint] || (course.sea ? [shipFallback[type] || 'cargo'] : null);
  if (fallbackArt) {
    const fallback = fallbackArt.filter(variant => w >= h*1.2 || !horizontalHandling(variant));
    paintEquipment(ctx,w,h,fallback[seed%fallback.length] || 'pallet',seed);
    ctx.restore();
    return;
  }
  const colors = {train:'#3b5960',water:'#153e4f',tank:'#535c60',winch:'#4c646a',foam:'#457a81',fender:'#457a81'};
  const steel = ctx.createLinearGradient(0,0,w,h);
  steel.addColorStop(0,colors[type] || '#4b5554');
  steel.addColorStop(.46,colors[type] || '#4b5554');
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
  if (isPadded(type) || type === 'winch') {
    quayProp(ctx,w,h,type);
    ctx.restore();
    return;
  }
  if (type === 'tank') {
    const tank = Math.min(w*.30,h*.19);
    const pipe = Math.max(4,w*.06);
    surfacePanel(ctx,w/2-pipe/2,h*.14,pipe,h*.72,'#94a0a4','#353e47',3);
    for (const cy of [h*.27,h*.73]) {
      const metal = ctx.createLinearGradient(w/2-tank,cy-tank,w/2+tank,cy+tank);
      metal.addColorStop(0,'#bcc5c5');
      metal.addColorStop(.48,'#606d73');
      metal.addColorStop(1,'#24323c');
      circle(w/2,cy,tank,ctx);
      ctx.fillStyle = metal;
      ctx.fill();
      ctx.strokeStyle = '#b7d1cf99';
      ctx.stroke();
      circle(w/2,cy,tank*.68,ctx);
      ctx.strokeStyle = '#2d4950';
      ctx.stroke();
      surfacePanel(ctx,w/2-tank*.30,cy-tank*.30,tank*.60,tank*.60,'#dce1d8','#425964',2);
      for (let i=0;i<6;i++) {
        const angle = i*Math.PI/3;
        circle(w/2+Math.cos(angle)*tank*.84,cy+Math.sin(angle)*tank*.84,1.3,ctx);
        ctx.fillStyle = '#e5ded0';
        ctx.fill();
      }
    }
  } else if (type === 'water') {
    reservoir(ctx,w,h);
  } else if (type === 'train') {
    for (let row=14;row<h-9;row+=18) {
      ctx.fillStyle = '#101d26';
      ctx.fillRect(8,row,9,9);
      ctx.fillRect(w-17,row,9,9);
    }
  }
  ctx.fillStyle = '#e7d9bd80';
  for (const bx of [6,w-8]) for (const by of [6,h-8]) ctx.fillRect(bx,by,2,2);
  ctx.fillStyle = '#111015ad';
  ctx.fillRect(12,h-25,Math.min(w-24,86),14);
  ctx.fillStyle = '#d4c6b0';
  ctx.font = '9px monospace';
  ctx.fillText({train:'METRO',water:'BASIN',tank:'PUMP'}[type] || '',18,h-15);
  if (type === 'train') {
    const inset = 5;
    if (w > h) {
      ctx.save();
      ctx.translate(w/2,h/2);
      ctx.rotate(Math.PI/2);
      drawSprite(ctx,4,-h/2+inset,-w/2+inset,h-2*inset,w-2*inset);
      ctx.restore();
    } else drawSprite(ctx,4,inset,inset,w-2*inset,h-2*inset);
  }
  ctx.restore();
}
function sprayTag(ctx,word,x,y,size,color) {
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(-.15);
  ctx.transform(1,0,-.24,.82,0,0);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'italic 900 ' + size + 'px system-ui';
  ctx.lineJoin = 'round';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#140d1ec9';
  ctx.strokeText(word,0,0);
  ctx.fillStyle = color;
  ctx.fillText(word,0,0);
  const edge = ctx.measureText(word).width/2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-edge*.74,size*.58);
  ctx.quadraticCurveTo(edge*.13,size*.74,edge*.9,size*.42);
  ctx.stroke();
  for (const offset of [-.65,.11,.55]) {
    ctx.beginPath();
    ctx.moveTo(edge*offset,size*.29);
    ctx.lineTo(edge*offset-2,size*(.4+Math.abs(offset)*.2));
    ctx.stroke();
  }
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
  concrete.addColorStop(0,course.quay ? '#1c3e3c' : '#262047');
  concrete.addColorStop(.55,course.quay ? '#152c36' : '#152a39');
  concrete.addColorStop(1,course.quay ? '#0a2125' : '#190f25');
  floor.fillStyle = concrete;
  floor.fillRect(0,0,960,500);
  for (let n=0;n<4800;n++) {
    floor.fillStyle = n%2 ? '#d1b0a20c' : '#00000025';
    floor.fillRect((n*163+Math.floor(n/960)*47)%960,(n*87+Math.floor(n/500)*37)%500,2+n%7,1+n%3);
  }
  if (course.quay) {
    floor.fillStyle = '#65bccb26';
    for (const y of [47,448]) {
      floor.fillRect(16,y,924,2);
      for (let x=24;x<940;x+=27) floor.fillRect(x,y+7,12,2);
    }
    sprayTag(floor,'NORTH QUAY',469,424,46,'#80c8ae66');
  }
  if (course.sea) {
    const sea = floor.createLinearGradient(0,0,960,500);
    sea.addColorStop(0,'#093852');
    sea.addColorStop(1,'#031723');
    floor.fillStyle = sea;
    floor.fillRect(0,0,960,36);
    floor.fillRect(0,464,960,36);
    for (let i=0;i<130;i++) {
      const x = (i*131)%960;
      const y = (i*17)%29;
      floor.fillStyle = i%3 ? '#91e9f326' : '#d6f9ff64';
      floor.fillRect(x,y+3,9+i%31,1);
      floor.fillRect(x,469+y,12+i%24,1);
    }
    for (const y of [35,464]) {
      floor.fillStyle = '#9aa1a4';
      floor.fillRect(12,y,934,2);
      floor.fillStyle = '#98d7cf';
      for (let x=18;x<946;x+=45) floor.fillRect(x,y-2,3,6);
    }
    sprayTag(floor,'M/V ORISON',460,450,38,'#a2cfca');
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
  const tags = course.quay ? ['QUAY CREW','NIGHT SHIFT','LOW TIDE','KEEP MOVING'] : graffiti;
  const tag = courseIndex < 0 ? 'NO BRAKES' : tags[courseIndex%tags.length];
  if (!course.sea) sprayTag(floor,tag,473,453,49,course.quay ? '#7bd4bcaa' : '#d77a9a9c');
  sprayTag(floor,course.sea ? 'RESCUE ACCESS' : course.quay ? 'STAY LOW' : 'EYES UP',750,66,31,'#8be1dd72');
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
    if (wall[4] === 'water' && w >= 65 && h >= 42) {
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
  const rays = phoneLayout.matches ? 16 : 34;
  for (let i=0;i<=rays;i++) {
    const angle = heading-beamWidth+i*2*beamWidth/rays;
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
// Rotor hubs and inner blade radii in the 256px airframe sprite cells.
const spriteRotors = [
  [[45,74,33],[211,74,33],[52,192,31],[201,192,31]],
  [[46,72,54],[209,72,54],[46,183,54],[209,183,54]],
  [[48,69,39],[207,69,39],[48,199,39],[207,199,39]],
  [[64,66,45],[190,66,45],[60,185,46],[195,185,46]],
  [[60,63,45],[197,63,45],[58,181,45],[199,181,45]],
  [[57,72,41],[197,72,41],[57,191,41],[197,191,41]],
  [[59,72,43],[197,72,43],[59,192,43],[197,192,43]],
  [[57,72,41],[197,72,41],[53,193,41],[201,193,41]]
];
const airframeLayers = [];
function spinSprite(ctx,index,spin,size) {
  const club = index >= 8;
  const isOnyx = fleet[index].onyx;
  const image = club ? clubAtlas : isOnyx ? onyxArt : index < 3 ? fleetArt : index < 5 ? storyAtlas : quayAtlas;
  if (!image.complete || !image.naturalWidth) return false;
  const column = club ? index-8 : isOnyx ? 0 : index < 3 ? index : index < 5 ? index-3 : index-5;
  const rotorLayout = spriteRotors[club ? [5,3,4,6][index-8] : index];
  if (!airframeLayers[index]) {
    const shell = document.createElement('canvas');
    shell.width = shell.height = 256;
    const paint = shell.getContext('2d');
    paint.drawImage(image,column*256,0,256,256,0,0,256,256);
    paint.globalCompositeOperation = 'destination-out';
    for (const [x,y,r] of rotorLayout) {
      circle(x,y,r,paint);
      paint.fill();
    }
    paint.globalCompositeOperation = 'source-over';
    if (index === 1) {
      // The Swift has exposed blades. Restore its struts under the spinning props.
      for (const [x,y] of rotorLayout) {
        paint.beginPath();
        paint.moveTo(128,y<128 ? 105 : 153);
        paint.lineTo(x,y);
        paint.lineWidth = 15;
        paint.strokeStyle = '#1c1821';
        paint.stroke();
        paint.lineWidth = 5;
        paint.strokeStyle = '#f3aa46';
        paint.stroke();
      }
    }
    // Bake the clipping masks once so phone frames only rotate and blit the blades.
    const propellers = index === 1 ? [] : rotorLayout.map(([x,y,r]) => {
      const blade = document.createElement('canvas');
      blade.width = blade.height = 2*r;
      const prop = blade.getContext('2d');
      circle(r,r,r,prop);
      prop.clip();
      prop.drawImage(image,column*256+x-r,y-r,2*r,2*r,0,0,2*r,2*r);
      return blade;
    });
    airframeLayers[index] = {shell,propellers};
  }
  ctx.save();
  ctx.translate(-size/2,-size/2);
  ctx.scale(size/256,size/256);
  const {shell,propellers} = airframeLayers[index];
  ctx.drawImage(shell,0,0);
  for (const [i,[x,y,r]] of rotorLayout.entries()) {
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(spin*(i === 0 || i === 3 ? 1 : -1));
    if (index === 1) {
      for (const direction of [-1,1]) {
        ctx.save();
        ctx.scale(direction,1);
        ctx.fillStyle = '#ffac4f';
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.quadraticCurveTo(25,-13,46,-5);
        ctx.quadraticCurveTo(40,7,0,4);
        ctx.fill();
        ctx.fillStyle = '#ffe5ad';
        ctx.fillRect(32,-5,7,1.8);
        ctx.restore();
      }
      circle(0,0,8,ctx);
      ctx.fillStyle = '#292431';
      ctx.fill();
    } else {
      ctx.drawImage(propellers[i],-r,-r);
    }
    ctx.restore();
  }
  ctx.restore();
  return true;
}
function paintDrone(ctx,frame,spin) {
  const index = fleet.indexOf(frame);
  const size = frame.size*2.25;
  if (index >= 0 && spinSprite(ctx,index,spin,size)) return;
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
function drawDroneTrail(points,frame,end) {
  if (points.length < 2) return;
  const ink = frame.onyx ? '#84fff1' : frame.color;
  ctx.save();
  ctx.lineCap = 'round';
  for (let i=0;i<points.length;i++) {
    const a = points[i];
    const b = points[i+1] ?? end;
    if (!b) break;
    const strength = Math.max(0,1-(elapsed-a.time)/trailLifetime);
    const hue = frame.onyx && strength < .55 ? '#bf76ff' : ink;
    ctx.beginPath();
    ctx.moveTo(a.x,a.y);
    ctx.lineTo(b.x,b.y);
    ctx.strokeStyle = hue;
    ctx.globalAlpha = .2*strength;
    ctx.lineWidth = 2+12*strength;
    ctx.stroke();
    ctx.globalAlpha = .76*strength;
    ctx.lineWidth = .5+3.6*strength;
    ctx.stroke();
  }
  ctx.restore();
}
function renderLoadout() {
  if (!airframe) return;
  const preview = get('#loadout');
  const surface = preview.getContext('2d');
  surface.clearRect(0,0,440,168);
  surface.save();
  surface.translate(220,84);
  const scale = fleet[progress.selected].onyx ? 4.05 : 4.3;
  surface.scale(scale,scale);
  surface.rotate(-.22);
  paintDrone(surface,fleet[progress.selected],performance.now()*.019);
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
function drawBatteryPickup(x,y) {
  ctx.save();
  ctx.translate(x,y);
  const light = ctx.createRadialGradient(0,0,4,0,0,25);
  light.addColorStop(0,'#bcff5a90');
  light.addColorStop(1,'#bcff5a00');
  ctx.fillStyle = light;
  ctx.fillRect(-25,-25,50,50);
  if (factoryAtlas.complete && factoryAtlas.naturalWidth) {
    ctx.drawImage(factoryAtlas,...factorySprites.battery,-16,-13,32,26);
  } else {
    ctx.fillStyle = '#d4a781';
    ctx.fillRect(-8,-12,5,4);
    ctx.fillRect(3,-12,5,4);
    surfacePanel(ctx,-12,-9,24,21,'#485052','#182022',4);
    ctx.fillStyle = '#b6ff64';
    ctx.fillRect(-12,-5,3,12);
    ctx.fillRect(9,-5,3,12);
    label('ϟ',0,1,'#ceff79',16);
  }
  ctx.restore();
}
function draw() {
  ctx.drawImage(terrain,0,0);
  if (course.exit || course.quay) {
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
  patrols.forEach(drawPatrol);
  const cell = chargeCells[courseIndex];
  if (cell && !cellCollected) drawBatteryPickup(...cell);
  label(courseIndex === freeFlightIndex ? 'SECTOR '+(freeSector+1) : courseIndex === -1 ? 'RACE ' + (raceSection+1) + '/' + raceSectionCount : 'NODE ' + String(courseIndex+1).padStart(2,'0'),62,27,'#b6d9d5',15);
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
  if (rechargePack && !packCollected) drawBatteryPickup(...rechargePack);
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
    if (rival && rival[3] === raceSection) {
      const wake = [];
      for (let age=trailLifetime;age>0;age-=.06) {
        const point = rivalPosition(race,elapsed-age);
        if (point?.[3] === raceSection) wake.push({x:point[0],y:point[1],time:elapsed-age});
      }
      drawDroneTrail(wake,race.frame,{x:rival[0],y:rival[1]});
      ctx.save();
      ctx.translate(rival[0],rival[1]);
      ctx.rotate(rivalAngle);
      ctx.globalAlpha = .69;
      paintDrone(ctx,race.frame,elapsed*15);
      ctx.restore();
      label('CPU',rival[0],rival[1]-25,'#f3b9ff',10);
    }
  }
  drawDroneTrail(droneTrail,airframe);
  ctx.translate(drone.x,drone.y);
  ctx.rotate(drone.angle);
  paintDrone(ctx,airframe,elapsed*35);
  ctx.restore();
}
function updateHudText(selector,text) {
  const element = get(selector);
  if (element.textContent !== text) element.textContent = text;
}
function remainingBattery() {
  return clamp(1-(elapsed+drained)/stats.seconds,0,1);
}
const raceMeters = [
  {meter:get('#playerRaceBattery'),card:get('#playerRacer'),value:get('#playerRacePercent')},
  {meter:get('#rivalRaceBattery'),card:get('#rivalRacer'),value:get('#rivalRacePercent')}
];
function updateRaceBattery(playerBattery,hostile) {
  // The scripted rival pays normal time-based battery use until it finishes.
  const rivalCapacity = race.sections[0].course.seconds + race.frame.battery;
  const rivalCharge = Math.ceil(100*clamp(1-Math.min(elapsed,race.finishTime)/rivalCapacity,0,1));
  for (const [index,charge] of [playerBattery,rivalCharge].entries()) {
    const {meter,card,value} = raceMeters[index];
    if (meter.value !== charge) {
      meter.value = charge;
      card.style.setProperty('--race-charge',charge+'%');
      value.textContent = charge+'%';
    }
    card.classList.toggle('race-critical',charge <= 20);
    card.classList.toggle('race-low',charge > 20 && charge <= 45);
  }
  raceMeters[0].card.classList.toggle('race-draining',hostile);
}
function hud() {
  const battery = Math.ceil(100*remainingBattery());
  const power = get('#power');
  const hostile = radarLocked || cameraSignal === 'red';
  if (courseIndex === -1) updateRaceBattery(battery,hostile);
  updateHudText('#batteryCondition',hostile ? 'Draining' : rechargeFlash > 0 ? 'Charging' : battery <= 20 ? 'Critical' : battery <= 45 ? 'Low' : 'Stable');
  if (batteryMeter.value !== battery) {
    batteryMeter.value = battery;
    power.style.setProperty('--battery-level',battery+'%');
  }
  power.classList.toggle('battery-low',battery <= 20);
  power.classList.toggle('battery-warn',battery > 20 && battery <= 45);
  power.classList.toggle('battery-charge',rechargeFlash > 0);
  updateHudText('#power b',battery + '%');
  updateHudText('#gates',(courseIndex === -1 ? (raceSection+1) + '/' + raceSectionCount + ' · Gates ' : 'Intel ') + gate + '/' + course.gates.length);
  updateHudText('#time',elapsed.toFixed(1) + ' s');
  updateHudText('#alert',radarLocked ? '◆ RADAR LOCK' : cameraSignal === 'red' ? '◆ SIGNAL DRAIN' : rechargeFlash > 0 ? 'ϟ RECHARGED' : cameraSignal === 'green' ? '● ALLIED FEED' : '○ SIGNAL CLEAR');
  get('#alert').classList.toggle('danger',radarLocked || cameraSignal === 'red');
  power.classList.toggle('hostile',hostile);
  updateHudText('#jamStatus',jam > 0 ? 'Jam ' + jam.toFixed(1) + 's' : courseIndex === freeFlightIndex ? 'Jams ∞' : 'Jams ' + jamsLeft + '/' + maxJams);
  get('#retryFlight').hidden = state !== 'paused';
  get('#endFree').hidden = state !== 'paused' || courseIndex !== freeFlightIndex;
  get('#jam').disabled = state !== 'flying' || jam > 0 || jamsLeft === 0;
  updateHudText('#best',courseIndex === freeFlightIndex ? 'Best '+progress.freeBest+' sectors' : courseIndex === -1 ? (elapsed >= race.finishTime ? 'Rival '+race.finishTime.toFixed(2)+' s' : 'Rival racing') : record ? 'Best ' + record.toFixed(1) + ' s' : 'Best —');
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
  if (key === 'r') {
    if (courseIndex === -1 && race.defeated) selectRace();
    else reset(courseIndex,true,storyFlight);
  }
  if (key === 'c') activateJam();
});
window.addEventListener('keyup',event => keyboard.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key));
window.addEventListener('blur',() => {
  clearInputs();
  if (state === 'flying') togglePause();
});
const joystick = get('.joystick');
const brakeButton = get('#brake');
function placeKnob(x,y) {
  joystick.style.setProperty('--stick-x',x+'px');
  joystick.style.setProperty('--stick-y',y+'px');
}
let stickBounds;
function centerJoystick() {
  const pointer = stick.pointer;
  stick.pointer = null;
  stickBounds = null;
  if (pointer !== null && joystick.hasPointerCapture(pointer)) joystick.releasePointerCapture(pointer);
  stick.x = stick.y = 0;
  placeKnob(0,0);
}
function steerByTouch(event) {
  const bounds = stickBounds;
  const reach = bounds.width*.32;
  const x = event.clientX-bounds.left-bounds.width/2;
  const y = event.clientY-bounds.top-bounds.height/2;
  const distance = Math.hypot(x,y);
  const push = Math.min(1,distance/reach);
  const directionX = x/(distance || 1);
  const directionY = y/(distance || 1);
  const power = Math.min(1,Math.max(0,(push-.12)/.88)*options.sensitivity/100);
  stick.x = directionX*power;
  stick.y = directionY*power;
  placeKnob(directionX*push*reach,directionY*push*reach);
}
joystick.addEventListener('pointerdown',event => {
  if (state !== 'flying' || event.button !== 0 || stick.pointer !== null) return;
  event.preventDefault();
  joystick.setPointerCapture(event.pointerId);
  stick.pointer = event.pointerId;
  stickBounds = joystick.getBoundingClientRect();
  steerByTouch(event);
});
joystick.addEventListener('pointermove',event => {
  if (event.pointerId === stick.pointer) steerByTouch(event);
});
brakeButton.addEventListener('pointerdown',event => {
  if (state !== 'flying' || event.button !== 0) return;
  event.preventDefault();
  brakeButton.setPointerCapture(event.pointerId);
  brakePointers.add(event.pointerId);
  brakeButton.classList.add('held');
});
for (const type of ['pointerup','pointercancel','lostpointercapture']) {
  joystick.addEventListener(type,event => {
    if (event.pointerId === stick.pointer) centerJoystick();
  });
  brakeButton.addEventListener(type,event => {
    brakePointers.delete(event.pointerId);
    brakeButton.classList.toggle('held',brakePointers.size > 0);
  });
}
window.matchMedia('(orientation: portrait)').addEventListener('change',() => {
  clearInputs();
  if (state === 'flying') togglePause();
});
window.addEventListener('resize',() => {
  if (stick.pointer !== null) stickBounds = joystick.getBoundingClientRect();
  flightNeedsRender = true;
});
document.addEventListener('visibilitychange',() => {
  if (!document.hidden) return;
  clearInputs();
  if (state === 'flying') togglePause();
});
pageButtons.forEach(button => button.addEventListener('click',() => {
  const page = button.dataset.page;
  if (page === currentPage) return;
  if (page === 'race') {
    if (courseIndex === -1 && (state === 'flying' || state === 'paused')) showPage('flight');
    else selectRace();
  } else if (page === 'free' && courseIndex === freeFlightIndex && (state === 'flying' || state === 'paused')) showPage('flight');
  else if (page === 'story') resumeCampaign();
  else showPage(page);
}));
for (const mode of ['race','free']) {
  get('#'+mode+'Pilot').addEventListener('change',event => {
    arcadeChoice[mode] = event.target.value;
    if (mode === 'race' && race?.rival === event.target.value) selectRace();
  });
}
get('#freeFly').addEventListener('click',() => {reset(freeFlightIndex); showPage('flight');});
get('#endFree').addEventListener('click',() => {finish(false,'Run ended.'); showPage('free');});
get('#backToRacePilots').addEventListener('click',() => {
  selectRace();
  get('#racePilot').focus();
});
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
get('#storyMission').addEventListener('change',event => selectStoryMission(Number(event.target.value)));
storyCases.forEach(([selector,first],index) => {
  get(selector).addEventListener('click',() => {
    if ((progress.campaignNext || 0) < first) return;
    const position = campaignPosition();
    const last = storyCases[index+1]?.[1] ?? courses.length+1;
    if (position < first || position >= last) selectStoryMission(first);
    else if (first > 0 && storyLines === campaignReveals[first]?.lines) {
      progress.campaignRevealed = first;
      saveProgress();
      startBriefing(first);
    } else resumeCampaign();
  });
});
get('#restartStory').addEventListener('click',() => selectStoryMission(0));
get('#prevMission').addEventListener('click',() => {missionPage--; renderMissionPage();});
get('#nextMission').addEventListener('click',() => {missionPage++; renderMissionPage();});
const jamButton = get('#jam');
jamButton.addEventListener('pointerdown',event => {
  // A second finger has its own pointer, even while the stick holds capture.
  if (event.button === 0) activateJam();
});
jamButton.addEventListener('click',event => {
  // Keyboard and assistive technology clicks have no preceding pointer press.
  if (event.detail === 0) activateJam();
});
get('#openUpgrades').addEventListener('click',() => showPage('upgrades'));
get('#backToHangar').addEventListener('click',() => showPage('hangar'));
function applyAudio() {
  soundEnabled = options.sound;
  get('#audio').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  get('#audio').setAttribute('aria-pressed',soundEnabled);
  get('#soundSetting').checked = soundEnabled;
  if (soundEnabled) enableFlightAudio();
  setTechnoMusic(soundEnabled);
  if (!soundEnabled) Object.values(effects).forEach(effect => effect.pause());
}
function changeAudio(enabled) {
  options.sound = enabled;
  writeData(optionsKey,options);
  applyAudio();
}
get('#audio').addEventListener('click',() => changeAudio(!options.sound));
get('#soundSetting').addEventListener('change',event => changeAudio(event.target.checked));
get('#pause').addEventListener('click',togglePause);
get('#retryFlight').addEventListener('click',() => {if (state === 'paused') reset(courseIndex,true,storyFlight);});
action.addEventListener('click',() => nextAction());
const main = get('main');
const mainMenu = get('#mainMenu');
const menuActions = get('#menuActions');
const saveMenu = get('#saveMenu');
const settingsMenu = get('#settingsMenu');
const slotList = get('#saveSlots');
const replacePrompt = get('#replacePrompt');
const replaceSave = get('#replaceSave');

function showMenuSection(section) {
  for (const node of [menuActions,saveMenu,settingsMenu]) node.hidden = node !== section;
  section.querySelector('button:not(:disabled):not([hidden]), select')?.focus();
}
function openMenu() {
  if (state === 'flying') togglePause();
  flightAudio(0,false,false,false);
  if (currentPage !== 'menu') gamePage = currentPage;
  currentPage = 'menu';
  main.hidden = true;
  mainMenu.hidden = false;
  get('#backToGame').hidden = !activeSlot;
  get('#loadGame').disabled = !slotKeys.some(key => loadProgress(key));
  get('#storageStatus').hidden = storageAvailable;
  showMenuSection(menuActions);
}
function enterGame(page) {
  mainMenu.hidden = true;
  main.hidden = false;
  if (page) showPage(page);
  else resumeCampaign();
  if (currentPage !== 'flight' || state !== 'flying') {
    get(currentPage === 'flight' ? '#action' : '#openMenu').focus();
  }
}
function openSave(key,saved) {
  activeSlot = key;
  progress = saved || {...freshProgress(),ignoreLegacyBests:true};
  race = undefined;
  arcadeChoice.race = arcadeChoice.free = 'equipped';
  const pilotsAssigned = assignPilotFrames();
  if (awardAchievements() || pilotsAssigned || !saved) saveProgress();
  reset(0);
  renderMissionPage();
  enterGame();
}
function chooseSave(creating) {
  replacePrompt.hidden = replaceSave.hidden = true;
  get('#saveTitle').textContent = creating ? 'New game' : 'Load game';
  slotList.replaceChildren(...slotKeys.map((key,index) => {
    const saved = loadProgress(key);
    const button = document.createElement('button');
    const checkpoint = saved?.campaignCursor ?? saved?.campaignNext ?? 0;
    const label = !saved ? 'Empty' : checkpoint >= courses.length ? 'Campaign complete' : courses[checkpoint]?.name || 'Saved campaign';
    button.textContent = 'Slot ' + (index+1) + ' · ' + label;
    button.disabled = !creating && !saved;
    button.addEventListener('click',() => {
      if (!creating || !saved) {
        openSave(key,saved);
        return;
      }
      replacePrompt.textContent = 'Replace all progress in slot ' + (index+1) + '?';
      replacePrompt.hidden = replaceSave.hidden = false;
      replaceSave.onclick = () => openSave(key,null);
      replaceSave.focus();
    });
    return button;
  }));
  showMenuSection(saveMenu);
}
get('#touchStart').addEventListener('click',() => {
  get('#startScreen').hidden = true;
  applyAudio();
  openMenu();
});
get('#openMenu').addEventListener('click',openMenu);
get('#backToGame').addEventListener('click',() => enterGame(gamePage));
get('#loadGame').addEventListener('click',() => chooseSave(false));
get('#newGame').addEventListener('click',() => chooseSave(true));
get('#openSettings').addEventListener('click',() => showMenuSection(settingsMenu));
document.querySelectorAll('.menu-back').forEach(button =>
  button.addEventListener('click',() => showMenuSection(menuActions)));
const difficulty = get('#difficulty');
difficulty.value = options.difficulty;
difficulty.addEventListener('change',() => {
  options.difficulty = difficulty.value;
  writeData(optionsKey,options);
});
const sensitivity = get('#sensitivity');
sensitivity.value = options.sensitivity;
get('#sensitivityValue').textContent = options.sensitivity + '%';
sensitivity.addEventListener('input',() => {
  options.sensitivity = Number(sensitivity.value);
  get('#sensitivityValue').textContent = options.sensitivity + '%';
  writeData(optionsKey,options);
});

function renderCharacterFiles() {
  get('#characterFiles').replaceChildren(...Object.entries(crew).map(([key,[name,role,portrait]]) => {
    const card = document.createElement('button');
    card.addEventListener('click',() => showCharacterProfile(key));
    const image = document.createElement('img');
    image.src = 'assets/crew-' + portrait + '.webp';
    image.alt = '';
    image.loading = 'lazy';
    image.width = image.height = 88;
    const text = document.createElement('span');
    const heading = document.createElement('strong');
    heading.textContent = name;
    const position = document.createElement('span');
    position.className = 'character-role';
    position.textContent = role;
    const bio = document.createElement('span');
    const unlocked = unlockedPilots().includes(key);
    card.disabled = !unlocked;
    bio.textContent = unlocked ? 'View full profile · '+fleet[progress.pilotFrames[key]].name : 'Unlock after Story '+pilotUnlocks[key];
    bio.className = 'profile-link';
    text.append(heading,position,bio);
    card.append(image,text);
    return card;
  }));
}
function showCharacterProfile(key) {
  if (!unlockedPilots().includes(key)) return;
  const [name,role,portrait] = crew[key];
  const art = get('#profileArt');
  art.src = 'assets/crew-full-' + portrait + '.webp';
  art.alt = 'Full-body illustration of ' + name;
  get('#profileName').textContent = name;
  get('#profileRole').textContent = role;
  get('#profileBio').textContent = crewBios[key];
  get('#characterProfile').showModal();
}
renderCharacterFiles();

function preloadMedia() {
  const portraits = ['crew-expression-7', ...new Set(Object.values(crew).flatMap(([, ,index]) =>
    index < 8 ? ['crew-'+index,'crew-expression-'+index] : ['crew-'+index]))];
  const sceneArt = Object.values(campaignReveals).flatMap(({lines}) =>
    lines.flatMap(([, , ,illustration]) => illustration ? [illustration.src] : []));
  const art = ['assets/night-watch-crew.webp',...portraits.map(name => 'assets/'+name+'.webp'),...sceneArt];
  const atlases = [atlas,quayAtlas,onyxArt,clubAtlas,storyAtlas,fleetArt,equipmentAtlas,factoryAtlas,workcellAtlas,shipAtlas,shipMachineryAtlas,verticalShipAtlas];
  const media = [
    ...atlases.map(image => () => image.decode()),
    ...art.map(url => () => {
      const image = new Image();
      image.fetchPriority = 'low';
      image.src = url;
      return image.decode();
    }),
    ...Object.values(effects).map(effect => () => new Promise(resolve => {
      if (effect.readyState >= 2) {resolve(true); return;}
      const events = new AbortController();
      const done = () => {
        clearTimeout(timeout);
        events.abort();
        resolve(effect.readyState >= 2);
      };
      const timeout = setTimeout(done,5000);
      effect.addEventListener('loadeddata',done,{signal:events.signal});
      effect.addEventListener('error',done,{signal:events.signal});
      effect.preload = 'auto';
      if (effect.paused && effect.networkState === HTMLMediaElement.NETWORK_EMPTY) effect.load();
    }))
  ];
  const meter = get('#mediaProgress');
  const status = get('#mediaStatus');
  meter.max = media.length;
  meter.value = 0;
  let unavailable = 0;
  let next = 0;
  const warm = async () => {
    while (next < media.length) {
      const load = media[next++];
      if (await Promise.resolve().then(load).catch(() => false) === false) unavailable++;
      meter.value++;
    }
  };
  status.textContent = 'Preloading art and audio…';
  Promise.all(Array.from({length:4},warm)).then(() => {
    status.textContent = unavailable ? 'Ready to play · some media may load on demand' : 'Art and audio ready';
  });
}
for (const artwork of [quayAtlas,onyxArt,clubAtlas,storyAtlas,fleetArt]) {
  artwork.addEventListener('load',() => {
    flightNeedsRender = true;
    if (currentPage === 'hangar') renderLoadout();
    if (currentPage === 'flight') drawRaceLoadout();
  });
}
for (const artwork of [equipmentAtlas,factoryAtlas,workcellAtlas,shipAtlas,shipMachineryAtlas,verticalShipAtlas]) {
  artwork.addEventListener('load',() => {
    if (course) terrain = paintTerrain();
    flightNeedsRender = true;
  });
}
atlas.addEventListener('load',() => {
  if (course) terrain = paintTerrain();
  flightNeedsRender = true;
  renderLoadout();
});
let flightNeedsRender = true;
let last = performance.now();
let lastRender = -Infinity;
let wasFlying = false;
function frame(now) {
  const startedFlying = state === 'flying';
  let remaining = Math.min(Math.max(0,(now-last)/1000),.1);
  while (remaining > 0 && state === 'flying') {
    const step = Math.min(remaining,1/60);
    update(step);
    remaining -= step;
  }
  const flying = state === 'flying';
  if ((wasFlying || startedFlying) && !flying) flightAudio(0,false,false,false);
  wasFlying = flying;
  last = now;
  const animateFlight = flying && (!phoneLayout.matches || now-lastRender >= 32);
  if (currentPage === 'flight' && (flightNeedsRender || animateFlight)) {
    draw();
    hud();
    flightNeedsRender = false;
    lastRender = now;
  } else if (currentPage === 'hangar' && now-lastRender >= 33) {
    renderLoadout();
    lastRender = now;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

preloadMedia();
get('#touchStart').disabled = false;
