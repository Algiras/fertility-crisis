import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile } from 'remotion';

export const TitleCard: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    const coverOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 60, to: 0, durationInFrames: 50, config: { damping: 14 } });
    const titleOpacity = interpolate(frame, [20, 60], [0, 1], { extrapolateRight: 'clamp' });
    const subtitleOpacity = interpolate(frame, [40, 80], [0, 1], { extrapolateRight: 'clamp' });
    const authorOpacity = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: 'clamp' });

    // Cinematic slow zoom
    const scale = interpolate(frame, [0, durationInFrames], [1, 1.1], { extrapolateRight: 'clamp' });

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
            backgroundColor: '#020406',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            opacity: fadeOutOpacity,
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Deep cinematic background */}
            <div style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'radial-gradient(ellipse at center, rgba(13,27,42,0.8) 0%, rgba(2,4,6,1) 80%)',
                transform: `scale(${scale})`,
                zIndex: 0,
            }} />

            <div style={{ opacity: coverOpacity, marginBottom: 60, zIndex: 1, transform: `translateY(${titleY / 2}px)` }}>
                <Img
                    src={staticFile('cover.png')}
                    style={{ width: 280, borderRadius: 12, boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}
                />
            </div>

            <div style={{ opacity: titleOpacity, transform: `translateY(${titleY}px)`, textAlign: 'center', zIndex: 1 }}>
                <h1 style={{
                    color: '#ffffff',
                    fontSize: 88,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-3px',
                    lineHeight: 1.05,
                    textTransform: 'uppercase',
                    textShadow: '0 20px 40px rgba(0,0,0,0.9)',
                }}>
                    The Male<br />Fertility Crisis
                </h1>
            </div>

            <div style={{ opacity: subtitleOpacity, marginTop: 30, zIndex: 1 }}>
                <p style={{
                    color: '#a0b0c0',
                    fontSize: 26,
                    margin: 0,
                    fontWeight: 300,
                    letterSpacing: 2,
                    textShadow: '0 10px 20px rgba(0,0,0,0.6)',
                }}>
                    Epidemiological Trends · Etiological Mechanisms · The Silent Trauma
                </p>
            </div>

            <div style={{ opacity: authorOpacity, marginTop: 50, zIndex: 1 }}>
                <p style={{ color: '#f0ad4e', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: 4 }}>
                    ALGIMANTAS K. · 2026
                </p>
            </div>
        </div>
    );
};
