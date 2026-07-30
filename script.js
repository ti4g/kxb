(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- copiar e-mail ---------- */
  var copyBtn = document.getElementById('copyMail');
  var mailVal = document.getElementById('mailVal');
  if(copyBtn){
    copyBtn.addEventListener('click', function(){
      var email = 'business.kxb@gmail.com';
      var done = function(){ mailVal.classList.add('copied'); mailVal.firstChild.textContent='copiado! '; setTimeout(function(){ mailVal.classList.remove('copied'); mailVal.firstChild.textContent='business.kxb@gmail.com '; },1600); };
      if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(email).then(done).catch(done); }
      else { var t=document.createElement('textarea'); t.value=email; document.body.appendChild(t); t.select(); try{document.execCommand('copy')}catch(e){} document.body.removeChild(t); done(); }
    });
  }

  /* ---------- preview sticky do índice ---------- */
  var frame = document.getElementById('previewFrame');
  var rows = Array.prototype.slice.call(document.querySelectorAll('#rows .row'));
  if(frame && rows.length){
    // monta um slide por projeto (print real se houver data-shot, senão poster)
    var slides = rows.map(function(row,i){
      var name = row.querySelector('.row__name').textContent.trim();
      var tag = (row.querySelector('.row__label span')||{}).textContent || '';
      var color = row.getAttribute('data-poster') || '#1C1A14';
      var shot = row.getAttribute('data-shot');
      var isDark = color.toLowerCase()==='#0c0c0d';
      var fg = isDark ? '#35E0D0' : '#fff';
      var s = document.createElement('div');
      s.className='preview__slide'+(i===0?' is-active':'');
      s.style.background = color;
      s.innerHTML = shot
        ? '<img src="'+shot+'" alt="Print do site '+name+'" loading="lazy">'
        : '<div class="poster" style="color:'+fg+'"><span class="ptag">'+tag+'</span><span class="pname">'+name+'</span></div>';
      frame.appendChild(s);
      return s;
    });
    var setActive = function(i){ slides.forEach(function(s,k){ s.classList.toggle('is-active',k===i); }); };
    rows.forEach(function(row,i){
      row.addEventListener('mouseenter', function(){ setActive(i); });
      row.addEventListener('focusin', function(){ setActive(i); });
    });
  }

  if(reduce) return; // sem motion daqui pra baixo

  /* ---------- Lenis: scroll liso (só se o CDN carregou) ---------- */
  var lenis = null;
  if(window.Lenis){
    lenis = new Lenis({ duration:1.1, easing:function(t){return Math.min(1,1.001-Math.pow(2,-10*t));}, smoothWheel:true });
    (function raf(time){ lenis.raf(time); requestAnimationFrame(raf); })();

    // âncoras internas usam o Lenis (sem ele, o scroll nativo já resolve)
    document.querySelectorAll('a[href^="#"]').forEach(function(a){
      a.addEventListener('click', function(e){
        var id = a.getAttribute('href'); if(id==='#') return;
        var el = document.querySelector(id); if(!el) return;
        e.preventDefault(); lenis.scrollTo(el, { offset: id==='#top' ? 0 : -10 });
      });
    });
  }

  /* ---------- GSAP ---------- */
  if(window.gsap){
    gsap.registerPlugin(ScrollTrigger);
    if(lenis){
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function(t){ lenis.raf(t*1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // entrada do hero: as letras caminham pro centro e formam o nome
    var letters = [];
    document.querySelectorAll('.hero__name .line').forEach(function(line){
      var chars = line.textContent.split('');
      line.textContent = '';
      var mid = (chars.length - 1) / 2;
      chars.forEach(function(ch, i){
        var s = document.createElement('span');
        s.className = 'ltr'; s.textContent = ch; s._off = i - mid;
        line.appendChild(s); letters.push(s);
      });
    });
    var fs = parseFloat(getComputedStyle(document.querySelector('.hero__name')).fontSize) || 120;
    var spread = fs * 0.22, drop = fs * 0.06;
    letters.forEach(function(s){ gsap.set(s, { x: s._off * spread, y: drop, opacity: 0 }); });
    var tl = gsap.timeline({ delay:.25 });
    tl.to(letters, { opacity:1, duration:0.55, ease:'power1.out', stagger:{ each:0.045, from:'center' } }, 0)
      .to(letters, { x:0, y:0, duration:1.45, ease:'power3.out', stagger:{ each:0.05, from:'center' } }, 0);
    tl.from('.hero__bottom > *', { y:16, opacity:0, duration:.8, ease:'expo.out', stagger:.12 }, '-=1.05');

    // scrollytelling: o hero "pina" e a frase acende palavra por palavra conforme o scroll
    var thesis = document.querySelector('.hero__thesis');
    var words = [];
    Array.prototype.slice.call(thesis.childNodes).forEach(function(node){
      if(node.nodeType === 3){
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function(p){
          if(!p) return;
          if(!p.trim()){ frag.appendChild(document.createTextNode(p)); }
          else { var w = document.createElement('span'); w.className = 'word'; w.textContent = p; frag.appendChild(w); words.push(w); }
        });
        thesis.replaceChild(frag, node);
      } else if(node.nodeType === 1){ node.classList.add('word'); words.push(node); }
    });
    var path = document.querySelector('.mark svg path'), plen = path ? path.getTotalLength() : 0;
    if(path){ path.style.strokeDasharray = plen; path.style.strokeDashoffset = plen; }
    gsap.set(words, { opacity:0.14, y:'0.35em' });
    var stl = gsap.timeline({ scrollTrigger:{ trigger:'.hero', start:'top top', end:'+=75%', pin:true, scrub:0.5, anticipatePin:1 } });
    stl.to(words, { opacity:1, y:0, ease:'none', stagger:0.5, duration:1 });
    if(path){ stl.to(path, { strokeDashoffset:0, ease:'none', duration:0.6 }, '>-0.35'); }

    // reveals no scroll
    gsap.utils.toArray('.spotlight__frame,.spotlight__meta > *').forEach(function(el){
      gsap.from(el, { y:34, opacity:0, duration:1, ease:'expo.out',
        scrollTrigger:{ trigger:el, start:'top 85%' } });
    });
    gsap.utils.toArray('#rows .row').forEach(function(el){
      gsap.from(el, { y:26, opacity:0, duration:.85, ease:'expo.out',
        scrollTrigger:{ trigger:el, start:'top 90%' } });
    });
    gsap.from('.about p', { y:30, opacity:0, duration:1, ease:'expo.out',
      scrollTrigger:{ trigger:'.about', start:'top 70%' } });
    gsap.utils.toArray('.links .link').forEach(function(el,i){
      gsap.from(el, { y:20, opacity:0, duration:.7, ease:'expo.out',
        scrollTrigger:{ trigger:'.links', start:'top 82%' }, delay:i*.06 });
    });
  }
})();
