import { Ban, ToggleLeft, ToggleRight, UserCog } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { PartnerDoctor } from './PartnerDoctors';
import './PartnerStatusManager.css';

const LS_PARTNERS = 'vc_partner_doctors';

const loadPartners = (): PartnerDoctor[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_PARTNERS) ?? '[]') as
      | PartnerDoctor[]
      | undefined;
    return (parsed ?? []).map(partner => ({
      ...partner,
      isActive: partner.isActive !== false,
    }));
  } catch {
    return [];
  }
};

function PartnerStatusManager() {
  const [partners, setPartners] = useState<PartnerDoctor[]>(loadPartners);
  const activeCount = useMemo(
    () => partners.filter(partner => partner.isActive).length,
    [partners],
  );

  const persist = (next: PartnerDoctor[]) => {
    setPartners(next);
    localStorage.setItem(LS_PARTNERS, JSON.stringify(next));
  };

  const toggle = (partnerId: string) => {
    const next = partners.map(partner =>
      partner.id === partnerId
        ? {
            ...partner,
            isActive: !partner.isActive,
          }
        : partner,
    );
    persist(next);
  };

  return (
    <div className="partner-status-page">
      <header className="dash-card partner-status-hero">
        <h1 className="dash-page-title">
          <UserCog size={22} /> Manage Partner Doctor Status
        </h1>
        <p>
          Parent doctor controls partner account ownership. Deactivated partners
          cannot login or access partner dashboards.
        </p>
      </header>

      <section className="partner-status-stats">
        <article className="dash-card">
          <strong>{partners.length}</strong>
          <span>Total Partners</span>
        </article>
        <article className="dash-card">
          <strong>{activeCount}</strong>
          <span>Active</span>
        </article>
        <article className="dash-card">
          <strong>{partners.length - activeCount}</strong>
          <span>Inactive</span>
        </article>
      </section>

      <section className="dash-card partner-status-list-wrap">
        <h2>Doctor Status Controls</h2>
        {partners.length === 0 ? (
          <p className="partner-status-empty">No partner doctors available.</p>
        ) : (
          <div className="partner-status-list">
            {partners.map(partner => (
              <article key={partner.id} className="partner-status-card">
                <div>
                  <h3>Dr. {partner.name}</h3>
                  <p>
                    {partner.mobileNumber} • {partner.specialization}
                  </p>
                  <span
                    className={`partner-status-pill ${partner.isActive ? 'active' : 'inactive'}`}
                  >
                    {partner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button
                  type="button"
                  className={`partner-status-toggle ${partner.isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggle(partner.id)}
                >
                  {partner.isActive ? (
                    <>
                      <ToggleRight size={18} /> Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={18} /> Activate
                    </>
                  )}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="dash-card partner-status-note">
        <p>
          <Ban size={16} /> Inactive partners are blocked from partner login,
          appointments, prescriptions, and vaccinations until reactivated by
          parent doctor.
        </p>
      </section>
    </div>
  );
}

export default PartnerStatusManager;
