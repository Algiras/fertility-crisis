import React from 'react';
import { Composition } from 'remotion';
import { FertilityCrisisVideo } from './Video';

// Import the dynamically generated script to calculate exact total frames
import script from '../data/script.json';

const FPS = 30;

// The final globalStart + duration of the last element gives us total frames
const lastScene = script[script.length - 1];
const totalFrames = lastScene.globalStart + lastScene.duration;

export const RemotionRoot: React.FC = () => {
    return (
        <Composition
            id="FertilityCrisis"
            component={FertilityCrisisVideo}
            durationInFrames={totalFrames}
            fps={FPS}
            width={1920}
            height={1080}
        />
    );
};
