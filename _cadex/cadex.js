(function(){
  document.documentElement.classList.add('js');

  // sticky header hairline
  var head = document.querySelector('.site-head');
  var onScroll = function(){ head.classList.toggle('stuck', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, {passive:true});

  // reveal on scroll — elements rest visible, so the page is complete without JS
  var io;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    document.querySelectorAll('.rv').forEach(function(el){ io.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
  }

  // early-access capture (no backend yet — wire the submit handler to your list)
  var EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  var ef = document.getElementById('early-form');
  var earlyData = {};
  var detailsSaved = false;
  // data-endpoint on #early is the Apps Script web app that writes to the sign-ups sheet (see README).
  // Each submit POSTs JSON: step 1 {email, step:"email"}, step 2 {email, work, province, ..., step:"details"}.
  var endpoint = (document.getElementById('early').dataset.endpoint || '').trim();
  function post(payload){
    if (!endpoint) { console.warn('Cadex early access: no data-endpoint set, nothing was sent.', payload); return Promise.resolve(); }
    // text/plain on purpose: Apps Script can't answer the CORS preflight that application/json triggers.
    return fetch(endpoint, {method:'POST', keepalive:true, headers:{'Content-Type':'text/plain;charset=utf-8','Accept':'application/json'}, body:JSON.stringify(payload)})
      .then(function(r){ if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      // Apps Script answers 200 even when saving failed, so the body carries the real result.
      .then(function(d){ if (!d || d.ok !== true) throw new Error((d && d.error) || 'not saved'); });
  }
  // Saving takes Apps Script 2-3 seconds and visitors no longer wait on it, so try twice before giving up.
  // Repeats are safe: the sheet keeps one row per email.
  function save(payload){
    return post(payload).catch(function(e){ console.error(e); return post(payload); });
  }
  function earlyStep(n){
    document.querySelectorAll('.early-step').forEach(function(s){ s.hidden = s.dataset.step !== String(n); });
  }
  function setOtherError(q, on){
    q.querySelector('.early-other-err').hidden = !on;
    q.querySelector('.early-other').setAttribute('aria-invalid', on);
  }
  document.querySelectorAll('.early-q').forEach(function(q){
    q.querySelector('.early-other').addEventListener('input', function(){ setOtherError(q, false); });
    q.addEventListener('click', function(e){
      var c = e.target.closest('.chip'); if (!c) return;
      var on = c.getAttribute('aria-pressed') !== 'true';
      if (q.dataset.multi !== 'true') q.querySelectorAll('.chip').forEach(function(x){ x.setAttribute('aria-pressed','false'); });
      c.setAttribute('aria-pressed', on);
      var oc = Array.prototype.find.call(q.querySelectorAll('.chip'), function(x){ return x.textContent === 'Other'; });
      var oi = q.querySelector('.early-other');
      var show = oc.getAttribute('aria-pressed') === 'true';
      oi.hidden = !show;
      if (!show) setOtherError(q, false);
      if (show && c === oc) oi.focus();
    });
  });
  var em = document.getElementById('early-more');
  function finish(send){
    if (send) document.querySelectorAll('.early-q').forEach(function(q){
      earlyData[q.dataset.name] = Array.prototype.map.call(q.querySelectorAll('.chip[aria-pressed="true"]'), function(c){ return c.textContent; });
      var oi = q.querySelector('.early-other');
      if (!oi.hidden && oi.value.trim()) earlyData[q.dataset.name + 'Other'] = oi.value.trim();
    });
    if (send) save(Object.assign({step:'details'}, earlyData))
      .then(function(){ detailsSaved = true; })
      .catch(function(e){ console.error(e); });
    earlyStep(3);
  }
  // Choosing Other requires a description, otherwise we can't tell what the answer means. Skip stays available.
  em.addEventListener('submit', function(e){
    e.preventDefault();
    var blank = null;
    document.querySelectorAll('.early-q').forEach(function(q){
      var oi = q.querySelector('.early-other');
      var missing = !oi.hidden && !oi.value.trim();
      setOtherError(q, missing);
      if (missing && !blank) blank = oi;
    });
    if (blank) { blank.focus(); return; }
    finish(true);
  });
  document.getElementById('early-skip').addEventListener('click', function(){ finish(false); });
  if (ef) {
    ef.addEventListener('submit', function(ev){
      ev.preventDefault();
      var input = document.getElementById('early-email');
      var v = input.value.trim();
      if (!EMAIL.test(v)) { input.focus(); return; }
      earlyData.email = v;
      var err = document.getElementById('early-err');
      err.hidden = true;
      detailsSaved = false;
      // Show the next screen straight away and save behind it. If saving fails, bring them back to
      // retry with their email still filled in, unless the details step already saved the same email.
      earlyStep(2);
      save({step:'email', email:v}).catch(function(e){
        console.error(e);
        if (!detailsSaved) { earlyStep(1); err.hidden = false; }
      });
    });
  }

  // footer disclaimer
  var dBtn = document.getElementById('disclaimer-btn');
  var dText = document.getElementById('disclaimer');
  dBtn.addEventListener('click', function(){
    var open = dBtn.getAttribute('aria-expanded') !== 'true';
    dBtn.setAttribute('aria-expanded', open);
    dText.hidden = !open;
    if (open) dText.closest('.site-foot').scrollIntoView({block:'end'});
  });

  // Pro notify form
  var btn = document.getElementById('notify-btn');
  var form = document.getElementById('notify');
  var ok = document.getElementById('notify-ok');
  if (btn && form) {
    btn.addEventListener('click', function(){
      form.classList.add('open'); btn.hidden = true;
      document.getElementById('notify-email').focus();
    });
    form.addEventListener('submit', function(ev){
      ev.preventDefault();
      var v = document.getElementById('notify-email').value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) {
        document.getElementById('notify-email').focus(); return;
      }
      form.classList.remove('open'); ok.classList.add('show');
    });
  }
})();

document.querySelectorAll('a[href="#early"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const c=document.getElementById('early');window.scrollTo({top:c.getBoundingClientRect().top+window.scrollY-120,behavior:'smooth'});setTimeout(()=>document.getElementById('early-email').focus({preventScroll:true}),600)}))