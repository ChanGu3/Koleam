import React, { useState, useEffect } from "react";
import NavbarOS from "../../components/NavbarOS";
import FooterOS from "../../components/FooterOS";
import SettingsSidebar from "../../components/SettingsSidebar";
import "./EmailPassword.css";

function EmailPassword() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordEmail, setCurrentPasswordEmail] = useState("");
  const [currentPasswordPwd, setCurrentPasswordPwd] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  // Load current user information
  useEffect(() => {
    document.title = "Settings - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");

    async function fetchCurrentUser() {
      try {
        const res = await fetch("/api/authorize/member/navbar", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setEmail(data.user.email);
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentUser();
  }, []);

  const handleUpdateEmail = async () => {
    if (!newEmail || !currentPasswordEmail) {
      setEmailMessage("Please fill in all fields");
      return;
    }

    setEmailLoading(true);
    setEmailMessage("");

    try {
      const res = await fetch("/api/authorize/member/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          newEmail,
          currentPassword: currentPasswordEmail,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setEmailMessage("Email updated successfully!");
        setNewEmail("");
        setCurrentPasswordEmail("");
        setEmail(data.email); // Update the displayed email
      } else {
        setEmailMessage(data.error || "Failed to update email");
      }
    } catch (err) {
      setEmailMessage(`Network error. Please try again.`);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPasswordPwd || !newPassword || !confirmPassword) {
      setPasswordMessage("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage("New passwords do not match");
      return;
    }

    if (newPassword.length < 7) {
      setPasswordMessage("Password must be at least 7 characters long");
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage("");

    try {
      const res = await fetch("/api/authorize/member/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: currentPasswordPwd,
          newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setPasswordMessage("Password updated successfully!");
        setCurrentPasswordPwd("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMessage(data.error || "Failed to update password");
      }
    } catch (err) {
      setPasswordMessage("Network error. Please try again.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancelEmail = () => {
    setNewEmail("");
    setCurrentPasswordEmail("");
    setEmailMessage("");
  };

  const handleCancelPassword = () => {
    setCurrentPasswordPwd("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
  };

  return (
    <>
      <NavbarOS reLoad={email} />
      <main className="main-ep manage-membership-layout">
        <aside className="settings-sidebar-fixed">
          <SettingsSidebar />
        </aside>
        <div className="manage-membership-main-centered">
          <div className="main-header">
            <h1 className="main-title">Email / Password</h1>
            <p className="main-desc">
              Update your registered email address or password for security or
              preference reasons
            </p>
          </div>

          {/* Email Card */}
          <div className="card email-card">
            <h2>Email Address</h2>
            <p className="text-muted">Change your registered email address</p>
            <div className="current-email">
              <label className="current-email-label">Current Email</label>
              <span>{loading ? "Loading..." : email}</span>
            </div>
            <div className="form-group">
              <label htmlFor="new-email" className="form-label">
                New Email Address
              </label>
              <input
                type="email"
                className="form-control"
                id="new-email"
                placeholder="Enter new email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="current-password-email" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                className="form-control"
                id="current-password-email"
                placeholder="Enter your current password"
                value={currentPasswordEmail}
                onChange={(e) => setCurrentPasswordEmail(e.target.value)}
              />
            </div>
            {emailMessage && (
              <div
                className={`message ${emailMessage.includes("successfully") ? "success" : "error"}`}
              >
                {emailMessage}
              </div>
            )}
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancelEmail}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-update"
                onClick={handleUpdateEmail}
                disabled={emailLoading}
              >
                {emailLoading ? "Updating..." : "Update Email"}
              </button>
            </div>
          </div>

          {/* Password Card */}
          <div className="card password-card">
            <h2>Password</h2>
            <p className="text-muted">Change your account password</p>
            <div className="form-group">
              <label htmlFor="current-password-pwd" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                className="form-control"
                id="current-password-pwd"
                placeholder="Enter your current password"
                value={currentPasswordPwd}
                onChange={(e) => setCurrentPasswordPwd(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="new-password" className="form-label">
                New Password
              </label>
              <input
                type="password"
                className="form-control"
                id="new-password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm-password" className="form-label">
                Confirm Password
              </label>
              <input
                type="password"
                className="form-control"
                id="confirm-password"
                placeholder="Enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {passwordMessage && (
              <div
                className={`message ${passwordMessage.includes("successfully") ? "success" : "error"}`}
              >
                {passwordMessage}
              </div>
            )}
            <div className="btn-row">
              <button
                type="button"
                className="btn btn-cancel"
                onClick={handleCancelPassword}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-update"
                onClick={handleUpdatePassword}
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default EmailPassword;
