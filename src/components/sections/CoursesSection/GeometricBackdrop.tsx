interface GeoShape {
    id: string
    kind: 'hex' | 'triangle' | 'diamond' | 'ring' | 'square' | 'cross'
    xPct: number
    yPct: number
    size: number
    duration: string
    delay: string
    variant: 'driftA' | 'driftB' | 'driftC'
    color: string
}

const GEO_SHAPES: GeoShape[] = [
    {
        id: 'hex-tl',
        kind: 'hex',
        xPct: 9,
        yPct: 20,
        size: 64,
        duration: '24s',
        delay: '0s',
        variant: 'driftA',
        color: 'rgba(37, 114, 171, 0.20)'
    },
    {
        id: 'ring-tr',
        kind: 'ring',
        xPct: 87,
        yPct: 18,
        size: 80,
        duration: '28s',
        delay: '-5s',
        variant: 'driftB',
        color: 'rgba(14, 165, 233, 0.22)'
    },
    {
        id: 'diamond-mid-l',
        kind: 'diamond',
        xPct: 27,
        yPct: 58,
        size: 56,
        duration: '22s',
        delay: '-3s',
        variant: 'driftC',
        color: 'rgba(79, 70, 229, 0.18)'
    },
    {
        id: 'tri-top-c',
        kind: 'triangle',
        xPct: 52,
        yPct: 24,
        size: 52,
        duration: '26s',
        delay: '-8s',
        variant: 'driftB',
        color: 'rgba(5, 150, 105, 0.18)'
    },
    {
        id: 'sq-mid-r',
        kind: 'square',
        xPct: 68,
        yPct: 56,
        size: 68,
        duration: '27s',
        delay: '-11s',
        variant: 'driftA',
        color: 'rgba(37, 114, 171, 0.19)'
    },
    {
        id: 'hex-bl',
        kind: 'hex',
        xPct: 15,
        yPct: 84,
        size: 70,
        duration: '30s',
        delay: '-6s',
        variant: 'driftC',
        color: 'rgba(79, 70, 229, 0.16)'
    },
    {
        id: 'tri-br',
        kind: 'triangle',
        xPct: 89,
        yPct: 78,
        size: 60,
        duration: '23s',
        delay: '-4s',
        variant: 'driftA',
        color: 'rgba(217, 119, 6, 0.18)'
    },
    {
        id: 'cross-mid',
        kind: 'cross',
        xPct: 43,
        yPct: 75,
        size: 28,
        duration: '20s',
        delay: '-2s',
        variant: 'driftB',
        color: 'rgba(100, 116, 139, 0.24)'
    }
]

function renderGeoSvg(shape: GeoShape) {
    const common = {
        stroke: shape.color,
        strokeWidth: 1.25,
        fill: 'none'
    }

    switch (shape.kind) {
        case 'hex':
            return (
                <polygon
                    points="50,6 90,28 90,72 50,94 10,72 10,28"
                    strokeLinejoin="round"
                    {...common}
                />
            )
        case 'triangle':
            return (
                <polygon
                    points="50,10 92,84 8,84"
                    strokeLinejoin="round"
                    {...common}
                />
            )
        case 'diamond':
            return (
                <polygon
                    points="50,6 94,50 50,94 6,50"
                    strokeLinejoin="round"
                    {...common}
                />
            )
        case 'ring':
            return (
                <>
                    <circle cx="50" cy="50" r="40" strokeDasharray="7 6" {...common} />
                    <circle cx="50" cy="50" r="22" stroke={shape.color} strokeWidth="1" fill="none" />
                </>
            )
        case 'square':
            return <rect x="14" y="14" width="72" height="72" rx="16" {...common} />
        case 'cross':
            return (
                <path
                    d="M50 16v68M16 50h68"
                    stroke={shape.color}
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    fill="none"
                />
            )
    }
}

const GeometricBackdrop = () => {
    return (
        <div
            className="absolute inset-0 overflow-hidden pointer-events-none select-none"
            aria-hidden="true"
        >
            {/* Pure CSS GPU-Composited Continuously Moving Line-Only Geometric Elements */}
            {GEO_SHAPES.map((shape) => (
                <div
                    key={shape.id}
                    style={{
                        left: `${shape.xPct}%`,
                        top: `${shape.yPct}%`,
                        width: shape.size,
                        height: shape.size,
                        animation: `icstGeo-${shape.variant} ${shape.duration} ease-in-out ${shape.delay} infinite`
                    }}
                    className="icst-geo-shape absolute -translate-x-1/2 -translate-y-1/2 motion-reduce:animate-none!"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
                        {renderGeoSvg(shape)}
                    </svg>
                </div>
            ))}

            <style>{`
                @keyframes icstGeo-driftA {
                    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                    50% { transform: translate3d(20px, -16px, 0) rotate(16deg); }
                }
                @keyframes icstGeo-driftB {
                    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                    50% { transform: translate3d(-22px, 14px, 0) rotate(-18deg); }
                }
                @keyframes icstGeo-driftC {
                    0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
                    50% { transform: translate3d(16px, 20px, 0) rotate(14deg); }
                }
                @media (prefers-reduced-motion: reduce) {
                    .icst-geo-shape { animation: none !important; }
                }
            `}</style>
        </div>
    )
}

export default GeometricBackdrop
