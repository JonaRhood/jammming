import './App.css';
import React, { useState, createContext, useContext, useEffect } from "react";
import backvid from "./resources/img/backvid.mp4";
import SearchBar from "./components/SearchBar";
import TokenProvider from "./components/TokenProvider";
import Authentication from './components/Authentication';
import styles from "./modules/NightMode.module.css"
import { faMoon } from '@fortawesome/free-solid-svg-icons';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchResults from './components/SearchResults';

const NightModeContext = createContext();

function App() {

  const [Night, setNight] = useState(false);
  const [mozilla, setMozilla] = useState(false);

  const sUsrAg = navigator.userAgent;

  useEffect(() => {
    if (sUsrAg.indexOf("Firefox") > -1) {
      setMozilla(true);
    }
  }, [sUsrAg]);

  const handleNightButton = () => {
    setNight(prevNight => !prevNight);
  }


  return (
    <NightModeContext.Provider value={{ Night }}>
      <TokenProvider>
        <Authentication>
          <div className="firstDiv">
            <div className={`
            ${"video-bg"}
            ${Night ? "" : "videoNight"}
            `}>
              <video autoPlay loop muted playsInline className={styles.backgroundVideo}>
                <source src={backvid} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div
              className={`
                ${styles.divNightMode}
                ${Night ? styles.NightMode : ''}
                `}
              onClick={handleNightButton}
            >
              <div className={styles.divLogoNightMode}>{<FontAwesomeIcon icon={faMoon} />}</div>
            </div>
            <div className={`
            ${"AppContainer"}
            ${Night ? "AppContainerNight" : ""}
            `}
              id='home'
            >
              <div className={"searchBar"}>
                <SearchBar mozilla={mozilla} />
              </div>
              <div className={`
              ${"trackList"}
              ${Night ? "trackListNight" : ""}
              `}>
                {/* Aquí puedes agregar el componente SearchResults o cualquier otro */}
              </div>
              <div className={`
              ${"toMyList"}
              ${Night ? "toMyListNight" : ""}
              `}>
                {/* Aquí puedes agregar el componente AddToPlaylist o cualquier otro */}
              </div>
            </div>
            <a href='#home' className='linkUp'>
              <div
                className={`
            ${"divButtonGoUp"}
            ${Night ? "divButtonGoUpNight" : ""}
            `}
              >
                <FontAwesomeIcon icon={faArrowUp} />
              </div>
            </a>
          </div>
        </Authentication>
      </TokenProvider>
    </NightModeContext.Provider>
  );
}

export const useNightMode = () => useContext(NightModeContext);

export default App;
