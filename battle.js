// Drone Battle shares art and flight steering with the campaign.
const battleModules = [
  {name:'Pulse cannon',description:'More damage on straight and charged shots',cost:100},
  {name:'Scatter array',description:'Adds pellet damage and extra pellets at higher tiers',cost:110},
  {name:'Deflector',description:'Longer shields and shorter recharge',cost:100}
];
const battleTierLimit = 5;
const battleHeld = new Set();
const battleStick = {x:0,y:0,id:null};
const battleWalls = [[317,68,10,79],[317,263,10,119],[636,68,10,126],[636,306,10,76]];
const battleCargo = [[207,62,64,51],[188,334,66,54],[426,57,66,57],[477,336,66,59],[696,65,64,57],[744,338,65,58]];
const captureWalls = [[474,114,12,224],[302,72,10,100],[302,264,10,111],[648,70,10,111],[648,280,10,100]];
const captureCargo = [[196,94,60,50],[211,325,61,50],[418,77,64,48],[479,312,66,53],[717,95,62,49],[733,321,65,52]];
let battleBlockers = [...battleWalls,...battleCargo];
const battleCameras = [[260,130,.55],[566,139,2.55],[712,303,-2.35]];
const battleRounds = 3;
const battleLives = 3;
const battleHullCapacity = 140;
const defenderHullCapacity = 158;
const captureCells = [[14,289],[669,946]];
const capturePadPositions = [[69,202],[891,248]];
const capturePatrol = [[71,137],[148,74],[249,62],[261,210],[254,414],[144,350],[78,275]];
const battleRoundCredits = {Victory:65,Defeat:20,Draw:20};
const battleMatchCredits = {Victory:175,Defeat:45};
const battlePackSpots = [[160,260],[381,178],[481,233],[579,284],[807,200]];
const battleArtwork = new Image();
battleArtwork.src = 'assets/battle-atlas.webp';
const battleSprites = {cargo:0,camera:1,pack:2,powered:3,pulse:4,scatter:5};
const allyChoices = new Set();
let battle;
let battleBackdrop;
let battleLastDraw = 0;

function battleUnlocked() {
  return hasKingAccess() || progress.campaignNext >= courses.length;
}
function renderBattleSetup() {
  const unlocked = battleUnlocked();
  get('#battleLocked').hidden = unlocked;
  get('#battleSetup').hidden = !unlocked || Boolean(battle);
  get('#battleArena').hidden = !unlocked || !battle;
  if (!unlocked || battle) return;
  const pilot = get('#battlePilot');
  const previousPilot = pilot.value;
  pilot.replaceChildren(new Option('Equipped · '+fleet[progress.selected].name,'equipped'));
  if (frameAvailable(omegaFrameIndex) && progress.selected !== omegaFrameIndex) {
    pilot.append(new Option(fleet[omegaFrameIndex].name,'owned-'+omegaFrameIndex));
  }
  for (const key of unlockedPilots()) {
    pilot.append(new Option(crew[key][0]+' · '+fleet[progress.pilotFrames[key]].name,key));
  }
  pilot.value = [...pilot.options].some(option => option.value === previousPilot) ? previousPilot : 'equipped';
  updatePilotPicker('battle',pilot);
  const omegaChoice = [...pilot.options].some(option => option.value === 'owned-'+omegaFrameIndex) ? ['owned-'+omegaFrameIndex] : [];
  renderPilotFaces(get('#battlePilotFaces'),pilot,['equipped',...omegaChoice,...unlockedPilots()],renderBattleSetup);
  const roster = unlockedPilots().length;
  const minimum = get('#battleMode').value === 'capture' ? 2 : 1;
  get('#battleGuardNote').hidden = minimum === 1;
  const allyCount = Math.trunc(Number(get('#battleAllies').value)) || 1;
  const enemyCount = Math.trunc(Number(get('#battleEnemies').value)) || 1;
  const allySize = clamp(allyCount,minimum,roster-minimum);
  get('#battleAllies').min = get('#battleEnemies').min = minimum;
  get('#battleAllies').max = roster-minimum;
  get('#battleEnemies').max = roster-allySize;
  get('#battleAllies').value = allySize;
  get('#battleEnemies').value = clamp(enemyCount,minimum,roster-allySize);
  renderBattleAllyPicker();
}
function renderBattleAllyPicker() {
  const pilot = get('#battlePilot').value;
  const max = Number(get('#battleAllies').value)-1;
  allyChoices.delete(pilot);
  [...allyChoices].slice(max).forEach(key => allyChoices.delete(key));
  get('#chooseBattleAllies').hidden = max <= 0;
  updateHudText('#chooseBattleAllies','Choose teammates · '+allyChoices.size+'/'+max);
  const panel = get('#battleAllyList');
  const candidates = unlockedPilots().filter(key => key !== pilot);
  panel.replaceChildren(...candidates.map(key => {
    const label = document.createElement('label');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = allyChoices.has(key);
    box.disabled = !box.checked && allyChoices.size >= max;
    box.addEventListener('change',() => {
      if (box.checked && allyChoices.size < max) allyChoices.add(key);
      else allyChoices.delete(key);
      updateHudText('#chooseBattleAllies','Choose teammates · '+allyChoices.size+'/'+max);
      for (const [index,child] of [...panel.children].entries()) {
        const checkbox = child.firstElementChild;
        const option = candidates[index];
        checkbox.checked = allyChoices.has(option);
        checkbox.disabled = !checkbox.checked && allyChoices.size >= max;
      }
    });
    const portrait = document.createElement('img');
    portrait.alt = '';
    portrait.loading = 'lazy';
    racePortrait(portrait,key);
    label.append(box,portrait,document.createTextNode(crew[key][0]));
    return label;
  }));

}
function startBattle() {
  if (!battleUnlocked() || battle) return;
  renderBattleSetup();
  const pilot = get('#battlePilot').value;
  const selected = [...allyChoices];
  const available = unlockedPilots().filter(key => key !== pilot && !allyChoices.has(key));
  const takePilot = () => available.splice(Math.floor(Math.random()*available.length),1)[0];
  const allyCount = Number(get('#battleAllies').value);
  const enemyCount = Number(get('#battleEnemies').value);
  const customOmega = pilot === 'owned-'+omegaFrameIndex;
  const playerFrame = customOmega ? omegaFrameIndex :
    pilot === 'equipped' ? progress.selected : progress.pilotFrames[pilot];
  const spawn = (team,key,frameIndex,index,total) => ({
    omega:fleet[frameIndex].omega ? {...progress.omega} : null,
    team,key,frame:fleet[frameIndex],modules:index === 0 && team === 0 ? progress.battleLevels[frameIndex] : [0,0,0],
    x:team ? 855-index%3*35 : 105+index%3*35,y:55+(index+1)*340/(total+1),
    angle:team ? -Math.PI/2 : Math.PI/2,health:battleHullCapacity,maxHull:battleHullCapacity,shotWait:.4+index*.12,scatterWait:0,
    shieldWait:0,shield:0,trail:[],dealt:0,taken:0,totalDealt:0,totalTaken:0,player:team === 0 && index === 0
  });
  const units = [spawn(0,customOmega ? 'equipped' : pilot,playerFrame,0,allyCount)];
  for (let i=1;i<allyCount;i++) {
    const key = selected.shift() || takePilot();
    units.push(spawn(0,key,progress.pilotFrames[key],i,allyCount));
  }
  for (let i=0;i<enemyCount;i++) {
    const key = takePilot();
    units.push(spawn(1,key,progress.pilotFrames[key],i,enemyCount));
  }
  battle = {units,startingPilot:units[0],player:units[0],round:1,wins:0,losses:0,
    mode:get('#battleMode').value === 'capture' ? 'capture' : 'elimination',countdown:3};
  for (const unit of units) {
    if (unit.omega) unit.maxHull = unit.omega.hull;
  }
  syncGameMusic();
  const capture = battle.mode === 'capture';
  if (capture) {
    units[0].ctfRole = 'Runner';
    for (const team of [0,1]) {
      const guards = units.filter(unit => unit.team === team && !unit.player);
      const defender = pick(guards);
      defender.defender = true;
      const attackers = guards.filter(unit => unit !== defender);
      for (let runner = team === 1 || attackers.length > 1; attackers.length; runner = !runner) {
        const [attacker] = attackers.splice(Math.floor(Math.random()*attackers.length),1);
        attacker.ctfRole = runner ? 'Runner' : 'Hunter';
      }
      defender.maxHull = defenderHullCapacity;
      defender.x = capturePadPositions[team][0]+(team ? -41 : 41);
      defender.y = capturePadPositions[team][1]+(Math.random()-.5)*46;
    }
  }
  battle.walls = capture ? captureWalls : battleWalls;
  battle.cargo = capture ? captureCargo : battleCargo;
  battleBlockers = [...battle.walls,...battle.cargo];
  battleNavigation = undefined;
  battleBackdrop = undefined;
  const firstStyle = [Math.random()<.5,Math.random()<.5];
  for (const [index,unit] of units.entries()) {
    unit.spawn = {x:unit.x,y:unit.y,angle:unit.angle,shotWait:unit.shotWait};
    unit.ai = {
      defensive:firstStyle[unit.team] !== Boolean(index%2),turn:Math.random()<.5 ? -1 : 1,
      phase:Math.random()*Math.PI*2,pace:.8+Math.random()*.35,
      rangeOffset:(Math.random()-.5)*65,passage:Math.random()<.5 ? 52 : 397,
      patrolIndex:0
    };
  }
  renderBattleRoster();
  resetBattleRound();
  renderBattleSetup();
  updateBattleHud();
}
function resetBattleRound() {
  const cameraSites = battle.mode === 'capture' ? [[245,164,.55],[571,124,2.55],[715,278,-2.35]] : battleCameras;
  const hazards = cameraSites.map(([x,y,angle],index) => ({x,y,angle,index,turret:false,readyAt:1.3+index*.4}));
  if (Math.random()<.58) {
    const sites = [...hazards];
    const count = Math.random()<.32 ? 2 : 1;
    for (let i=0;i<count;i++) sites.splice(Math.floor(Math.random()*sites.length),1)[0].turret = true;
  }
  Object.assign(battle,{shots:[],hazards,packs:battlePackSpots.map(([x,y]) => ({x,y,readyAt:0})),
    elapsed:0,charge:null,paused:false,result:'',matchResult:'',roundCredits:0,matchCredits:0,player:battle.startingPilot,transferAt:-Infinity});
  battle.pads = battle.mode === 'capture' ?
    capturePadPositions.map(([x,y],team) => ({team,x,y})) : [];
  for (const unit of battle.units) {
    Object.assign(unit,unit.spawn,{health:unit.maxHull,scatterWait:0,shieldWait:0,shield:0,slowUntil:0,respawnAt:undefined,protectedUntil:0,lives:battleLives,landing:0,speed:0,dealt:0,taken:0,player:unit===battle.player});
    unit.trail.length = 0;
    if (unit.ai) unit.ai.planAt = 0;
  }
  get('#battleRoundOverlay').hidden = true;
  get('#battleRecap').hidden = true;
  clearBattleInput();
  battleLastDraw = -Infinity;
  get('#battlePause').textContent = 'Pause';
}
function clearBattleInput() {
  battleHeld.clear();
  battleStick.x = battleStick.y = 0;
  const pointer = battleStick.id;
  battleStick.id = null;
  const stick = get('#battleStick');
  if (pointer !== null && stick.hasPointerCapture(pointer)) stick.releasePointerCapture(pointer);
  stick.style.setProperty('--stick-x','0px');
  stick.style.setProperty('--stick-y','0px');
  if (battle) {
    const source = battle.chargeSource;
    battle.charge = null;
    battle.chargeSource = undefined;
    const pulse = get('#battlePulse');
    if (typeof source === 'number' && pulse.hasPointerCapture(source)) pulse.releasePointerCapture(source);
    pulse.classList.remove('charging');
  }
}
function pauseBattle() {
  if (!battle || battle.result) return;
  battle.paused = true;
  clearBattleInput();
  get('#battlePause').textContent = 'Resume';
  updateBattleHud();
}
function nearestBattleEnemy(unit) {
  let nearest, range = Infinity;
  for (const other of battle.units) {
    if (other.team === unit.team || other.health <= 0) continue;
    const distance = (other.x-unit.x)**2+(other.y-unit.y)**2;
    if (distance < range) {nearest = other; range = distance;}
  }
  return nearest;
}
function battleWallAt(x,y,radius = 0) {
  return battleBlockers.some(wall => x > wall[0]-radius && x < wall[0]+wall[2]+radius &&
    y > wall[1]-radius && y < wall[1]+wall[3]+radius);
}
function fireBattleShot(unit,kind) {
  const enemy = nearestBattleEnemy(unit);
  if (!enemy || unit.health <= 0) return;
  const scatter = kind === 'scatter';
  if (scatter ? unit.scatterWait > 0 : unit.shotWait > 0) return;
  const angle = Math.atan2(enemy.y-unit.y,enemy.x-unit.x);
  const tier = unit.modules[scatter ? 1 : 0];
  const powered = kind === 'powered';
  const count = scatter ? 3+Math.floor(tier/2) : 1;
  const omegaVolley = scatter && unit.omega ? new Set() : null;
  for (let pellet=0;pellet<count;pellet++) {
    const heading = angle+(pellet-(count-1)/2)*.14;
    const speed = powered ? 410 : 470;
    battle.shots.push({x:unit.x,y:unit.y,vx:Math.cos(heading)*speed,vy:Math.sin(heading)*speed,
      team:unit.team,source:unit,kind,omegaVolley,life:scatter ? .75 : 2.6,size:powered ? 5 : 2.5,
      damage:Math.round((scatter ? 7+tier*2 : powered ? 31+tier*5 : 13+tier*2)*(unit.defender ? 1.45 : 1))});
  }
  if (scatter) unit.scatterWait = unit.defender ? .8 : 1.05;
  else unit.shotWait = powered ? .57 : .22;
  battleSound(kind);
}
function shieldBattleUnit(unit) {
  if (unit.health <= 0 || unit.shieldWait > 0 || (unit.omega && unit.shield > 0)) return;
  unit.shield = 1.3+unit.modules[2]*.23;
  unit.shieldWait = unit.omega ? unit.shield+unit.omega.shield : 4.9-unit.modules[2]*.32;
  battleSound('shield');
}
function canControlBattle() {
  return currentPage === 'battle' && battle && !battle.paused && !battle.result && !battle.countdown && battle.player.health > 0;
}
function battlePulseStart(source) {
  if (!canControlBattle() || battle.charge !== null || battle.player.shotWait > 0) return;
  battle.charge = battle.elapsed;
  battle.chargeSource = source;
  get('#battlePulse').classList.add('charging');
  return true;
}
function battlePulseEnd(source) {
  if (!canControlBattle() || battle.charge === null || battle.chargeSource !== source) return;
  fireBattleShot(battle.player,battle.elapsed-battle.charge >= .55 ? 'powered' : 'pulse');
  battle.charge = null;
  battle.chargeSource = undefined;
  get('#battlePulse').classList.remove('charging');
}
function moveBattleUnit(unit,dx,dy,dt) {
  const beforeX = unit.x,beforeY = unit.y;
  const scale = Math.max(1,Math.hypot(dx,dy));
  const pilotSpeed = unit.omega ? 24+unit.omega.thrust*.217 : 144+(unit.frame.thrust-395)*.16;
  const modeSpeed = battle.mode === 'capture' ? .78 : 1;
  const speed = modeSpeed*(unit.player ? pilotSpeed : 94)*(unit.slowUntil>battle.elapsed ? .54 : 1);
  const [minX,maxX] = unit.defender ? captureCells[unit.team] : [14,946];
  const x = clamp(unit.x+dx/scale*speed*dt,minX,maxX);
  const y = clamp(unit.y+dy/scale*speed*dt,14,436);
  if (!battleWallAt(x,unit.y,11)) unit.x = x;
  if (!battleWallAt(unit.x,y,11)) unit.y = y;
  unit.angle = turnNose(unit.angle,dx,dy,dt);
  unit.speed = Math.hypot(unit.x-beforeX,unit.y-beforeY)/dt;
}
function battleLineClear(x,y,dx,dy) {
  const steps = Math.ceil(Math.hypot(dx,dy)/14);
  for (let i=1;i<steps;i++) {
    if (battleWallAt(x+dx*i/steps,y+dy*i/steps,3)) return false;
  }
  return true;
}
function incomingBattleShot(unit) {
  return battle.shots.find(shot => {
    if (shot.team === unit.team) return false;
    const dx = unit.x-shot.x,dy = unit.y-shot.y;
    if (dx*dx+dy*dy > 116**2) return false;
    const speed = Math.hypot(shot.vx,shot.vy);
    return (dx*shot.vx+dy*shot.vy)/speed > 0 &&
      Math.abs(dx*shot.vy-dy*shot.vx)/speed < 22;
  });
}
let battleNavigation;
function battleRouteClear(x,y,targetX,targetY) {
  const dx = targetX-x,dy = targetY-y;
  return battleBlockers.every(([left,top,width,height]) => {
    let near = 0,far = 1;
    for (const [start,delta,min,max] of [[x,dx,left-11,left+width+11],[y,dy,top-11,top+height+11]]) {
      if (!delta) {
        if (start <= min || start >= max) return true;
        continue;
      }
      const a = (min-start)/delta,b = (max-start)/delta;
      near = Math.max(near,Math.min(a,b));
      far = Math.min(far,Math.max(a,b));
      if (near >= far) return true;
    }
    return false;
  });
}
function planBattleWaypoint(unit,targetX,targetY) {
  if (battleRouteClear(unit.x,unit.y,targetX,targetY)) return [targetX,targetY];
  if (!battleNavigation) {
    const points = battleBlockers.flatMap(([x,y,w,h]) =>
      [[x-17,y-17],[x+w+17,y-17],[x-17,y+h+17],[x+w+17,y+h+17]])
      .filter(([x,y]) => x>=14 && x<=946 && y>=14 && y<=436 && !battleWallAt(x,y,14));
    const costs = points.map(([x,y],i) => points.map(([tx,ty],j) =>
      i === j ? 0 : battleRouteClear(x,y,tx,ty) ? Math.hypot(tx-x,ty-y) : Infinity));
    for (let via=0;via<points.length;via++) {
      for (let from=0;from<points.length;from++) {
        for (let to=0;to<points.length;to++) {
          costs[from][to] = Math.min(costs[from][to],costs[from][via]+costs[via][to]);
        }
      }
    }
    battleNavigation = {points,costs};
  }
  const {points,costs} = battleNavigation;
  const toTarget = points.map(([x,y]) => battleRouteClear(x,y,targetX,targetY) ?
    Math.hypot(targetX-x,targetY-y) : Infinity);
  let bestCost = Infinity, waypoint = [targetX,targetY];
  for (const [index,[x,y]] of points.entries()) {
    if (!battleRouteClear(unit.x,unit.y,x,y) || Math.hypot(unit.x-x,unit.y-y)<1.5) continue;
    const remaining = Math.min(...costs[index].map((cost,to) => cost+toTarget[to]));
    const preference = battle?.mode === 'capture' && !unit.defender ?
      Math.abs(y-unit.ai.passage)*.12 : (1+Math.sin(unit.ai.phase+y/72))*9;
    const score = Math.hypot(unit.x-x,unit.y-y)+remaining+preference;
    if (score < bestCost) {bestCost = score; waypoint = [x,y];}
  }
  return waypoint;
}
function captureTarget(unit,enemy) {
  if (unit.defender) {
    const ai = unit.ai;
    const [minX,maxX] = captureCells[unit.team];
    const pad = battle.pads[unit.team];
    if (enemy && enemy.x >= minX && enemy.x <= maxX) {
      const dx = pad.x-enemy.x,dy = pad.y-enemy.y;
      const scale = Math.min(1,55/Math.max(1,Math.hypot(dx,dy)));
      const x = clamp(enemy.x+dx*scale,minX+12,maxX-12);
      const y = clamp(enemy.y+dy*scale,26,424);
      if (!battleWallAt(x,y,12)) return {x,y};
    }
    const patrolPoint = () => {
      const [x,y] = capturePatrol[ai.patrolIndex];
      return {x:unit.team ? 960-x : x,y};
    };
    let target = patrolPoint();
    if (Math.hypot(unit.x-target.x,unit.y-target.y) < 19) {
      ai.patrolIndex = (ai.patrolIndex+ai.turn+capturePatrol.length)%capturePatrol.length;
      target = patrolPoint();
    }
    return target;
  }
  if (unit.ctfRole === 'Hunter' && enemy && battle.elapsed < 100) return null;
  return battle.pads[1-unit.team];
}
function steerBattleAI(unit,dt) {
  const enemy = nearestBattleEnemy(unit);
  const objective = captureTarget(unit,enemy);
  if (!enemy && !objective) return;
  const ai = unit.ai;
  const enemyRange = enemy ? Math.hypot(enemy.x-unit.x,enemy.y-unit.y) : Infinity;
  const threat = incomingBattleShot(unit);
  if (threat && (ai.defensive || unit.health<66 || enemyRange<110)) shieldBattleUnit(unit);
  const repair = !unit.defender && ai.defensive && unit.health<unit.maxHull*.69 && battle.packs
    .filter(pack => pack.readyAt<=battle.elapsed && Math.floor(pack.x/320)===Math.floor(unit.x/320) &&
      battleLineClear(unit.x,unit.y,pack.x-unit.x,pack.y-unit.y))
    .sort((a,b) => (a.x-unit.x)**2+(a.y-unit.y)**2-(b.x-unit.x)**2-(b.y-unit.y)**2)[0];
  const targetX = (repair || objective || enemy).x,targetY = (repair || objective || enemy).y;
  const needsRoute = !battleRouteClear(unit.x,unit.y,targetX,targetY);
  if (needsRoute && (battle.elapsed >= ai.planAt || !ai.waypoint ||
      Math.hypot(unit.x-ai.waypoint[0],unit.y-ai.waypoint[1])<2)) {
    ai.waypoint = planBattleWaypoint(unit,targetX,targetY);
    ai.planAt = battle.elapsed+.32;
  }
  const [aimX,aimY] = needsRoute ? ai.waypoint : [targetX,targetY];
  const dx = aimX-unit.x;
  const dy = aimY-unit.y;
  const range = Math.hypot(dx,dy);
  const idealRange = (ai.defensive ? 237 : 143)+ai.rangeOffset;
  const landingNearPad = objective && !unit.defender && !repair && !needsRoute && range < 18;
  if (landingNearPad) moveBattleUnit(unit,0,0,dt);
  else if (range > 1) {
    const approach = repair || objective || needsRoute || range>idealRange+35 ? 1 : range<idealRange-38 ? -.72 : 0;
    const orbit = ai.turn*(.43+.27*Math.sin(battle.elapsed*ai.pace+ai.phase));
    const strafe = repair || objective || needsRoute || range>idealRange+35 ? 0 : orbit;
    let moveX = (approach*dx-strafe*dy)/range;
    let moveY = (approach*dy+strafe*dx)/range;
    if (threat && unit.shield === 0) {
      const speed = Math.hypot(threat.vx,threat.vy);
      moveX -= ai.turn*threat.vy/speed;
      moveY += ai.turn*threat.vx/speed;
    }
    const lookahead = needsRoute ? Math.min(25,range) : 25;
    if (battleWallAt(unit.x+moveX*lookahead,unit.y+moveY*lookahead,11)) {
      const directions = [[-moveY,moveX],[moveY,-moveX]];
      if (ai.turn < 0) directions.reverse();
      const detour = directions.find(([x,y]) => !battleWallAt(unit.x+x*28,unit.y+y*28,12));
      if (detour) [moveX,moveY] = detour;
    }
    moveBattleUnit(unit,moveX*ai.pace,moveY*ai.pace,dt);
  }
  if (enemy && enemyRange < 365 && battleLineClear(unit.x,unit.y,enemy.x-unit.x,enemy.y-unit.y)) {
    if ((unit.defender || unit.ctfRole === 'Hunter' || !ai.defensive) && enemyRange < (unit.defender ? 170 : 155) && unit.scatterWait <= 0) fireBattleShot(unit,'scatter');
    if (unit.shotWait <= 0) {
      fireBattleShot(unit,Math.random()<(ai.defensive ? .29 : .14) ? 'powered' : 'pulse');
      unit.shotWait = unit.defender ? Math.max(unit.shotWait,.42+Math.random()*.26) :
        (unit.ctfRole === 'Hunter' ? .47 : ai.defensive ? .93 : .53)+Math.random()*.58;
    }
  }
}
function battleCameraHeading(camera) {
  return camera.angle+Math.sin(battle.elapsed*1.12+camera.index*1.6)*.85;
}
function battleUnitProtected(unit) {
  return unit.shield > 0 || unit.protectedUntil > battle.elapsed;
}
function applyBattleDamage(unit,amount,source) {
  if (battleUnitProtected(unit) || unit.health <= 0) return;
  const damage = Math.min(amount,unit.health);
  unit.health -= damage;
  unit.taken += damage;
  if (source) source.dealt += damage;
}
function applyBattleHazards(unit,dt) {
  const inBeam = !unit.omega && battle.hazards.some(camera => {
    if (camera.turret) return false;
    const {x,y} = camera;
    const dx = unit.x-x, dy = unit.y-y;
    if (dx*dx+dy*dy > 118**2 || Math.cos(Math.atan2(dy,dx)-battleCameraHeading(camera)) < .92) return false;
    for (let sample=.1;sample<1;sample+=.1) {
      if (battleWallAt(x+dx*sample,y+dy*sample)) return false;
    }
    return true;
  });
  if (inBeam) applyBattleDamage(unit,6.3*dt);
  if (unit.health <= 0 || unit.health > unit.maxHull-1) return;
  for (const pack of battle.packs) {
    if (pack.readyAt <= battle.elapsed && (unit.x-pack.x)**2+(unit.y-pack.y)**2 < 25**2) {
      unit.health = Math.min(unit.maxHull,unit.health+32);
      pack.readyAt = battle.elapsed+8;
      battleSound('repair');
      break;
    }
  }
}
function recordBattleTrail(unit,priorX,priorY) {
  while (unit.trail.length && battle.elapsed-unit.trail[0].time >= trailLifetime) unit.trail.shift();
  const last = unit.trail.at(-1);
  if ((unit.x-priorX)**2+(unit.y-priorY)**2 > .025 &&
      (!last || battle.elapsed-last.time >= trailSampleInterval)) {
    unit.trail.push({x:unit.x,y:unit.y,time:battle.elapsed});
  }
}
function transferBattleControl() {
  if (battle.player.lives > 0) return;
  let replacement;
  for (const unit of battle.units) {
    if (unit.team === 0 && unit.health > 0 && (!replacement || unit.health > replacement.health)) replacement = unit;
  }
  if (!replacement) return;
  battle.player.player = false;
  battle.player = replacement;
  replacement.player = true;
  battle.transferAt = battle.elapsed;
  clearBattleInput();
}
function battleTransferFlash(elapsedSinceTransfer) {
  return elapsedSinceTransfer >= 0 && elapsedSinceTransfer < 1 &&
    elapsedSinceTransfer % (1/3) < .15;
}
function fireBattleTurrets() {
  for (const turret of battle.hazards) {
    if (!turret.turret || turret.readyAt > battle.elapsed) continue;
    let closest,range = 265;
    for (const unit of battle.units) {
      if (unit.health <= 0) continue;
      const dx = unit.x-turret.x,dy = unit.y-turret.y;
      const distance = Math.hypot(dx,dy);
      if (distance >= range || !battleLineClear(turret.x,turret.y,dx,dy)) continue;
      closest = unit;
      range = distance;
    }
    if (!closest) continue;
    turret.angle = Math.atan2(closest.y-turret.y,closest.x-turret.x);
    battle.shots.push({x:turret.x,y:turret.y,vx:Math.cos(turret.angle)*235,vy:Math.sin(turret.angle)*235,
      team:-1,kind:'stasis',life:1.6,size:6,damage:0});
    turret.readyAt = battle.elapsed+1.625;
    battleSound('turret');
  }
}
function updateCaptureLandings(dt) {
  for (const unit of battle.units) {
    const pad = battle.pads[1-unit.team];
    const pursuingPad = unit.player || unit.ctfRole === 'Runner' || (unit.ctfRole === 'Hunter' && battle.elapsed >= 100);
    const onPad = pursuingPad && unit.health > 0 && unit.speed < 16 &&
      Math.hypot(unit.x-pad.x,unit.y-pad.y) < 24;
    unit.landing = onPad ? unit.landing+dt : 0;
    if (unit.landing >= .55) {
      concludeBattle(unit.team === 0 ? 'Victory' : 'Defeat');
      return;
    }
  }
}
function scheduleBattleRespawn(unit) {
  if (unit.health > 0 || unit.respawnAt !== undefined) return;
  unit.lives = Math.max(0,unit.lives-1);
  unit.respawnAt = unit.lives > 0 ? battle.elapsed+3 : Infinity;
  if (unit === battle.player) clearBattleInput();
}
function respawnBattleDrone(unit) {
  scheduleBattleRespawn(unit);
  if (battle.elapsed < unit.respawnAt) return;
  Object.assign(unit,unit.spawn,{health:unit.maxHull,scatterWait:0,shield:0,shieldWait:0,
    slowUntil:0,protectedUntil:battle.elapsed+1,landing:0,speed:0,respawnAt:undefined});
  unit.trail.length = 0;
  if (unit.ai) unit.ai.planAt = 0;
}
function stepBattle(dt) {
  battle.elapsed += dt;
  for (const unit of battle.units) {
    if (unit.health <= 0) {
      respawnBattleDrone(unit);
      if (unit.health <= 0) continue;
    }
    for (const timer of ['shotWait','scatterWait','shieldWait','shield']) unit[timer] = Math.max(0,unit[timer]-dt);
    const {x,y} = unit;
    if (unit.player) {
      const held = (...keys) => keys.some(key => battleHeld.has(key));
      moveBattleUnit(unit,battleStick.x + Number(held('d','ArrowRight'))-Number(held('a','ArrowLeft')),
        battleStick.y + Number(held('s','ArrowDown'))-Number(held('w','ArrowUp')),dt);
    } else steerBattleAI(unit,dt);
    recordBattleTrail(unit,x,y);
    applyBattleHazards(unit,dt);
  }
  fireBattleTurrets();
  battle.shots = battle.shots.filter(shot => {
    shot.x += shot.vx*dt;
    shot.y += shot.vy*dt;
    shot.life -= dt;
    if (shot.life <= 0 || shot.x < 0 || shot.x > 960 || shot.y < 0 || shot.y > 450 || battleWallAt(shot.x,shot.y,shot.size)) return false;
    const target = battle.units.find(unit => unit.team !== shot.team && unit.health > 0 &&
      !(shot.kind === 'stasis' && unit.omega) &&
      (unit.x-shot.x)**2+(unit.y-shot.y)**2 < (13+shot.size)**2);
    if (!target) return true;
    if (battleUnitProtected(target)) battleSound('blocked');
    else if (shot.kind === 'stasis') {
      target.slowUntil = battle.elapsed+3;
      battleSound('slowed');
    } else {
      const tuning = shot.source?.omega;
      if (shot.omegaVolley?.has(target)) return false;
      shot.omegaVolley?.add(target);
      const percent = tuning ? (shot.omegaVolley ? tuning.scatter : tuning.pulse) : 0;
      applyBattleDamage(target,tuning ? target.maxHull*percent/100 : shot.damage,shot.source);
      battleSound('hit');
    }
    return false;
  });
  battle.units.forEach(scheduleBattleRespawn);
  transferBattleControl();
  if (battle.mode === 'capture') {
    updateCaptureLandings(dt);
    if (!battle.result && (battle.elapsed >= 150 || battle.units.every(unit => unit.lives === 0))) concludeBattle('Draw');
    return;
  }
  const remaining = [0,1].map(team => battle.units.reduce((sum,unit) => sum+(unit.team === team ?
    Math.max(0,unit.lives-1)*unit.maxHull+(unit.health || (unit.lives>0 ? unit.maxHull : 0)) : 0),0));
  if (!remaining.every(Boolean) || battle.elapsed >= 150) {
    concludeBattle(remaining[0] === remaining[1] ? 'Draw' : remaining[0] > remaining[1] ? 'Victory' : 'Defeat');
  }
}
function battlePilotName(unit) {
  return unit.key === 'equipped' ? 'Custom pilot' : crew[unit.key][0];
}
function renderBattleRoster() {
  for (const [side,selector] of [[0,'#battleFriendly'],[1,'#battleOpposing']]) {
    get(selector).replaceChildren(...battle.units.filter(unit => unit.team === side).map(unit => {
      const card = document.createElement('div');
      card.className = 'battle-pilot';
      const image = document.createElement('img');
      image.alt = '';
      if (unit.key === 'equipped') image.src = 'assets/icon-32.png';
      else racePortrait(image,unit.key);
      const info = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = battlePilotName(unit);
      const bar = document.createElement('meter');
      bar.max = 100;
      bar.value = 100;
      bar.setAttribute('aria-label',battlePilotName(unit)+' hull');
      const health = document.createElement('small');
      health.textContent = '100%';
      if (unit.defender) card.classList.add('battle-defender');
      info.append(name);
      const assignment = unit.defender ? 'Defender' : unit.ctfRole;
      if (assignment && unit !== battle.startingPilot) {
        const role = document.createElement('small');
        role.textContent = assignment;
        info.append(role);
      } else if (!unit.player) name.title = unit.ai.defensive ? 'Defensive pilot' : 'Offensive pilot';
      info.append(bar,health);
      card.append(image,info);
      unit.roster = {card,bar,health};
      return card;
    }));
  }
}
const battleRoundLabels = {Victory:'Round Won',Defeat:'Round Lost',Draw:'Round Draw', 'Battle ended':'Battle ended'};
const battleMatchLabels = {Victory:'Battle Won',Defeat:'Battle Lost',Draw:'Battle Tied','Battle ended':'Battle ended'};
function showBattleResultWindow(final) {
  const outcome = final ? battle.matchResult : battle.result;
  const overlay = get('#battleRoundOverlay');
  overlay.dataset.outcome = outcome.toLowerCase();
  overlay.classList.toggle('battle-final-result',final);
  const heading = (final ? battleMatchLabels : battleRoundLabels)[outcome];
  updateHudText('#battleRoundHeading',heading);
  updateHudText('#battleResult',heading);
  const summary = outcome === 'Battle ended' ? 'Match ended early' :
    final ? 'Final score' : 'Round '+battle.round+' complete';
  const earned = final ? battle.matchCredits : battle.roundCredits;
  updateHudText('#battleRoundSummary',summary+' · '+battle.wins+'–'+battle.losses+(earned ? ' · +'+earned+' CR' : ''));
  get('#battleResultHangar').hidden = !final;
  get('#battleNextRound').textContent = final ? 'Back to setup' :
    battle.matchResult ? 'View battle result' : 'Next round';
  overlay.hidden = false;
  renderBattleRecap(final);
  get('#battleNextRound').focus({preventScroll:true});
}
function concludeBattle(result) {
  if (battle.result) return;
  battle.result = result;
  const abandoned = result === 'Battle ended';
  if (result === 'Victory') battle.wins++;
  if (result === 'Defeat') battle.losses++;
  for (const unit of battle.units) {
    unit.totalDealt += unit.dealt;
    unit.totalTaken += unit.taken;
  }
  battle.roundCredits = battleRoundCredits[result] || 0;
  const finished = abandoned || battle.round === battleRounds;
  if (finished) battle.matchResult = abandoned ? result :
    battle.wins === battle.losses ? 'Draw' : battle.wins > battle.losses ? 'Victory' : 'Defeat';
  battle.matchCredits = battleMatchCredits[battle.matchResult] || 0;
  const reward = battle.roundCredits+battle.matchCredits;
  if (reward) {
    progress.credits += reward;
    saveProgress();
    updateHudText('#wallet',progress.credits.toLocaleString()+' CR');
  }
  if (!abandoned) battleSound((battle.matchResult || result) === 'Victory' ? 'win' : 'loss');
  clearBattleInput();
  updateBattleHud();
  showBattleResultWindow(abandoned);
}
function renderBattleRecap(matchTotals) {
  updateHudText('#battleRecapTitle',matchTotals ? 'Match damage totals' : 'Round damage totals');
  get('#battleStatRows').replaceChildren(...battle.units.map(unit => {
    const row = document.createElement('tr');
    for (const value of [battlePilotName(unit)+' · '+unit.frame.name,unit.team ? 'Rivals' : 'Allies',
      Math.round(matchTotals ? unit.totalDealt : unit.dealt),Math.round(matchTotals ? unit.totalTaken : unit.taken)]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    return row;
  }));
  get('#battleRecap').hidden = false;
}
function updateBattleHud() {
  const count = team => battle.units.filter(unit => unit.team === team && unit.health > 0).length;
  const score = 'Round '+battle.round+'/'+battleRounds+' · '+battle.wins+'–'+battle.losses;
  updateHudText('#battleStatus',score+' · '+(battle.result || (battle.paused ? 'Paused' :
    (battle.mode === 'capture' ? 'Capture the Flag · ' : count(0)+' allies · '+count(1)+' rivals · ')+Math.max(0,Math.ceil(150-battle.elapsed))+'s')));
  updateHudText('#battleHealth',Math.ceil(battle.player.health)+' / '+battle.player.maxHull+' hull'+(battle.player.slowUntil>battle.elapsed ? ' · Slowed' : ''));
  const pilot = battle.player;
  const respawning = pilot.health <= 0 && pilot.lives > 0 && !battle.result;
  const pilotState = respawning ? 'Respawning: ' : pilot.health > 0 ? 'Flying: ' : 'Eliminated: ';
  updateHudText('#battlePilotStatus',pilotState+battlePilotName(pilot)+(pilot.defender ? ' · Defender' : pilot.ctfRole ? ' · '+pilot.ctfRole : ''));
  const countdown = get('#battleCountdown');
  const seconds = respawning ? Math.max(1,Math.ceil(pilot.respawnAt-battle.elapsed-1e-9)) :
    Math.max(0,Math.ceil(battle.countdown-1e-9));
  countdown.hidden = !seconds || Boolean(battle.result);
  countdown.classList.toggle('battle-respawn',respawning);
  if (!countdown.hidden) updateHudText('#battleCountdown',respawning ? 'Respawn in '+seconds+'s' : String(seconds));
  get('#battleFlagStatus').hidden = battle.mode !== 'capture';
  if (battle.pads.length) {
    const landing = Math.min(100,Math.floor(battle.player.landing/.55*100));
    updateHudText('#battleFlagStatus',landing ? 'Landing '+landing+'%' : 'Land on the opposing pad');
  }
  updateHudText('#battleLives','Lives: '+pilot.lives);
  if (!battle.result) updateHudText('#battleResult','');
  get('#battleHull').max = battle.player.maxHull;
  get('#battleHull').value = battle.player.health;
  for (const unit of battle.units) {
    const charge = Math.ceil(100*unit.health/unit.maxHull);
    const {bar,health,card} = unit.roster;
    card.classList.toggle('battle-controlled',unit.player && charge > 0);
    const readout = charge+'% · '+unit.lives+' lives';
    if (health.textContent !== readout) health.textContent = readout;
    if (bar.value !== charge) {
      bar.value = charge;
      card.classList.toggle('battle-ko',charge === 0);
    }
  }
  get('#battlePause').hidden = Boolean(battle.result);
  get('#battleExit').hidden = Boolean(battle.result);
  get('#battleRestart').hidden = !battle.paused || Boolean(battle.result);
  for (const [selector,wait] of [['#battlePulse',battle.player.shotWait],['#battleScatter',battle.player.scatterWait],['#battleShield',battle.player.shieldWait]]) {
    get(selector).disabled = !canControlBattle() || wait > 0;
  }
}
const battleLaserSprites = new Map();
function drawBattleSprite(surface,kind,x,y,width,height,angle = 0,teamColor) {
  if (!battleArtwork.complete || !battleArtwork.naturalWidth) return false;
  surface.save();
  surface.translate(x,y);
  surface.rotate(angle);
  if (teamColor) {
    const key = kind+teamColor;
    let tint = battleLaserSprites.get(key);
    if (!tint) {
      tint = document.createElement('canvas');
      tint.width = 160;
      tint.height = 112;
      const paint = tint.getContext('2d');
      paint.drawImage(battleArtwork,battleSprites[kind]*160,0,160,112,0,0,160,112);
      paint.globalCompositeOperation = 'source-atop';
      paint.globalAlpha = .78;
      paint.fillStyle = teamColor;
      paint.fillRect(0,0,160,112);
      battleLaserSprites.set(key,tint);
    }
    surface.drawImage(tint,-width/2,-height/2,width,height);
  } else surface.drawImage(battleArtwork,battleSprites[kind]*160,0,160,112,-width/2,-height/2,width,height);
  surface.restore();
  return true;
}
function drawBattleHazards(surface) {
  for (const [x,y,width,height] of battle.cargo) {
    surface.fillStyle = '#29495a';
    surface.fillRect(x,y,width,height);
    drawBattleSprite(surface,'cargo',x+width/2,y+height/2,width+8,height+10);
  }
  for (const camera of battle.hazards) {
    const {x,y} = camera;
    if (camera.turret) {
      circle(x,y,13,surface);
      surface.fillStyle = '#352768';
      surface.fill();
      surface.strokeStyle = '#ce98ff';
      surface.lineWidth = 2;
      surface.stroke();
      surface.beginPath();
      surface.moveTo(x,y);
      surface.lineTo(x+Math.cos(camera.angle)*16,y+Math.sin(camera.angle)*16);
      surface.stroke();
      continue;
    }
    const angle = battleCameraHeading(camera);
    surface.beginPath();
    surface.moveTo(x,y);
    const rays = phoneLayout.matches ? 7 : 11;
    for (let ray=0;ray<=rays;ray++) {
      const heading = angle-.403+.806*ray/rays;
      const dx = Math.cos(heading), dy = Math.sin(heading);
      let distance = 10;
      while (distance<118 && !battleWallAt(x+dx*distance,y+dy*distance)) distance += 7;
      distance = Math.min(118,distance);
      surface.lineTo(x+dx*distance,y+dy*distance);
    }
    surface.closePath();
    surface.fillStyle = '#ff355a44';
    surface.fill();
    if (!drawBattleSprite(surface,'camera',x,y,34,32,angle)) {
      circle(x,y,8,surface);
      surface.fillStyle = '#fd5471';
      surface.fill();
    }
  }
  for (const pack of battle.packs) {
    if (pack.readyAt > battle.elapsed) {
      circle(pack.x,pack.y,13,surface);
      surface.strokeStyle = '#63bd9d66';
      surface.stroke();
      continue;
    }
    if (!drawBattleSprite(surface,'pack',pack.x,pack.y,37,36)) {
      surface.fillStyle = '#82ffd2';
      surface.fillRect(pack.x-8,pack.y-8,16,16);
    }
  }
}
function drawBattleShot(surface,shot) {
  if (shot.kind === 'stasis') {
    const glow = surface.createRadialGradient(shot.x,shot.y,1,shot.x,shot.y,12);
    glow.addColorStop(0,'#f9d9ff');
    glow.addColorStop(.42,'#b45aff');
    glow.addColorStop(1,'#8300ff00');
    circle(shot.x,shot.y,12,surface);
    surface.fillStyle = glow;
    surface.fill();
    return;
  }
  const width = shot.kind === 'powered' ? 44 : shot.kind === 'pulse' ? 32 : 24;
  const angle = Math.atan2(shot.vy,shot.vx);
  const laserColor = shot.team ? '#ff2947' : '#28ff75';
  if (drawBattleSprite(surface,shot.kind,shot.x,shot.y,width,width*.55,angle,
    shot.kind === 'scatter' ? undefined : laserColor)) return;
  surface.save();
  surface.translate(shot.x,shot.y);
  surface.rotate(angle);
  surface.lineCap = 'round';
  if (shot.kind === 'scatter') {
    const fire = surface.createLinearGradient(-17,0,5,0);
    fire.addColorStop(0,'#ff442500');
    fire.addColorStop(.64,'#ff7139');
    fire.addColorStop(1,'#fff6a5');
    surface.fillStyle = fire;
    surface.beginPath();
    surface.moveTo(-17,0);
    surface.quadraticCurveTo(0,-9,5,0);
    surface.quadraticCurveTo(0,9,-17,0);
    surface.fill();
  } else {
    surface.beginPath();
    if (shot.kind === 'powered') {
      surface.moveTo(-22,0);
      surface.lineTo(-13,4);
      surface.lineTo(-9,-5);
      surface.lineTo(-3,1);
      surface.lineTo(4,0);
      surface.moveTo(-9,-5);
      surface.lineTo(-16,-8);
    } else {
      surface.moveTo(-16,0);
      surface.lineTo(4,0);
    }
    surface.lineWidth = shot.kind === 'powered' ? 5 : 4;
    surface.strokeStyle = laserColor;
    surface.stroke();
    surface.lineWidth = 1.4;
    surface.strokeStyle = '#fff2ff';
    surface.stroke();
  }
  surface.restore();
}
const battleOutlines = new Map();
function drawBattleOutline(surface,frame,color) {
  const key = frame.name+color;
  let outline = battleOutlines.get(key);
  if (!outline) {
    outline = document.createElement('canvas');
    outline.width = outline.height = 56;
    const mask = outline.getContext('2d');
    mask.save();
    mask.translate(28,28);
    paintDrone(mask,frame,0);
    mask.restore();
    mask.globalCompositeOperation = 'source-in';
    mask.fillStyle = color;
    mask.fillRect(0,0,56,56);
    battleOutlines.set(key,outline);
  }
  surface.save();
  surface.shadowColor = color;
  surface.shadowBlur = phoneLayout.matches ? 0 : 7;
  for (const [x,y] of [[-1.6,0],[1.6,0],[0,-1.6],[0,1.6]]) {
    surface.drawImage(outline,x-28,y-28);
  }
  surface.restore();
}
function drawCapturePads(surface) {
  for (const pad of battle.pads) {
    const color = pad.team ? '#ff758d' : '#71ffb1';
    surface.save();
    surface.translate(pad.x,pad.y);
    // Beveled deck plate and inset approach markings, baked into the arena.
    surface.beginPath();
    surface.moveTo(-22,-33);
    for (const [x,y] of [[22,-33],[33,-22],[33,22],[22,33],[-22,33],[-33,22],[-33,-22]]) {
      surface.lineTo(x,y);
    }
    surface.closePath();
    const metal = surface.createLinearGradient(0,-33,0,33);
    metal.addColorStop(0,'#31475b');
    metal.addColorStop(.52,'#142433');
    metal.addColorStop(1,'#0a1420');
    surface.fillStyle = metal;
    surface.fill();
    surface.lineWidth = 2;
    surface.strokeStyle = '#8397aa';
    surface.stroke();
    surface.strokeStyle = color;
    circle(0,0,23,surface);
    surface.stroke();
    surface.fillStyle = color;
    for (const x of [-29,26]) {
      for (const y of [-17,9]) surface.fillRect(x,y,3,8);
    }
    surface.fillRect(-9,-10,4,20);
    surface.fillRect(5,-10,4,20);
    surface.fillRect(-5,-2,10,4);
    surface.fillStyle = '#0b1521';
    surface.fillRect(-35,-51,70,15);
    surface.fillStyle = color;
    surface.font = 'bold 11px system-ui, sans-serif';
    surface.textAlign = 'center';
    surface.fillText(pad.team ? 'RIVAL PAD' : 'ALLY PAD',0,-40);
    surface.restore();
  }
}
function drawCaptureProgress(surface) {
  if (!battle.player.landing || !battle.pads.length) return;
  const pad = battle.pads[1-battle.player.team];
  surface.beginPath();
  surface.arc(pad.x,pad.y,28,-Math.PI/2,-Math.PI/2+2*Math.PI*Math.min(1,battle.player.landing/.55));
  surface.strokeStyle = '#f5fff9';
  surface.lineWidth = 3;
  surface.stroke();
}
function drawBattle() {
  const field = get('#battleCanvas');
  const surface = field.getContext('2d');
  if (!battleBackdrop) {
    battleBackdrop = document.createElement('canvas');
    battleBackdrop.width = 960;
    battleBackdrop.height = 450;
    const art = battleBackdrop.getContext('2d');
    ['#14293d','#20263f','#331f38'].forEach((color,i) => {
      art.fillStyle = color;
      art.fillRect(i*320,0,320,450);
      art.strokeStyle = '#91b6db33';
      for (let y=20;y<450;y+=24) art.strokeRect(i*320+8,y,304,22);
    });
    for (const wall of battle.walls) {
      art.fillStyle = '#7688ab';
      art.fillRect(...wall);
    }
    art.font = 'bold 18px monospace';
    art.fillStyle = '#b3c5e0';
    ['WEST DECK','RELAY BAY','EAST DECK'].forEach((name,i) => art.fillText(name,18+i*320,32));
    drawCapturePads(art);
  }
  surface.drawImage(battleBackdrop,0,0);
  drawBattleHazards(surface);
  drawCaptureProgress(surface);
  for (const shot of battle.shots) drawBattleShot(surface,shot);
  for (const unit of battle.units) {
    if (unit.health <= 0) continue;
    const color = unit.defender ? (unit.team ? '#c786ff' : '#68beff') :
      unit.team ? '#ff5269' : '#69ff9a';
    drawDroneTrail(unit.trail,unit.frame,unit,surface,battle.elapsed,color);
    if (unit.slowUntil>battle.elapsed) {
      circle(unit.x,unit.y,24,surface);
      surface.strokeStyle = '#bd76ff';
      surface.lineWidth = 2;
      surface.stroke();
    }
    if (unit.shield) {
      circle(unit.x,unit.y,21,surface);
      surface.strokeStyle = '#9ed9ff';
      surface.lineWidth = 2;
      surface.stroke();
    }
    surface.save();
    surface.translate(unit.x,unit.y);
    surface.rotate(unit.angle);
    drawBattleOutline(surface,unit.frame,color);
    paintDrone(surface,unit.frame,battle.elapsed*29);
    if (unit.omega && !reduceFlightEffects.matches) {
      drawOmegaShine(surface,-12,-8,3,.9*Math.max(0,Math.cos(battle.elapsed*4))**6);
    }
    surface.restore();
    surface.fillStyle = '#0b1324';
    surface.fillRect(unit.x-17,unit.y-27,34,4);
    surface.fillStyle = color;
    surface.fillRect(unit.x-17,unit.y-27,34*unit.health/unit.maxHull,4);
    const respawnFlash = unit.protectedUntil>battle.elapsed &&
      battleTransferFlash(battle.elapsed-(unit.protectedUntil-1));
    const handoffFlash = unit.player && unit.protectedUntil<=battle.elapsed &&
      battleTransferFlash(battle.elapsed-battle.transferAt);
    if (respawnFlash || handoffFlash) {
      circle(unit.x,unit.y,28,surface);
      surface.strokeStyle = '#e0ffeb';
      surface.lineWidth = 3;
      surface.stroke();
    }
    if (unit.player || unit.defender) {
      surface.font = 'bold 12px monospace';
      surface.fillText(unit.player ? 'YOU' : 'DEF',unit.x-11,unit.y+28);
    }
  }
}
function tickBattle(now,dt) {
  if (!battle || battle.paused || battle.result) return;
  if (battle.countdown>0) {
    battle.countdown = Math.max(0,battle.countdown-dt);
    if (battle.countdown <= 1e-9) battle.countdown = 0;
    updateBattleHud();
    return;
  }
  while (dt > 0 && !battle.result) {
    const step = Math.min(dt,1/60);
    stepBattle(step);
    dt -= step;
  }
  if (now-battleLastDraw >= (phoneLayout.matches ? 32 : 15) || battle.result) {
    drawBattle();
    updateBattleHud();
    battleLastDraw = now;
  }
}
function createFullscreenControl(element,button,expandedClass,onResize) {
  let request = 0;
  const active = () => document.fullscreenElement === element || element.classList.contains(expandedClass);
  const sync = () => {
    const expanded = active();
    button.textContent = expanded ? 'Exit fullscreen' : 'Fullscreen';
    button.setAttribute('aria-pressed',String(expanded));
    onResize?.();
  };
  const exit = () => {
    request++;
    element.classList.remove(expandedClass);
    if (document.fullscreenElement === element) document.exitFullscreen().catch(() => {});
    sync();
  };
  button.addEventListener('click',async () => {
    if (active()) {exit(); return;}
    const attempt = ++request;
    if (element.requestFullscreen) {
      try {
        await element.requestFullscreen();
        if (attempt !== request && document.fullscreenElement === element) exit();
        else sync();
        return;
      } catch {
        // Some mobile and embedded browsers restrict native fullscreen.
      }
    }
    if (attempt !== request) return;
    element.classList.add(expandedClass);
    sync();
  });
  document.addEventListener('fullscreenchange',sync);
  window.addEventListener('keydown',event => {
    if (event.key === 'Escape' && element.classList.contains(expandedClass)) exit();
  });
  return exit;
}
let exitBattleFullscreen;
function leaveBattle() {
  if (!battle) return;
  clearBattleInput();
  exitBattleFullscreen();
  battle = undefined;
  renderBattleSetup();
  syncGameMusic();
  get('#battleStart').focus({preventScroll:true});
}
function initBattleControls() {
  exitBattleFullscreen = createFullscreenControl(get('#battleArena'),get('#battleFullscreen'),'battle-expanded');
  for (const art of [omegaArt,onyxArt,clubAtlas,quayAtlas,storyAtlas,fleetArt]) {
    art.addEventListener('load',() => battleOutlines.clear());
  }
  get('#battlePilot').addEventListener('change',renderBattleSetup);
  get('#battleAllies').addEventListener('change',renderBattleSetup);
  get('#battleMode').addEventListener('change',event => {
    if (event.target.value === 'capture') {
      if (Number(get('#battleAllies').value) === 1) get('#battleAllies').value = 4;
      if (Number(get('#battleEnemies').value) === 1) get('#battleEnemies').value = 3;
    }
    renderBattleSetup();
    syncGameMusic();
  });
  get('#battleStart').addEventListener('click',() => {startBattle(); if (battle) drawBattle();});
  get('#battleExit').addEventListener('click',leaveBattle);
  get('#battleResultHangar').addEventListener('click',() => {
    leaveBattle();
    showPage('hangar');
  });
  get('#battleRestart').addEventListener('click',() => {
    if (!battle?.paused || battle.result) return;
    battle.countdown = 3;
    resetBattleRound();
    drawBattle();
    updateBattleHud();
    get('#battleCanvas').focus({preventScroll:true});
  });
  get('#battleNextRound').addEventListener('click',() => {
    if (!battle?.result) return;
    if (battle.matchResult && !battle.finalWindow && battle.result !== 'Battle ended') {
      battle.finalWindow = true;
      showBattleResultWindow(true);
      return;
    }
    if (battle.matchResult) {
      leaveBattle();
      return;
    }
    battle.round++;
    resetBattleRound();
    drawBattle();
    updateBattleHud();
    get('#battleCanvas').focus({preventScroll:true});
  });
  get('#battlePause').addEventListener('click',() => {
    if (battle.paused) {
      battle.paused = false;
      get('#battlePause').textContent = 'Pause';
      updateBattleHud();
    } else pauseBattle();
  });
  const stick = get('#battleStick');
  function steer(event) {
    const bounds = stick.getBoundingClientRect();
    const dx = event.clientX-bounds.left-bounds.width/2;
    const dy = event.clientY-bounds.top-bounds.height/2;
    const distance = Math.hypot(dx,dy);
    const push = Math.min(1,distance/(bounds.width*.35));
    const power = touchSteeringPower(push);
    const x = dx/(distance || 1),y = dy/(distance || 1);
    battleStick.x = x*power;
    battleStick.y = y*power;
    stick.style.setProperty('--stick-x',x*push*20+'px');
    stick.style.setProperty('--stick-y',y*push*20+'px');
  }
  stick.addEventListener('pointerdown',event => {
    if (!canControlBattle() || event.button !== 0 || battleStick.id !== null) return;
    stick.setPointerCapture(event.pointerId);
    battleStick.id = event.pointerId;
    steer(event);
  });
  stick.addEventListener('pointermove',event => {if (event.pointerId === battleStick.id) steer(event);});
  for (const type of ['pointerup','pointercancel','lostpointercapture']) stick.addEventListener(type,event => {
    if (event.pointerId !== battleStick.id) return;
    battleStick.id = null;
    battleStick.x = battleStick.y = 0;
    stick.style.setProperty('--stick-x','0px');
    stick.style.setProperty('--stick-y','0px');
  });
  const pulse = get('#battlePulse');
  pulse.addEventListener('pointerdown',event => {
    if (event.button === 0 && battlePulseStart(event.pointerId)) pulse.setPointerCapture(event.pointerId);
  });
  pulse.addEventListener('pointerup',event => battlePulseEnd(event.pointerId));
  for (const type of ['pointercancel','lostpointercapture']) pulse.addEventListener(type,event => {
    if (!battle || battle.chargeSource !== event.pointerId) return;
    battle.charge = null;
    battle.chargeSource = undefined;
    pulse.classList.remove('charging');
  });
  pulse.addEventListener('click',event => {
    if (event.detail === 0 && canControlBattle()) fireBattleShot(battle.player,'pulse');
  });
  for (const [selector,activate] of [
    ['#battleScatter',() => fireBattleShot(battle.player,'scatter')],
    ['#battleShield',() => shieldBattleUnit(battle.player)]
  ]) {
    const button = get(selector);
    button.addEventListener('pointerdown',event => {if (event.button === 0 && canControlBattle()) activate();});
    button.addEventListener('click',event => {if (event.detail === 0 && canControlBattle()) activate();});
  }
  window.addEventListener('keydown',event => {
    if (!canControlBattle() || event.defaultPrevented || get('dialog[open]') || event.ctrlKey || event.altKey || event.metaKey ||
        /^(INPUT|SELECT|TEXTAREA)$/.test(event.target?.tagName)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(key)) {
      event.preventDefault();
      battleHeld.add(key);
    }
    if (!['v','x','c'].includes(key)) return;
    event.preventDefault();
    if (event.repeat) return;
    if (key === 'v') battlePulseStart('keyboard');
    if (key === 'c') fireBattleShot(battle.player,'scatter');
    if (key === 'x') shieldBattleUnit(battle.player);
  });
  window.addEventListener('keyup',event => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    battleHeld.delete(key);
    if (key === 'v') battlePulseEnd('keyboard');
  });
  window.addEventListener('blur',pauseBattle);
  window.matchMedia('(orientation: portrait)').addEventListener('change',pauseBattle);
  document.addEventListener('visibilitychange',() => {if (document.hidden) pauseBattle();});
}
