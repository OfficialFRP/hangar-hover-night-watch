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
   intro:'Ride out strong crosswinds, scan five targets, then fly straight through the east loading door.'}
];

const fleet = [
  {name:'Scout S1', color:'#8fffd2', thrust:455, battery:0, brake:9, size:17, exposure:1, arms:10, rotor:5, windResponse:1, desc:'Balanced handling'},
  {name:'Swift X2', color:'#ffc27d', thrust:590, battery:-3, brake:9.5, size:15, exposure:1.18, arms:8, rotor:5, windResponse:1.1, desc:'Fastest frame · shorter battery'},
  {name:'Warden L3', color:'#aebeff', thrust:395, battery:7, brake:10.5, size:18, exposure:.72, arms:13, rotor:7, windResponse:.55, desc:'Extended props · steadier in gusts'}
];
const upgrades = [
  {name:'Extended battery', description:'+4 seconds per tier', cost:100, max:3},
  {name:'Motor tuning', description:'+7% thrust per tier', cost:125, max:3},
  {name:'Stabilizer', description:'Stronger braking and easier landings', cost:100, max:3}
];
const saveKey = 'hangar-hover-night-watch-v1';
function loadProgress() {
  const initial = {credits:100, cleared:[], selected:0, levels:fleet.map(() => [0,0,0])};
  try { return JSON.parse(localStorage.getItem(saveKey)) || initial; }
  catch { return initial; }
}
let progress = loadProgress();
function saveProgress() {
  try { localStorage.setItem(saveKey,JSON.stringify(progress)); } catch {}
}
// Each mission can place one optional battery cell at [x, y].
const chargeCells = [null,[467,252],[454,270],[451,241],[707,293],[447,277],[730,283],[562,391]];
const spriteBounds = [[8, 20, 284, 260], [308, 24, 284, 252], [608, 25, 284, 249], [91, 308, 117, 284], [391, 308, 117, 284], [671, 308, 158, 284], [8, 658, 284, 184], [308, 656, 284, 188], [608, 612, 284, 276]];
const atlas = new Image();
atlas.src = 'assets/sprite-atlas.webp';
function drawSprite(surface,index,x,y,w,h) {
  if (!atlas.complete || !atlas.naturalWidth) return false;
  surface.drawImage(atlas,...spriteBounds[index],x,y,w,h);
  return true;
}

const music = new Audio('assets/night-line.wav');
music.loop = true;
music.volume = .30;
const effects = Object.fromEntries(['launch','scan','jam','drain','charge','crash','complete'].map(name => {
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
    reset(courseIndex);
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

function showPage(page) {
  if (page !== 'flight' && state === 'flying') togglePause();
  currentPage = page;
  pageButtons.forEach(button => {
    const selected = button.dataset.page === page;
    button.setAttribute('aria-pressed',selected);
    get('#page-' + button.dataset.page).hidden = !selected;
  });
  if (page === 'flight') hud();
  if (page === 'missions') {
    missionPage = Math.floor(courseIndex/missionsPerPage);
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
  reset(courseIndex);
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
function reset(index, fly = false) {
  courseIndex = index;
  course = courses[index];
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
  record = storedBest();
  clearInputs();
  state = fly ? 'flying' : 'ready';
  renderHangar();
  if (fly) {
    sound('launch');
    overlay.hidden = true;
    action.blur();
  } else menu(course.name, course.intro, 'Launch drone', () => reset(index,true));
}
function finish(won, message) {
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
    saveProgress();
    message += ' +' + payout + ' credits.';
  }
  renderHangar();
  const hasNext = won && courseIndex < courses.length - 1;
  if (won && course.exit) {
    menu('MISSION ACCOMPLISHED',message,'Mission list',() => {
      reset(courseIndex);
      showPage('missions');
    });
  } else {
    menu(won ? 'Touchdown!' : 'Flight ended', message, hasNext ? 'Next course' : 'Fly again',
      () => reset(hasNext ? courseIndex + 1 : courseIndex, !hasNext));
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
  const gust = course.wind ? (course.wind === true ? 120 : course.wind) * airframe.windResponse : 0;
  const wind = gust * Math.sin(elapsed * 2.3);
  const crosswind = course.exit ? gust*.76 * Math.sin(elapsed*1.47+.8) : 0;
  const drag = Math.exp(-(braking ? stats.brake : 1.9) * dt);
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
  if (scan >= .24) {
    gate++;
    scan = 0;
    sound('scan');
  }
  if (course.exit) {
    if (doorOpen && x >= 960) finish(true,'All five targets recorded. Warehouse cleared in ' + elapsed.toFixed(1) + ' seconds.');
    return;
  }
  const [px,py] = course.pad;
  const steady = gate === course.gates.length && Math.hypot(x-px,y-py) < 29 && Math.hypot(vx,vy) < stats.landingSpeed;
  landing = steady ? landing + dt : 0;
  if (landing >= 0.65) finish(true, 'Targets recorded and drone extracted in ' + elapsed.toFixed(1) + ' seconds.');
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
  return Math.min(w,h) * (type === 'fan' || type === 'drum' ? .47 : .16);
}
function touchesStructure([x,y,w,h,type],px,py,radius = 0) {
  const corner = cornerRadius(w,h,type);
  return Math.hypot(px-clamp(px,x+corner,x+w-corner),py-clamp(py,y+corner,y+h-corner)) < corner+radius;
}

function structure(ctx,[x,y,w,h,type]) {
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = '#070e14aa';
  const rounding = cornerRadius(w,h,type);
  ctx.beginPath();
  ctx.roundRect(6,8,w,h,rounding);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(0,0,w,h,rounding);
  ctx.clip();
  const colors = {hangar:'#334a54',cargo:'#675449',tower:'#444863',train:'#3b5960',water:'#153e4f',tank:'#535c60',fan:'#49676b',drum:'#875e4d'};
  const steel = ctx.createLinearGradient(0,0,w,h);
  steel.addColorStop(0,colors[type]);
  steel.addColorStop(.46,colors[type]);
  steel.addColorStop(1,'#15151d');
  ctx.fillStyle = steel;
  ctx.fillRect(0,0,w,h);
  ctx.fillStyle = '#fff2e32e';
  ctx.fillRect(3,3,w-6,4);
  ctx.fillStyle = '#07070c88';
  ctx.fillRect(3,h-8,w-6,5);
  ctx.strokeStyle = '#98b5bc88';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(1,1,w-2,h-2,rounding);
  ctx.stroke();
  ctx.strokeStyle = '#abbec72e';
  ctx.lineWidth = 1;
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
    for (let row=14;row<h-7;row+=14) {
      ctx.beginPath();
      for (let col=8;col<w-6;col+=5) ctx.lineTo(col,row+2*Math.sin(col/9+row));
      ctx.stroke();
    }
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
  concrete.addColorStop(0,'#203d40');
  concrete.addColorStop(.55,'#1b3037');
  concrete.addColorStop(1,'#111c29');
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
  sprayTag(floor,graffiti[courseIndex],462,457,47,'#c787b87a');
  for (const [x,y] of [course.start,course.pad || [950,course.exit[0]]]) {
    const light = floor.createRadialGradient(x,y,4,x,y,118);
    light.addColorStop(0,'#cab8ff2e');
    light.addColorStop(1,'#cab8ff00');
    floor.fillStyle = light;
    floor.fillRect(x-118,y-118,236,236);
  }
  course.walls.forEach(wall => structure(floor,wall));
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
  if (drawSprite(ctx,index,-size/2,-size/2,size,size)) return;
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
  label('NODE ' + String(courseIndex+1).padStart(2,'0'),62,27,'#b6d9d5',15);
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
  ctx.translate(drone.x,drone.y);
  ctx.rotate(drone.angle);
  paintDrone(ctx,airframe,elapsed*35);
  ctx.restore();
}
function hud() {
  const battery = Math.max(0,Math.ceil(100*(1-(elapsed+drained)/stats.seconds)));
  get('meter').value = battery;
  get('#power b').textContent = battery + '%';
  get('#gates').textContent = 'Intel ' + gate + '/' + course.gates.length;
  get('#time').textContent = elapsed.toFixed(1) + ' s';
  get('#alert').textContent = cameraSignal === 'red' ? '◆ SIGNAL DRAIN' : cameraSignal === 'green' ? '● ALLIED FEED' : '○ SIGNAL CLEAR';
  get('#alert').classList.toggle('danger',cameraSignal === 'red');
  get('#power').classList.toggle('hostile',cameraSignal === 'red');
  get('#jamStatus').textContent = jam > 0 ? 'Jam ' + jam.toFixed(1) + 's' : 'Jams ' + jamsLeft + '/2';
  get('#jam').disabled = state !== 'flying' || jam > 0 || jamsLeft === 0;
  get('#best').textContent = record ? 'Best ' + record.toFixed(1) + ' s' : 'Best —';
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
  if (key === 'r') reset(courseIndex,true);
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
pageButtons.forEach(button => button.addEventListener('click',() => showPage(button.dataset.page)));
get('#prevMission').addEventListener('click',() => {missionPage--; renderMissionPage();});
get('#nextMission').addEventListener('click',() => {missionPage++; renderMissionPage();});
get('#jam').addEventListener('click',activateJam);
get('#openUpgrades').addEventListener('click',() => showPage('upgrades'));
get('#backToHangar').addEventListener('click',() => showPage('hangar'));
get('#audio').addEventListener('click',() => {
  soundEnabled = !soundEnabled;
  get('#audio').textContent = soundEnabled ? 'Sound on' : 'Sound off';
  get('#audio').setAttribute('aria-pressed',soundEnabled);
  if (soundEnabled) music.play().catch(() => {});
  else {
    music.pause();
    Object.values(effects).forEach(effect => effect.pause());
  }
});
get('#pause').addEventListener('click',togglePause);
action.addEventListener('click',() => nextAction());
reset(0);
renderMissionPage();
atlas.addEventListener('load',() => {
  terrain = paintTerrain();
  renderLoadout();
});
let last = performance.now();
function frame(now) {
  if (state === 'flying') update(Math.min((now-last)/1000,1/30));
  last = now;
  if (currentPage === 'flight') {draw(); hud();}
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
