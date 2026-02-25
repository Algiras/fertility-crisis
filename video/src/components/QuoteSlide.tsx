import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig, Img, staticFile } from 'remotion';

interface WordTiming {
    word: string;
    start: number; // seconds
    end: number;
}

interface QuoteSlideProps {
    quote: string;
    attribution?: string;
    accentColor?: string;
    bgImage?: string;
    wordTimings?: WordTiming[] | null;
}

export const QuoteSlide: React.FC<QuoteSlideProps> = ({
    quote,
    attribution,
    accentColor = '#f0ad4e',
    bgImage,
    wordTimings,
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();
    const currentSec = frame / fps;

    // Dynamically scale font size so text always fits the frame.
    // Formula calibrated for 1400px text width, ~700px usable height at 30fps.
    // C=1150: at 320 chars → 64px (max), at 573 chars → 48px, at 900 chars → 38px (min).
    const fontSize = Math.max(36, Math.min(64, Math.round(1150 / Math.sqrt(quote.length))));

    // Full-bleed slow Ken Burns camera move
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.08], { extrapolateRight: 'clamp' });
    const panY = interpolate(frame, [0, durationInFrames], [0, -20], { extrapolateRight: 'clamp' });

    // Minimalist text entrance
    const textOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
    const textY = spring({ frame, fps, from: 30, to: 0, durationInFrames: 30, config: { damping: 12 } });

    // Add a quick cinematic fade out at the end so chunks don't hard cut
    const fadeOutOpacity = interpolate(
        frame,
        [durationInFrames - 10, durationInFrames],
        [1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );


    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#050a0f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            position: 'relative',
            overflow: 'hidden',
            opacity: fadeOutOpacity,
        }}>
            {/* 1. Full-Bleed Dynamic Background Element */}
            {bgImage && (
                <div style={{
                    position: 'absolute',
                    top: -50, left: -50, right: -50, bottom: -50, // Bleed edges for panning
                    transform: `scale(${scale}) translateY(${panY}px)`,
                    zIndex: 0,
                }}>
                    <Img
                        src={staticFile(`images/${bgImage}`)}
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                    {/* Heavy cinematic vignette & darkening overlay to make text pop instantly */}
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        background: 'radial-gradient(circle at center, rgba(5,10,15,0.4) 0%, rgba(5,10,15,0.95) 100%)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, width: '100%', height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)', // Global darkening
                    }} />
                </div>
            )}

            {/* 2. Bold, Minimal Typography Overlay */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0 150px',
                opacity: textOpacity,
                transform: `translateY(${textY}px)`,
                maxWidth: 1400,
            }}>
                {/* Subtle decorative accent */}
                <div style={{
                    width: 60, height: 4,
                    background: accentColor,
                    marginBottom: 40,
                    boxShadow: `0 0 20px ${accentColor}`
                }} />

                <h2 style={{
                    color: '#ffffff',
                    fontSize,
                    fontWeight: 800,
                    lineHeight: 1.3,
                    margin: 0,
                    textAlign: 'center',
                    letterSpacing: '-1px',
                    textShadow: '0 10px 30px rgba(0,0,0,0.8)',
                }}>
                    {wordTimings && wordTimings.length > 0
                        ? wordTimings.map((w, i) => {
                            const spoken = currentSec >= w.start;
                            const active = currentSec >= w.start && currentSec < w.end;
                            return (
                                <span key={i} style={{
                                    color: active ? accentColor : spoken ? '#ffffff' : 'rgba(255,255,255,0.35)',
                                    textShadow: active ? `0 0 30px ${accentColor}` : '0 10px 30px rgba(0,0,0,0.8)',
                                    transition: 'color 0.05s, text-shadow 0.05s',
                                }}>
                                    {w.word}{' '}
                                </span>
                            );
                        })
                        : quote
                    }
                </h2>

                {attribution && (
                    <p style={{
                        color: '#a0b0c0',
                        fontSize: 24,
                        fontWeight: 600,
                        letterSpacing: 4,
                        textTransform: 'uppercase',
                        marginTop: 60,
                    }}>
                        {attribution}
                    </p>
                )}
            </div>
        </div>
    );
};