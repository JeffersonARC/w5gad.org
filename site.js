const button = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
if (button && nav) {
  button.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}
