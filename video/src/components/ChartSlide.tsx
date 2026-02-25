import React from 'react';
import { Img, interpolate, useCurrentFrame, useVideoConfig, spring, staticFile, AbsoluteFill } from 'remotion';

interface ChartSlideProps {
    chartSrc: string;
    title: string;
    source?: string;
    bgImage?: string; // Optional background image, otherwise uses a default
}

export const ChartSlide: React.FC<ChartSlideProps> = ({
    chartSrc,
    title,
    source,
    bgImage = 'bg_abstract.jpg'
}) => {
    const frame = useCurrentFrame();
    const { fps, durationInFrames } = useVideoConfig();

    // Cinematic slow zoom for background
    const bgScale = interpolate(frame, [0, durationInFrames], [1, 1.1], { extrapolateRight: 'clamp' });

    // Entrance animations for chart
    const chartOpacity = interpolate(frame, [10, 40], [0, 1], { extrapolateRight: 'clamp' });
    const chartScale = spring({ frame, fps, from: 0.8, to: 1, durationInFrames: 60, delay: 10, config: { damping: 12 } });

    const titleOpacity = interpolate(frame, [20, 50], [0, 1], { extrapolateRight: 'clamp' });
    const titleY = spring({ frame, fps, from: 20, to: 0, durationInFrames: 40, delay: 20 });

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
                    background: 'radial-gradient(circle at center, rgba(5,10,15,0.2) 0%, rgba(5,10,15,0.9) 100%)',
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
                padding: '60px 100px',
            }}>
                <div style={{
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textAlign: 'center',
                    marginBottom: 40,
                }}>
                    <h2 style={{
                        color: '#f0ad4e',
                        fontSize: 42,
                        fontWeight: 800,
                        margin: 0,
                        letterSpacing: -1,
                        textShadow: '0 4px 20px rgba(0,0,0,0.8)',
                    }}>
                        {title}
                    </h2>
                </div>

                <div style={{
                    opacity: chartOpacity,
                    transform: `scale(${chartScale})`,
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
                    maxWidth: 1000,
                    width: '100%',
                    border: '1px solid rgba(255,255,255,0.1)',
                }}>
                    <Img
                        src={staticFile(chartSrc)}
                        style={{
                            width: '100%',
                            display: 'block',
                            filter: 'brightness(1.1) contrast(1.1)',
                        }}
                    />
                </div>

                {source && (
                    <p style={{
                        opacity: titleOpacity,
                        color: '#7f8c8d',
                        fontSize: 18,
                        marginTop: 40,
                        fontStyle: 'italic',
                        fontWeight: 500,
                    }}>
                        Source: {source}
                    </p>
                )}
            </div>
        </AbsoluteFill>
    );
};
