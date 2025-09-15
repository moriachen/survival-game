
/*! diag-overlay.js — drop-in debugging overlay (mobile-friendly) */
(function(){
  // styles
  var css = document.createElement('style');
  css.textContent = [
    '#__diag{position:fixed;left:8px;right:8px;bottom:8px;z-index:999999;background:rgba(0,0,0,.85);color:#eaeaea;',
    'font:12px/1.4 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;border:1px solid #555;border-radius:10px;',
    'max-height:46vh;overflow:auto;box-shadow:0 8px 28px rgba(0,0,0,.5);padding:8px}',
    '#__diag_btn{position:fixed;right:10px;bottom:10px;z-index:1000000;background:#222;color:#fff;border:1px solid #555;',
    'border-radius:12px;padding:8px 10px;font:12px system-ui;-webkit-tap-highlight-color:transparent}',
    '#__diag_actions{position:sticky;top:0;background:#111;padding:6px;border-radius:8px;margin-bottom:6px;display:flex;gap:6px;flex-wrap:wrap}',
    '#__diag_actions button{padding:6px 8px;border-radius:8px;border:1px solid #555;background:#222;color:#eee;touch-action:manipulation}'
  ].join('');
  document.head.appendChild(css);

  var open = false, box = document.createElement('div'), btn = document.createElement('button');
  btn.id='__diag_btn'; btn.textContent='🧪 调试';
  box.id='__diag'; box.style.display='none';
  var actions = document.createElement('div'); actions.id='__diag_actions';
  var out = document.createElement('pre'); out.id='__diag_log';

  function log(s){ var t=new Date().toLocaleTimeString(); out.textContent='['+t+'] '+s+'\n'+out.textContent; }

  function togg(){ open=!open; box.style.display=open?'block':'none'; log(open?'打开调试面板':'关闭调试面板'); }

  // buttons
  var bProbe = document.createElement('button'); bProbe.textContent='探测叠层';
  var bCT = document.createElement('button'); bCT.textContent='穿透开/关';
  var bTryRender = document.createElement('button'); bTryRender.textContent='尝试 render()';
  var bOpenPet = document.createElement('button'); bOpenPet.textContent='尝试打开宠物弹窗';
  var bDump = document.createElement('button'); bDump.textContent='变量快照';
  actions.appendChild(bProbe); actions.appendChild(bCT); actions.appendChild(bTryRender); actions.appendChild(bOpenPet); actions.appendChild(bDump);

  box.appendChild(actions); box.appendChild(out);
  document.body.appendChild(box); document.body.appendChild(btn);
  btn.addEventListener('click', togg, {passive:true});

  // error capture
  window.addEventListener('error', function(e){ log('JS错误: '+(e.message||e.error)); }, true);
  window.addEventListener('unhandledrejection', function(e){ log('Promise未捕获: '+e.reason); }, true);
  document.addEventListener('DOMContentLoaded', function(){ log('DOMContentLoaded'); });
  window.addEventListener('load', function(){ log('load'); });

  // helpers
  function elementsFromCenter(y){
    var x = Math.round(window.innerWidth/2);
    var stack = document.elementsFromPoint(x, y) || [];
    stack.slice(0, 6).forEach(function(el, i){
      var s = getComputedStyle(el);
      log('#'+i+': '+el.tagName+(el.id?('#'+el.id):'')+(el.className?('.'+el.className):'')+' pos='+s.position+' pe='+s.pointerEvents+' z='+s.zIndex);
    });
  }
  var ctOn=false, ctStyle;
  function toggleClickThrough(){
    ctOn=!ctOn;
    if(ctOn){
      ctStyle = document.createElement('style');
      ctStyle.textContent = '@media(hover:none) and (pointer:coarse){.overlay,.mask,.backdrop,.intro,.cover,[class*=\"overlay\"],[class*=\"backdrop\"]{pointer-events:none!important}button,a,input,select,textarea,label,[role=\"button\"],.btn,.button,.tab,.tile,.clickable{pointer-events:auto!important}}';
      document.head.appendChild(ctStyle);
      log('已开启强制穿透');
    }else{
      ctStyle && ctStyle.remove();
      log('已关闭强制穿透');
    }
  }
  function tryRender(){
    try{
      log('存在 render = '+(typeof window.render));
      if(typeof window.render === 'function'){ window.render(); log('render() 已调用'); }
      else log('没有 render 函数');
    }catch(e){ log('render() 报错: '+e); }
  }
  function tryOpenPet(){
    try{
      var d = document.getElementById('petDlg');
      log('#petDlg 存在 = '+!!d+'; showModal = '+(d && typeof d.showModal));
      if(d && typeof d.showModal === 'function'){ d.showModal(); log('调用了 petDlg.showModal()'); }
    }catch(e){ log('petDlg.showModal() 报错: '+e); }
  }
  function dumpVars(){
    try{
      log('UA='+navigator.userAgent);
      log('has S='+(typeof window.S)+ (window.S?(', S.pet='+window.S.pet):''));
      log('has save='+(typeof window.save)+', addLog='+(typeof window.addLog)+', LS_KEY='+(typeof window.LS_KEY !== 'undefined' ? window.LS_KEY : 'undefined'));
      log('viewport='+window.innerWidth+'x'+window.innerHeight);
    }catch(e){ log('dump失败: '+e); }
  }

  bProbe.addEventListener('click', function(){ [180,260,360,460].forEach(elementsFromCenter); }, {passive:true});
  bCT.addEventListener('click', toggleClickThrough, {passive:true});
  bTryRender.addEventListener('click', tryRender, {passive:true});
  bOpenPet.addEventListener('click', tryOpenPet, {passive:true});
  bDump.addEventListener('click', dumpVars, {passive:true});

  // auto open once on mobile
  if (matchMedia('(hover:none) and (pointer:coarse)').matches) { togg(); dumpVars(); [220,320].forEach(elementsFromCenter); }
})();
