import React from 'react'
import { Phone, MessageSquare, MapPin, ArrowUpRight } from 'lucide-react'
import { SITE_IDENTITY } from '../../data/site'

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1E2326] text-[#F5F8FA] border-t border-[#474848]">

      {/* 2027 Admissions CTA Strip */}
      <div className="border-b border-[#474848] bg-[#2A3036]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-8 sm:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Admissions open for the 2027 session.
            </h3>
            <p className="text-sm text-[#A0BED1]">
              Enroll for School Smart Syllabus, Class 11–12 Computer Science, and Career Diplomas.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={SITE_IDENTITY.contact.whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#2672AB] hover:bg-[#1B5584] text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-98"
            >
              <MessageSquare size={16} strokeWidth={1.75} />
              <span>WhatsApp Us</span>
            </a>
            <a
              href={`tel:${SITE_IDENTITY.contact.phone}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#474848] hover:bg-[#2672AB] text-white text-xs sm:text-sm font-semibold transition-all border border-[#474848] hover:border-[#2672AB]"
            >
              <Phone size={15} strokeWidth={1.75} />
              <span>{SITE_IDENTITY.contact.phoneFormatted}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Body */}
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Brand Info & Identity (6 Cols) */}
          <div className="md:col-span-6 space-y-4">

            {/* Logo in dark section rule (Section 3.1): White rounded tile (12px radius, 12px padding), min-width 160px */}
            <div className="inline-block bg-white p-3 rounded-xl shadow-sm">
              <img
                src="/brand/logo.jpg"
                alt={SITE_IDENTITY.brandName}
                className="h-12 w-auto object-contain"
                style={{ minWidth: '160px' }}
                width={160}
                height={48}
              />
            </div>

            <div>
              <span className="font-heading font-bold text-lg text-white block leading-tight">
                {SITE_IDENTITY.name}
              </span>
              <span className="font-bengali text-xs text-[#A0BED1] block leading-tight mt-0.5">
                {SITE_IDENTITY.nameBengali}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#A0BED1] leading-relaxed max-w-md">
              MSME-registered training institute affiliated with the National Youth Skill Development Board (NYSDB). Instructing school and career computer science in Chowberia, North 24 Parganas.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#A0BED1]">
              <MapPin size={14} className="text-[#A0BED1] shrink-0" strokeWidth={1.75} />
              <span>{SITE_IDENTITY.address.full}</span>
            </div>
          </div>

          {/* Quick Nav Links (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A0BED1]">
              <li>
                <a href="#programs" className="hover:text-white transition-colors">Programs & Tracks</a>
              </li>
              <li>
                <a href="#lab" className="hover:text-white transition-colors">14-Seat Lab & Demo</a>
              </li>
              <li>
                <a href="#subjects" className="hover:text-white transition-colors">Subjects & Tech</a>
              </li>
              <li>
                <a href="#icst-labs" className="hover:text-white transition-colors">ICST Labs Simulations</a>
              </li>
              <li>
                <a href="#about" className="hover:text-white transition-colors">About & Trust</a>
              </li>
              <li>
                <a href="#scholarship" className="hover:text-white transition-colors">2027 Scholarship</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-white transition-colors">Location & FAQ</a>
              </li>
            </ul>
          </div>

          {/* Digital Brand & Verification (3 Cols) */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
              Digital Brand
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-[#A0BED1]">
              <li>
                <span className="block text-white font-semibold">{SITE_IDENTITY.domain}</span>
                <span className="text-[11px] text-[#A0BED1]">Official Web Portal</span>
              </li>
              <li>
                <span className="block text-white font-semibold">@{SITE_IDENTITY.socialHandle}</span>
                <span className="text-[11px] text-[#A0BED1]">Social Handle</span>
              </li>
              <li className="pt-2">
                <a
                  href="https://labs.icstconnect.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-[#A0BED1] hover:underline"
                >
                  <span>labs.icstconnect.in</span>
                  <ArrowUpRight size={12} strokeWidth={1.75} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Affiliations */}
        <div className="mt-12 pt-6 border-t border-[#474848] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A0BED1]">
          <div>
            © {new Date().getFullYear()} {SITE_IDENTITY.name}. All rights reserved.
          </div>
          <div className="text-center sm:text-right text-[11px]">
            {SITE_IDENTITY.registrations.msme} · {SITE_IDENTITY.registrations.nysdb}
          </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer
