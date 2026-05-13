import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarOS from "../components/NavbarOS";
import FooterOS from "../components/FooterOS";
import "./Favorites.css";

const filterTypes = ["All", "Anime", "Movies", "Ongoing"];

function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "My Favorites - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");

    async function fetchFavorites() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/authorize/member/anime/favorite", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch favorites");
        const data = await res.json();
        setFavorites(data.list || []);
      } catch (err) {
        setError("Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    }
    fetchFavorites();
  }, []);

  // Remove from favorites
  const handleRemove = async (animeID) => {
    try {
      if (!animeID || animeID === "undefined") {
        throw new Error("animeID가 유효하지 않습니다");
      }

      const res = await fetch(
        `/api/authorize/member/anime/favorite/${animeID}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch (parseError) {
          errorData = { error: "Failed to parse server response" };
        }

        // Remove from UI even if item doesn't exist in favorites
        if (
          errorData &&
          errorData.error &&
          typeof errorData.error === "string" &&
          errorData.error.includes("is already not having")
        ) {
          setFavorites(
            favorites.filter((item) => {
              const itemId =
                item.animeID || item.id || item.anime_id || item.animeId;
              return itemId !== animeID;
            }),
          );
          return; // Don't throw error, treat as success
        }

        throw new Error(errorData.error || "Failed to remove favorite");
      }
      setFavorites(
        favorites.filter((item) => {
          const itemId =
            item.animeID || item.id || item.anime_id || item.animeId;
          return itemId !== animeID;
        }),
      );
    } catch (err) {
      // Treat as success if item doesn't exist in favorites
      if (
        err &&
        err.message &&
        typeof err.message === "string" &&
        err.message.includes("is already not having")
      ) {
        return;
      }

      alert(`Failed to remove: ${err.message}`);
    }
  };

  // Watch Now button click handler
  const handleWatchNow = async (animeID) => {
    try {
      // Fetch anime data and navigate to first episode
      const res = await fetch(`/api/anime/${animeID}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch anime data");
      }

      const animeData = await res.json();

      // Navigate to first episode of first installment (season)
      if (animeData.installments && animeData.installments.length > 0) {
        const firstInstallment = animeData.installments[0];
        if (
          firstInstallment.animeStreamList &&
          firstInstallment.animeStreamList.length > 0
        ) {
          const firstStream = firstInstallment.animeStreamList[0];
          navigate(
            `/stream/${firstStream.id}/${encodeURIComponent(firstStream.title)}`,
          );
          return;
        }
      }

      // If no episodes, navigate to anime details page
      navigate(`/series/${animeID}/${encodeURIComponent(animeData.title)}`);
    } catch (err) {
      // On error, navigate to anime details page
      navigate(`/series/${animeID}/details`);
    }
  };

  const filteredFavorites = Array.isArray(favorites)
    ? favorites.filter((item) => {
        // Handle safely in case type field doesn't exist
        const type = item.type || "";
        const matchesType =
          filter === "All" ||
          type === filter ||
          (filter === "Movies" && type === "Movie");
        const matchesSearch = (item.title || "")
          .toLowerCase()
          .includes(search.toLowerCase());
        return matchesType && matchesSearch;
      })
    : [];

  return (
    <>
      <NavbarOS />
      <main className="mx-3 md:mx-0 favorites-layout">
        <h1 className="favorites-title">My Favorites</h1>
        <div className="favorites-controls">
          <input
            className="favorites-search"
            type="text"
            placeholder="Search your favorites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="favorites-filters">
            {filterTypes.map((type) => (
              <button
                key={type}
                className={`favorites-filter-btn${filter === type ? " active" : ""}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <div className="favorites-grid mx-10">
          {loading ? (
            <div className="favorites-empty">Loading...</div>
          ) : error ? (
            <div className="favorites-empty">{error}</div>
          ) : filteredFavorites.length === 0 ? (
            <div className="favorites-empty">No favorites found.</div>
          ) : (
            filteredFavorites.map((item) => {
              const itemId =
                item.animeID || item.id || item.anime_id || item.animeId;
              return (
                <div className="favorites-card" key={itemId}>
                  <div className="favorites-card-image">
                    <img
                      className="w-full h-full object-cover"
                      src={item.coverHREF}
                    ></img>
                  </div>
                  <div className="favorites-card-content">
                    <div className="favorites-card-header">
                      <span className="favorites-card-title">{item.title}</span>
                      <span
                        className={`favorites-card-type favorites-card-type-${(item.type || "").toLowerCase()}`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="favorites-card-desc line-clamp-3 md:line-clamp-4">
                      {item.description}
                    </div>
                    <div className="favorites-card-actions">
                      <button
                        className="favorites-watch-btn"
                        onClick={() =>
                          handleWatchNow(
                            item.animeID ||
                              item.id ||
                              item.anime_id ||
                              item.animeId,
                          )
                        }
                      >
                        <span className="favorites-watch-icon">▶</span> Watch
                        Now
                      </button>
                      <button
                        className="favorites-remove-btn"
                        onClick={() =>
                          handleRemove(
                            item.animeID ||
                              item.id ||
                              item.anime_id ||
                              item.animeId,
                          )
                        }
                      >
                        X
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default Favorites;
