import React, { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from 'src/components/NavBar'
import LabelProjectPollingManager from 'src/components/LabelProjectPollingManager'

const DefaultLayout = () => {
    return (
        <div className="relative min-h-screen">
            <style>{`
                body, html {
                    background-color: #0b0b11 !important;
                    min-height: 100dvh !important;
                }
            `}</style>
            {/* Full-viewport background fill (aligns with LandingPage approach) */}
            <div className="fixed inset-0 bg-[#0b0b11] -z-50" />

            <NavBar />
            <div className="min-h-[calc(100dvh-60px)]">
                <Outlet className="outlet" />
            </div>
            <LabelProjectPollingManager />
        </div>
    )
}

export default DefaultLayout
