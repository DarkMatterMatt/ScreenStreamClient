import React, { useState } from "react";

interface Props {
    onStreamSelected?: (stream: MediaStream) => void;
    onStreamEnded?: (stream: MediaStream) => void;
    constraints?: {
        height?: number;
        frameRate?: number;
    };
}

function getDisplayMedia(constraints?: MediaStreamConstraints) {
    if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        return navigator.mediaDevices.getDisplayMedia(constraints);
    }
    if (navigator.getDisplayMedia) {
        return navigator.getDisplayMedia(constraints);
    }
    throw new Error("getDisplayMedia is not available.");
}

function supportsDisplayMedia() {
    return (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) || navigator.getDisplayMedia;
}

type StreamState = "initial" | "error" | "selected" | "ended";

export function SelectStream(p: Props) {
    if (!supportsDisplayMedia()) {
        return (
          <div>Not supported</div>
        );
    }

    const [streamState, setStreamState] = useState<StreamState>("initial");

    const select = async () => {
        try {
            const stream = await getDisplayMedia({ video: p.constraints || true });
            if (p.onStreamSelected) {
                p.onStreamSelected(stream);
            }
            setStreamState("selected");

            const [video] = stream.getVideoTracks();
            video.addEventListener("ended", () => {
                if (p.onStreamEnded) {
                    p.onStreamEnded(stream);
                }
                setStreamState("ended");
            });
            console.log("video", video);
        }
        catch (err) {
            console.error(err);
            setStreamState("error");
        }
    };

    if (streamState === "selected") {
        return (
          <div>Stream selected</div>
        );
    }

    return (
      <>
        {streamState === "error" && (<div>Error</div>)}
        <button onClick={select} type="button">
          Select screen to share
        </button>
      </>
    );
}
