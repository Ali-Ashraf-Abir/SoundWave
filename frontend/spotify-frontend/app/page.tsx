"use client";

import Link from "next/link";
import { Music2, Headphones, Radio, Mic2, TrendingUp, Play } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";


export default function Home() {
  const {loading ,user} = useAuth()
  const router = useRouter()
  useEffect(()=>{
    if(!loading && user){
      router.push('/home')
    }
  },[loading, user, router])

  if(loading){
    return <Loader></Loader>
  }
  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-dark opacity-60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)_0%,_transparent_50%)] opacity-20" />
        
        {/* Navigation */}
        <nav className="relative z-10 max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center">
              <Music2 className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold text-primary">SoundWave</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/login"
              className="px-6 py-2.5 text-primary font-semibold hover:text-primary-hover transition-colors"
            >
              Log in
            </Link>
            <Link 
              href="/register"
              className="px-6 py-2.5 bg-brand text-black font-bold rounded-full 
                       hover:bg-primary-hover hover-lift shadow-custom-md hover:shadow-custom-lg
                       transition-all duration-200"
            >
              Sign up
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6 leading-tight">
              Music for everyone.
            </h1>
            <p className="text-xl md:text-2xl text-secondary mb-8 max-w-2xl">
              Millions of songs. No credit card needed. Stream your favorite tracks, 
              discover new artists, and create the perfect playlist.
            </p>
            <Link 
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand text-black 
                       font-bold text-lg rounded-full hover:bg-primary-hover hover-lift
                       shadow-custom-lg hover:shadow-custom-xl transition-all duration-200"
            >
              <Play className="w-6 h-6" />
              Get Started Free
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-primary mb-12 text-center">
          Why you'll love SoundWave
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Feature Cards */}
          {[
            {
              icon: <Headphones className="w-8 h-8" />,
              title: "Unlimited Listening",
              description: "Stream millions of songs without limits"
            },
            {
              icon: <Radio className="w-8 h-8" />,
              title: "Personalized Radio",
              description: "Discover music tailored to your taste"
            },
            {
              icon: <Mic2 className="w-8 h-8" />,
              title: "Artist Podcasts",
              description: "Exclusive content from your favorites"
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: "Trending Charts",
              description: "Stay updated with what's hot"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-secondary p-6 rounded-2xl border border-default hover:border-primary
                       transition-all duration-200 hover-lift shadow-custom-md hover:shadow-custom-lg"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
              <p className="text-secondary">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="bg-gradient-primary rounded-3xl p-12 md:p-16 text-center shadow-custom-xl">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Ready to start listening?
          </h2>
          <p className="text-xl text-black/80 mb-8 max-w-2xl mx-auto">
            Join millions of listeners streaming their favorite music every day
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-primary 
                     font-bold text-lg rounded-full hover:bg-black/90
                     shadow-custom-lg transition-all duration-200"
          >
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-secondary border-t border-divider mt-20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Music2 className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-primary">SoundWave</span>
              </div>
              <p className="text-secondary text-sm">
                Your music, your way. Stream anywhere, anytime.
              </p>
            </div>
            
            {[
              {
                title: "Company",
                links: ["About", "Jobs", "Press", "News"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Privacy", "Terms"]
              },
              {
                title: "Community",
                links: ["Artists", "Developers", "Brands", "Investors"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="font-semibold text-primary mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-secondary hover:text-primary transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-divider pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-secondary text-sm">
              © 2024 SoundWave. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Instagram", "Twitter", "Facebook", "YouTube"].map((social) => (
                <a 
                  key={social}
                  href="#" 
                  className="text-secondary hover:text-primary transition-colors text-sm"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}