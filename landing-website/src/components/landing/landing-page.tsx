'use client'

import Header from './header'
import Hero from './hero'
import Features from './features'
import Pricing from './pricing'
import About from './about'
import Contact from './contact'
import Footer from './footer'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main>
                <Hero />
                <Features />
                <Pricing />
                <About />
                <Contact />
            </main>
            <Footer />
        </div>
    )
}