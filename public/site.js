/* SR Soft LLC — site interactions */

(function() {
  class ParticleField {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.particles = [];
      this.mouse = { x: -9999, y: -9999, active: false };
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.isPaused = false;
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // color: 'white' (default, hero) or 'black' (final CTA on light bg)
      this.colorBase = options.color === 'black' ? '0,0,0' : '255,255,255';
      // Optional density clusters — array of regions to seed extra particles.
      // Each region: { x: [0, 0.4], y: [0.55, 1], count: 28 }
      // Backward-compat: accept singular `cluster` too.
      this.clusters = options.clusters || (options.cluster ? [options.cluster] : []);
      this.resize();
      this.init();
      this.bindEvents();
      if (this.reducedMotion) this.draw(); else this.animate();
    }
    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = this.width * this.dpr;
      this.canvas.height = this.height * this.dpr;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(this.dpr, this.dpr);
    }
    init() {
      const isMobile = this.width < 768;
      const count = isMobile ? 55 : 110;
      this.connectionDistance = isMobile ? 110 : 160;
      this.mouseRadius = 220;
      this.time = 0;
      this.particles = Array.from({ length: count }, () => {
        const tier = Math.random();
        let size, baseOpacity, isAnchor;
        if (tier < 0.7)      { size = 1.0 + Math.random()*0.5; baseOpacity = 0.35; isAnchor = false; }
        else if (tier < 0.95){ size = 1.6 + Math.random()*0.7; baseOpacity = 0.6;  isAnchor = false; }
        else                 { size = 2.2 + Math.random()*0.8; baseOpacity = 0.85; isAnchor = true;  }
        return {
          x: Math.random()*this.width, y: Math.random()*this.height,
          vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
          size, baseOpacity, opacity: baseOpacity, isAnchor,
          waveOffset: Math.random()*Math.PI*2,
        };
      });

      // Clusters: seed extra particles weighted to specific regions. Used to add
      // visual density to corners users weren't noticing (testing-driven).
      this.clusters.forEach(c => {
        const clusterCount = isMobile ? Math.floor(c.count * 0.6) : c.count;
        for (let i = 0; i < clusterCount; i++) {
          const tier = Math.random();
          let size, baseOpacity, isAnchor;
          if (tier < 0.65)     { size = 1.0 + Math.random()*0.5; baseOpacity = 0.35; isAnchor = false; }
          else if (tier < 0.9) { size = 1.6 + Math.random()*0.7; baseOpacity = 0.6;  isAnchor = false; }
          else                 { size = 2.2 + Math.random()*0.8; baseOpacity = 0.85; isAnchor = true;  }
          this.particles.push({
            x: (c.x[0] + Math.random() * (c.x[1] - c.x[0])) * this.width,
            y: (c.y[0] + Math.random() * (c.y[1] - c.y[0])) * this.height,
            vx: (Math.random()-0.5)*0.2, vy: (Math.random()-0.5)*0.2,
            size, baseOpacity, opacity: baseOpacity, isAnchor,
            waveOffset: Math.random()*Math.PI*2,
          });
        }
      });
    }
    bindEvents() {
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { this.resize(); this.init(); }, 150);
      });
      if (window.innerWidth >= 768) {
        this.canvas.addEventListener('mousemove', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          this.mouse.x = e.clientX - rect.left;
          this.mouse.y = e.clientY - rect.top;
          this.mouse.active = true;
        });
        this.canvas.addEventListener('mouseleave', () => { this.mouse.active = false; });
      }
      document.addEventListener('visibilitychange', () => { this.isPaused = document.hidden; });
    }
    update() {
      this.time += 0.008;
      this.particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.x += Math.sin(this.time + p.waveOffset)*0.2;
        p.y += Math.cos(this.time*0.8 + p.waveOffset)*0.2;
        if (p.x < -20) p.x = this.width+20;
        if (p.x > this.width+20) p.x = -20;
        if (p.y < -20) p.y = this.height+20;
        if (p.y > this.height+20) p.y = -20;
        if (this.mouse.active) {
          const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < this.mouseRadius) p.opacity = Math.min(1, p.baseOpacity + (1 - dist/this.mouseRadius)*0.5);
          else p.opacity = p.baseOpacity;
        } else p.opacity = p.baseOpacity;
      });
    }
    draw() {
      this.ctx.clearRect(0, 0, this.width, this.height);
      for (let i = 0; i < this.particles.length; i++) {
        for (let j = i+1; j < this.particles.length; j++) {
          const a = this.particles[i], b = this.particles[j];
          const dx = a.x-b.x, dy = a.y-b.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < this.connectionDistance) {
            let opacity = (1 - dist/this.connectionDistance)*0.22;
            if (this.mouse.active) {
              const mDx = (a.x+b.x)/2 - this.mouse.x, mDy = (a.y+b.y)/2 - this.mouse.y;
              const mDist = Math.sqrt(mDx*mDx + mDy*mDy);
              if (mDist < this.mouseRadius) opacity += (1 - mDist/this.mouseRadius)*0.35;
            }
            this.ctx.strokeStyle = `rgba(${this.colorBase},${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(a.x, a.y);
            this.ctx.lineTo(b.x, b.y);
            this.ctx.stroke();
          }
        }
      }
      if (this.mouse.active) {
        this.particles.forEach(p => {
          const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < this.mouseRadius) {
            const opacity = (1 - dist/this.mouseRadius)*0.5;
            this.ctx.strokeStyle = `rgba(${this.colorBase},${opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(this.mouse.x, this.mouse.y);
            this.ctx.lineTo(p.x, p.y);
            this.ctx.stroke();
          }
        });
      }
      this.particles.forEach(p => {
        if (p.isAnchor) { this.ctx.shadowColor = `rgba(${this.colorBase},0.6)`; this.ctx.shadowBlur = 10; }
        else { this.ctx.shadowBlur = 0; }
        this.ctx.fillStyle = `rgba(${this.colorBase},${p.opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
        this.ctx.fill();
      });
      this.ctx.shadowBlur = 0;
    }
    animate() {
      if (!this.isPaused) { this.update(); this.draw(); }
      requestAnimationFrame(() => this.animate());
    }
  }

  function initSite() {
    const canvas = document.getElementById('particle-canvas');
    if (canvas) new ParticleField(canvas, {
      // Seed extra dots in both bottom corners so the constellation feels grounded
      // across the full width. Testing showed users weren't noticing the pattern
      // in either corner; matching the visible density of the CTA's particle field.
      clusters: [
        { x: [0, 0.42],   y: [0.55, 1.0], count: 28 },  // bottom-left
        { x: [0.58, 1.0], y: [0.55, 1.0], count: 28 },  // bottom-right
        { x: [0, 0.42],   y: [0, 0.42],   count: 28 },  // top-left
        { x: [0.58, 1.0], y: [0, 0.42],   count: 28 },  // top-right
      ]
    });

    // Mirror constellation on the final CTA — same animation, black on cream
    const ctaCanvas = document.getElementById('particle-canvas-cta');
    if (ctaCanvas) new ParticleField(ctaCanvas, { color: 'black' });

    document.querySelectorAll('.faq-q').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const wasOpen = item.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.faq-item').forEach(i => i.setAttribute('aria-expanded', 'false'));
        if (!wasOpen) item.setAttribute('aria-expanded', 'true');
      });
    });

    // Showcase bridge — scroll-driven scaling + counter animation
    const bridge = document.querySelector('.showcase-bridge');
    const stage = bridge ? bridge.querySelector('.showcase-stage') : null;
    const counters = document.querySelectorAll('[data-target]');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (stage && !reducedMotion) {
      // Scroll-driven scale + opacity via CSS variable --reveal
      let ticking = false;
      const updateReveal = () => {
        const rect = bridge.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when bridge top is at viewport bottom (just entering)
        // 1 when bridge top has scrolled vh past viewport bottom (fully in)
        const progress = Math.max(0, Math.min(1, (vh - rect.top) / vh));
        stage.style.setProperty('--reveal', progress.toFixed(3));
        ticking = false;
      };
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateReveal);
          ticking = true;
        }
      }, { passive: true });
      updateReveal();  // set initial value
    }

    // Counter animation — count up when bridge is mostly in view
    if (counters.length && !reducedMotion) {
      const animateCounter = (el, target, duration) => {
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.floor(eased * target);
          if (t < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        };
        requestAnimationFrame(tick);
      };
      // Reset counters to 0 (HTML has final values as fallback)
      counters.forEach(el => { el.textContent = '0'; });
      const trigger = () => {
        counters.forEach((el, i) => {
          const target = parseInt(el.dataset.target, 10);
          setTimeout(() => animateCounter(el, target, 1600), 100 + i * 120);
        });
      };
      const statsEl = document.querySelector('.showcase-stats');
      if (statsEl && 'IntersectionObserver' in window) {
        const obs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              // Reset to 0 then animate back up to target
              counters.forEach(el => { el.textContent = '0'; });
              trigger();
            }
          });
        }, { threshold: 0.4 });
        obs.observe(statsEl);
      } else {
        trigger();
      }
    }

    // Hero logo mark — 90° step rotation on hover
    const heroMark = document.getElementById('hero-mark');
    if (heroMark && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const img = heroMark.querySelector('img');
      let rotation = 0;
      let isRotating = false;
      heroMark.addEventListener('mouseenter', () => {
        if (isRotating) return;
        isRotating = true;
        rotation += 90;
        img.style.transform = `rotate(${rotation}deg) scale(1.06)`;
        setTimeout(() => { isRotating = false; }, 1200);
      });
      heroMark.addEventListener('mouseleave', () => {
        img.style.transform = `rotate(${rotation}deg) scale(1)`;
      });
    }

    const toggle = document.querySelector('.nav-toggle');
    const mobileNav = document.querySelector('.nav-mobile');
    if (toggle && mobileNav) {
      const openNav = () => {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.setAttribute('aria-label', 'Close menu');
        mobileNav.classList.add('open');
        document.body.classList.add('nav-open');
        const firstLink = mobileNav.querySelector('a');
        if (firstLink) {
          // Defer focus so the menu has rendered + animated in
          requestAnimationFrame(() => firstLink.focus());
        }
      };
      const closeNav = (restoreFocus) => {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open menu');
        mobileNav.classList.remove('open');
        document.body.classList.remove('nav-open');
        if (restoreFocus) toggle.focus();
      };
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') === 'true';
        if (open) closeNav(false); else openNav();
      });
      // Escape closes
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          closeNav(true);
        }
      });
      // Click a link → close
      mobileNav.addEventListener('click', (e) => {
        if (e.target.closest('a')) closeNav(false);
      });
      // Window resize beyond mobile breakpoint → close + cleanup
      const mq = window.matchMedia('(min-width: 901px)');
      const onMq = () => {
        if (mq.matches && toggle.getAttribute('aria-expanded') === 'true') {
          closeNav(false);
        }
      };
      if (mq.addEventListener) mq.addEventListener('change', onMq);
      else mq.addListener(onMq);
    }

    // E-Verify badge dismiss
    const everifyClose = document.querySelector('.everify-close');
    const everifyBadge = document.querySelector('.everify-badge');
    if (everifyClose && everifyBadge) {
      everifyClose.addEventListener('click', () => {
        everifyBadge.classList.add('hidden');
        try { sessionStorage.setItem('everify-dismissed', '1'); } catch(e) {}
      });
      try {
        if (sessionStorage.getItem('everify-dismissed') === '1') everifyBadge.classList.add('hidden');
      } catch(e) {}
    }

    // Reveal on scroll — replay every time element enters view
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
          } else {
            // Only reset when fully out of view, so animation can replay on scroll-back
            e.target.classList.remove('in');
          }
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -10% 0px' });
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => obs.observe(el));
    } else {
      document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in'));
    }

    // ====================================================================
    // INTERACTIVE LOGO — 3D mouse-driven tilt + click-to-flip
    //
    // The brand-card logo on the about page responds to cursor position
    // with a parallax tilt (max ±14°), and on click does a satisfying full
    // 360° Y-axis rotation. Honours prefers-reduced-motion.
    // ====================================================================
    (function initLogoInteraction() {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;

      const marks = document.querySelectorAll('.brand-card-mark');
      if (!marks.length) return;

      marks.forEach((mark) => {
        // The bounding container — listen here so the cursor doesn't have to
        // be precisely over the logo image to start the tilt; hovering the
        // card region is enough. Falls back to the mark itself.
        const region = mark.closest('.brand-card') || mark.closest('.about-head-logo') || mark.parentElement;
        if (!region) return;

        let rafId = null;
        let isSpinning = false;

        const onMove = (e) => {
          if (isSpinning) return;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            const rect = mark.getBoundingClientRect();
            // Distance from mark center, normalized to [-1, 1] within the mark itself.
            // Cursor anywhere in the card translates to a proportional tilt.
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = Math.max(-1.4, Math.min(1.4, (e.clientX - cx) / (rect.width / 2)));
            const dy = Math.max(-1.4, Math.min(1.4, (e.clientY - cy) / (rect.height / 2)));
            const MAX_TILT = 14; // degrees
            const rotY = dx * MAX_TILT;
            const rotX = -dy * MAX_TILT;
            mark.style.transform =
              'perspective(720px) rotateX(' + rotX.toFixed(2) + 'deg) ' +
              'rotateY(' + rotY.toFixed(2) + 'deg) scale(1.06)';
          });
        };

        const onLeave = () => {
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          if (isSpinning) return;
          // Smooth return — temporarily set transition for the snap-back,
          // then strip it so the next mousemove has no lag.
          mark.style.transition = 'transform 620ms cubic-bezier(0.2, 0.85, 0.25, 1), filter 500ms cubic-bezier(0.2, 0.85, 0.25, 1)';
          mark.style.transform = '';
          setTimeout(() => {
            // Restore the CSS-only transition (filter only)
            mark.style.transition = '';
          }, 640);
        };

        const onClick = () => {
          if (isSpinning) return;
          isSpinning = true;
          if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
          mark.style.transition = 'transform 900ms cubic-bezier(0.2, 0.85, 0.25, 1)';
          mark.style.transform = 'perspective(720px) rotateY(360deg) scale(1.06)';
          setTimeout(() => {
            // Reset without animating back through 360°
            mark.style.transition = 'none';
            mark.style.transform = '';
            // Force reflow so the next transition is clean
            void mark.offsetWidth;
            mark.style.transition = '';
            isSpinning = false;
          }, 920);
        };

        region.addEventListener('mousemove', onMove);
        region.addEventListener('mouseleave', onLeave);
        mark.addEventListener('click', onClick);
        // Keyboard parity: Enter or Space triggers the spin
        mark.setAttribute('tabindex', '0');
        mark.setAttribute('role', 'button');
        mark.setAttribute('aria-label', 'SR Soft logo — click to animate');
        mark.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        });
      });
    })();

    // ====================================================================
    // CAREERS HANDSHAKE — cursor-driven parallax
    //
    // The handshake image drifts a few pixels opposite the cursor to fake
    // depth. CSS handles the entrance animation + Ken Burns; this just
    // writes --px / --py vars that the CSS transform reads. Honours
    // prefers-reduced-motion.
    // ====================================================================
    (function initCareersParallax() {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      const careers = document.getElementById('careers-figure');
      if (!careers) return;
      const wrap = careers.querySelector('.head-figure-image-wrap');
      if (!wrap) return;

      const MAX = 14; // px max drift in each axis
      let rafId = null;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;
      let animating = false;

      const ease = () => {
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;
        wrap.style.setProperty('--px', currentX.toFixed(2) + 'px');
        wrap.style.setProperty('--py', currentY.toFixed(2) + 'px');
        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          rafId = requestAnimationFrame(ease);
        } else {
          animating = false;
        }
      };
      const kick = () => {
        if (!animating) {
          animating = true;
          rafId = requestAnimationFrame(ease);
        }
      };

      careers.addEventListener('mousemove', (e) => {
        const rect = careers.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        // Negate so image moves OPPOSITE the cursor — feels like depth
        targetX = -Math.max(-1.2, Math.min(1.2, dx)) * MAX;
        targetY = -Math.max(-1.2, Math.min(1.2, dy)) * MAX;
        kick();
      });
      careers.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        kick();
      });
    })();

    // ====================================================================
    // TRANSFORMATION SLIDER — before/after comparison with the SR Soft
    // logo as the draggable handle. Supports mouse, touch, and keyboard.
    // The position is stored on the slider's --ts-pos custom property,
    // which the CSS uses to clip the AFTER layer and position the handle.
    // ====================================================================
    // FOUR PHASES — scroll-driven single card.
    // The .phases-scroll section is a tall track; while it scrolls past, the
    // inner card is pinned (CSS sticky) and this controller maps scroll
    // progress to the active phase. Click a rail item to jump. Disabled on
    // mobile, where CSS shows every panel stacked.
    // ====================================================================
    // INSIGHTS — topic chip filter
    // Each post / featured card has data-topic="sap ai pharma ...". Chips
    // toggle visibility by setting data-active on cards.
    // ====================================================================
    (function initInsightsTopics() {
      const chips = document.querySelectorAll('.topic-chip');
      if (!chips.length) return;
      const cards = document.querySelectorAll('.post-card[data-topic], .blog-featured[data-topic]');
      // Live region for screen reader announcements
      let live = document.getElementById('insights-live');
      if (!live) {
        live = document.createElement('div');
        live.id = 'insights-live';
        live.className = 'sr-live';
        live.setAttribute('aria-live', 'polite');
        live.setAttribute('aria-atomic', 'true');
        document.body.appendChild(live);
      }
      function apply(topic, label) {
        let visible = 0;
        cards.forEach(card => {
          const topics = (card.dataset.topic || '').split(/\s+/);
          const match = topic === 'all' || topics.includes(topic);
          card.dataset.active = match ? 'true' : 'false';
          if (match) visible++;
        });
        const word = visible === 1 ? 'essay' : 'essays';
        live.textContent = `Showing ${visible} ${word}` + (topic === 'all' ? '' : ` in ${label}`);
      }
      chips.forEach(chip => {
        chip.setAttribute('aria-pressed', chip.classList.contains('is-active') ? 'true' : 'false');
        chip.addEventListener('click', () => {
          chips.forEach(c => {
            c.classList.remove('is-active');
            c.setAttribute('aria-pressed', 'false');
          });
          chip.classList.add('is-active');
          chip.setAttribute('aria-pressed', 'true');
          const label = chip.firstChild ? chip.firstChild.textContent.trim() : 'topic';
          apply(chip.dataset.topic || 'all', label);
        });
      });
    })();

    // ====================================================================
    // Fibonacci-sphere dot distribution, slow orthographic rotation,
    // continental US dots in white, rest at low opacity. Pauses when
    // off-screen and on prefers-reduced-motion.
    // ====================================================================
    (function initCareersGlobe() {
      const canvas = document.getElementById('careers-globe');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, rect.width * dpr);
        canvas.height = Math.max(1, rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Simplified land polygons (lat, lon) for all major continents.
      // Ray-cast point-in-polygon — winding doesn't matter.
      const NORTH_AMERICA = [
        [71.0, -156.0],[70.0, -141.0],[69.0, -135.0],[69.0, -125.0],
        [74.0, -120.0],[74.0, -95.0],[72.0, -82.0],
        [66.0, -62.0],[60.0, -65.0],[55.0, -57.0],[52.0, -55.0],
        [47.0, -52.0],[45.0, -60.0],[43.0, -66.0],[44.5, -67.0],
        [40.7, -74.0],[35.0, -75.5],[32.0, -80.5],
        [27.0, -80.0],[25.1, -80.2],[25.5, -82.0],[29.0, -84.0],
        [29.5, -89.0],
        [26.0, -97.5],[21.0, -97.0],[18.5, -94.5],[16.0, -93.0],
        [15.5, -88.0],[12.5, -83.0],[9.0, -81.0],[8.5, -77.5],
        [10.0, -85.0],[13.0, -90.0],[15.5, -93.0],
        [20.0, -105.0],[23.0, -110.0],[29.0, -114.0],
        [32.5, -117.2],[40.0, -124.5],[46.0, -124.0],[48.5, -125.0],
        [54.0, -132.0],[60.0, -140.0],[59.0, -150.0],[54.0, -163.0],
        [60.0, -167.0],[66.0, -168.0],
      ];
      const SOUTH_AMERICA = [
        [12.5, -72.0],[12.0, -68.0],[10.5, -61.0],[6.0, -58.0],
        [5.0, -52.0],[2.0, -50.0],[-2.0, -44.0],[-8.0, -34.5],
        [-23.0, -41.0],[-34.0, -53.5],[-39.0, -58.0],[-50.5, -68.5],
        [-55.0, -68.0],[-53.0, -73.0],[-45.0, -75.0],[-30.0, -71.5],
        [-18.0, -70.5],[-5.0, -81.0],[1.0, -80.0],[7.0, -78.0],
      ];
      const AFRICA = [
        [37.0, -7.0],[37.0, 11.0],[33.0, 22.0],[31.0, 32.0],
        [23.0, 36.0],[12.0, 43.0],[11.0, 51.0],[2.0, 42.0],
        [-12.0, 40.0],[-26.0, 33.0],[-34.5, 20.0],[-34.0, 18.0],
        [-25.0, 14.0],[-12.0, 13.0],[-2.0, 9.0],[4.0, 7.0],
        [5.0, -1.0],[5.0, -7.0],[10.0, -14.0],[14.0, -17.0],
        [20.0, -17.0],[27.0, -13.0],[35.0, -5.0],
      ];
      const EURASIA = [
        // Iberia → Western Europe coast → Scandinavia → Arctic
        [37.0, -9.0],[43.0, -10.0],[48.0, -5.0],[51.0, -5.0],
        [55.0, -2.0],[58.0, 5.0],[71.0, 28.0],[78.0, 60.0],
        // Siberian arctic edge
        [78.0, 100.0],[75.0, 140.0],[70.0, 170.0],[66.0, 180.0],
        [66.0, 175.0],[60.0, 165.0],
        // East coast Asia
        [54.0, 142.0],[45.0, 135.0],[39.0, 128.0],[35.0, 125.0],
        [30.0, 122.0],[22.0, 115.0],[18.0, 110.0],[12.0, 109.0],
        [8.0, 100.0],[2.0, 102.0],[6.0, 80.0],[8.0, 77.0],
        [20.0, 70.0],[24.0, 60.0],[12.0, 45.0],[15.0, 42.0],
        [28.0, 34.0],[31.0, 32.0],[35.0, 35.0],[36.0, 30.0],
        [41.0, 28.0],[40.0, 23.0],[37.0, 22.0],[40.0, 16.0],
        [44.0, 9.0],[43.0, -1.0],[37.0, -9.0],
      ];
      const AUSTRALIA = [
        [-11.0, 142.0],[-11.0, 132.0],[-15.0, 124.0],[-21.0, 114.0],
        [-26.0, 113.0],[-34.0, 115.0],[-35.0, 118.0],[-39.0, 144.0],
        [-37.0, 150.0],[-28.0, 153.0],[-20.0, 149.0],
      ];
      const GREENLAND = [
        [83.0, -32.0],[82.0, -22.0],[77.0, -18.0],[70.0, -22.0],
        [60.0, -43.0],[60.0, -48.0],[70.0, -55.0],[77.0, -68.0],
        [82.0, -64.0],
      ];
      const BRITISH_ISLES = [
        [60.5, -7.0],[59.0, -1.0],[55.0, -1.5],[51.0, 1.5],
        [50.0, -5.5],[55.0, -8.0],[58.0, -7.5],
      ];
      const JAPAN = [
        [45.5, 142.0],[45.0, 145.0],[36.0, 141.5],[33.0, 132.0],
        [35.0, 131.0],[38.0, 139.0],[42.0, 141.0],
      ];
      const MADAGASCAR = [
        [-12.0, 49.0],[-15.5, 50.5],[-25.5, 47.0],[-25.5, 44.5],
        [-15.0, 44.0],
      ];
      const INDONESIA = [
        [6.0, 95.0],[5.0, 100.0],[2.0, 105.0],[-3.0, 105.0],
        [-7.0, 105.0],[-10.0, 119.0],[-10.0, 125.0],[-9.0, 140.0],
        [0.0, 137.0],[3.0, 125.0],[7.0, 125.0],[6.0, 117.0],
        [2.0, 110.0],[5.0, 96.0],
      ];
      const NEW_ZEALAND = [
        [-34.5, 173.0],[-37.0, 175.5],[-41.0, 174.5],[-47.0, 168.0],
        [-46.0, 166.5],[-41.0, 172.0],
      ];
      const LANDS = [
        NORTH_AMERICA, SOUTH_AMERICA, AFRICA, EURASIA, AUSTRALIA,
        GREENLAND, BRITISH_ISLES, JAPAN, MADAGASCAR, INDONESIA, NEW_ZEALAND,
      ];

      // USA polygons for the highlight
      const CONUS = [
        [49.0, -123.0],[49.0, -95.0],[48.0, -89.5],[47.4, -88.0],
        [46.0, -84.5],[45.0, -83.0],[41.7, -83.0],[42.0, -78.9],
        [44.0, -76.0],[45.0, -71.5],[47.0, -69.0],[44.5, -67.0],
        [43.5, -70.0],[41.5, -71.0],[40.7, -74.0],[38.0, -75.0],
        [35.0, -75.5],[32.0, -80.5],[27.0, -80.0],[25.1, -80.2],
        [25.5, -81.5],[29.0, -83.0],[29.5, -85.0],[29.5, -89.0],
        [29.0, -90.0],[28.0, -96.0],[26.0, -97.5],[29.0, -101.0],
        [29.5, -104.0],[31.8, -106.5],[31.3, -111.0],[32.5, -114.8],
        [32.5, -117.2],[40.0, -124.5],[46.0, -124.0],[48.5, -125.0],
      ];
      const ALASKA = [
        [71.0, -156.0],[71.0, -141.0],[60.0, -141.0],[55.0, -130.0],
        [58.0, -153.0],[55.0, -160.0],[60.0, -168.0],[66.0, -168.0],
      ];
      const HAWAII_BBOX = { lat0: 18.9, lat1: 22.3, lon0: -160.5, lon1: -154.5 };

      function pip(lat, lon, poly) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const yi = poly[i][0], xi = poly[i][1];
          const yj = poly[j][0], xj = poly[j][1];
          const intersect = ((yi > lat) !== (yj > lat)) &&
            (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
          if (intersect) inside = !inside;
        }
        return inside;
      }
      function isLand(lat, lon) {
        if (lat < -62) return true; // Antarctica band
        for (let k = 0; k < LANDS.length; k++) {
          if (pip(lat, lon, LANDS[k])) return true;
        }
        return false;
      }
      function isUSA(lat, lon) {
        if (pip(lat, lon, CONUS)) return true;
        if (pip(lat, lon, ALASKA)) return true;
        if (lat >= HAWAII_BBOX.lat0 && lat <= HAWAII_BBOX.lat1 &&
            lon >= HAWAII_BBOX.lon0 && lon <= HAWAII_BBOX.lon1) return true;
        return false;
      }

      // Generate dot positions on the sphere via golden-angle spiral.
      const N = 6200;
      const dots = new Array(N);
      const phi = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const theta = phi * i;
        const x = Math.cos(theta) * radius;
        const z = Math.sin(theta) * radius;
        const lat = Math.asin(y) * 180 / Math.PI;
        const lon = Math.atan2(z, x) * 180 / Math.PI;
        const land = isLand(lat, lon);
        const usa = land && isUSA(lat, lon);
        dots[i] = { lat, lon, land, usa };
      }

      // Pre-convert lat/lon to unit vectors
      const vecs = new Array(N);
      for (let i = 0; i < N; i++) {
        const latRad = dots[i].lat * Math.PI / 180;
        const lonRad = dots[i].lon * Math.PI / 180;
        vecs[i] = {
          x: Math.cos(latRad) * Math.sin(lonRad),
          y: -Math.sin(latRad),
          z: Math.cos(latRad) * Math.cos(lonRad),
        };
      }

      // Initial rotation: center on continental US (~ -97° lon)
      // HOME = Y-axis rotation that brings -97° longitude to the meridian.
      // TILT = X-axis tilt that lifts the USA's latitude into the visible center.
      const HOME = 97 * Math.PI / 180;
      const TILT = 32 * Math.PI / 180;
      const cosT = Math.cos(TILT);
      const sinT = Math.sin(TILT);
      let rotation = HOME;
      let hovering = false;            // pointer over globe → return & hold home
      let returning = false;           // easing back to HOME
      let returnFrom = 0;
      let returnTarget = HOME;
      let returnT0 = 0;
      const RETURN_MS = 900;
      const SLOW_SPIN = 0.00004;       // idle drift (rad/ms) — very slow rotation
      let visible = true;
      let lastT = performance.now();
      let pulse = 0;

      function draw() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2, cy = h / 2;
        const r = Math.min(cx, cy) * 0.94;
        const cosR = Math.cos(rotation);
        const sinR = Math.sin(rotation);
        // Breathing factor: 0..1, eases between dim and bright.
        const breath = 0.5 + 0.5 * Math.sin(pulse);

        ctx.clearRect(0, 0, w, h);

        // --- 3-D sphere body: a soft radial gradient offset toward the light,
        //     so the globe reads as a lit ball rather than a flat disc. ---
        const body = ctx.createRadialGradient(
          cx - r * 0.38, cy - r * 0.42, r * 0.05,
          cx, cy, r * 1.02
        );
        body.addColorStop(0,    'rgba(150,170,200,0.10)');
        body.addColorStop(0.45, 'rgba(90,105,135,0.045)');
        body.addColorStop(0.82, 'rgba(10,14,22,0.10)');
        body.addColorStop(1,    'rgba(4,6,10,0.30)');
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = body;
        ctx.fill();

        // Rim / atmosphere — a clearer, slightly brighter border on the lit edge.
        ctx.beginPath();
        ctx.arc(cx, cy, r + 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250,250,247,0.16)';
        ctx.lineWidth = 1.25;
        ctx.stroke();
        // Inner shadow ring on the dark (lower-right) side deepens the curve.
        const rim = ctx.createRadialGradient(cx, cy, r * 0.82, cx, cy, r);
        rim.addColorStop(0, 'rgba(0,0,0,0)');
        rim.addColorStop(1, 'rgba(0,0,0,0.22)');
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = rim;
        ctx.fill();

        // Directional light (upper-left, toward viewer) in view space.
        // Used to shade each dot for a 3-D terminator across the globe.
        const LX = -0.48, LY = -0.55, LZ = 0.68;
        const LLEN = Math.sqrt(LX * LX + LY * LY + LZ * LZ);
        const lx = LX / LLEN, ly = LY / LLEN, lz = LZ / LLEN;

        for (let i = 0; i < N; i++) {
          const v = vecs[i];
          // Y-axis rotation (longitude spin)
          const x1 = v.x * cosR + v.z * sinR;
          const z1 = -v.x * sinR + v.z * cosR;
          const y1 = v.y;
          // X-axis tilt (lift northern hemisphere into view)
          const zr = z1 * cosT - y1 * sinT;
          const yr = z1 * sinT + y1 * cosT;
          const xr = x1;
          if (zr < 0) continue;

          const d = dots[i];
          if (!d.land) continue;

          const sx = cx + xr * r;
          const sy = cy + yr * r;
          const limb = zr;
          // Lambert term: 1 on the lit side, 0 at the terminator.
          const lambert = Math.max(0, xr * lx + yr * ly + zr * lz);

          let alpha, radius;
          if (d.usa) {
            // Breathing highlight: brighter, fuller — the US should read as lit.
            // Keep it strong everywhere but still pick up a little light shaping.
            const base = 0.78 + 0.22 * breath;
            const shade = 0.72 + 0.28 * lambert;
            alpha = base * (0.6 + 0.4 * limb) * shade;
            radius = 1.7 + 0.3 * breath;
          } else {
            // Ambient + directional: dark side dims toward the terminator.
            const shade = 0.30 + 0.70 * lambert;
            alpha = (0.16 + 0.22 * limb) * shade;
            radius = 0.95 + 0.35 * lambert;
          }

          ctx.beginPath();
          ctx.arc(sx, sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250,250,247,' + alpha.toFixed(3) + ')';
          ctx.fill();
        }
      }

      function tick(t) {
        const dt = Math.min(64, t - lastT);
        lastT = t;
        if (visible) {
          pulse += dt * 0.0025;
          if (pulse > Math.PI * 200) pulse -= Math.PI * 200;
          if (returning) {
            const k = Math.min(1, (t - returnT0) / RETURN_MS);
            // easeInOutCubic — gentle settle
            const e = k < 0.5
              ? 4 * k * k * k
              : 1 - Math.pow(-2 * k + 2, 3) / 2;
            // shortest-arc lerp
            let delta = returnTarget - returnFrom;
            while (delta > Math.PI) delta -= Math.PI * 2;
            while (delta < -Math.PI) delta += Math.PI * 2;
            rotation = returnFrom + delta * e;
            // normalize
            while (rotation > Math.PI * 2) rotation -= Math.PI * 2;
            while (rotation < 0) rotation += Math.PI * 2;
            if (k >= 1) { rotation = returnTarget; returning = false; }
          } else if (!hovering) {
            // Idle: very slow continuous drift
            rotation += dt * SLOW_SPIN;
            if (rotation > Math.PI * 2) rotation -= Math.PI * 2;
          }
          draw();
        }
        requestAnimationFrame(tick);
      }

      resize();
      draw();
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); draw(); }, 120);
      });

      const io = new IntersectionObserver((entries) => {
        for (const e of entries) visible = e.isIntersecting;
      }, { threshold: 0 });
      io.observe(canvas);

      if (!reduced) {
        const fig = canvas.closest('.head-figure-globe') || canvas;
        const start = () => {
          // pointer over globe → ease back to USA-centered home and hold
          hovering = true;
          returning = true;
          returnFrom = rotation;
          returnTarget = HOME;
          returnT0 = performance.now();
        };
        const end = () => {
          // pointer leaves → resume slow idle drift from current position
          hovering = false;
          returning = false;
        };
        fig.addEventListener('mouseenter', start);
        fig.addEventListener('mouseleave', end);
        fig.addEventListener('touchstart', () => {
          start();
          clearTimeout(fig._spinStop);
          fig._spinStop = setTimeout(end, 4000);
        }, { passive: true });
      }

      requestAnimationFrame(tick);
    })();

    // ====================================================================
    // SERVICES GEAR — wireframe constellation, in the same dot+line idiom
    // as the homepage ParticleField. Two meshing gears: dots sit at tooth
    // corners and bore-rim points; thin lines emerge between dots within
    // range, forming the gear outline. Tooth-tip dots are anchors (brighter,
    // with a breathing pulse). Gears counter-rotate at the proper tooth ratio
    // (12:8 → omega ratio 1:-1.5) so the mesh reads as real.
    // Pauses off-screen and on prefers-reduced-motion.
    // ====================================================================
    (function initServicesGear() {
      const canvas = document.getElementById('services-gear');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      function resize() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = Math.max(1, rect.width * dpr);
        canvas.height = Math.max(1, rect.height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      // Two meshing gears. For real meshing: (a) same module (tooth pitch in
      // arc length at pitch radius), (b) center distance = sum of pitch radii,
      // (c) contact axis is a straight line between centers, (d) when A has a
      // tooth at the contact angle, B has a gap there.
      //   module = 2π · pitch_R / N → both gears tuned to module ≈ 0.24
      //   A: pitch_R = 0.382, B: pitch_R = 0.268, sum = 0.650
      //   centers on x-axis, distance 0.650 → contact axis horizontal
      //   phase 0 on both: A has tooth-0 at angle 0 (toward B); B has a gap
      //   at angle π (toward A) because 7 is odd so teeth and gaps alternate
      //   landing a gap exactly opposite tooth-0.
      const gears = [
        { cx: -0.300, cy: 0, N_TEETH: 10, BODY_R: 0.310, TIP_R: 0.454, BORE_R: 0.110, phase: 0, omega:  1.0   },
        { cx:  0.350, cy: 0, N_TEETH:  7, BODY_R: 0.195, TIP_R: 0.340, BORE_R: 0.080, phase: 0, omega: -1.428 },
      ];

      // Build LOCAL-frame dot positions per gear AND an ordered list of
      // outline edges connecting them. Two passes: (1) draw the explicit
      // outline so the gear shape is unmistakable, (2) layer the homepage's
      // distance-based constellation lines on top for the network feel.
      // Tooth = trapezoidal outline (base-L, mid-side-L, tip-L, tip-R,
      // mid-side-R, base-R) plus a mid-gap dot between teeth. Plus a handful
      // of interior scatter dots so the body shows criss-cross spokes.
      const PHI = Math.PI * (3 - Math.sqrt(5));
      gears.forEach((g, gi) => {
        g.dots = [];
        g.edges = [];                              // outline-only edges
        const pitch = (Math.PI * 2) / g.N_TEETH;
        const TOOTH_FRAC = 0.44;
        const halfA    = pitch * TOOTH_FRAC / 2;
        const tipHalfA = halfA * 0.66;             // tooth narrows at tip
        const midR     = (g.BODY_R + g.TIP_R) / 2;
        const midHalfA = (halfA + tipHalfA) / 2;
        const PER_TOOTH = 7;                       // 6 perimeter + 1 mid-gap
        for (let i = 0; i < g.N_TEETH; i++) {
          const c = i * pitch;
          const b0 = g.dots.length;
          // Tooth outline — 6 dots tracing the trapezoid perimeter…
          g.dots.push({ lx: Math.cos(c - halfA   ) * g.BODY_R, ly: Math.sin(c - halfA   ) * g.BODY_R, anchor: false });
          g.dots.push({ lx: Math.cos(c - midHalfA) * midR    , ly: Math.sin(c - midHalfA) * midR    , anchor: false });
          g.dots.push({ lx: Math.cos(c - tipHalfA) * g.TIP_R , ly: Math.sin(c - tipHalfA) * g.TIP_R , anchor: true  });
          g.dots.push({ lx: Math.cos(c + tipHalfA) * g.TIP_R , ly: Math.sin(c + tipHalfA) * g.TIP_R , anchor: true  });
          g.dots.push({ lx: Math.cos(c + midHalfA) * midR    , ly: Math.sin(c + midHalfA) * midR    , anchor: false });
          g.dots.push({ lx: Math.cos(c + halfA   ) * g.BODY_R, ly: Math.sin(c + halfA   ) * g.BODY_R, anchor: false });
          // …then a mid-gap dot on the body arc between teeth.
          g.dots.push({ lx: Math.cos(c + pitch / 2) * g.BODY_R, ly: Math.sin(c + pitch / 2) * g.BODY_R, anchor: false });
          // Outline edges through this tooth + onward to next tooth's base.
          for (let e = 0; e < 6; e++) g.edges.push([b0 + e, b0 + e + 1]);
          const nextBase = ((i + 1) % g.N_TEETH) * PER_TOOTH;
          g.edges.push([b0 + 6, nextBase]);
        }
        // Bore rim — inner circle.
        const BORE_N = Math.max(7, Math.round(g.N_TEETH * 0.8));
        const boreStart = g.dots.length;
        for (let i = 0; i < BORE_N; i++) {
          const th = (i / BORE_N) * Math.PI * 2;
          g.dots.push({ lx: Math.cos(th) * g.BORE_R, ly: Math.sin(th) * g.BORE_R, anchor: false });
        }
        for (let i = 0; i < BORE_N; i++) {
          g.edges.push([boreStart + i, boreStart + ((i + 1) % BORE_N)]);
        }
        // Interior scatter — no explicit edges; picked up by distance pass.
        const INTERIOR_N = Math.max(5, Math.round(g.N_TEETH * 0.7));
        const span = g.BODY_R - g.BORE_R - 0.05;
        for (let i = 0; i < INTERIOR_N; i++) {
          const th = (gi * 1.7 + i) * PHI;
          const rr = g.BORE_R + 0.025 + ((i + 0.5) / INTERIOR_N) * span;
          g.dots.push({ lx: Math.cos(th) * rr, ly: Math.sin(th) * rr, anchor: false });
        }
      });

      // Flatten world-position scratch buffer — re-used each frame. Track
      // per-gear offsets so we can resolve edge indices into the flat buffer.
      let totalDots = 0;
      gears.forEach(g => { g.offset = totalDots; totalDots += g.dots.length; });
      const wx = new Float32Array(totalDots);
      const wy = new Float32Array(totalDots);
      const wa = new Uint8Array(totalDots); // anchor flag

      // Connection distance in normalized world units. Tuned so adjacent
      // tooth corners + tooth tips + bore-rim dots + interior scatter all
      // link, but base-body→bore doesn't — the body stays implicit.
      const CONN_DIST    = 0.165;
      const CONN_DIST_SQ = CONN_DIST * CONN_DIST;

      let hovering = false;
      let visible = true;
      let lastT = performance.now();
      let pulse = 0;
      const BASE_SPIN  = reduced ? 0 : 0.00020; // rad/ms — slow drift
      const HOVER_SPIN = reduced ? 0 : 0.00065;

      function draw() {
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;
        const cx = w / 2, cy = h / 2;
        const r = Math.min(cx, cy) * 0.94;
        const breath = 0.5 + 0.5 * Math.sin(pulse);

        // 1. Compute world positions for every dot under current rotations.
        let k = 0;
        for (let gi = 0; gi < gears.length; gi++) {
          const g = gears[gi];
          const c = Math.cos(g.phase);
          const s = Math.sin(g.phase);
          for (let di = 0; di < g.dots.length; di++) {
            const d = g.dots[di];
            wx[k] = g.cx + d.lx * c - d.ly * s;
            wy[k] = g.cy + d.lx * s + d.ly * c;
            wa[k] = d.anchor ? 1 : 0;
            k++;
          }
        }

        ctx.clearRect(0, 0, w, h);

        // 2. Silhouette edges — explicit, brighter, breathing pulse on
        //    anchor-to-anchor (tooth-tip) edges so the outline feels alive.
        ctx.lineWidth = 1;
        for (let gi = 0; gi < gears.length; gi++) {
          const g = gears[gi];
          const off = g.offset;
          for (let ei = 0; ei < g.edges.length; ei++) {
            const a = g.edges[ei][0] + off;
            const b = g.edges[ei][1] + off;
            const ax = wx[a], ay = wy[a];
            const bx = wx[b], by = wy[b];
            const bothAnchor = wa[a] && wa[b];
            const alpha = bothAnchor ? (0.55 + 0.22 * breath) : 0.36;
            ctx.strokeStyle = 'rgba(250,250,247,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(cx + ax * r, cy + ay * r);
            ctx.lineTo(cx + bx * r, cy + by * r);
            ctx.stroke();
          }
        }

        // 3. Distance-based connections — same logic as the homepage
        //    particle field. Picks up interior-scatter spokes and bridges
        //    teeth at the contact point between the two gears.
        for (let i = 0; i < totalDots; i++) {
          const ax = wx[i], ay = wy[i], aa = wa[i];
          for (let j = i + 1; j < totalDots; j++) {
            const dx = ax - wx[j], dy = ay - wy[j];
            const distSq = dx * dx + dy * dy;
            if (distSq > CONN_DIST_SQ) continue;
            const t = 1 - Math.sqrt(distSq) / CONN_DIST;
            // Softer alpha than silhouette edges — keeps the network feel
            // without competing with the explicit outline.
            const bothAnchor = aa && wa[j];
            const baseA = bothAnchor ? 0.22 : 0.16;
            const alpha = baseA * t;
            ctx.strokeStyle = 'rgba(250,250,247,' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.moveTo(cx + ax * r, cy + ay * r);
            ctx.lineTo(cx + wx[j] * r, cy + wy[j] * r);
            ctx.stroke();
          }
        }

        // 4. Dots on top of the network — tooth-tip anchors brighter + pulsing.
        for (let i = 0; i < totalDots; i++) {
          let alpha, radius;
          if (wa[i]) {
            alpha = 0.80 + 0.20 * breath;
            radius = 1.55 + 0.25 * breath;
          } else {
            alpha = 0.50;
            radius = 1.15;
          }
          ctx.fillStyle = 'rgba(250,250,247,' + alpha.toFixed(3) + ')';
          ctx.beginPath();
          ctx.arc(cx + wx[i] * r, cy + wy[i] * r, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      function tick(t) {
        const dt = Math.min(64, t - lastT);
        lastT = t;
        if (visible) {
          pulse += dt * 0.0025;
          if (pulse > Math.PI * 200) pulse -= Math.PI * 200;
          const spin = hovering ? HOVER_SPIN : BASE_SPIN;
          for (let gi = 0; gi < gears.length; gi++) {
            gears[gi].phase += dt * spin * gears[gi].omega;
            if (gears[gi].phase >  Math.PI * 2) gears[gi].phase -= Math.PI * 2;
            if (gears[gi].phase < -Math.PI * 2) gears[gi].phase += Math.PI * 2;
          }
          draw();
        }
        requestAnimationFrame(tick);
      }

      resize();
      draw();
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => { resize(); draw(); }, 120);
      });

      const io = new IntersectionObserver((entries) => {
        for (const e of entries) visible = e.isIntersecting;
      }, { threshold: 0 });
      io.observe(canvas);

      if (!reduced) {
        const fig = canvas.closest('.head-figure-gear') || canvas;
        fig.addEventListener('mouseenter', () => { hovering = true; });
        fig.addEventListener('mouseleave', () => { hovering = false; });
        fig.addEventListener('touchstart', () => {
          hovering = true;
          clearTimeout(fig._gearStop);
          fig._gearStop = setTimeout(() => { hovering = false; }, 4000);
        }, { passive: true });
      }

      requestAnimationFrame(tick);
    })();

    // ====================================================================
    // FOUR PHASES — single morphing card.
    // While the tall .phases-scroll track is in view, the inner card is
    // pinned (CSS sticky). This controller maps scroll progress to the
    // active phase, crossfading the card content and updating the counter
    // and progress dashes. Dashes are click-to-jump. Disabled on mobile,
    // where CSS shows every phase stacked.
    // ====================================================================
    (function initPhasesScroll() {
      const section = document.querySelector('.phases-scroll');
      if (!section) return;

      const panels     = Array.from(section.querySelectorAll('.phase-panel'));
      const dashes     = Array.from(section.querySelectorAll('.phases-dash'));
      const counterNum = section.querySelector('.phases-counter-num');
      const fill       = section.querySelector('.phases-progress-fill');
      const count      = panels.length;
      if (!count) return;

      const mobileMq = window.matchMedia('(max-width: 768px)');
      let currentIndex = -1;
      let ticking = false;

      const apply = () => {
        ticking = false;
        if (mobileMq.matches) return; // mobile shows all phases stacked

        const rect = section.getBoundingClientRect();
        const pinned = section.offsetHeight - window.innerHeight;
        if (pinned <= 0) return;

        // Scroll progress 0 → 1 across the pinned distance
        const progress = Math.max(0, Math.min(1, -rect.top / pinned));
        if (fill) fill.style.width = (progress * 100).toFixed(1) + '%';

        // Map progress to a phase index
        let index = Math.floor(progress * count);
        if (index >= count) index = count - 1;
        if (index < 0) index = 0;

        if (index !== currentIndex) {
          currentIndex = index;
          panels.forEach((p, i) => p.classList.toggle('is-active', i === index));
          dashes.forEach((d, i) => {
            d.classList.toggle('is-active', i === index);
            d.classList.toggle('is-done', i < index);
          });
          if (counterNum) {
            counterNum.textContent = String(index + 1).padStart(2, '0');
          }
        }
      };

      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(apply);
        }
      };

      // Dash click → smooth-scroll so the chosen phase lands centered
      dashes.forEach((dash, i) => {
        dash.addEventListener('click', () => {
          if (mobileMq.matches) return;
          const pinned = section.offsetHeight - window.innerHeight;
          const targetProgress = (i + 0.5) / count;
          window.scrollTo({
            top: section.offsetTop + targetProgress * pinned,
            behavior: 'smooth'
          });
        });
      });

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', () => { currentIndex = -1; apply(); });
      apply();
    })();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSite);
  else initSite();
})();
