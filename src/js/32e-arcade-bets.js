/* ================= Arcade: apostas seguras com saldo do Workday =================
   Dinheiro é exclusivamente a carteira do jogo. Debitar antes de iniciar impede
   repetir uma rodada sem assumir o risco; sair após o início perde a aposta.
   O multiplicador 2x restitui a entrada e mais um lucro igual se o jogador vencer. */
function arcadeBetPanel(host, title, onStart, options = {}) {
  const u=U(), min=options.allowFree?0:1;
  const wrap=document.createElement('div');wrap.className='mg-wager';
  host.append(wrap);
  const label=document.createElement('label');
  label.textContent=u.mgBetAmount;label.htmlFor='mg-bet-'+Math.random().toString(36).slice(2);
  const value=document.createElement('input');value.id=label.htmlFor;value.type='number';value.min=String(min);value.step='1';
  value.max=String(Math.max(0,Math.floor(P.wallet)));
  value.value=String(Math.min(25,Math.floor(P.wallet)));
  const btn=document.createElement('button');btn.type='button';btn.className='pxbtn main';btn.textContent=u.mgBetStart;
  const hint=document.createElement('small');hint.textContent=u.mgBetInfo;
  const balance=document.createElement('span');balance.className='mg-balance';
  const row=document.createElement('div');row.className='mg-wager-row';row.append(label,value,btn);
  wrap.append(balance,row,hint);
  const update=()=>{balance.textContent=u.wallet+': '+money(P.wallet);btn.disabled=P.wallet<min;};
  update();
  let started=false;
  btn.onclick=()=>{
    if(started)return;
    const stake=Number(value.value);
    if(!Number.isSafeInteger(stake)||stake<min||stake>Math.floor(P.wallet)){mgPop(options.stage,u.mgBetInvalid,'bad');return;}
    started=true;btn.disabled=true;
    if(stake>0){P.wallet-=stake;persist();}update();wrap.remove();
    onStart(stake);
  };
  return { cancel(){wrap.remove();},get started(){return started;} };
}
function arcadeBetPayout(stake,win) {
  if(win && stake>0) {P.wallet+=stake*2;persist();}
  return win?stake*2:0;
}
function arcadePaintProgress() {
  const p=load('arcade-paint',null);
  if(!p || typeof p!=='object')return {done:{},colors:{}};
  return {done:p.done&&typeof p.done==='object'?p.done:{},colors:p.colors&&typeof p.colors==='object'?p.colors:{}};
}
