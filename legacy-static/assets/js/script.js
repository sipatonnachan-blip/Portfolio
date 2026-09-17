'use strict';

// Page Navigation System
document.addEventListener('DOMContentLoaded', () => {
  const navigationLinks = document.querySelectorAll('[data-nav-link]');
  const pages = document.querySelectorAll('[data-page]');

  // Map button text to page names
  const pageMap = {
    'home': 'home',
    'tech stack': 'tech stack',
    'projects': 'projects',
    'about': 'about',
    'experience': 'experience',
    'contact': 'contact',
    'view my work': 'projects'
  };

  function getTarget(link) {
    if (link.dataset.pageTarget) {
      return link.dataset.pageTarget.toLowerCase();
    }
    const text = link.textContent.trim().toLowerCase();
    return pageMap[text] || text;
  }

  function navigateTo(pageName) {
    // Hide all pages
    pages.forEach(page => page.classList.remove('active'));

    // Remove active from all nav links in sidebar
    const sidebarLinks = document.querySelectorAll('.nav-menu-link[data-nav-link]');
    sidebarLinks.forEach(link => link.classList.remove('active'));

    // Show target page
    pages.forEach(page => {
      if (page.dataset.page === pageName) {
        page.classList.add('active');
      }
    });

    // Highlight matching sidebar nav link
    sidebarLinks.forEach(link => {
      if (getTarget(link) === pageName) {
        link.classList.add('active');
      }
    });

    // Scroll main content to top
    const mainContent = document.querySelector('.main-content-redesign');
    if (mainContent) mainContent.scrollTop = 0;
    window.scrollTo(0, 0);
  }

  // Attach click handlers to all nav links
  navigationLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = getTarget(link);
      navigateTo(targetPage);
    });
  });

  // Eye Comfort / Theme Toggle
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle ? themeToggle.querySelector('.theme-icon') : null;
  const themeLabel = themeToggle ? themeToggle.querySelector('.theme-label') : null;

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (themeIcon) {
        if (themeIcon.tagName.toLowerCase() === 'ion-icon') {
          themeIcon.setAttribute('name', 'sunny-outline');
        } else {
          themeIcon.textContent = '☀️';
        }
      }
      if (themeLabel) themeLabel.textContent = 'Light Mode';
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (themeIcon) {
        if (themeIcon.tagName.toLowerCase() === 'ion-icon') {
          themeIcon.setAttribute('name', 'moon-outline');
        } else {
          themeIcon.textContent = '🌙';
        }
      }
      if (themeLabel) themeLabel.textContent = 'Eye Comfort';
    }
    localStorage.setItem('portfolio-theme', theme);
  }

  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      applyTheme(isDark ? 'light' : 'dark');
    });
  }
});