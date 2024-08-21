import React, { createContext, useState, useEffect } from "react";
import AddToPlaylist from "./Authentication";

export const TokenContext = createContext();

function TokenProvider({ children }) {
    const clientId = '6a18aead68cc40328197f823c5b3fb55';
    const clientSecret = '06555bc38fae48928ff825089d1d940f';

    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccessToken = async () => {
            const params = new URLSearchParams();
            params.append('grant_type', 'client_credentials');
            params.append('client_id', clientId);
            params.append('client_secret', clientSecret);

            try {
                const response = await fetch('https://accounts.spotify.com/api/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: params.toString()
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }

                const data = await response.json();
                setAccessToken(data.access_token);
                setLoading(false);

            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchAccessToken();

        const intervalId = setInterval(fetchAccessToken, 60 * 60 * 1000);

        return () => clearInterval(intervalId);

    }, []); // Solo ejecutar una vez al montar el componente

    return (
        <TokenContext.Provider value={{ accessToken, loading }}>
            {children}
        </TokenContext.Provider>
    );
};

export default TokenProvider;
