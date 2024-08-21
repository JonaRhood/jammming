import React, { useState, useContext, useEffect, createContext } from "react";

export const AuthenticationContext = createContext();

function Authentication({ children }) {

    const [authentication, setAuthentication] = useState(null);
    const [accessToken, setAccessToken] = useState();

    const clientId = "6a18aead68cc40328197f823c5b3fb55"; // Replace with your client ID
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");


    useEffect(() => {

        const AuthenticationProcess = async () => {

            if (!code) {
                redirectToAuthCodeFlow(clientId);
            } else {
                console.log("Authentication Done");
            }

            async function redirectToAuthCodeFlow(clientId) {
                const verifier = generateCodeVerifier(128);
                const challenge = await generateCodeChallenge(verifier);

                localStorage.setItem("verifier", verifier);

                const params = new URLSearchParams();
                params.append("client_id", clientId);
                params.append("response_type", "code");
                params.append("redirect_uri", "https://jonarhood.netlify.app");
                params.append("scope", "user-read-private user-read-email playlist-modify-public playlist-modify");
                params.append("code_challenge_method", "S256");
                params.append("code_challenge", challenge);

                document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
            }

            function generateCodeVerifier(length) {
                let text = '';
                let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

                for (let i = 0; i < length; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

            async function generateCodeChallenge(codeVerifier) {
                const data = new TextEncoder().encode(codeVerifier);
                const digest = await window.crypto.subtle.digest('SHA-256', data);
                return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=+$/, '');
            }

        }
        AuthenticationProcess()

    }, []);

    return (
        <AuthenticationContext.Provider value={{ clientId, params, code }}>
            {children}
        </AuthenticationContext.Provider>
    )
};

export default Authentication;