import React, { useContext, useState, useEffect } from "react";
import styles from "../modules/SearchResults.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { faSpotify } from "@fortawesome/free-brands-svg-icons"
import { AuthenticationContext } from "./Authentication";
import { useNightMode } from "../App";


function SearchResults({ dataSpotify, searchBarMozilla }) {

    const { Night } = useNightMode();

    const { clientId, params, code } = useContext(AuthenticationContext);

    const [trackList, setTrackList] = useState([]); // Lista original
    const [selectedTracks, setSelectedTracks] = useState([]); // Lista de elementos seleccionados
    const [newListInput, setNewListInput] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);

        function msToTime(s) {

            // Pad to 2 or 3 digits, default is 2
            function pad(n, z) {
                z = z || 2;
                return ('00' + n).slice(-z);
            }

            var ms = s % 1000;
            s = (s - ms) / 1000;
            var secs = s % 60;
            s = (s - secs) / 60;
            var mins = s % 60;
            var hrs = (s - mins) / 60;

            return pad(mins) + ':' + pad(secs);
        }

        if (dataSpotify?.tracks?.items?.length > 0) {

            const combinedTracks = dataSpotify.tracks.items.map(track => ({
                title: track.name,
                artists: track.artists.map(artist => artist.name).join(", "),
                album: track.album.name,
                duration: msToTime(track.duration_ms),
                img: track.album.images.length > 0 ? track.album.images[0].url : null,
                id: track.id,
                uri: track.uri
            }));

            setTrackList(combinedTracks);

            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    }, [dataSpotify]);


    const handleChangeInput = (event) => {
        event.preventDefault();
        setNewListInput(event.target.value);
    }

    const handleKeyPress = (event) => {
        if (event.key === "Enter") {
            handleCreatePlaylist();
        }
    }

    const handleMoveToSelected = (indexToMove) => {
        setSelectedTracks(prevSelected => [...prevSelected, trackList[indexToMove]]);
        setTrackList(prevTrack =>
            prevTrack.filter((_, index) => index !== indexToMove)
        );
        setShowSuccess(false);
    };

    const handleMoveToTrackList = (indexToMove) => {
        setTrackList(prevTrack => [...prevTrack, selectedTracks[indexToMove]]);
        setSelectedTracks(prevSelected =>
            prevSelected.filter((_, index) => index !== indexToMove)
        );
    }

    const [tokenVerification, setTokenVerification] = useState(false);
    const [tokenAuth, setTokenAuth] = useState("");
    const [userId, setUserId] = useState("");

    const handleCreatePlaylist = async () => {

        if (!tokenVerification) {
            const tokenAccess = await getAccessToken(clientId, code);
            setTokenAuth(tokenAccess);
            setTokenVerification(true);
            const userIdentification = await getUserId(tokenAccess);
            setUserId(userIdentification);
            const playlistId = await createPlaylist(tokenAccess, userIdentification);
            const tracksToPlaylist = await addTracksToPlaylist(playlistId, tokenAccess);

        } else {
            const playlistId = await createPlaylist(tokenAuth, userId);
            const tracksToPlaylist = await addTracksToPlaylist(playlistId, tokenAuth);
        }


        async function getAccessToken(clientId, code) {
            const verifier = localStorage.getItem("verifier");

            const params = new URLSearchParams();
            params.append("client_id", clientId);
            params.append("grant_type", "authorization_code");
            params.append("code", code);
            params.append("redirect_uri", "https://jonarhood.netlify.app");
            params.append("code_verifier", verifier);

            const result = await fetch("https://accounts.spotify.com/api/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params
            });

            const { access_token } = await result.json();
            return access_token;
        }

        async function getUserId(token) {
            const result = await fetch("https://api.spotify.com/v1/me", {
                method: "GET", headers: { Authorization: `Bearer ${token}` }
            });

            const { id } = await result.json();
            return id;
        }

        async function createPlaylist(token, userId) {

            const playlistData = {
                name: newListInput,
                description: "Playlist created with Jammming"
            };

            try {
                const response = await fetch('https://api.spotify.com/v1/users/' + userId + '/playlists', {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(playlistData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Playlist created successfully:');

                return data.id;

            } catch (error) {
                alert('Error creating playlist:', error);
            }
        }

        async function addTracksToPlaylist(Id, token) {

            const trackUriFinder = selectedTracks.map(track => track.uri);

            const playlistData = {
                uris: trackUriFinder
            };

            try {
                const response = await fetch("https://api.spotify.com/v1/playlists/" + Id + "/tracks", {
                    method: 'POST',
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(playlistData)
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Tracks added successfully:', data);
                // Reset input field

                setShowSuccess(true);
                setNewListInput("");
                setSelectedTracks([]);

                return data;

            } catch (error) {
                alert('Error adding tracks:', error);
            }
        }
    };

    const [clickedEmpty, setClickedEmpty] = useState(false);

    const pleaseTypePlaylistName = () => {
        setClickedEmpty(true);
        setTimeout(() => {
            setClickedEmpty(false);
        }, 100)
        setTimeout(() => {
            setClickedEmpty(true);
        }, 200)
        setTimeout(() => {
            setClickedEmpty(false);
        }, 300)

    }

    const listBehaviour = selectedTracks.length === 0 ? "Select tracks to begin..." : "Name your Playlist...";
    const listDisabled = selectedTracks.length === 0;

    return (
        <div className={`
        ${styles.searchResults}
        ${Night ? styles.searchResultsNight : ""}
        ${searchBarMozilla ? styles.searchResultsMozilla : ""}
        ${Night && searchBarMozilla ? styles.searchResultsMozillaNight : ""}
        `}>
            <div className={styles.divCreateList}>
                {loading ? (
                    <div className={styles.divLoading}>
                        <svg className={styles.loadingSvg} viewBox="25 25 50 50">
                            <circle className={`
                            ${styles.loadingCircle}
                            ${Night ? styles.loadingCircleNight : ""}
                            `} r="20" cy="50" cx="50"></circle>
                        </svg>
                    </div>
                ) : (
                    trackList.map((track, index) => (
                        <div
                            key={index}
                            className={`
                            ${styles.trackContainer}
                            ${Night ? styles.trackContainerNight : ""}
                            `}
                            onClick={() => handleMoveToSelected(index)} // Mover el div al hacer clic
                        >
                            <div className={styles.divImg}>
                                <div className={styles.trackImgContainer}>
                                    <img src={track.img} alt={track.title} />
                                </div>
                            </div>
                            <div className={styles.divInfo}>
                                <div className={`
                                ${styles.trackTitle}
                                ${Night ? styles.trackTitleNight : ""}
                                `}>
                                    <strong>{track.title}</strong>
                                </div>
                                <div className={`
                                ${styles.artistsContainer}
                                ${Night ? styles.artistsContainerNight : ""}
                                `}>
                                    <strong>{track.artists}</strong>
                                </div>
                                <div className={`
                                ${styles.albumContainer}
                                ${Night ? styles.albumContainerNight : ""}
                                `}>
                                    <strong>Album: {track.album}</strong>
                                </div>
                                <div className={styles.durationContainer}>
                                    <strong><span>Duration:</span> {track.duration}</strong>
                                </div>
                            </div>
                            <div className={styles.divArrow}>
                                <FontAwesomeIcon icon={faCaretRight} />
                            </div>
                        </div>
                    ))
                )}
            </div>
            <div className={`
                ${styles.divPlaylistName}
                ${Night ? styles.divPlaylistNight : ""}
                ${selectedTracks.length === 0 ? styles.divPlaylistEmpty : ""}
                ${!clickedEmpty ? "" : styles.divListClickedEmpty}
            `}>
                <input
                    type="text"
                    value={newListInput}
                    onChange={handleChangeInput}
                    onKeyDown={handleKeyPress}
                    placeholder={listBehaviour}
                    disabled={listDisabled}
                    autoComplete="off"
                    id="inputPlaylistName"
                >
                </input>
            </div>
            <div className={`
            ${styles.playListMaker}
            ${Night ? styles.playListMakerNight : ""}
            `}>
                <div className={styles.divCreateList}>
                    {selectedTracks.map((track, index) => (
                        <div
                            key={index}
                            className={`
                            ${styles.trackContainer}
                            ${Night ? styles.trackContainerNight : ""}
                            `}
                            onClick={() => handleMoveToTrackList(index)} // Mover el div al hacer clic
                        >
                            <div className={styles.divImg}>
                                <div className={styles.trackImgContainer}>
                                    <img src={track.img} alt={track.title} />
                                </div>
                            </div>
                            <div className={styles.divInfo}>
                                <div className={`
                                ${styles.trackTitle}
                                ${Night ? styles.trackTitleNight : ""}
                                `}>
                                    <strong>{track.title}</strong>
                                </div>
                                <div className={`
                                ${styles.artistsContainer}
                                ${Night ? styles.artistsContainerNight : ""}
                                `}>
                                    <strong>{track.artists}</strong>
                                </div>
                                <div className={`
                                ${styles.albumContainer}
                                ${Night ? styles.albumContainerNight : ""}
                                `}>
                                    <strong>Album: {track.album}</strong>
                                </div>
                                <div className={styles.durationContainer}>
                                    <strong><span>Duration:</span> {track.duration}</strong>
                                </div>
                            </div>
                            <div className={styles.divArrow}>
                                <FontAwesomeIcon icon={faXmark} />
                            </div>
                        </div>
                    ))}
                </div>
                <div className={`
                ${styles.divSuccess}
                ${showSuccess === true ? styles.divSuccessTrue : ""}
                `}>
                    <FontAwesomeIcon icon={faSpotify} />
                    <h3>Playlist Created <br /> Succesfully</h3>
                </div>
            </div>
            <div className={selectedTracks.length === 0 ? `${styles.divButtonEmpty}` : `${styles.divButton}`}>
                <button
                    type="Submit"
                    className={styles.buttonPlaylist}
                    value="Click"
                    onClick={newListInput.length === 0 ? pleaseTypePlaylistName : handleCreatePlaylist}
                >
                    <h2>Create new Playlist</h2>
                </button>
            </div>
        </div>
    );
}

export default SearchResults;
