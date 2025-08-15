// Animation on scroll functionality
const animateOnScroll = () => {
  const elements = document.querySelectorAll('.reveal');
  
  elements.forEach(element => {
    const elementPosition = element.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;
    
    if(elementPosition < screenPosition) {
      element.classList.add('active');
    }
  });
};

// Initialize animations
window.addEventListener('load', () => {
  animateOnScroll();
});

// Re-run on scroll
window.addEventListener('scroll', animateOnScroll);
