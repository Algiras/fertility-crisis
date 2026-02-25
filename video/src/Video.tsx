import React from 'react';
import { AbsoluteFill, Sequence, Audio, useCurrentFrame, interpolate, staticFile } from 'remotion';

// Import our generated dynamic timing script
import script from '../data/script.json';

// Import our Slide Components
import { SectionBumper } from './components/SectionBumper';
import { ChartSlide } from './components/ChartSlide';
import { QuoteSlide } from './components/QuoteSlide';
import { CreditsSlide } from './components/CreditsSlide';
import { TitleCard } from './components/TitleCard';

export const FertilityCrisisVideo: React.FC = () => {
    return (
        <AbsoluteFill style={{ background: '#0d1b2a' }}>
            {/* Global background music bed */}
            <Audio
                src={staticFile('audio/bgm.wav')}
                volume={0.07}
                loop
            />

            {script.map((chapter) => {
                if (chapter.id === 'intro') {
                    const slide = chapter.subSlides[0] as any;
                    return (
                        <Sequence key="intro" from={chapter.globalStart} durationInFrames={chapter.duration}>
                            {slide.audioSrc && <Audio src={staticFile(slide.audioSrc)} />}
                            <SlideRenderer slide={slide} />
                        </Sequence>
                    );
                }

                if (chapter.id === 'credits') {
                    const slide = chapter.subSlides[0] as any;
                    return (
                        <Sequence key="credits" from={chapter.globalStart} durationInFrames={chapter.duration}>
                            {slide.audioSrc && <Audio src={staticFile(slide.audioSrc)} />}
                            <CreditsSlide />
                        </Sequence>
                    );
                }

                return (
                    <Sequence key={chapter.id} from={chapter.globalStart} durationInFrames={chapter.duration}>
                        <ChapterSegment chapter={chapter} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

const ChapterSegment: React.FC<{ chapter: any }> = ({ chapter }) => {
    return (
        <AbsoluteFill style={{ background: '#0d1b2a', position: 'relative' }}>
            {/* Render carefully timed Sub-Slides synced exactly to the chunk length */}
            {chapter.subSlides.map((slide: any, idx: number) => {
                return (
                    <Sequence key={idx} from={slide.start} durationInFrames={slide.duration}>
                        {slide.chunk_id && slide.audio_exists ? (
                            <Audio src={staticFile(`audio/chunks/${slide.chunk_id}.wav`)} />
                        ) : null}
                        {slide.audioSrc ? (
                            <Audio src={staticFile(slide.audioSrc)} />
                        ) : null}
                        <SlideRenderer slide={slide} />
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};

const SlideRenderer: React.FC<{ slide: any }> = ({ slide }) => {
    switch (slide.type) {
        case 'intro':
            return <TitleCard />;

        case 'bumper':
            return <SectionBumper partNumber="CHAPTER" partTitle={slide.title} color="#f0ad4e" />;

        case 'chart':
            return <ChartSlide chartSrc={slide.chartSrc} title={slide.title} />;

        case 'quote':
            return <QuoteSlide quote={slide.text} bgImage={slide.bgImage} wordTimings={slide.wordTimings} />;

        case 'credits':
            return <CreditsSlide />;

        default:
            return null;
    }
};
