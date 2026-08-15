import { PublicClientApplication } from '@azure/msal-browser';

// Environment variables from Vite
const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
const tenantId = import.meta.env.VITE_MICROSOFT_TENANT_ID;

// Use the current origin (e.g. http://localhost:5173 or https://the-backbenchers-final.vercel.app/)
const redirectUri = window.location.origin + '/';

export const msalConfig = {
    auth: {
        clientId: clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri: redirectUri,
        postLogoutRedirectUri: redirectUri,
        navigateToLoginRequestUrl: false, // Ensures we don't reload hash routes unnecessarily
    },
    cache: {
        cacheLocation: 'sessionStorage',
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (containsPii) {
                    return;
                }
                switch (level) {
                    case 0: // LogLevel.Error
                        console.error(message);
                        return;
                    case 1: // LogLevel.Warning
                        console.warn(message);
                        return;
                    case 2: // LogLevel.Info
                    case 3: // LogLevel.Verbose
                        // Optionally log info/verbose
                        return;
                    default:
                        return;
                }
            },
        },
    },
};

export const loginRequest = {
    scopes: ['openid', 'profile', 'email', 'User.Read']
};

export const msalInstance = new PublicClientApplication(msalConfig);
