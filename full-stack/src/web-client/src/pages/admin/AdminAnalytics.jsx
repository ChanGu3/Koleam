import React, { useEffect, useState } from "react";
import "./AdminAnalytics.css";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limit] = useState(8);
  const [offset, setOffset] = useState(0);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/authorize/admin/analytics/anime/streams?limit=${limit}&offset=${offset}`,
        { credentials: "include" },
      );
      const data = await res.json();
      setAnalytics(data || []);
    } catch (e) {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Analytics - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");
  }, []);

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line
  }, [offset]);

  return (
    <div className="admin-analytics-container">
      <h2>Movie Analytics</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <table className="admin-analytics-table">
          <thead>
            <tr>
              <th>Anime Title</th>
              <th>Avg Rating</th>
              <th>Movie Title</th>
              <th>Likes</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {analytics.map((a, i) => (
              <tr key={i}>
                <td>
                  <a
                    className="hover:text-os-blue-tertiary"
                    href={`/series/${a.animeID}/${a.animeTitle}`}
                  >
                    {a.animeTitle}
                  </a>
                </td>
                <td>{a.ratingData.avg.toFixed(1)}</td>
                <td>
                  <a
                    className="hover:text-os-blue-tertiary"
                    href={`/stream/${a.id}/${a.title}`}
                  >
                    {a.title}
                  </a>
                </td>
                <td>{a.likes}</td>
                <td>{a.views}</td>
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
          className={`admin-members-more-btn ${analytics.length < limit ? "hidden" : ""}`}
          onClick={() => {
            if (!(analytics.length < limit)) {
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

export default AdminAnalytics;
