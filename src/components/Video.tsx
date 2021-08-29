import React, { VideoHTMLAttributes, useEffect, useRef } from "react";

type Props = VideoHTMLAttributes<HTMLVideoElement> & {
    srcObject: MediaStream
}

type OldVideoElement = Omit<HTMLVideoElement, "srcObject">

export function Video({ srcObject, ...props }: Props) {
    const refVideo = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (!refVideo.current) return;

        const video = refVideo.current as HTMLVideoElement | OldVideoElement;

        if ("srcObject" in video) {
            video.srcObject = srcObject;
        }
        else {
            // Avoid using this in new browsers, as it is going away.
            video.src = URL.createObjectURL(srcObject);
        }
    }, [srcObject]);

    return <video ref={refVideo} {...props} />;
}
