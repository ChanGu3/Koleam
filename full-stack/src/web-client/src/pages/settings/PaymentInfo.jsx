import React, { useState, useEffect } from "react";
import NavbarOS from "../../components/NavbarOS";
import FooterOS from "../../components/FooterOS";
import SettingsSidebar from "../../components/SettingsSidebar";
import { useNavigate } from "react-router-dom";
import "./PaymentInfo.css";
import "./PaymentInfoModal.css";

function PaymentInfo() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [billingHistory, setBillingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editCard, setEditCard] = useState(null);
  const [form, setForm] = useState({
    type: "",
    number: "",
    expiry: "",
    name: "",
    cvc: "",
  });
  const [errors, setErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    document.title = "Settings - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");

    fetchCards();
    fetchBillingHistory();
  }, []);

  useEffect(() => {
    validateForm();
  }, [form]);

  const validateForm = () => {
    const newErrors = {};

    // Card Type validation
    if (!form.type) {
      newErrors.type = "Please select a card type";
    }

    // Card Number validation - simplified to just 16 digits
    if (!form.number) {
      newErrors.number = "Card number is required";
    } else if (!/^\d{16}$/.test(form.number.replace(/\s/g, ""))) {
      newErrors.number = "Card number must be 16 digits";
    }

    // Expiry Date validation
    if (!form.expiry) {
      newErrors.expiry = "Expiry date is required";
    } else if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
      newErrors.expiry = "Use MM/YY format";
    } else {
      const [month, year] = form.expiry.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;

      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = "Invalid month";
      } else if (
        parseInt(year) < currentYear ||
        (parseInt(year) === currentYear && parseInt(month) < currentMonth)
      ) {
        newErrors.expiry = "Card has expired";
      }
    }

    // Name validation
    if (!form.name.trim()) {
      newErrors.name = "Name is required";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // CVC validation
    if (!form.cvc) {
      newErrors.cvc = "CVC is required";
    } else if (!/^\d{3,4}$/.test(form.cvc)) {
      newErrors.cvc = "CVC must be 3-4 digits";
    }

    setErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  };

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    // Limit to 16 digits
    const limited = v.substring(0, 16);
    // Add spaces every 4 digits
    const parts = [];

    for (let i = 0; i < limited.length; i += 4) {
      parts.push(limited.substring(i, i + 4));
    }

    return parts.join(" ");
  };

  const formatExpiry = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
  };

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/saved-cards", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCards(data.cards || []);
      } else {
        console.error("Failed to fetch saved cards");
      }
    } catch (error) {
      console.error("Error fetching saved cards:", error);
    }
  };

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
        console.error("Failed to fetch billing history");
      }
    } catch (error) {
      console.error("Error fetching billing history:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalType("add");
    setForm({ type: "", number: "", expiry: "", name: "", cvc: "" });
    setErrors({});
    setIsFormValid(false);
    setShowModal(true);
    setEditCard(null);
  };

  const openEditModal = (card) => {
    setModalType("edit");
    setForm({
      type: card.cardType,
      number: card.cardNumber,
      expiry: card.expiryDate,
      name: card.cardHolderName,
      cvc: "",
    });
    setErrors({});
    setIsFormValid(false);
    setEditCard(card);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditCard(null);
    setErrors({});
    setIsFormValid(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === "number") {
      formattedValue = formatCardNumber(value);
    }

    // Format expiry date
    if (name === "expiry") {
      formattedValue = formatExpiry(value);
    }

    // Only allow digits for CVC
    if (name === "cvc") {
      formattedValue = value.replace(/\D/g, "");
    }

    setForm({ ...form, [name]: formattedValue });
  };

  const handleSave = async () => {
    if (!isFormValid) {
      alert("Please fix the errors before saving");
      return;
    }

    try {
      if (modalType === "add") {
        const response = await fetch("/api/saved-cards", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cardType: form.type,
            cardNumber: form.number.replace(/\s/g, ""),
            expiryDate: form.expiry,
            cardHolderName: form.name.trim(),
            isPrimary: cards.length === 0 ? true : false,
          }),
        });

        if (response.ok) {
          await fetchCards();
          closeModal();
        } else {
          alert("Failed to add card");
        }
      } else if (modalType === "edit" && editCard) {
        const response = await fetch(`/api/saved-cards/${editCard.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            cardType: form.type,
            cardNumber: form.number.replace(/\s/g, ""),
            expiryDate: form.expiry,
            cardHolderName: form.name.trim(),
            isPrimary: editCard.isPrimary,
          }),
        });

        if (response.ok) {
          await fetchCards();
          closeModal();
        } else {
          alert("Failed to update card");
        }
      }
    } catch (error) {
      console.error("Error saving card:", error);
      alert("Error saving card");
    }
  };

  const setAsPrimary = async (cardId) => {
    try {
      const response = await fetch(`/api/saved-cards/${cardId}/primary`, {
        method: "PUT",
        credentials: "include",
      });

      if (response.ok) {
        await fetchCards();
      } else {
        alert("Failed to set primary card");
      }
    } catch (error) {
      console.error("Error setting primary card:", error);
      alert("Error setting primary card");
    }
  };

  const removeCard = async (cardId) => {
    try {
      const response = await fetch(`/api/saved-cards/${cardId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetchCards();
      } else {
        alert("Failed to remove card");
      }
    } catch (error) {
      console.error("Error removing card:", error);
      alert("Error removing card");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const handleDownload = (billingId) => {
    alert(
      `Download functionality for billing record ${billingId} would be implemented here`,
    );
  };

  return (
    <>
      <NavbarOS />
      <main className="main-pi manage-membership-layout">
        <aside className="settings-sidebar-fixed">
          <SettingsSidebar />
        </aside>
        <div className="manage-membership-main-centered">
          <h1 className="payment-info-title">Payment Info</h1>
          <section className="payment-methods-section">
            <div className="section-header">
              <h2>Payment Methods</h2>
              <button className="btn add" onClick={openAddModal}>
                + Add
              </button>
            </div>
            <div className="card-grid">
              {cards.map((card) => (
                <div
                  className={`card${card.isPrimary ? " card-primary" : ""}`}
                  key={card.id}
                >
                  <div className="card-header">
                    <span
                      className={`card-type ${card.cardType.toLowerCase().replace(" ", "-")}`}
                    >
                      {card.cardType}
                    </span>
                  </div>
                  <div className="card-details">
                    <div>**** **** **** {card.cardNumber.slice(-4)}</div>
                    <div>Expires: {card.expiryDate}</div>
                    <div>{card.cardHolderName}</div>
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn edit"
                      onClick={() => openEditModal(card)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn remove"
                      onClick={() => removeCard(card.id)}
                    >
                      Remove
                    </button>
                    {!card.isPrimary && (
                      <button
                        className="btn blue"
                        onClick={() => setAsPrimary(card.id)}
                      >
                        Set as Primary
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="no-cards-message">
                  <p>No payment methods added yet.</p>
                  <p>Add a payment method to enable premium features.</p>
                </div>
              )}
            </div>
          </section>
          <section className="billing-history-section">
            <h2>Recent Billing History</h2>
            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#87CEEB",
                }}
              >
                Loading billing history...
              </div>
            ) : (
              <>
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingHistory.length > 0 ? (
                      billingHistory.map((billing) => (
                        <tr key={billing.id}>
                          <td>{formatDate(billing.billing_date)}</td>
                          <td>{billing.description}</td>
                          <td>{billing.payment_method}</td>
                          <td>${billing.amount}</td>
                          <td className={billing.status.toLowerCase()}>
                            {billing.status}
                          </td>
                          <td>
                            <button
                              className="btn download"
                              onClick={() => handleDownload(billing.id)}
                            >
                              Download
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          style={{ textAlign: "center", color: "#A9A9A9" }}
                        >
                          No billing history available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                <button
                  className="btn blue full-width"
                  onClick={() => navigate("/settings/billing-history")}
                >
                  View Full Billing History
                </button>
              </>
            )}
          </section>
        </div>
      </main>
      {showModal && (
        <div className="payment-modal-overlay" onClick={closeModal}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="payment-modal-title">
              {modalType === "add"
                ? "Add Payment Method"
                : "Edit Payment Method"}
            </h2>
            <form
              className="payment-modal-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <label>
                Card Type
                <select
                  name="type"
                  value={form.type}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select</option>
                  <option value="Visa">Visa</option>
                  <option value="Master Card">Master Card</option>
                  <option value="Amex">Amex</option>
                </select>
                {errors.type && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    {errors.type}
                  </div>
                )}
              </label>
              <label>
                Card Number
                <input
                  name="number"
                  type="text"
                  maxLength="19"
                  value={form.number}
                  onChange={handleFormChange}
                  required
                  placeholder="1234 5678 9012 3456"
                />
                {errors.number && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    {errors.number}
                  </div>
                )}
              </label>
              <label>
                Expiry
                <input
                  name="expiry"
                  type="text"
                  maxLength="5"
                  value={form.expiry}
                  onChange={handleFormChange}
                  required
                  placeholder="MM/YY"
                />
                {errors.expiry && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    {errors.expiry}
                  </div>
                )}
              </label>
              <label>
                Name on Card
                <input
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                  placeholder="John Doe"
                />
                {errors.name && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    {errors.name}
                  </div>
                )}
              </label>
              <label>
                CVC
                <input
                  name="cvc"
                  type="password"
                  maxLength="4"
                  value={form.cvc}
                  onChange={handleFormChange}
                  required
                  placeholder="123"
                />
                {errors.cvc && (
                  <div
                    style={{
                      color: "#dc3545",
                      fontSize: "0.85rem",
                      marginTop: "2px",
                    }}
                  >
                    {errors.cvc}
                  </div>
                )}
              </label>
              <div className="payment-modal-actions">
                <button
                  type="button"
                  className="btn cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn save"
                  disabled={!isFormValid}
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <FooterOS />
    </>
  );
}

export default PaymentInfo;
