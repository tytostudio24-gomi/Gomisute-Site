document.addEventListener('DOMContentLoaded', () => {
  const scrollElements = document.querySelectorAll('.reveal');

  const elementInView = (el, dividend = 1) => {
    const elementTop = el.getBoundingClientRect().top;
    return (
      elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
    );
  };

  const displayScrollElement = (element) => {
    element.classList.add('active');
  };

  const handleScrollAnimation = () => {
    scrollElements.forEach((el) => {
      // Reveal the element when it is 1.15th the way into the viewport
      if (elementInView(el, 1.15)) {
        displayScrollElement(el);
      }
    });
  };

  // Trigger once on load
  handleScrollAnimation();

  // Hero section 3 second animation
  const heroAnimation = document.getElementById('hero-animation');
  if (heroAnimation) {
    setTimeout(() => {
      heroAnimation.classList.add('animated');
    }, 3000);
  }

  // and then on scroll
  window.addEventListener('scroll', () => {
    handleScrollAnimation();
  });

  // Mobile Menu Toggle
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      // Prevent body scrolling when menu is open
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }
  // Q&A Accordion
  const qaQuestions = document.querySelectorAll('.qa-question');
  qaQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const item = question.closest('.qa-item');
      const answer = item.querySelector('.qa-answer');
      const isOpen = item.classList.contains('active');
      
      // Close all other open items
      document.querySelectorAll('.qa-item.active').forEach(activeItem => {
        if (activeItem !== item) {
          activeItem.classList.remove('active');
          activeItem.querySelector('.qa-answer').style.maxHeight = null;
        }
      });
      
      // Toggle current item
      if (isOpen) {
        item.classList.remove('active');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });
});
