import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import loginCss from '../styles/login.css?inline';
import { usePageStyles } from '../lib/usePageStyles';

const CAROUSEL_ITEMS = [
  'Project Intelligence',
  'Secure Project Governance',
  'Smart Survey Studio',
  'Field Investigator Operations',
];

const DEMO_ROLES = [
  { role: 'center_head', user: 'center_head', pass: 'Head@2026', label: 'Center Head' },
  { role: 'finance_dept', user: 'finance_officer', pass: 'Finance@123', label: 'Finance Dept' },
  { role: 'project_lead', user: 'aiggpa', pass: 'Admin@123', label: 'Project Lead' },
];

export default function LoginPage(): React.ReactElement {
  usePageStyles(loginCss);
  const navigate = useNavigate();

  const [username, setUsername] = useState('aiggpa');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRole, setActiveRole] = useState('project_lead');
  const [submitting, setSubmitting] = useState(false);

  const typewriterTextRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = 'AIGGPA - Empowering Project Governance';
  }, []);

  // Typewriter carousel effect matching legacy login.js
  useEffect(() => {
    let carouselIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let timer: number | undefined;

    function renderText(text: string) {
      const words = text.split(' ');
      // second word highlighted (legacy logic: i === 1)
      if (typewriterTextRef.current) {
        typewriterTextRef.current.innerHTML = words
          .map((w, i) => `<span class="${i === 1 ? 'typewriter-word-black' : ''}">${w} </span>`)
          .join('');
      }
    }

    function typeStep() {
      const currentText = CAROUSEL_ITEMS[carouselIndex];
      const speed = isDeleting ? 35 : 70;

      if (!isDeleting) {
        charIndex++;
        renderText(currentText.slice(0, charIndex));
        if (charIndex >= currentText.length) {
          isDeleting = true;
          timer = window.setTimeout(typeStep, 1800);
          return;
        }
      } else {
        charIndex--;
        renderText(currentText.slice(0, charIndex));
        if (charIndex <= 0) {
          isDeleting = false;
          carouselIndex = (carouselIndex + 1) % CAROUSEL_ITEMS.length;
        }
      }
      timer = window.setTimeout(typeStep, speed);
    }

    typeStep();
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleDemoRole(role: { user: string; pass: string; role: string }) {
    setActiveRole(role.role);
    setUsername(role.user);
    setPassword(role.pass);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const name = username.trim();
    let roleTitle = 'Project Lead (Center)';
    let roleKey = 'project_lead';

    if (name.toLowerCase().includes('head')) {
      roleTitle = 'Center Head';
      roleKey = 'center_head';
    } else if (name.toLowerCase().includes('finance')) {
      roleTitle = 'Senior Finance Officer';
      roleKey = 'finance_dept';
    }

    sessionStorage.setItem('aiggpa_user_name', name || 'AIGGPA User');
    sessionStorage.setItem('aiggpa_user_role', roleTitle);
    sessionStorage.setItem('aiggpa_role_key', roleKey);

    setSubmitting(true);
    window.setTimeout(() => navigate('/create-project'), 500);
  }

  function handleQuickDashboard() {
    sessionStorage.setItem('aiggpa_user_name', 'Center Head');
    sessionStorage.setItem('aiggpa_user_role', 'Center Head & Director');
    sessionStorage.setItem('aiggpa_role_key', 'center_head');
    navigate('/create-project');
  }

  return (
    <main className="auth-page">
      {/* LEFT HERO SECTION */}
      <section className="auth-hero-section">
        <div className="auth-hero-content">
          <div className="aiggpa-logo-container">
            <div className="aiggpa-logo-row">
              <div className="aiggpa-brand-icon-login">
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 7L29 12V21C29 26.5 25.2 31.6 20 33C14.8 31.6 11 26.5 11 21V12L20 7Z"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="rgba(255,255,255,0.15)"
                  />
                  <path
                    d="M16 20L19 23L24 17"
                    stroke="#38bdf8"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="aiggpa-logo-text">AIGGPA</div>
                <span className="aiggpa-logo-sub">EMPOWERING PROJECT & FIELD GOVERNANCE</span>
              </div>
            </div>
          </div>

          <div className="auth-hero-heading-block">
            <h1 className="auth-hero-title">
              Integrating <span>Project & Field Management</span> Through Digital Excellence
            </h1>

            <p className="auth-hero-description">
              A unified governance platform enabling transparent project planning, team allocations,
              budget sanctions, on-ground field surveys, and real-time monitoring across centers.
            </p>
          </div>

          <div className="auth-platform-badges">
            <div className="auth-platform-badge">
              <i className="pi pi-shield" />
              <span>Secure</span>
            </div>
            <div className="auth-platform-badge">
              <i className="pi pi-verified" />
              <span>Transparent</span>
            </div>
            <div className="auth-platform-badge">
              <i className="pi pi-bolt" />
              <span>Efficient</span>
            </div>
            <div className="auth-platform-badge">
              <i className="pi pi-check-circle" />
              <span>Compliant</span>
            </div>
          </div>

          <div className="auth-feature-grid">
            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-folder-open" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Project Planning & Creation</h2>
                <p className="auth-feature-description">
                  Multi-stage project initiation with auto-duration & objectives
                </p>
              </div>
            </article>

            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-wallet" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Budget & Sanctions</h2>
                <p className="auth-feature-description">
                  Center Head & Finance approval workflows and head allocations
                </p>
              </div>
            </article>

            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-users" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Team & Role Allocation</h2>
                <p className="auth-feature-description">
                  Senior Advisors, Research Associates, Fellows & Field Investigators
                </p>
              </div>
            </article>

            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-list-check" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Field Task Operations</h2>
                <p className="auth-feature-description">
                  Standard research tasks, ground survey quotas and review meetings
                </p>
              </div>
            </article>

            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-file-edit" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Survey Studio & Media AI</h2>
                <p className="auth-feature-description">
                  Questionnaire builder with per-question voice, image & video
                </p>
              </div>
            </article>

            <article className="auth-feature-card">
              <div className="auth-feature-icon">
                <i className="pi pi-chart-pie" />
              </div>
              <div className="auth-feature-content">
                <h2 className="auth-feature-title">Real-time Monitoring & Reports</h2>
                <p className="auth-feature-description">
                  Live respondent tracking, geographic coverage and audit compliance
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* RIGHT LOGIN CARD */}
      <section className="auth-form-section">
        <div className="login-card-container">
          <div className="auth-card">
            <div className="login-heading">
              <h2>Login 👋</h2>
              <p>Sign in to continue to your account</p>
            </div>

            <div className="auth-title-separator">
              <span></span>
              <i></i>
              <span></span>
            </div>

            <div
              className="login-typewriter-highlight"
              id="typewriterText"
              ref={typewriterTextRef}
              dangerouslySetInnerHTML={{ __html: '<span>Project</span> <strong class="typewriter-word-black">Intelligence</strong>' }}
            />

            <div className="demo-roles-bar">
              {DEMO_ROLES.map((role) => (
                <button
                  key={role.role}
                  type="button"
                  className={`demo-role-btn${activeRole === role.role ? ' active' : ''}`}
                  data-role={role.role}
                  data-user={role.user}
                  data-pass={role.pass}
                  onClick={() => handleDemoRole(role)}
                >
                  {role.label}
                </button>
              ))}
            </div>

            <form id="loginForm" noValidate onSubmit={handleSubmit}>
              <div className="login-field">
                <div className="input-wrapper">
                  <i className="pi pi-user input-prefix-icon" />
                  <input
                    type="text"
                    id="usernameInput"
                    className="auth-input"
                    placeholder="User Name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="login-field">
                <div className="input-wrapper">
                  <i className="pi pi-lock input-prefix-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="passwordInput"
                    className="auth-input"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    id="togglePasswordBtn"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    <i className={showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'} id="toggleEyeIcon" />
                  </button>
                </div>
              </div>

              <div className="login-options-row">
                <label className="remember-checkbox-label">
                  <input type="checkbox" id="rememberMe" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" className="forgot-password-link">
                  Forgot Password?
                </a>
              </div>

              <button type="submit" className="btn-submit-login" id="btnSubmitLogin" disabled={submitting}>
                {submitting ? (
                  <>
                    <span>Verifying Credentials...</span> <i className="pi pi-spin pi-spinner" />
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="pi pi-arrow-right" />
                  </>
                )}
              </button>
            </form>

            <div className="login-card-divider">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn-direct-dashboard"
              id="btnQuickDashboard"
              onClick={handleQuickDashboard}
            >
              <i className="pi pi-id-card" />
              <span>⚡ Enter Directly to Dashboard</span>
            </button>
          </div>

          <img
            src="assets/lock.png"
            alt="Security Lock"
            className="auth-shield-lock"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </section>
    </main>
  );
}
