import React, { useContext, useState, useEffect } from "react";
import styles from "../modules/SearchBar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { ReactComponent as ArrowLogo } from "../resources/img/ArrowUDownLeft.svg";
import { TokenContext } from "./TokenProvider";
import SearchResults from "./SearchResults";
import { useNightMode } from "../App";

function SearchBar({mozilla}) {

    const {Night} = useNightMode();

    const { accessToken, loading } = useContext(TokenContext);

    const [textTyped, setTextTyped] = useState("");
    const [dataSpotify, setDataSpotify] = useState("");
    const [searchBarMozilla, setSearchBarMozilla] = useState(mozilla);

    useEffect(() => {
        setSearchBarMozilla(mozilla);
    }, [mozilla]);


    const handleTextTyping = (event) => {
        event.preventDefault();
        setTextTyped(event.target.value);
    }

    async function handleSubmit(event) {

        if (!textTyped.trim()) {
            return;
        }

        if (event.key === "Enter" || event.type === "click") {
            const endpoint = "https://api.spotify.com/v1/search?";
            const q = "q=remaster%2520artist%3A" + textTyped;
            const type = "&type=album,track,artist";
            const market = "&market=ES";
            const limit = "&limit=50";

            const url = endpoint + q + type + market + limit;
            const token = accessToken;

            try {
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error("HTTP error! status: ${response.status}");
                }

                const data = await response.json();
                setDataSpotify(data);

            } catch (error) {
                console.error("There was a problem with the fetch operation:", error);
            };

            setTextTyped("");
        };
    };

    return (
        <div className={styles.divSearch}>
            <div className={`
            ${styles.divBoth}
            ${Night ? styles.divBothNight : ""}
            `}>
                <div className={`
                ${styles.divSearchIcon}
                ${Night ? styles.divSearchIconNight : ""}
                `}>
                    <FontAwesomeIcon icon={faSearch} />
                </div>
                <div className={styles.divSearchInput}>
                    <input
                        className={`
                        ${styles.inputBox}
                        ${Night ? styles.inputBoxNight : ""}
                        `}
                        name="searchBarName"
                        type="text"
                        id="searchBar"
                        mozactionhint="search"
                        placeholder="Search by Artist, Song, or Album..."
                        value={textTyped}
                        onChange={handleTextTyping}
                        onKeyDown={handleSubmit}
                        autoComplete="off"
                    ></input>
                </div>
                <div className={`
                ${styles.divSearchEnterIcon}
                ${Night ? styles.divSearchEnterIconNight : ""}
                `}
                onClick={handleSubmit}
                >
                    <span><ArrowLogo /></span>
                </div>
            </div>
            <div className={styles.trackList}>
                    {dataSpotify && <SearchResults dataSpotify={dataSpotify} searchBarMozilla={searchBarMozilla} />}
            </div>
        </div>
    );
};

export default SearchBar;