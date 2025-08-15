// Scroll-based navbar active link highlighting
window.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  const sections = Array.from(navLinks).map(link => {
    const id = link.getAttribute('href').replace('#', '');
    return document.getElementById(id);
  });

  function onScroll() {
    let scrollPos = window.scrollY || window.pageYOffset;
    let offset = 120; // adjust for fixed header
    let found = false;
    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section) {
        const top = section.offsetTop - offset;
        if (scrollPos >= top) {
          navLinks.forEach(link => link.classList.remove('active'));
          navLinks[i].classList.add('active');
          found = true;
          break;
        }
      }
    }
    // If not found (scrolled above first section), highlight first link
    if (!found) {
      navLinks.forEach(link => link.classList.remove('active'));
      navLinks[0].classList.add('active');
    }
  }

  window.addEventListener('scroll', onScroll);
  onScroll();
});
