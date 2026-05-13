import React, { useEffect, useState } from "react";
import NavbarOS from "../../components/NavbarOS";
import FooterOS from "../../components/FooterOS";
import SettingsSidebar from "../../components/SettingsSidebar";
import "./PreferredLanguage.css";

function PreferredLanguage() {
  const [interfaceLang, setInterfaceLang] = useState("English");
  const [subtitleLang, setSubtitleLang] = useState("English");
  const [subtitleOption, setSubtitleOption] = useState("auto-select");

  useEffect(() => {
    document.title = "Settings - OtakuStream";
    document.body.classList.remove("bg-os-dark-primary");
    document.body.classList.add("bg-[#181a1b]");
  }, []);

  return (
    <>
      <NavbarOS />
      <main className="manage-membership-layout">
        <aside className="settings-sidebar-fixed">
          <SettingsSidebar />
        </aside>
        <div className="manage-membership-main-centered">
          <div className="main-container">
            <header className="text-center mb-5">
              <h1 className="main-title">Preferred Language</h1>
              <p className="sub-title">
                Select your preferred languages for website interface and
                subtitle display
              </p>
            </header>
            <main className="card content-card">
              <div className="card-body">
                <section className="mb-5">
                  <h2 className="section-title">Interface Language</h2>
                  <p className="section-description">
                    Choose the language for menus, buttons, and website
                    interface
                  </p>
                  <div className="select-wrapper">
                    <label htmlFor="interface-lang" className="form-label">
                      Website Language
                    </label>
                    <select
                      className="form-select"
                      id="interface-lang"
                      value={interfaceLang}
                      onChange={(e) => setInterfaceLang(e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Korean">Korean</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </section>
                <section className="subtitle-section">
                  <h2 className="section-title">Subtitle Preferences</h2>
                  <p className="section-description">
                    Choose your preferred subtitle language and display options
                  </p>
                  <div className="select-wrapper">
                    <label htmlFor="subtitle-lang" className="form-label">
                      Subtitle Language
                    </label>
                    <select
                      className="form-select"
                      id="subtitle-lang"
                      value={subtitleLang}
                      onChange={(e) => setSubtitleLang(e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Korean">Korean</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                  <div className="subtitle-radio-group">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subtitleOptions"
                        id="auto-select"
                        checked={subtitleOption === "auto-select"}
                        onChange={() => setSubtitleOption("auto-select")}
                      />
                      <label className="form-check-label" htmlFor="auto-select">
                        Auto-select subtitles when available
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subtitleOptions"
                        id="always-ask"
                        checked={subtitleOption === "always-ask"}
                        onChange={() => setSubtitleOption("always-ask")}
                      />
                      <label className="form-check-label" htmlFor="always-ask">
                        Always ask me to choose subtitles
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="subtitleOptions"
                        id="disable-default"
                        checked={subtitleOption === "disable-default"}
                        onChange={() => setSubtitleOption("disable-default")}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="disable-default"
                      >
                        Disable subtitles by default
                      </label>
                    </div>
                  </div>
                </section>
              </div>
              <div className="card-footer">
                <button type="button" className="btn btn-cancel">
                  Cancel
                </button>
                <button type="button" className="btn btn-save">
                  Save Changes
                </button>
              </div>
            </main>
          </div>
        </div>
      </main>
      <FooterOS />
    </>
  );
}

export default PreferredLanguage;
