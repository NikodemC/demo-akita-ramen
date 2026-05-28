gsap.registerPlugin(ScrollTrigger);

    // Footer year
    document.getElementById('footer-year').textContent = new Date().getFullYear();

    // Navbar scroll
    const navbar = document.getElementById('navbar');
    ScrollTrigger.create({
      start: 80,
      onEnter: () => navbar.classList.add('scrolled'),
      onLeaveBack: () => navbar.classList.remove('scrolled')
    });

    // Hero parallax
    gsap.to('.hero-bg', {
      yPercent: 30,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });

    // Hero entrance animation (tylko elementy ktore istnieja na danej stronie)
    const heroTl = gsap.timeline({ delay: 0.3 });
    function heroFrom(sel, vars, pos) {
      if (document.querySelector(sel)) heroTl.from(sel, vars, pos);
    }
    heroFrom('#heroBadge', { y: 30, opacity: 0, duration: 0.6, ease: 'power2.out' });
    heroFrom('#line1', { y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2');
    heroFrom('#line2', { y: 80, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
    heroFrom('#heroSub', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    heroFrom('#heroPills', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    heroFrom('#heroCtas', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    heroFrom('#scrollHint', { opacity: 0, duration: 0.8 }, '-=0.2');

    // Generic scroll reveals
    document.querySelectorAll('[data-gsap="fade-up"]').forEach(function(el) {
      gsap.from(el, {
        y: 50, opacity: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    document.querySelectorAll('[data-gsap="slide-left"]').forEach(function(el) {
      gsap.from(el, {
        x: -60, opacity: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      });
    });

    document.querySelectorAll('[data-gsap="slide-right"]').forEach(function(el) {
      gsap.from(el, {
        x: 60, opacity: 0, duration: 0.9, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 80%', once: true }
      });
    });

    // Karty menu — bez animacji wejścia (zawsze widoczne; reveal psuł się przy przełączaniu zakładek)

    // Gallery stagger
    document.querySelectorAll('.gallery-item').forEach(function(el, i) {
      gsap.from(el, {
        scale: 0.92, opacity: 0, duration: 0.6, ease: 'power2.out', delay: i * 0.07,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Testimonial cards stagger
    document.querySelectorAll('.testimonial-card').forEach(function(el, i) {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.7, ease: 'power2.out', delay: i * 0.1,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      });
    });

    // Animated counters
    var counters = document.querySelectorAll('.stat-num');
    counters.forEach(function(el) {
      var target = parseFloat(el.dataset.target);
      var dec = parseInt(el.dataset.decimal);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: function() {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function() {
              el.textContent = this.targets()[0].val.toFixed(dec);
            }
          });
        }
      });
    });

    // Swiper — Menu
    var menuSwiper = new Swiper('#menuSwiper', {
      slidesPerView: 1.15,
      spaceBetween: 16,
      centeredSlides: false,
      pagination: { el: '.menu-pagination', clickable: true },
      breakpoints: {
        640: { slidesPerView: 2.1 }
      }
    });

    // Swiper — Testimonials
    var testimonialSwiper = new Swiper('#testimonialsSwiper', {
      slidesPerView: 1,
      spaceBetween: 24,
      autoplay: { delay: 5000, disableOnInteraction: false },
      pagination: { el: '.t-pagination', clickable: true },
      breakpoints: {
        768: { slidesPerView: 2, spaceBetween: 24 },
        1024: { slidesPerView: 3, spaceBetween: 28 }
      }
    });

    // Hamburger (mobile nav toggle — basic)
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function() {
        var isOpen = navLinks.style.display === 'flex';
        if (isOpen) {
          navLinks.style.display = 'none';
        } else {
          navLinks.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:100%;left:0;right:0;background:rgba(255,248,245,0.98);padding:1.5rem 2rem;gap:1.2rem;backdrop-filter:blur(16px);border-bottom:1px solid rgba(232,116,138,0.1);';
          navLinks.querySelectorAll('a').forEach(function(a) {
            a.style.color = 'var(--c-text)';
          });
        }
      });
      navLinks.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          if (window.matchMedia('(max-width: 1024px)').matches) {
            navLinks.style.display = 'none';
          }
        });
      });
      // na desktopie nigdy nie zostawiaj inline display:none po zmianie rozmiaru
      window.addEventListener('resize', function() {
        if (!window.matchMedia('(max-width: 1024px)').matches) navLinks.style.display = '';
      });
    }


/* ===== Logo swap dark/light wg stanu navbara ===== */
(function(){
  var logo = document.getElementById('navLogo');
  if(!logo) return;
  var nav = document.getElementById('navbar');
  function upd(){ logo.src = nav.classList.contains('scrolled') ? logo.dataset.dark : logo.dataset.light; }
  new MutationObserver(upd).observe(nav,{attributes:true,attributeFilter:['class']});
  upd();
})();

/* ===== Zakladki menu ===== */
document.querySelectorAll('.menu-tab').forEach(function(tab){
  tab.addEventListener('click',function(){
    document.querySelectorAll('.menu-tab').forEach(function(t){t.classList.remove('active');});
    document.querySelectorAll('.menu-panel').forEach(function(p){p.classList.remove('active');});
    tab.classList.add('active');
    var el = document.getElementById(tab.dataset.target);
    if(el) el.classList.add('active');
  });
});

/* ===== Karuzela historii ===== */
if(document.getElementById('historySwiper')){
  new Swiper('#historySwiper',{
    slidesPerView:1.1, spaceBetween:20,
    pagination:{ el:'.history-pagination', clickable:true },
    breakpoints:{ 640:{slidesPerView:2.2}, 1024:{slidesPerView:3} }
  });
}
