import { useEffect, useRef, useState, useCallback } from 'react'
import { IconChevronLeft, IconChevronRight, IconExternalLink } from '@tabler/icons-react'
import { ThinkingOrb } from 'thinking-orbs'
import labPortalImg from '../../assets/labs/lab-portal.webp'
import labFormEntryImg from '../../assets/labs/lab-form-entry.webp'
import labExcelLedgerImg from '../../assets/labs/lab-excel-ledger.webp'
import labStreamDispatchImg from '../../assets/labs/lab-stream-dispatch.webp'
import labFileExplorerImg from '../../assets/labs/lab-file-explorer.webp'
import labTypingKeysImg from '../../assets/labs/lab-typing-keys.webp'
import labFingerGuideImg from '../../assets/labs/lab-finger-guide.webp'
import labCourierRunnerImg from '../../assets/labs/lab-courier-runner.webp'
import { prefersReducedMotion } from '../../lib/motion'

export interface LabSlide {
    id: string
    category: string
    title: string
    alt: string
    image: string
    width: number
    height: number
}

const LAB_SLIDES: LabSlide[] = [
    {
        id: 'portal',
        category: 'ICST LAB PORTAL · INTERACTIVE SUITE',
        title: 'All-in-One Office & Typing Hub',
        alt: 'ICST Lab interactive simulation portal featuring typing preview and 6 office simulators',
        image: labPortalImg,
        width: 760,
        height: 422
    },
    {
        id: 'form-entry',
        category: 'DATA ENTRY · PRACTICE LAB',
        title: 'Student Registration Form Simulator',
        alt: 'ICST Lab student registration data entry simulation with reference dossier and form validation',
        image: labFormEntryImg,
        width: 760,
        height: 390
    },
    {
        id: 'excel-ledger',
        category: 'EXCEL 365 · MASS DATA LAB',
        title: 'Spreadsheet Ledger Verification',
        alt: 'ICST Lab Excel 365 spreadsheet simulation showing student admission ledger verification',
        image: labExcelLedgerImg,
        width: 760,
        height: 399
    },
    {
        id: 'stream-dispatch',
        category: 'STREAM DISPATCH · AUDIT LAB',
        title: 'Treasury Challan & e-Receipt Entry',
        alt: 'ICST Lab high-speed heads-down treasury challan clearing stream simulation',
        image: labStreamDispatchImg,
        width: 760,
        height: 364
    },
    {
        id: 'file-explorer',
        category: 'OS & FILE LAB · AI GUIDED',
        title: 'Windows File Explorer Workspace',
        alt: 'ICST Lab interactive file explorer simulation with bilingual Data AI Assistant guidance',
        image: labFileExplorerImg,
        width: 760,
        height: 538
    },
    {
        id: 'typing-keys',
        category: 'TOUCH TYPING · LEVEL 1',
        title: 'Interactive Home Row Key Guide',
        alt: 'ICST Lab interactive touch typing level with glowing finger placement highlights',
        image: labTypingKeysImg,
        width: 760,
        height: 497
    },
    {
        id: 'finger-guide',
        category: 'FINGER PLACEMENT · TRAINER',
        title: 'Color-Coded Hand Alignment',
        alt: 'ICST Lab pre-session hand and finger placement trainer on home row keys',
        image: labFingerGuideImg,
        width: 760,
        height: 602
    },
    {
        id: 'courier-runner',
        category: 'ARCADE TYPING · STAGE 1/25',
        title: 'Courier Runner Speed Challenge',
        alt: 'ICST Lab Courier Runner gamified typing speed simulation at Stage 1 of 25',
        image: labCourierRunnerImg,
        width: 760,
        height: 508
    }
]

const TOTAL_SLIDES = LAB_SLIDES.length
const STEP_ANGLE = (Math.PI * 2) / TOTAL_SLIDES

function normalizeAngleDiff(angle: number): number {
    let diff = angle % (Math.PI * 2)
    if (diff > Math.PI) diff -= Math.PI * 2
    if (diff < -Math.PI) diff += Math.PI * 2
    return diff
}

function getIndexFromAngle(angle: number): number {
    const raw = Math.round(-angle / STEP_ANGLE)
    return ((raw % TOTAL_SLIDES) + TOTAL_SLIDES) % TOTAL_SLIDES
}

const OrbitalLabCarousel = () => {
    const stageRef = useRef<HTMLDivElement>(null)
    const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
    const scrimRefs = useRef<(HTMLDivElement | null)[]>([])

    const stageSizeRef = useRef({ width: 680, height: 340 })
    const currentAngleRef = useRef(0)
    const targetAngleRef = useRef(0)
    const velocityRef = useRef(0)
    const lastActiveRef = useRef(0)
    const isPausedRef = useRef(false)
    const isDraggingRef = useRef(false)
    const dragStartXRef = useRef(0)
    const dragStartAngleRef = useRef(0)
    const dragMovedRef = useRef(false)
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number | null>(null)
    const holdStateRef = useRef<{
        direction: 1 | -1
        pressedAt: number
        spinning: boolean
    } | null>(null)
    const isCoastingRef = useRef(false)
    const suppressNextClickRef = useRef(false)
    const isInViewRef = useRef(true)

    const [activeIndex, setActiveIndex] = useState(0)
    const [isStageInView, setIsStageInView] = useState(true)
    const [holdingDirection, setHoldingDirection] = useState<1 | -1 | null>(null)

    const applyOrbitPositions = useCallback((angle: number) => {
        const { width } = stageSizeRef.current
        const isCompact = width < 480
        const cardW = Math.min(340, Math.max(198, width * (isCompact ? 0.57 : 0.49)))
        const radiusX = width * (isCompact ? 0.25 : 0.285)
        const radiusY = isCompact ? 34 : 48

        for (let i = 0; i < TOTAL_SLIDES; i++) {
            const el = cardRefs.current[i]
            if (!el) continue

            const theta = angle + i * STEP_ANGLE
            const cosT = Math.cos(theta)
            const sinT = Math.sin(theta)
            const depth = (cosT + 1) / 2 // 1 = front center, 0 = back center

            const x = sinT * radiusX
            const y = cosT * radiusY - radiusY * 0.22
            const scale = 0.50 + 0.50 * Math.pow(depth, 1.85)
            const zIndex = Math.round(depth * 100) + 1
            const opacity = 0.62 + 0.38 * depth

            el.style.width = `${cardW}px`
            el.style.transform = `translate3d(calc(-50% + ${x.toFixed(2)}px), calc(-50% + ${y.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`
            el.style.zIndex = String(zIndex)
            el.style.opacity = opacity.toFixed(3)

            const scrim = scrimRefs.current[i]
            if (scrim) {
                scrim.style.opacity = (0.44 * (1 - depth)).toFixed(3)
            }
        }
    }, [])

    useEffect(() => {
        const stage = stageRef.current
        if (!stage) return

        const updateStageSize = () => {
            const rect = stage.getBoundingClientRect()
            if (rect.width > 0) {
                stageSizeRef.current = { width: rect.width, height: rect.height }
                applyOrbitPositions(currentAngleRef.current)
            }
        }

        updateStageSize()
        const ro = new ResizeObserver(updateStageSize)
        ro.observe(stage)

        const io = new IntersectionObserver(
            ([entry]) => {
                const visible = entry.isIntersecting
                isInViewRef.current = visible
                setIsStageInView(visible)
            },
            { rootMargin: '120px 0px', threshold: 0 }
        )
        io.observe(stage)

        return () => {
            ro.disconnect()
            io.disconnect()
        }
    }, [applyOrbitPositions])

    useEffect(() => {
        if (!isStageInView) {
            lastTimeRef.current = null
            return
        }
        const reduced = prefersReducedMotion()

        const tick = (now: number) => {
            if (lastTimeRef.current === null) lastTimeRef.current = now
            const dt = Math.min(0.05, Math.max(0.001, (now - lastTimeRef.current) / 1000))
            lastTimeRef.current = now

            const hold = holdStateRef.current

            if (hold) {
                const heldMs = now - hold.pressedAt
                if (!reduced && heldMs >= 180) {
                    if (!hold.spinning) {
                        hold.spinning = true
                        suppressNextClickRef.current = true
                        setHoldingDirection(hold.direction)
                    }
                    const elapsed = (heldMs - 180) / 1000
                    // Progressive turbo spin: ramps from 3.4 rad/s up to 24 rad/s the longer it is held
                    const spinSpeed = 3.4 + Math.min(20.6, elapsed * 5.6 + elapsed * elapsed * 2.4)
                    velocityRef.current = -hold.direction * spinSpeed
                    currentAngleRef.current += velocityRef.current * dt
                    targetAngleRef.current = currentAngleRef.current
                }
            } else if (isCoastingRef.current) {
                velocityRef.current *= Math.exp(-3.4 * dt)
                currentAngleRef.current += velocityRef.current * dt

                if (Math.abs(velocityRef.current) <= 3.2) {
                    isCoastingRef.current = false
                    const projectedAngle = currentAngleRef.current + velocityRef.current * 0.14
                    targetAngleRef.current = Math.round(projectedAngle / STEP_ANGLE) * STEP_ANGLE
                }
            } else if (!isDraggingRef.current) {
                if (reduced) {
                    currentAngleRef.current = targetAngleRef.current
                    velocityRef.current = 0
                } else {
                    const displacement = targetAngleRef.current - currentAngleRef.current
                    const stiffness = 120
                    const damping = 22
                    const acceleration = stiffness * displacement - damping * velocityRef.current
                    velocityRef.current += acceleration * dt
                    currentAngleRef.current += velocityRef.current * dt

                    if (Math.abs(displacement) < 0.0005 && Math.abs(velocityRef.current) < 0.0005) {
                        currentAngleRef.current = targetAngleRef.current
                        velocityRef.current = 0
                    }
                }
            }

            applyOrbitPositions(currentAngleRef.current)

            const nearest = getIndexFromAngle(currentAngleRef.current)
            if (nearest !== lastActiveRef.current) {
                lastActiveRef.current = nearest
                setActiveIndex(nearest)
            }

            rafRef.current = requestAnimationFrame(tick)
        }

        rafRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
        }
    }, [applyOrbitPositions, isStageInView])

    const stopHoldSpin = useCallback(() => {
        const hold = holdStateRef.current
        if (!hold) return
        holdStateRef.current = null
        setHoldingDirection(null)

        if (hold.spinning) {
            isCoastingRef.current = true
        }
    }, [])

    useEffect(() => {
        window.addEventListener('pointerup', stopHoldSpin)
        window.addEventListener('pointercancel', stopHoldSpin)
        window.addEventListener('blur', stopHoldSpin)
        return () => {
            window.removeEventListener('pointerup', stopHoldSpin)
            window.removeEventListener('pointercancel', stopHoldSpin)
            window.removeEventListener('blur', stopHoldSpin)
        }
    }, [stopHoldSpin])

    const orbitToIndex = useCallback((index: number) => {
        isCoastingRef.current = false
        const desired = -index * STEP_ANGLE
        const delta = normalizeAngleDiff(desired - targetAngleRef.current)
        targetAngleRef.current += delta
    }, [])

    const stepOrbit = useCallback((direction: 1 | -1) => {
        isCoastingRef.current = false
        targetAngleRef.current -= direction * STEP_ANGLE
    }, [])

    const getControlButtonProps = (direction: 1 | -1) => ({
        onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return
            suppressNextClickRef.current = false
            isCoastingRef.current = false
            holdStateRef.current = {
                direction,
                pressedAt: performance.now(),
                spinning: false
            }
        },
        onPointerUp: stopHoldSpin,
        onPointerCancel: stopHoldSpin,
        onContextMenu: (e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault(),
        onClick: () => {
            if (suppressNextClickRef.current) {
                suppressNextClickRef.current = false
                return
            }
            stepOrbit(direction)
        }
    })

    useEffect(() => {
        if (prefersReducedMotion() || !isStageInView) return
        const interval = setInterval(() => {
            if (
                isInViewRef.current &&
                !isPausedRef.current &&
                !isDraggingRef.current &&
                !holdStateRef.current &&
                !isCoastingRef.current
            ) {
                stepOrbit(1)
            }
        }, 4000)
        return () => clearInterval(interval)
    }, [stepOrbit, isStageInView])

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return
        isCoastingRef.current = false
        isDraggingRef.current = true
        dragMovedRef.current = false
        dragStartXRef.current = e.clientX
        dragStartAngleRef.current = currentAngleRef.current
        velocityRef.current = 0
    }

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current) return
        const dx = e.clientX - dragStartXRef.current
        if (Math.abs(dx) > 6) dragMovedRef.current = true
        const sensitivity = 0.0055
        const nextAngle = dragStartAngleRef.current + dx * sensitivity
        currentAngleRef.current = nextAngle
        targetAngleRef.current = nextAngle
    }

    const handlePointerUp = () => {
        if (!isDraggingRef.current) return
        isDraggingRef.current = false
        const nearestStep = Math.round(currentAngleRef.current / STEP_ANGLE)
        targetAngleRef.current = nearestStep * STEP_ANGLE
    }

    const handleCardClick = (index: number) => {
        if (dragMovedRef.current) return
        if (index === activeIndex) {
            window.open('https://labs.icstconnect.in', '_blank', 'noopener,noreferrer')
            return
        }
        orbitToIndex(index)
    }

    const activeSlide = LAB_SLIDES[activeIndex]
    const [loadedSlides, setLoadedSlides] = useState<Record<string, boolean>>({})
    const slideImgRefs = useRef<Record<string, HTMLImageElement | null>>({})

    const markSlideLoaded = (id: string) => {
        setLoadedSlides((prev) => (prev[id] ? prev : { ...prev, [id]: true }))
    }

    useEffect(() => {
        Object.entries(slideImgRefs.current).forEach(([id, el]) => {
            if (el?.complete && el.naturalWidth > 0) {
                markSlideLoaded(id)
            }
        })
    }, [])

    return (
        <div
            className="w-full flex flex-col items-center select-none"
            onMouseEnter={() => { isPausedRef.current = true }}
            onMouseLeave={() => {
                isPausedRef.current = false
                handlePointerUp()
            }}
            onFocusCapture={() => { isPausedRef.current = true }}
            onBlurCapture={() => { isPausedRef.current = false }}
        >
            {/* 3D Orbital Stage */}
            <div
                ref={stageRef}
                role="region"
                aria-roledescription="carousel"
                aria-label="ICST Labs interactive simulations showcase"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                        e.preventDefault()
                        stepOrbit(1)
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault()
                        stepOrbit(-1)
                    }
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                className="relative w-full h-[250px] sm:h-[310px] lg:h-[340px] flex items-center justify-center cursor-grab active:cursor-grabbing touch-pan-y focus:outline-none"
            >
                {/* Soft radial pedestal shadow under the center hero card */}
                <div
                    className="absolute bottom-3 left-1/2 -translate-x-1/2 w-[56%] h-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(37,114,171,0.18)_0%,rgba(15,23,42,0.06)_50%,transparent_75%)] blur-md pointer-events-none"
                    aria-hidden="true"
                />

                {LAB_SLIDES.map((slide, idx) => {
                    const isActive = idx === activeIndex
                    const slideLoaded = Boolean(loadedSlides[slide.id])
                    return (
                        <button
                            key={slide.id}
                            ref={(el) => { cardRefs.current[idx] = el }}
                            type="button"
                            onClick={() => handleCardClick(idx)}
                            aria-label={isActive ? `${slide.title} — click to launch ICST Labs` : `Show ${slide.title}`}
                            aria-current={isActive ? 'true' : undefined}
                            className={`absolute left-1/2 top-1/2 aspect-[16/10] rounded-2xl overflow-hidden bg-white p-0 cursor-pointer will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2572AB] transition-[box-shadow,border-color] duration-300 ${isActive
                                ? 'border-2 border-[#2572AB]/35 shadow-[0_28px_56px_-18px_rgba(15,23,42,0.28),0_10px_24px_-10px_rgba(37,114,171,0.28)]'
                                : 'border border-slate-200/90 shadow-[0_14px_30px_-14px_rgba(15,23,42,0.18)]'
                                }`}
                        >
                            {!slideLoaded && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#F8FAFC] pointer-events-none">
                                    <ThinkingOrb
                                        state="composing"
                                        size={32}
                                        theme="light"
                                        color="#2572AB"
                                        aria-label={`Loading ${slide.title}`}
                                    />
                                </div>
                            )}
                            <img
                                ref={(el) => {
                                    slideImgRefs.current[slide.id] = el
                                }}
                                src={slide.image}
                                alt={slide.alt}
                                width={slide.width}
                                height={slide.height}
                                loading="lazy"
                                decoding="async"
                                draggable={false}
                                onLoad={() => markSlideLoaded(slide.id)}
                                onError={() => markSlideLoaded(slide.id)}
                                className={`w-full h-full object-cover ${slide.id === 'finger-guide' ? 'object-center' : 'object-top'} block pointer-events-none transition-opacity duration-300 ${slideLoaded ? 'opacity-100' : 'opacity-0'
                                    }`}
                            />
                            {/* Atmospheric depth haze for background cards on light background */}
                            <div
                                ref={(el) => { scrimRefs.current[idx] = el }}
                                className="absolute inset-0 bg-[#F4F8FD] pointer-events-none"
                                style={{ opacity: 0 }}
                                aria-hidden="true"
                            />
                        </button>
                    )
                })}
            </div>

            {/* Active Caption & Smooth Controls */}
            <div className="mt-2 sm:mt-3 flex flex-col items-center text-center px-2">
                <div key={activeSlide.id} className="animate-in fade-in duration-200">
                    <div className="text-xs font-medium text-[#2572AB] mb-1">
                        {activeSlide.category}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#0F172A] tracking-tight mb-3">
                        {activeSlide.title}
                    </h3>
                </div>

                {/* Controls + Direct Lab Link */}
                <div className="inline-flex items-center gap-2.5 p-1.5 rounded-full bg-[#FFFFFF] border border-slate-200/90 shadow-xs">
                    <button
                        type="button"
                        {...getControlButtonProps(-1)}
                        aria-label="Previous lab preview (hold to spin)"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-150 cursor-pointer touch-none ${holdingDirection === -1
                            ? 'bg-[#2572AB] text-white border-[#2572AB] ring-2 ring-[#2572AB]/25'
                            : 'bg-slate-50 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2572AB] border-slate-200/80'
                            }`}
                    >
                        <IconChevronLeft size={16} aria-hidden="true" />
                    </button>

                    <div className="flex items-center gap-1.5 px-1" role="tablist" aria-label="Select lab slide">
                        {LAB_SLIDES.map((slide, idx) => {
                            const selected = idx === activeIndex
                            return (
                                <button
                                    key={slide.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={selected}
                                    aria-label={`View ${slide.title}`}
                                    onClick={() => orbitToIndex(idx)}
                                    className={`h-2 rounded-full transition-[width,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${selected
                                        ? 'w-6 bg-[#2572AB]'
                                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                                        }`}
                                />
                            )
                        })}
                    </div>

                    <button
                        type="button"
                        {...getControlButtonProps(1)}
                        aria-label="Next lab preview (hold to spin faster)"
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors duration-150 cursor-pointer touch-none ${holdingDirection === 1
                            ? 'bg-[#2572AB] text-white border-[#2572AB] ring-2 ring-[#2572AB]/25'
                            : 'bg-slate-50 hover:bg-[#EFF6FF] text-[#0F172A] hover:text-[#2572AB] border-slate-200/80'
                            }`}
                    >
                        <IconChevronRight size={16} aria-hidden="true" />
                    </button>

                    <a
                        href="https://labs.icstconnect.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:inline-flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full bg-[#EFF6FF] hover:bg-[#2572AB] text-[#2572AB] hover:text-white text-xs font-medium border border-[#BFDBFE]/80 transition-colors duration-150 no-underline"
                    >
                        <span>Open Lab</span>
                        <IconExternalLink size={12} aria-hidden="true" />
                    </a>
                </div>
            </div>
        </div>
    )
}

export default OrbitalLabCarousel
