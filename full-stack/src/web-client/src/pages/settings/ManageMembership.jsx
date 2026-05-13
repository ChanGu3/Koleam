import React from "react";
import NavbarOS from "../../components/NavbarOS";
import FooterOS from "../../components/FooterOS";
import SettingsSidebar from "../../components/SettingsSidebar";
import "./ManageMembership.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ManageMembership() {
  const [loading, setLoading] = useState(false);
  const [downgradeLoading, setDowngradeLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Settings - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");

    fetchPremiumStatus();
  }, []);

  const fetchPremiumStatus = async () => {
    try {
      const response = await fetch("/api/premium/status", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setIsPremium(data.isPremium);
        setPremiumData(data.premium);
      } else {
        console.error("Failed to fetch premium status");
      }
    } catch (error) {
      console.error("Error fetching premium status:", error);
    }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/premium/upgrade", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Premium upgrade successful!");
        await fetchPremiumStatus();
      } else {
        if (data.error === "No primary card found") {
          alert("Please add a payment method first to upgrade to Premium.");
          navigate("/settings/payment-info");
        } else {
          alert(data.error || "Upgrade failed");
        }
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your Premium membership? Your subscription will be cancelled at the end of your current billing period.",
      )
    ) {
      return;
    }

    setDowngradeLoading(true);
    try {
      const res = await fetch("/api/premium/downgrade", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(
          "Your Premium membership has been cancelled. You will have access to Premium features until the end of your current billing period.",
        );
        await fetchPremiumStatus();
      } else {
        alert(data.error || "Downgrade failed");
      }
    } catch (err) {
      alert("Network error. Please try again.");
    } finally {
      setDowngradeLoading(false);
    }
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <NavbarOS />
      <main className="manage-membership-layout">
        <aside className="settings-sidebar-fixed">
          <SettingsSidebar />
        </aside>
        <div className="manage-membership-main-centered">
          <h1 className="manage-membership-title">Manage Membership</h1>
          <section className="membership-current-section">
            <div className="membership-current-box">
              <div>
                <div className="current-label">Current Subscription</div>
                <div className="current-plan">
                  {isPremium ? "Premium Plan" : "Free Plan"}
                </div>
                <div className="current-desc">
                  {isPremium
                    ? "4K Ultra HD quality, Full library access, Ad-free experience"
                    : "HD quality, Limited content, With ads"}
                </div>
                {isPremium && premiumData && (
                  <div className="current-expiry">
                    Expires: {formatExpiryDate(premiumData.expDate)}
                  </div>
                )}
                <div className="current-note">
                  {isPremium
                    ? "You have access to all premium features"
                    : "Upgrade anytime to unlock premium features"}
                </div>
              </div>
              <div className="current-price">
                {isPremium ? "$9.99/month" : "Free"}
              </div>
            </div>
          </section>
          <section className="membership-plan-section">
            <div className="membership-plan-card">
              <div className="plan-title">Free</div>
              <div className="plan-price">$ 0</div>
              <ul>
                <li>HD quality (720p)</li>
                <li>1 device streaming</li>
                <li>With advertisements</li>
                <li>Limited anime library</li>
              </ul>
              {isPremium ? (
                <button
                  className="downgrade-btn"
                  onClick={handleDowngrade}
                  disabled={downgradeLoading}
                >
                  {downgradeLoading ? "Processing..." : "Downgrade"}
                </button>
              ) : (
                <button className="current-btn" disabled>
                  Current Plan
                </button>
              )}
            </div>
            <div className="membership-plan-card premium">
              <div className="plan-title">Premium</div>
              <div className="plan-price">$ 9.99</div>
              <ul>
                <li>4K Ultra HD quality</li>
                <li>4 devices streaming</li>
                <li>Full anime library access</li>
                <li>Ad-free experience</li>
              </ul>
              {isPremium ? (
                <button className="current-btn" disabled>
                  Current Plan
                </button>
              ) : (
                <button
                  className="upgrade-btn"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? "Upgrading..." : "Upgrade Now"}
                </button>
              )}
            </div>
          </section>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default ManageMembership;
