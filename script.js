const themeToggle = document.getElementById('theme-toggle');
const themeOverlay = document.getElementById('theme-overlay');
const scrollTopButton = document.getElementById('scroll-top');

let activeThemeReveal = null;

function updateThemeToggle(theme) {
  if (!themeToggle) return;

  themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  const icon = themeToggle.querySelector('.theme-toggle__icon');
  const label = themeToggle.querySelector('.theme-toggle__label');

  if (icon) {
    icon.textContent = theme === 'light' ? '☀️' : '🌙';
  }

  if (label) {
    label.textContent = theme === 'light' ? 'Svetli način' : 'Temni način';
  }
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeToggle(theme);
}

function getRevealOrigin(toggleRect) {
  const centerX = toggleRect.left + toggleRect.width / 2;
  const centerY = toggleRect.bottom + 6;

  return { centerX, centerY };
}

function getRevealRadius(centerX, centerY) {
  const corners = [
    [0, 0],
    [window.innerWidth, 0],
    [0, window.innerHeight],
    [window.innerWidth, window.innerHeight],
  ];

  return Math.max(...corners.map(([x, y]) => Math.hypot(x - centerX, y - centerY))) + 24;
}

function resetThemeOverlay() {
  if (!themeOverlay) return;

  themeOverlay.getAnimations().forEach((animation) => animation.cancel());
  themeOverlay.classList.remove('is-revealing');
  themeOverlay.removeAttribute('data-theme');
  themeOverlay.style.cssText = '';
}

function setThemeTransitionState(isActive) {
  document.documentElement.classList.toggle('theme-transitioning', isActive);

  if (themeToggle) {
    themeToggle.disabled = isActive;
  }
}

function animateThemeSwitch(nextTheme) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!themeOverlay || !themeToggle || prefersReducedMotion) {
    applyTheme(nextTheme);
    return;
  }

  const currentTheme = document.documentElement.getAttribute('data-theme') || initialTheme;

  resetThemeOverlay();

  const toggleRect = themeToggle.getBoundingClientRect();
  const { centerX, centerY } = getRevealOrigin(toggleRect);
  const maxRadius = getRevealRadius(centerX, centerY);

  themeOverlay.setAttribute('data-theme', currentTheme);
  themeOverlay.style.setProperty('--theme-reveal-x', `${centerX}px`);
  themeOverlay.style.setProperty('--theme-reveal-y', `${centerY}px`);
  themeOverlay.style.setProperty('--theme-reveal-radius', '0px');
  themeOverlay.style.opacity = '1';
  themeOverlay.style.visibility = 'visible';
  themeOverlay.classList.add('is-revealing');

  applyTheme(nextTheme);
  setThemeTransitionState(true);
  void themeOverlay.offsetWidth;

  const revealAnimation = themeOverlay.animate(
    [
      { '--theme-reveal-radius': '0px' },
      { '--theme-reveal-radius': `${maxRadius}px` },
    ],
    {
      duration: 720,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }
  );

  activeThemeReveal = revealAnimation;

  const finishReveal = () => {
    if (activeThemeReveal !== revealAnimation) return;
    resetThemeOverlay();
    setThemeTransitionState(false);
    activeThemeReveal = null;
  };

  revealAnimation.finished.then(finishReveal).catch(finishReveal);
}

function toggleScrollTopButton() {
  if (!scrollTopButton) return;

  if (window.scrollY > 360) {
    scrollTopButton.classList.add('is-visible');
  } else {
    scrollTopButton.classList.remove('is-visible');
  }
}

window.addEventListener('scroll', toggleScrollTopButton);
window.addEventListener('load', toggleScrollTopButton);

if (scrollTopButton) {
  scrollTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

function getPreferredTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

const storedTheme = localStorage.getItem('theme');
const initialTheme = storedTheme || getPreferredTheme();
applyTheme(initialTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || initialTheme;
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    animateThemeSwitch(nextTheme);
  });
}

const releaseDate = new Date('2026-09-01T00:00:00');
const countdown = document.getElementById('countdown');

if (countdown) {
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');
  let countdownTimer;

  function updateCountdown() {
    const now = new Date();
    const diff = releaseDate - now;

    if (diff <= 0) {
      countdown.innerHTML = '<p class="release-note">Izdaja je na voljo. Dostop do prenosa bo kmalu omogočen.</p>';
      clearInterval(countdownTimer);
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  countdownTimer = setInterval(updateCountdown, 1000);
}

const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach((item) => {
  const button = item.querySelector('.faq-question');
  const answer = item.querySelector('.faq-answer');

  if (!button || !answer) return;

  button.addEventListener('click', () => {
    const isOpen = item.classList.contains('is-open');

    faqItems.forEach((otherItem) => {
      otherItem.classList.remove('is-open');
      const otherButton = otherItem.querySelector('.faq-question');
      if (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
      }
    });

    if (!isOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const form = document.getElementById('application-form');
const formMessage = document.getElementById('form-message');

if (form && formMessage) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const firstName = form.querySelector('[name="firstName"]').value.trim();
    const lastName = form.querySelector('[name="lastName"]').value.trim();
    const reason = form.querySelector('[name="reason"]').value.trim();

    if (!firstName || !lastName || !reason) {
      formMessage.textContent = 'Prosim izpolni vsa polja pred pošiljanjem prošnje.';
      formMessage.className = 'form-message error';
      return;
    }

    formMessage.textContent = `Hvala, ${firstName} ${lastName}! Tvoja prošnja za testiranje je bila uspešno oddana.`;
    formMessage.className = 'form-message success';
    form.reset();
  });
}
