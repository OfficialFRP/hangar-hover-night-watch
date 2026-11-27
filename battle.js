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
  const rival = get('#battleOpponent');
  const previousPilot = pilot.value;
  const previousRival = rival.value;
  pilot.replaceChildren(new Option('Equipped · '+fleet[progress.selected].name,'equipped'));
  rival.replaceChildren(new Option('Random opponent',''));
  for (const key of unlockedPilots()) {
    pilot.append(new Option(crew[key][0]+' · '+fleet[progress.pilotFrames[key]].name,key));
    if (key !== previousPilot) rival.append(new Option(crew[key][0],key));
  }
  pilot.value = [...pilot.options].some(option => option.value === previousPilot) ? previousPilot : 'equipped';
  rival.value = [...rival.options].some(option => option.value === previousRival) ? previousRival : '';
  const roster = unlockedPilots().length;
  const allyCount = Math.trunc(Number(get('#battleAllies').value)) || 1;
  const enemyCount = Math.trunc(Number(get('#battleEnemies').value)) || 1;
  get('#battleAllies').max = get('#battleEnemies').max = roster-1;
  get('#battleAllies').value = Math.min(roster-1,Math.max(1,allyCount));
  get('#battleEnemies').value = Math.min(roster-Number(get('#battleAllies').value),Math.max(1,enemyCount));
}
function startBattle() {
  if (!battleUnlocked() || battle) return;
  renderBattleSetup();
  const pilot = get('#battlePilot').value;
  const opponent = get('#battleOpponent').value;
  const available = unlockedPilots().filter(key => key !== pilot && key !== opponent);
  const takePilot = () => available.splice(Math.floor(Math.random()*available.length),1)[0];
  const allyCount = Number(get('#battleAllies').value);
  const enemyCount = Number(get('#battleEnemies').value);
  const playerFrame = pilot === 'equipped' ? progress.selected : progress.pilotFrames[pilot];
  const spawn = (team,key,frameIndex,index,total) => ({
    team,key,frame:fleet[frameIndex],modules:index === 0 && team === 0 ? progress.battleLevels[frameIndex] : [0,0,0],
    x:team ? 855-index%3*35 : 105+index%3*35,y:55+(index+1)*340/(total+1),
    angle:team ? -Math.PI/2 : Math.PI/2,health:100,shotWait:.4+index*.12,scatterWait:0,
    shieldWait:0,shield:0,player:team === 0 && index === 0
  });
  const units = [spawn(0,pilot,playerFrame,0,allyCount)];
  for (let i=1;i<allyCount;i++) {
    const key = takePilot();
    units.push(spawn(0,key,progress.pilotFrames[key],i,allyCount));
  }
  for (let i=0;i<enemyCount;i++) {
    const key = i === 0 && opponent && opponent !== pilot ? opponent : takePilot();
    units.push(spawn(1,key,progress.pilotFrames[key],i,enemyCount));
  }
  battle = {units,player:units[0],shots:[],elapsed:0,charge:null,paused:false,result:''};
  clearBattleInput();
  battleLastDraw = -Infinity;
  get('#battlePause').textContent = 'Pause';
  renderBattleSetup();
  updateBattleHud();
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
  return battleWalls.some(wall => x > wall[0]-radius && x < wall[0]+wall[2]+radius &&
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
      team:unit.team,life:scatter ? .52 : 1.95,size:powered ? 5 : 2.5,
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
function battlePulseStart() {
  if (!canControlBattle() || battle.charge !== null || battle.player.shotWait > 0) return;
  battle.charge = battle.elapsed;
  get('#battlePulse').classList.add('charging');
}
function battlePulseEnd() {
  if (!canControlBattle() || battle.charge === null) return;
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
    const strafe = boundary ? 0 : .34;
    moveBattleUnit(unit,approach*dx/range-strafe*dy/range,approach*dy/range+strafe*dx/range,dt);
  }
  if (!boundary && range < 375 && unit.shotWait <= 0) {
    fireBattleShot(unit,Math.random()<.16 ? 'powered' : 'pulse');
    unit.shotWait = .66+Math.random()*.6;
  }
  if (!boundary && unit.health < 70 && unit.shieldWait <= 0) shieldBattleUnit(unit);
}
function stepBattle(dt) {
  battle.elapsed += dt;
  for (const unit of battle.units) {
    if (unit.health <= 0) continue;
    for (const timer of ['shotWait','scatterWait','shieldWait','shield']) unit[timer] = Math.max(0,unit[timer]-dt);
    if (!unit.player) {steerBattleAI(unit,dt); continue;}
    const held = (...keys) => keys.some(key => battleHeld.has(key));
    moveBattleUnit(unit,battleStick.x + Number(held('d','ArrowRight'))-Number(held('a','ArrowLeft')),
      battleStick.y + Number(held('s','ArrowDown'))-Number(held('w','ArrowUp')),dt);
  }
  battle.shots = battle.shots.filter(shot => {
    shot.x += shot.vx*dt;
    shot.y += shot.vy*dt;
    shot.life -= dt;
    if (shot.life <= 0 || shot.x < 0 || shot.x > 960 || shot.y < 0 || shot.y > 450 || battleWallAt(shot.x,shot.y,shot.size)) return false;
    const target = battle.units.find(unit => unit.team !== shot.team && unit.health > 0 &&
      (unit.x-shot.x)**2+(unit.y-shot.y)**2 < (13+shot.size)**2);
    if (!target) return true;
    if (!target.shield) target.health = Math.max(0,target.health-shot.damage);
    return false;
  });
  const survivors = [0,1].map(team => battle.units.reduce((sum,unit) => sum+(unit.team === team ? unit.health : 0),0));
  if (!survivors.every(Boolean) || battle.elapsed >= 150) {
    battle.result = survivors[0] === survivors[1] ? 'Draw' : survivors[0] > survivors[1] ? 'Victory' : 'Defeat';
    clearBattleInput();
  }
}
function updateBattleHud() {
  const count = team => battle.units.filter(unit => unit.team === team && unit.health > 0).length;
  updateHudText('#battleStatus',battle.result || (battle.paused ? 'Paused' : count(0)+' allies · '+count(1)+' rivals · '+Math.max(0,Math.ceil(150-battle.elapsed))+'s'));
  updateHudText('#battleHealth',Math.ceil(battle.player.health)+'% hull');
  updateHudText('#battleResult',battle.result);
  get('#battleHull').value = battle.player.health;
  get('#battlePause').hidden = Boolean(battle.result);
  get('#battleExit').textContent = battle.result ? 'Back to setup' : 'End battle';
  for (const [selector,wait] of [['#battlePulse',battle.player.shotWait],['#battleScatter',battle.player.scatterWait],['#battleShield',battle.player.shieldWait]]) {
    get(selector).disabled = !canControlBattle() || wait > 0;
  }
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
  for (const shot of battle.shots) {
    circle(shot.x,shot.y,shot.size,surface);
    surface.fillStyle = shot.team ? '#ff759a' : '#a8ffd6';
    surface.fill();
  }
  for (const unit of battle.units) {
    if (unit.health <= 0) continue;
    const color = unit.team ? '#ff759a' : '#74ffd0';
    if (unit.shield) {
      circle(unit.x,unit.y,21,surface);
      surface.strokeStyle = '#9ed9ff';
      surface.lineWidth = 2;
      surface.stroke();
    }
    surface.save();
    surface.translate(unit.x,unit.y);
    surface.rotate(unit.angle);
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
function initBattleControls() {
  get('#battlePilot').addEventListener('change',renderBattleSetup);
  get('#battleAllies').addEventListener('change',renderBattleSetup);
  get('#battleStart').addEventListener('click',() => {startBattle(); if (battle) drawBattle();});
  get('#battleExit').addEventListener('click',() => {clearBattleInput(); battle = undefined; renderBattleSetup();});
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
    battlePulseStart();
  });
  pulse.addEventListener('pointerup',battlePulseEnd);
  for (const type of ['pointercancel','lostpointercapture']) pulse.addEventListener(type,() => {
    if (!battle) return;
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
    if (!canControlBattle() || /^(INPUT|SELECT)$/.test(event.target?.tagName)) return;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if (key === ' ' && event.target?.tagName === 'BUTTON') return;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' '].includes(key)) {
      event.preventDefault();
      battleHeld.add(key);
    }
    if (event.repeat) return;
    if (key === ' ') battlePulseStart();
    if (key === 'x') fireBattleShot(battle.player,'scatter');
    if (key === 'c') shieldBattleUnit(battle.player);
  });
  window.addEventListener('keyup',event => {
    battleHeld.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    if (event.key === ' ') battlePulseEnd();
  });
  window.addEventListener('blur',pauseBattle);
  window.matchMedia('(orientation: portrait)').addEventListener('change',pauseBattle);
  document.addEventListener('visibilitychange',() => {if (document.hidden) pauseBattle();});
}
