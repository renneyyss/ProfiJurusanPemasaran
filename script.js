
    const nav = document.querySelector('.site-nav');
    const toggle = document.querySelector('.menu-toggle');
    const links = document.querySelector('.nav-links');
    const back = document.querySelector('.back-top');
    const progress = document.querySelector('.scroll-progress span');
    const navLinks = [...links.querySelectorAll('a[href^="#"]')];
    const navSections = navLinks.map(link => ({link, section: document.querySelector(link.getAttribute('href'))})).filter(item => item.section);

    function setMenu(open) {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      toggle.textContent = open ? '×' : '☰';
    }
    function updateScrollState() {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const percent = maxScroll > 0 ? Math.min(100, (window.scrollY / maxScroll) * 100) : 0;
      progress.style.width = `${percent}%`;
      nav.classList.toggle('scrolled', window.scrollY > 30);
      back.classList.toggle('visible', window.scrollY > 500);
      let current = navSections[0];
      for (const item of navSections) {
        if (item.section.getBoundingClientRect().top <= 150) current = item;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4) current = navSections[navSections.length - 1] || current;
      navSections.forEach(({link}) => {
        const active = current && link === current.link;
        link.classList.toggle('active', Boolean(active));
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    window.addEventListener('scroll', updateScrollState, {passive: true});
    window.addEventListener('resize', updateScrollState, {passive: true});
    updateScrollState();

    toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
    navLinks.forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', event => {
      if (links.classList.contains('open') && !event.target.closest('.site-nav')) setMenu(false);
    });
    back.addEventListener('click', () => window.scrollTo({top: 0, behavior: 'smooth'}));

    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
        entry.target.classList.toggle('shown', entry.isIntersecting);
      }), {threshold: 0, rootMargin: '0px 0px -8% 0px'});
      revealItems.forEach(element => revealObserver.observe(element));
    } else {
      revealItems.forEach(element => element.classList.add('shown'));
    }

    const galleryItems = [...document.querySelectorAll('.gallery-item')];
    const lightbox = document.querySelector('.lightbox');
    const lightImg = lightbox.querySelector('img');
    const lightCaption = lightbox.querySelector('p');
    const lightCount = lightbox.querySelector('.lightbox-count');
    const lightClose = lightbox.querySelector('.lightbox-close');
    let currentPhoto = 0;
    let lastTrigger = null;
    function showPhoto(index) {
      currentPhoto = (index + galleryItems.length) % galleryItems.length;
      const item = galleryItems[currentPhoto];
      lightImg.src = item.dataset.full;
      lightImg.alt = item.querySelector('img').alt;
      lightImg.classList.toggle('rotated', item.classList.contains('rotated'));
      lightCaption.textContent = item.dataset.caption;
      lightCount.textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${String(galleryItems.length).padStart(2, '0')}`;
    }
    function openLightbox(index, trigger) {
      lastTrigger = trigger;
      showPhoto(index);
      lightbox.classList.add('open');
      document.body.classList.add('locked');
      lightClose.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove('open');
      lightImg.classList.remove('rotated');
      document.body.classList.remove('locked');
      if (lastTrigger) lastTrigger.focus();
    }
    galleryItems.forEach((item, index) => item.addEventListener('click', () => openLightbox(index, item)));
    lightClose.addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showPhoto(currentPhoto - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => showPhoto(currentPhoto + 1));
    lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (lightbox.classList.contains('open')) closeLightbox();
        else if (links.classList.contains('open')) setMenu(false);
      }
      if (lightbox.classList.contains('open') && event.key === 'ArrowRight') showPhoto(currentPhoto + 1);
      if (lightbox.classList.contains('open') && event.key === 'ArrowLeft') showPhoto(currentPhoto - 1);
      if (lightbox.classList.contains('open') && event.key === 'Tab') {
        const focusables = [...lightbox.querySelectorAll('button')];
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });

    function animateCount(element) {
      const target = Number(element.dataset.count);
      const start = performance.now();
      const duration = 850;
      const tick = now => {
        const progressValue = Math.min((now - start) / duration, 1);
        element.textContent = String(Math.floor(target * (1 - Math.pow(1 - progressValue, 3))));
        if (progressValue < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    document.querySelectorAll('[data-count]').forEach(element => {
      if (!('IntersectionObserver' in window)) animateCount(element);
      else {
        const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCount(element);
            counterObserver.disconnect();
          }
        }), {threshold: .7});
        counterObserver.observe(element);
      }
    });
    document.getElementById('year').textContent = new Date().getFullYear();
  