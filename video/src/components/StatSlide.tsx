import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, spring, AbsoluteFill, Img, staticFile } from 'remotion';

interface StatSlideProps {
    stat: string;
    description: string;
    bgImage?: string;
}

export const StatSlide: React.FC<StatSlideProps> = ({
    stat,
    description,
    bgImage = 'bg_demographics.jpg'
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Cinematic slow zoom for background
    const bgScale = interpolate(frame, [0, durationInFrames], [1.05, 1.15], { extrapolateRight: 'clamp' });

    // Entrance animations
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
    const statScale = spring({ frame, fps, from: 0.5, to: 1, durationInFrames: 50, config: { damping: 12 } });

    const descOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp' });
    const descY = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 40 });

    // Fade out
    const fadeOutOpacity = interpolate(
        frame,
        [durationInFrames - 15, durationInFrames],
        [1, 0],
        { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' }
    );

    return (
        <AbsoluteFill style={{
            backgroundColor: '#050a0f',
            fontFamily: '"Inter", "Helvetica Neue", sans-serif',
            opacity: fadeOutOpacity,
            overflow: 'hidden',
        }}>
            {/* 1. Cinematic Background */}
            <div style={{
                position: 'absolute',
                top: -50, left: -50, right: -50, bottom: -50,
                transform: `scale(${bgScale})`,
                zIndex: 0,
            }}>
                <Img
                    src={staticFile(`images/${bgImage}`)}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.4,
                    }}
                />
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    background: 'radial-gradient(circle at center, rgba(5,10,15,0.4) 0%, rgba(5,10,15,0.95) 100%)',
                }} />
            </div>

            {/* 2. Content Layer */}
            <div style={{
                zIndex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0 100px',
                opacity,
            }}>
                <h1 style={{
                    color: '#f0ad4e',
                    fontSize: 220,
                    fontWeight: 900,
                    margin: 0,
                    letterSpacing: '-8px',
                    transform: `scale(${statScale})`,
                    textShadow: '0 20px 80px rgba(0,0,0,0.8), 0 0 30px rgba(240,173,78,0.3)',
                }}>
                    {stat}
                </h1>

                <div style={{
                    opacity: descOpacity,
                    transform: `translateY(${descY}px)`,
                    maxWidth: 900,
                    textAlign: 'center',
                    marginTop: -20,
                }}>
                    <p style={{
                        color: '#ffffff',
                        fontSize: 36,
                        fontWeight: 700,
                        lineHeight: 1.3,
                        margin: 0,
                        letterSpacing: '-0.5px',
                        textShadow: '0 5px 15px rgba(0,0,0,0.8)',
                    }}>
                        {description}
                    </p>
                </div>
            </div>
        </AbsoluteFill>
    );
};
