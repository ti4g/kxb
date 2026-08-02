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

    // ENTRADA: tela em branco -> as letras vêm das bordas e pousam formando o nome
    var letters = [];
    document.querySelectorAll('.hero__name .line').forEach(function(line){
      var chars = line.textContent.split('');
      line.textContent = '';
      chars.forEach(function(ch){
        var s = document.createElement('span');
        s.className = 'ltr'; s.textContent = ch;
        line.appendChild(s); letters.push(s);
      });
    });
    // esconde o entorno (tela em branco no começo)
    gsap.set('.hero__top', { opacity:0 });
    gsap.set('.hero__bottom > *', { opacity:0, y:16 });
    gsap.set('.proof', { y:22 });   // a prova do allmosso entra só depois da frase, no scroll
    // cada letra parte de um ponto espalhado ao redor da tela e desliza pro lugar
    var vw = window.innerWidth, vh = window.innerHeight, cx = vw/2, cy = vh/2;
    var n = letters.length;
    letters.forEach(function(s, i){
      var r = s.getBoundingClientRect();
      var pad = Math.max(r.width, r.height) * 0.6 + 10;      // margem pra letra não encostar na borda
      var rx = Math.max(cx - pad, 40), ry = Math.max(cy - pad, 40);
      var ang = (((i * 5) % n) / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      var k = 0.72 + Math.random() * 0.28;                    // espalha entre 72% e 100% do limite
      var sx = cx + Math.cos(ang) * rx * k, sy = cy + Math.sin(ang) * ry * k;
      gsap.set(s, { x: sx - (r.left + r.width/2), y: sy - (r.top + r.height/2), rotation:(Math.random()-0.5)*18, opacity:0 });
    });
    // load: as letras só APARECEM espalhadas e ficam flutuando (o nome ainda não se lê)
    var tl = gsap.timeline({ delay:.2 });
    tl.to(letters, { opacity:1, duration:1.1, ease:'power2.out', stagger:{ each:0.04, from:'random' } });
    tl.to('.hero__top', { opacity:1, duration:.7, ease:'power2.out' }, '-=.4');
    tl.to('.scrollcue', { opacity:1, y:0, duration:.8, ease:'expo.out' }, '<');
    // respiro: cada letra flutua de leve no lugar onde parou
    var floats = letters.map(function(s){
      return gsap.to(s, { x:'+='+((Math.random()-0.5)*26), y:'+='+((Math.random()-0.5)*26), rotation:'+='+((Math.random()-0.5)*7),
        duration:2.2+Math.random()*1.6, ease:'sine.inOut', yoyo:true, repeat:-1 });
    });

    // scrollytelling: hero pina; a frase cai de cima palavra por palavra e o bordão assina
    var thesis = document.querySelector('.hero__thesis');
    var txt = thesis.textContent, words = [];
    thesis.textContent = '';
    txt.split(/(\s+)/).forEach(function(p){
      if(!p) return;
      if(!p.trim()){ thesis.appendChild(document.createTextNode(p)); }
      else { var w = document.createElement('span'); w.className='word'; w.textContent=p; thesis.appendChild(w); words.push(w); }
    });
    var path = document.querySelector('.mark svg path'), plen = path ? path.getTotalLength() : 0;
    if(path){ path.style.strokeDasharray = plen; path.style.strokeDashoffset = plen; }
    gsap.set(words, { opacity:0, yPercent:-110 });
    gsap.set('.hero__bordao', { opacity:0, y:22 });
    var bar = document.querySelector('.heroprog i');
    var stl = gsap.timeline({ scrollTrigger:{ trigger:'.hero', start:'top top', end:'+=160%', pin:true, scrub:0.5, anticipatePin:1,
      onUpdate:function(self){
        if(self.progress > 0.01){ floats.forEach(function(f){ f.kill(); }); }
        if(bar){ bar.style.width = (self.progress*100).toFixed(1) + '%'; }
      } } });
    // 1) as letras param de flutuar e convergem formando o nome
    stl.to(letters, { x:0, y:0, rotation:0, ease:'power2.inOut', stagger:{ each:0.05, from:'start' }, duration:1.6 });
    // 2) só então a frase cai palavra por palavra
    stl.to(words, { opacity:1, yPercent:0, ease:'power2.out', stagger:0.4, duration:1 }, '>-0.1');
    stl.to('.hero__bordao', { opacity:1, y:0, ease:'power2.out', duration:0.8 }, '>-0.15');
    stl.to('.proof', { opacity:1, y:0, ease:'power2.out', duration:0.8 }, '>-0.3');
    if(path){ stl.to(path, { strokeDashoffset:0, ease:'none', duration:0.6 }, '>-0.2'); }

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
