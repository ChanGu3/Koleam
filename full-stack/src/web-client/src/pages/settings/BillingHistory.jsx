import React, { useState, useEffect } from "react";
import NavbarOS from "../../components/NavbarOS";
import FooterOS from "../../components/FooterOS";
import SettingsSidebar from "../../components/SettingsSidebar";
import "./BillingHistory.css";

function BillingHistory() {
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Settings - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");

    const fetchBillingHistory = async () => {
      try {
        const response = await fetch("/api/billing/all", {
          method: "GET",
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setBillingHistory(data.billingHistory || []);
        } else {
          setError("Failed to load billing history");
        }
      } catch (err) {
        setError("Error loading billing history");
      } finally {
        setLoading(false);
      }
    };

    fetchBillingHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const formatAmount = (amount) => {
    return `$${amount}`;
  };

  if (loading) {
    return (
      <>
        <NavbarOS />
        <main className="manage-membership-layout">
          <aside className="settings-sidebar-fixed">
            <SettingsSidebar />
          </aside>
          <div className="manage-membership-main-centered">
            <h1 className="billing-history-title">Billing History</h1>
            <div className="loading-message">Loading billing history...</div>
          </div>
        </main>
        <FooterOS />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavbarOS />
        <main className="manage-membership-layout">
          <aside className="settings-sidebar-fixed">
            <SettingsSidebar />
          </aside>
          <div className="manage-membership-main-centered">
            <h1 className="billing-history-title">Billing History</h1>
            <div className="error-message">{error}</div>
          </div>
        </main>
        <FooterOS />
      </>
    );
  }

  return (
    <>
      <NavbarOS />
      <main className="manage-membership-layout">
        <aside className="settings-sidebar-fixed">
          <SettingsSidebar />
        </aside>
        <div className="manage-membership-main-centered">
          <h1 className="billing-history-title">Billing History</h1>
          <section className="billing-history-section">
            <h2>Recent Billing History</h2>
            {billingHistory.length > 0 ? (
              <table className="billing-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Payment Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((billing, index) => (
                    <tr key={index}>
                      <td>{formatDate(billing.billing_date)}</td>
                      <td>{billing.description}</td>
                      <td>{billing.payment_method}</td>
                      <td>{formatAmount(billing.amount)}</td>
                      <td className={billing.status.toLowerCase()}>
                        {billing.status}
                      </td>
                      <td>
                        <a className="download-link" href="#">
                          Download
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-billing-history">
                <p>No billing history available</p>
              </div>
            )}
            <div className="billing-note">
              Payment history is only available for the past year.
            </div>
          </section>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default BillingHistory;
