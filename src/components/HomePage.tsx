import { Link } from 'react-router-dom';
import './HomePage.css';

const highlights = [
  {
    title: 'Unified Care Journey',
    description:
      'Manage registrations, consultations, inventory, and daily clinic operations from one place.',
  },
  {
    title: 'Role-Based Experience',
    description:
      'Separate, focused experiences for doctors, pet owners, and shop teams to reduce confusion.',
  },
  {
    title: 'Built For Daily Use',
    description:
      'Fast workflows for appointments, prescriptions, holidays, wages, and expense reporting.',
  },
];

function HomePage() {
  return (
    <main className="home-page">
      <div className="home-bg home-bg-left" aria-hidden="true" />
      <div className="home-bg home-bg-right" aria-hidden="true" />

      <section className="hero-card">
        <p className="hero-kicker">PETCARE PLATFORM</p>
        <h1>Run your veterinary practice with confidence.</h1>
        <p className="hero-subtitle">
          A clean front desk experience for onboarding, plus a complete doctor
          dashboard for daily clinic operations.
        </p>

        <div className="hero-actions">
          <Link className="btn btn-primary" to="/entry">
            Get Started
          </Link>
        </div>
      </section>

      <section className="highlight-grid" aria-label="Platform highlights">
        {highlights.map(item => (
          <article className="highlight-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default HomePage;
