declare global {
    interface Navigator {
        getDisplayMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
    }

    interface MediaDevices {
        getDisplayMedia?(constraints?: MediaStreamConstraints): Promise<MediaStream>;
    }
}

export {};
