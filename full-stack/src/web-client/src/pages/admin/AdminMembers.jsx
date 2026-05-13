import React, { useEffect, useState } from "react";
import "./AdminMembers.css";

function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(8);
  const [offset, setOffset] = useState(0);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/authorize/admin/members?limit=${limit}&offset=${offset}`,
        { credentials: "include" },
      );
      const data = await res.json();
      setMembers(data || []);
    } catch (e) {
      setError("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Members [List & Ban] - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");
  }, []);

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line
  }, [offset]);

  const handleBan = async (email, isBanned) => {
    try {
      await fetch(
        `/api/authorize/admin/members/${email}/ban${isBanned === false ? "?isBanned=false" : ""}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      fetchMembers();
    } catch (e) {
      alert("Failed to update ban status");
    }
  };

  return (
    <div className="admin-members-container">
      <h2>Member List</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table className="admin-members-table">
          <thead>
            <tr>
              <th>Sign-up Date</th>
              <th>Email</th>
              <th>Account Type</th>
              <th>Ban?</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={i}>
                <td>{m.createdAt ? m.createdAt.split("T")[0] : ""}</td>
                <td>{m.email}</td>
                <td>{m.accountType || (m.isPremium ? "Premium" : "Free")}</td>
                <td>
                  <button
                    className={m.banned ? "unban-btn" : "ban-btn"}
                    onClick={() =>
                      handleBan(m.email, m.banned === true ? false : undefined)
                    }
                  >
                    {m.banned ? "UNBAN" : "BAN"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="flex flex-row items-center justify-center">
        <button
          className={`admin-members-more-btn ${offset > 0 ? `` : `hidden`}`}
          onClick={() => {
            if (offset > 0) {
              setOffset(offset - limit);
            }
          }}
        >
          Go Back
        </button>
        <p className="flex flex-row gap-x-2 m-4 text-sm font-semibold text-center">
          Page{" "}
          <span className="text-os-blue-tertiary">{offset / limit + 1}</span>
        </p>
        <button
          className={`admin-members-more-btn ${members.length < limit ? "hidden" : ""}`}
          onClick={() => {
            if (!(members.length < limit)) {
              setOffset(offset + limit);
            }
          }}
        >
          View more
        </button>
      </div>
    </div>
  );
}

export default AdminMembers;
