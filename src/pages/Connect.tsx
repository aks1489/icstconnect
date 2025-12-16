import { ExternalLink } from 'lucide-react';
import logo from '../assets/logo.jpg';
import { useMemo } from 'react';

// REFINED: Usage of the correct multi-colored modern Google Maps logo (2020 version)
const GoogleMapsLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 92.3 132.3" width="100%" height="100%">
        <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z" />
        <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z" />
        <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3" />
        <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3" />
        <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2" />
    </svg>
);

const FacebookLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%">
        <path fill="#1877F2" d="M24 4C12.95 4 4 12.95 4 24c0 9.96 7.34 18.23 16.87 19.72v-13.9h-5.08V24h5.08v-4.4c0-5.01 2.99-7.79 7.57-7.79 2.19 0 4.48.39 4.48.39v4.92h-2.52c-2.48 0-3.26 1.54-3.26 3.12V24h5.54l-.89 5.82h-4.66v13.9C36.66 42.23 44 33.96 44 24 44 12.95 35.05 4 24 4z" />
    </svg>
);

const InstagramLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%">
        <defs>
            <radialGradient id="instagram_grad" cx="24" cy="46" r="44" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="#f09433" />
                <stop offset="0.25" stopColor="#e6683c" />
                <stop offset="0.5" stopColor="#dc2743" />
                <stop offset="0.75" stopColor="#cc2366" />
                <stop offset="1" stopColor="#bc1888" />
            </radialGradient>
        </defs>
        <path fill="url(#instagram_grad)" d="M24 2C13 2 4 11 4 22s9 20 20 20 20-9 20-20S35 2 24 2zm0 34c-7.7 0-14-6.3-14-14s6.3-14 14-14 14 6.3 14 14-6.3 14-14 14z" />
        <rect x="12" y="12" width="24" height="24" rx="6" ry="6" fill="url(#instagram_grad)" />
        <path fill="#fff" d="M24 16c-4.4 0-8 3.6-8 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4zm10.4-10.4c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z" />
    </svg>
);

const WhatsAppLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%">
        <path fill="#25D366" d="M24 4C13 4 4 13 4 24c0 3.9 1.1 7.6 3 10.8L4.2 44l9.5-2.5C16.6 43.1 20.2 44 24 44c11 0 20-9 20-20S35 4 24 4z" />
        <path fill="#FFF" d="M35.2 30.2c-.5-.2-2.7-1.3-3.1-1.5-.4-.2-.7-.3-1 .2-.3.4-1 1.3-1.3 1.5-.2.3-.5.3-1 .1-2.9-1.3-4.8-2.6-6.7-5.9-.2-.4 0-.8.4-1.2l.9-1.1c.2-.2.3-.6.1-.8-.1-.2-1-2.4-1.4-3.3-.4-.9-.8-.7-1.1-.7H19c-.4 0-1 .1-1.5.7-1.9 2-1.9 5.3 0 7.2 2.7 3.9 7 8 13.9 9.8 4.6 1.2 5.5 1 6.3.9.9-.1 2.7-1.1 3-2.2.4-1.1.4-2 .3-2.2-.1-.1-.3-.2-.8-.4z" />
    </svg>
);

// REFINED: Standard SVG to match others
const WebsiteLogo = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 48 48" width="100%" height="100%">
        <circle fill="#3B82F6" cx="24" cy="24" r="24" />
        <circle cx="24" cy="24" r="16" stroke="#FFF" strokeWidth="3" fill="none" />
        <path d="M7.9 24h32.2M24 7.9C20 12 18 18 18 24s2 12 6 16.1M24 7.9C28 12 30 18 30 24s-2 12-6 16.1" stroke="#FFF" strokeWidth="3" fill="none" />
    </svg>
)

const TicketIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5.5C3 4.11929 4.11929 3 5.5 3H18.5C19.8807 3 21 4.11929 21 5.5V18.5C21 19.8807 19.8807 21 18.5 21H5.5C4.11929 21 3 19.8807 3 18.5V5.5Z" className="text-amber-500" stroke="none" fill="rgba(245, 158, 11, 0.2)" />
        <path d="M13 3L13 21" stroke="currentColor" strokeDasharray="4 4" className="text-amber-400" />
        <circle cx="8" cy="12" r="2" className="text-amber-400" fill="currentColor" />
        <path d="M3 5.5C3 4.11929 4.11929 3 5.5 3H18.5C19.8807 3 21 4.11929 21 5.5V18.5C21 19.8807 19.8807 21 18.5 21H5.5C4.11929 21 3 19.8807 3 18.5V5.5Z" stroke="currentColor" className="text-amber-400" />
    </svg>
)

const Connect = () => {
    const links = useMemo(() => [
        {
            id: 'maps',
            label: 'Visit Us',
            subLabel: 'Google Maps',
            Icon: GoogleMapsLogo,
            url: 'https://maps.app.goo.gl/5AE3yZ6ry1mntPsM7',
            borderColor: 'group-hover:border-red-500/50',
            bgHover: 'group-hover:bg-red-500/10'
        },
        {
            id: 'website',
            label: 'Official Website',
            subLabel: 'icstconnect.in',
            Icon: WebsiteLogo,
            url: 'https://icstconnect.in',
            borderColor: 'group-hover:border-blue-500/50',
            bgHover: 'group-hover:bg-blue-500/10'
        },
        {
            id: 'facebook',
            label: 'Facebook',
            subLabel: '@icstconnect',
            Icon: FacebookLogo,
            url: 'https://www.facebook.com/icstconnect',
            borderColor: 'group-hover:border-blue-600/50',
            bgHover: 'group-hover:bg-blue-600/10'
        },
        {
            id: 'instagram',
            label: 'Instagram',
            subLabel: '@icstconnect',
            Icon: InstagramLogo,
            url: 'https://www.instagram.com/icstconnect/',
            borderColor: 'group-hover:border-pink-500/50',
            bgHover: 'group-hover:bg-pink-500/10'
        },
        {
            id: 'whatsapp',
            label: 'WhatsApp',
            subLabel: 'Chat with us',
            Icon: WhatsAppLogo,
            url: 'https://wa.me/8158031706',
            borderColor: 'group-hover:border-green-500/50',
            bgHover: 'group-hover:bg-green-500/10'
        }
    ], []);

    const handleClaimDiscount = () => {
        // Will be linked later
        console.log("Claim Discount clicked");
    };

    return (
        <div className="min-h-screen w-full bg-[#0f172a] text-white flex flex-col items-center justify-center py-2 px-4 relative overflow-hidden font-sans">

            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Main Content Container - Compact max-width for aesthetic appeal */}
            <div className="w-full max-w-[340px] z-10 flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">

                {/* Branding Section */}
                <div className="flex flex-col items-center text-center gap-2 mb-1">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-md opacity-40 group-hover:opacity-60 transition duration-500"></div>
                        <img
                            src={logo}
                            alt="ICST Logo"
                            className="relative w-24 h-24 rounded-full border-[3px] border-[#0f172a] shadow-xl object-cover transform transition duration-500 hover:scale-105"
                        />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-200 tracking-tight">
                            ICST Connect
                        </h1>
                        <p className="text-slate-400 text-[10px] font-bold tracking-[0.2em] uppercase mt-0.5">
                            Education • Technology • Future
                        </p>
                    </div>
                </div>

                {/* Claim Discount Button */}
                <button
                    onClick={handleClaimDiscount}
                    className="w-full group relative overflow-hidden rounded-xl p-[1px] shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-transform"
                >
                    {/* Spinning Gradient Border - ENLARGED to cover corners */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_60deg,#f59e0b_120deg,transparent_180deg,transparent_360deg)] animate-[spin_4s_linear_infinite]" />

                    {/* Button Content */}
                    <div className="relative w-full bg-[#1e293b] rounded-[11px] p-3 flex items-center justify-center gap-3 border border-amber-500/20 group-hover:bg-[#1e293b]/90 transition-colors">
                        <div className="p-1.5 bg-amber-500/10 rounded-md">
                            <TicketIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold bg-gradient-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider">
                            Claim 10% Discount
                        </span>
                    </div>
                </button>

                {/* Links Stack */}
                <div className="w-full flex flex-col gap-2.5 mt-1">
                    {links.map((link, index) => (
                        <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative flex items-center p-3 rounded-xl bg-[#1e293b]/50 backdrop-blur-sm border border-white/5 transition-all duration-300 hover:border-transparent hover:scale-[1.01] active:scale-[0.99] ${link.bgHover}`}
                            style={{ animationDelay: `${index * 75}ms` }}
                        >
                            {/* Hover Border Effect */}
                            <div className={`absolute inset-0 rounded-xl border opacity-0 ${link.borderColor} transition-opacity duration-300`}></div>

                            {/* Icon - INCREASED SIZE: w-11 h-11, p-0.5 to make logos large */}
                            <div className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-[#0f172a]/50 rounded-full border border-white/5 shadow-sm p-0.5">
                                <link.Icon className="w-full h-full" />
                            </div>

                            {/* Text */}
                            <div className="ml-3 flex flex-col">
                                <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">
                                    {link.label}
                                </span>
                                <span className="text-[10px] text-gray-500 font-medium group-hover:text-gray-400 transition-colors">
                                    {link.subLabel}
                                </span>
                            </div>

                            {/* Arrow */}
                            <ExternalLink size={14} className="ml-auto text-gray-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                        </a>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-4 text-[10px] text-slate-600 font-medium tracking-wide">
                    © {new Date().getFullYear()} ICST Connect
                </div>

            </div>
        </div>
    );
};

export default Connect;
