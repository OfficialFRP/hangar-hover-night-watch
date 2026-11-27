// Drone Battle shares art and flight steering with the campaign.
const battleModules = [
  {name:'Pulse cannon',description:'More damage on straight and charged shots',cost:100},
  {name:'Scatter array',description:'Adds pellet damage and extra pellets at higher tiers',cost:110},
  {name:'Deflector',description:'Longer shields and shorter recharge',cost:100}
];
const battleTierLimit = 5;
const battleHeld = new Set();
const battleStick = {x:0,y:0,id:null};
const battleWalls = [[317,0,10,147],[317,263,10,187],[636,0,10,194],[636,306,10,144]];
const battleCargo = [[207,62,64,51],[188,334,66,54],[426,57,66,57],[477,336,66,59],[696,65,64,57],[744,338,65,58]];
const battleBlockers = [...battleWalls,...battleCargo];
const battleCameras = [[260,130,.55],[566,139,2.55],[712,303,-2.35]];
const battleRoundLimit = 3;
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
  for (const key of unlockedPilots()) {
    pilot.append(new Option(crew[key][0]+' · '+fleet[progress.pilotFrames[key]].name,key));
  }
  pilot.value = [...pilot.options].some(option => option.value === previousPilot) ? previousPilot : 'equipped';
  const roster = unlockedPilots().length;
  const allyCount = Math.trunc(Number(get('#battleAllies').value)) || 1;
  const enemyCount = Math.trunc(Number(get('#battleEnemies').value)) || 1;
  get('#battleAllies').max = get('#battleEnemies').max = roster-1;
  get('#battleAllies').value = Math.min(roster-1,Math.max(1,allyCount));
  get('#battleEnemies').value = Math.min(roster-Number(get('#battleAllies').value),Math.max(1,enemyCount));
  renderBattleAllyPicker();
}
function renderBattleAllyPicker() {
  const pilot = get('#battlePilot').value;
  const max = Number(get('#battleAllies').value)-1;
  allyChoices.delete(pilot);
  [...allyChoices].slice(max).forEach(key => allyChoices.delete(key));
  get('#battleAllyPicker').hidden = max <= 0;
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
      for (const [index,child] of [...panel.children].entries()) {
        const checkbox = child.firstElementChild;
        const option = candidates[index];
        checkbox.checked = allyChoices.has(option);
        checkbox.disabled = !checkbox.checked && allyChoices.size >= max;
      }
    });
    label.append(box,document.createTextNode(crew[key][0]));
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
  const playerFrame = pilot === 'equipped' ? progress.selected : progress.pilotFrames[pilot];
  const spawn = (team,key,frameIndex,index,total) => ({
    team,key,frame:fleet[frameIndex],modules:index === 0 && team === 0 ? progress.battleLevels[frameIndex] : [0,0,0],
    x:team ? 855-index%3*35 : 105+index%3*35,y:55+(index+1)*340/(total+1),
    angle:team ? -Math.PI/2 : Math.PI/2,health:100,shotWait:.4+index*.12,scatterWait:0,
    shieldWait:0,shield:0,trail:[],dealt:0,taken:0,totalDealt:0,totalTaken:0,player:team === 0 && index === 0
  });
  const units = [spawn(0,pilot,playerFrame,0,allyCount)];
  for (let i=1;i<allyCount;i++) {
    const key = selected.shift() || takePilot();
    units.push(spawn(0,key,progress.pilotFrames[key],i,allyCount));
  }
  for (let i=0;i<enemyCount;i++) {
    const key = takePilot();
    units.push(spawn(1,key,progress.pilotFrames[key],i,enemyCount));
  }
  battle = {units,player:units[0],round:1,wins:0,losses:0};
  for (const unit of units) unit.spawn = {x:unit.x,y:unit.y,angle:unit.angle,shotWait:unit.shotWait};
  renderBattleRoster();
  resetBattleRound();
  renderBattleSetup();
  updateBattleHud();
}
function resetBattleRound() {
  Object.assign(battle,{shots:[],packs:battlePackSpots.map(([x,y]) => ({x,y,readyAt:0})),
    elapsed:0,charge:null,paused:false,result:'',matchResult:''});
  for (const unit of battle.units) {
    Object.assign(unit,unit.spawn,{health:100,scatterWait:0,shieldWait:0,shield:0,dealt:0,taken:0});
    unit.trail.length = 0;
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
    battle.charge = null;
    get('#battlePulse').classList.remove('charging');
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
  for (let pellet=0;pellet<count;pellet++) {
    const heading = angle+(pellet-(count-1)/2)*.14;
    const speed = powered ? 390 : 455;
    battle.shots.push({x:unit.x,y:unit.y,vx:Math.cos(heading)*speed,vy:Math.sin(heading)*speed,
      team:unit.team,source:unit,kind,life:scatter ? .52 : 1.95,size:powered ? 5 : 2.5,
      damage:scatter ? 7+tier*2 : powered ? 31+tier*5 : 13+tier*2});
  }
  if (scatter) unit.scatterWait = 1.05;
  else unit.shotWait = powered ? .78 : .31;
}
function shieldBattleUnit(unit) {
  if (unit.health <= 0 || unit.shieldWait > 0) return;
  unit.shield = 1.3+unit.modules[2]*.23;
  unit.shieldWait = 6.5-unit.modules[2]*.46;
}
function canControlBattle() {
  return currentPage === 'battle' && battle && !battle.paused && !battle.result && battle.player.health > 0;
}
function battlePulseStart(source) {
  if (!canControlBattle() || battle.charge !== null || battle.player.shotWait > 0) return;
  battle.charge = battle.elapsed;
  battle.chargeSource = source;
  get('#battlePulse').classList.add('charging');
}
function battlePulseEnd(source) {
  if (!canControlBattle() || battle.charge === null || battle.chargeSource !== source) return;
  fireBattleShot(battle.player,battle.elapsed-battle.charge >= .55 ? 'powered' : 'pulse');
  battle.charge = null;
  get('#battlePulse').classList.remove('charging');
}
function moveBattleUnit(unit,dx,dy,dt) {
  const scale = Math.max(1,Math.hypot(dx,dy));
  const speed = unit.player ? 144+(unit.frame.thrust-395)*.16 : 94;
  const x = clamp(unit.x+dx/scale*speed*dt,14,946);
  const y = clamp(unit.y+dy/scale*speed*dt,14,436);
  if (!battleWallAt(x,unit.y,11)) unit.x = x;
  if (!battleWallAt(unit.x,y,11)) unit.y = y;
  unit.angle = turnNose(unit.angle,dx,dy,dt);
}
function steerBattleAI(unit,dt) {
  const enemy = nearestBattleEnemy(unit);
  if (!enemy) return;
  const boundary = [322,641].find(x => (x-unit.x)*(x-enemy.x)<0 && Math.abs(x-enemy.x)>12);
  const gap = boundary === 322 ? 205 : 250;
  const aimY = boundary ? gap : enemy.y;
  const aimX = boundary && Math.abs(unit.y-gap)>35 && Math.abs(unit.x-boundary)<65 ?
    boundary+(unit.x<boundary ? -39 : 39) : enemy.x;
  const dx = aimX-unit.x;
  const dy = aimY-unit.y;
  const range = Math.hypot(dx,dy);
  const approach = boundary || range > 205 ? 1 : range < 115 ? -.7 : 0;
  if (range > 1) {
    const blocked = battleWallAt(unit.x+dx/range*30,unit.y+dy/range*30,12);
    const strafe = blocked ? (unit.y<225 ? 1 : -1) : boundary ? 0 : .34;
    moveBattleUnit(unit,approach*dx/range-strafe*dy/range,approach*dy/range+strafe*dx/range,dt);
  }
  if (!boundary && range < 375 && unit.shotWait <= 0) {
    fireBattleShot(unit,Math.random()<.16 ? 'powered' : 'pulse');
    unit.shotWait = .66+Math.random()*.6;
  }
  if (!boundary && unit.health < 70 && unit.shieldWait <= 0) shieldBattleUnit(unit);
}
function battleCameraHeading(camera,index) {
  return camera[2]+Math.sin(battle.elapsed*1.12+index*1.6)*.85;
}
function applyBattleDamage(unit,amount,source) {
  if (unit.shield > 0 || unit.health <= 0) return;
  const damage = Math.min(amount,unit.health);
  unit.health -= damage;
  unit.taken += damage;
  if (source) source.dealt += damage;
}
function applyBattleHazards(unit,dt) {
  const inBeam = battleCameras.some(([x,y],index) => {
    const dx = unit.x-x, dy = unit.y-y;
    if (dx*dx+dy*dy > 118**2 || Math.cos(Math.atan2(dy,dx)-battleCameraHeading(battleCameras[index],index)) < .92) return false;
    for (let sample=.1;sample<1;sample+=.1) {
      if (battleWallAt(x+dx*sample,y+dy*sample)) return false;
    }
    return true;
  });
  if (inBeam) applyBattleDamage(unit,4.5*dt);
  if (unit.health <= 0 || unit.health > 99) return;
  for (const pack of battle.packs) {
    if (pack.readyAt <= battle.elapsed && (unit.x-pack.x)**2+(unit.y-pack.y)**2 < 25**2) {
      unit.health = Math.min(100,unit.health+32);
      pack.readyAt = battle.elapsed+8;
      sound('charge');
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
function stepBattle(dt) {
  battle.elapsed += dt;
  for (const unit of battle.units) {
    if (unit.health <= 0) continue;
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
  battle.shots = battle.shots.filter(shot => {
    shot.x += shot.vx*dt;
    shot.y += shot.vy*dt;
    shot.life -= dt;
    if (shot.life <= 0 || shot.x < 0 || shot.x > 960 || shot.y < 0 || shot.y > 450 || battleWallAt(shot.x,shot.y,shot.size)) return false;
    const target = battle.units.find(unit => unit.team !== shot.team && unit.health > 0 &&
      (unit.x-shot.x)**2+(unit.y-shot.y)**2 < (13+shot.size)**2);
    if (!target) return true;
    applyBattleDamage(target,shot.damage,shot.source);
    return false;
  });
  const survivors = [0,1].map(team => battle.units.reduce((sum,unit) => sum+(unit.team === team ? unit.health : 0),0));
  if (!survivors.every(Boolean) || battle.elapsed >= 150) {
    concludeBattle(survivors[0] === survivors[1] ? 'Draw' : survivors[0] > survivors[1] ? 'Victory' : 'Defeat');
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
      info.append(name,bar,health);
      card.append(image,info);
      unit.roster = {card,bar,health};
      return card;
    }));
  }
}
const battleResultLabels = {Victory:'Victory: Allies',Defeat:'Allies Defeated',
  Draw:'Draw / Battle Tied', 'Battle ended':'Battle ended'};
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
  const finished = abandoned || battle.round === battleRoundLimit;
  if (finished) battle.matchResult = abandoned ? result :
    battle.wins > battle.losses ? 'Victory' : battle.losses > battle.wins ? 'Defeat' : 'Draw';
  const overlay = get('#battleRoundOverlay');
  overlay.dataset.outcome = (battle.matchResult || result).toLowerCase();
  updateHudText('#battleRoundHeading',battleResultLabels[battle.matchResult || result]);
  const summary = abandoned ? 'Match ended early' :
    (finished ? 'Round '+battle.round+': '+result+' · Final score' : 'Round '+battle.round+' of '+battleRoundLimit+' complete');
  updateHudText('#battleRoundSummary',summary+' · '+battle.wins+'–'+battle.losses);
  get('#battleNextRound').textContent = finished ? 'Back to setup' : 'Next round';
  overlay.hidden = false;
  clearBattleInput();
  renderBattleRecap(finished);
  updateBattleHud();
  get('#battleNextRound').focus();
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
  const score = 'Round '+battle.round+'/'+battleRoundLimit+' · '+battle.wins+'–'+battle.losses;
  updateHudText('#battleStatus',score+' · '+(battle.result || (battle.paused ? 'Paused' :
    count(0)+' allies · '+count(1)+' rivals · '+Math.max(0,Math.ceil(150-battle.elapsed))+'s')));
  updateHudText('#battleHealth',Math.ceil(battle.player.health)+'% hull');
  updateHudText('#battleResult',battleResultLabels[battle.matchResult || battle.result] || '');
  get('#battleHull').value = battle.player.health;
  for (const unit of battle.units) {
    const charge = Math.ceil(unit.health);
    const {bar,health,card} = unit.roster;
    if (bar.value !== charge) {
      bar.value = charge;
      health.textContent = charge+'%';
      card.classList.toggle('battle-ko',charge === 0);
    }
  }
  get('#battlePause').hidden = Boolean(battle.result);
  get('#battleExit').hidden = Boolean(battle.result);
  for (const [selector,wait] of [['#battlePulse',battle.player.shotWait],['#battleScatter',battle.player.scatterWait],['#battleShield',battle.player.shieldWait]]) {
    get(selector).disabled = !canControlBattle() || wait > 0;
  }
}
function drawBattleSprite(surface,kind,x,y,width,height,angle = 0) {
  if (!battleArtwork.complete || !battleArtwork.naturalWidth) return false;
  surface.save();
  surface.translate(x,y);
  surface.rotate(angle);
  surface.drawImage(battleArtwork,battleSprites[kind]*160,0,160,112,-width/2,-height/2,width,height);
  surface.restore();
  return true;
}
function drawBattleHazards(surface) {
  for (const [x,y,width,height] of battleCargo) {
    surface.fillStyle = '#29495a';
    surface.fillRect(x,y,width,height);
    drawBattleSprite(surface,'cargo',x+width/2,y+height/2,width+8,height+10);
  }
  for (const [index,[x,y]] of battleCameras.entries()) {
    const angle = battleCameraHeading(battleCameras[index],index);
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
  const width = shot.kind === 'powered' ? 44 : shot.kind === 'pulse' ? 32 : 24;
  const angle = Math.atan2(shot.vy,shot.vx);
  if (drawBattleSprite(surface,shot.kind,shot.x,shot.y,width,width*.55,angle)) return;
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
    surface.strokeStyle = shot.kind === 'powered' ? '#61d9ff' : '#ff74c7';
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
    for (const wall of battleWalls) {
      art.fillStyle = '#7688ab';
      art.fillRect(...wall);
    }
    art.font = 'bold 18px monospace';
    art.fillStyle = '#b3c5e0';
    ['WEST DECK','RELAY BAY','EAST DECK'].forEach((name,i) => art.fillText(name,18+i*320,32));
  }
  surface.drawImage(battleBackdrop,0,0);
  drawBattleHazards(surface);
  for (const shot of battle.shots) drawBattleShot(surface,shot);
  for (const unit of battle.units) {
    if (unit.health <= 0) continue;
    const color = unit.team ? '#ff5269' : '#69ff9a';
    drawDroneTrail(unit.trail,unit.frame,unit,surface,battle.elapsed,color);
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
    surface.restore();
    surface.fillStyle = '#0b1324';
    surface.fillRect(unit.x-17,unit.y-27,34,4);
    surface.fillStyle = color;
    surface.fillRect(unit.x-17,unit.y-27,34*unit.health/100,4);
    if (unit.player) {
      surface.font = 'bold 12px monospace';
      surface.fillText('YOU',unit.x-11,unit.y+28);
    }
  }
}
function tickBattle(now,dt) {
  if (!battle || battle.paused || battle.result) return;
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
function initBattleControls() {
  exitBattleFullscreen = createFullscreenControl(get('#battleArena'),get('#battleFullscreen'),'battle-expanded');
  for (const art of [onyxArt,clubAtlas,quayAtlas,storyAtlas,fleetArt]) {
    art.addEventListener('load',() => battleOutlines.clear());
  }
  get('#battlePilot').addEventListener('change',renderBattleSetup);
  get('#battleAllies').addEventListener('change',renderBattleSetup);
  get('#battleStart').addEventListener('click',() => {startBattle(); if (battle) drawBattle();});
  get('#battleExit').addEventListener('click',() => concludeBattle('Battle ended'));
  get('#battleNextRound').addEventListener('click',() => {
    if (!battle?.result) return;
    if (battle.matchResult) {
      clearBattleInput();
      exitBattleFullscreen();
      battle = undefined;
      renderBattleSetup();
      get('#battleStart').focus({preventScroll:true});
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
    battleStick.x = clamp((event.clientX-bounds.left-bounds.width/2)/(bounds.width*.35),-1,1);
    battleStick.y = clamp((event.clientY-bounds.top-bounds.height/2)/(bounds.height*.35),-1,1);
    stick.style.setProperty('--stick-x',battleStick.x*20+'px');
    stick.style.setProperty('--stick-y',battleStick.y*20+'px');
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
    if (event.button !== 0) return;
    pulse.setPointerCapture(event.pointerId);
    battlePulseStart(event.pointerId);
  });
  pulse.addEventListener('pointerup',event => battlePulseEnd(event.pointerId));
  for (const type of ['pointercancel','lostpointercapture']) pulse.addEventListener(type,event => {
    if (!battle || battle.chargeSource !== event.pointerId) return;
    battle.charge = null;
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
    if (!canControlBattle() || event.ctrlKey || event.altKey || event.metaKey ||
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
    if (key === 'x') fireBattleShot(battle.player,'scatter');
    if (key === 'c') shieldBattleUnit(battle.player);
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
