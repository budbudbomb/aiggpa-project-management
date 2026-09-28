// AIGGPA Project Management - Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('usernameInput');
  const passwordInput = document.getElementById('passwordInput');
  const togglePasswordBtn = document.getElementById('togglePasswordBtn');
  const toggleEyeIcon = document.getElementById('toggleEyeIcon');
  const demoRoleBtns = document.querySelectorAll('.demo-role-btn');
  const btnQuickDashboard = document.getElementById('btnQuickDashboard');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  const typewriterText = document.getElementById('typewriterText');

  // Typewriter carousel effect matching reference Login.tsx
  const CAROUSEL_ITEMS = [
    'Project Intelligence',
    'Secure Project Governance',
    'Smart Survey Studio',
    'Field Investigator Operations'
  ];

  let carouselIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeStep() {
    const currentText = CAROUSEL_ITEMS[carouselIndex];
    const speed = isDeleting ? 35 : 70;

    if (!isDeleting) {
      charIndex++;
      const words = currentText.slice(0, charIndex).split(' ');
      if (typewriterText) {
        typewriterText.innerHTML = words.map((w, i) => 
          `<span class="${i === 1 ? 'typewriter-word-black' : ''}">${w} </span>`
        ).join('');
      }

      if (charIndex >= currentText.length) {
        isDeleting = true;
        setTimeout(typeStep, 1800);
        return;
      }
    } else {
      charIndex--;
      const words = currentText.slice(0, charIndex).split(' ');
      if (typewriterText) {
        typewriterText.innerHTML = words.map((w, i) => 
          `<span class="${i === 1 ? 'typewriter-word-black' : ''}">${w} </span>`
        ).join('');
      }

      if (charIndex <= 0) {
        isDeleting = false;
        carouselIndex = (carouselIndex + 1) % CAROUSEL_ITEMS.length;
      }
    }

    setTimeout(typeStep, speed);
  }

  typeStep();

  // Password visibility toggle
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener('click', () => {
      const isPass = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPass ? 'text' : 'password');
      if (toggleEyeIcon) {
        toggleEyeIcon.className = isPass ? 'pi pi-eye-slash' : 'pi pi-eye';
      }
    });
  }

  // Demo role switcher
  demoRoleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      demoRoleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const user = btn.getAttribute('data-user');
      const pass = btn.getAttribute('data-pass');
      usernameInput.value = user;
      passwordInput.value = pass;
    });
  });

  // Handle Login submit
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    let roleTitle = 'Project Lead (Center)';
    let roleKey = 'project_lead';

    if (username.toLowerCase().includes('head')) {
      roleTitle = 'Center Head';
      roleKey = 'center_head';
    } else if (username.toLowerCase().includes('finance')) {
      roleTitle = 'Senior Finance Officer';
      roleKey = 'finance_dept';
    }

    sessionStorage.setItem('aiggpa_user_name', username || 'AIGGPA User');
    sessionStorage.setItem('aiggpa_user_role', roleTitle);
    sessionStorage.setItem('aiggpa_role_key', roleKey);

    btnSubmitLogin.innerHTML = '<span>Verifying Credentials...</span> <i class="pi pi-spin pi-spinner"></i>';
    btnSubmitLogin.style.opacity = '0.9';

    setTimeout(() => {
      window.location.href = 'create-project.html';
    }, 500);
  });

  if (btnQuickDashboard) {
    btnQuickDashboard.addEventListener('click', () => {
      sessionStorage.setItem('aiggpa_user_name', 'Center Head');
      sessionStorage.setItem('aiggpa_user_role', 'Center Head & Director');
      sessionStorage.setItem('aiggpa_role_key', 'center_head');
      window.location.href = 'create-project.html';
    });
  }
});
