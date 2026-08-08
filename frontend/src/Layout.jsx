import { Outlet } from "react-router-dom"
import React from "react"
import NavBar from "./components/NavBar"
import Footer from "./components/Footer"
import CookieConsentBanner from "./components/consent/CookieConsentBanner"
import CookiePreferencesPanel from "./components/consent/CookiePreferencesPanel"

export default function Layout() {
    return (
        <div >
            <NavBar />
            <main>
                <Outlet />
            </main>
            <Footer />
            {/* Storefront only: the admin session token is strictly necessary,
                so /login and /admins/* have nothing to ask consent for. */}
            <CookieConsentBanner />
            <CookiePreferencesPanel />
        </div>
    )
}
