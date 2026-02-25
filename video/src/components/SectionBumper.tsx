import React from 'react';
import { interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface SectionBumperProps {
    partNumber: string;
    partTitle: string;
    color?: string;
}

export const SectionBumper: React.FC<SectionBumperProps> = ({
    partNumber,
    partTitle,
    color = '#f0ad4e',
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const lineWidth = spring({ frame, fps, from: 0, to: 400, durationInFrames: 30, config: { damping: 12 } });
    const partOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 50, to: 0, durationInFrames: 40, delay: 10, config: { damping: 14 } });
    const titleOpacity = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: 'clamp' });

    // Cinematic slow zoom
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.15], { extrapolateRight: 'clamp' });
    const pan = interpolate(frame, [0, durationInFrames], [0, 20], { extrapolateRight: 'clamp' });

    // Fade out
    const fadeOutOpacity = interpolate(
        frame,
        [durationInFrames - 15, durationInFrames],
        [1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );

    return (
        <div style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#030609',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* Background kinetic texture */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(circle at center, rgba(13,27,42,1) 0%, rgba(3,6,9,1) 100%)',
                transform: `scale(${scale}) translateX(${pan}px)`,
                zIndex: 0,
            }}>
                <div style={{ width: '100%', height: '100%', opacity: 0.05, backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />
            </div>

            <div style={{ textAlign: 'center', zIndex: 1, padding: '0 100px' }}>
                <p style={{
                    color,
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: 12,
                    textTransform: 'uppercase',
                    margin: '0 0 24px 0',
                    opacity: partOpacity,
                    textShadow: `0 0 20px ${color}`,
                }}>
                    {partNumber}
                </p>
                <div style={{
                    width: lineWidth,
                    height: 2,
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    margin: '0 auto 40px',
                }} />
                <h2 style={{
                    color: '#ffffff',
                    fontSize: 96,
                    fontWeight: 900,
                    margin: 0,
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    letterSpacing: '-2px',
                    textShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    lineHeight: 1.1,
                }}>
                    {partTitle}
                </h2>
            </div>
        </div>
    );
};
