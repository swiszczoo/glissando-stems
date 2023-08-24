import React, { useCallback, useRef } from "react";

import { useNative } from "../hooks/useNative";

interface SeekingProps {

}

export function withSeeking<P, T extends HTMLElement>(WrappedComponent: React.ComponentType<P & React.DOMAttributes<T>>) {
  const WithSeekingComponent = (props: P & React.JSX.IntrinsicAttributes & SeekingProps) => {
    const [ native, ] = useNative();
    const seekPointerId = useRef<number | undefined>(undefined);
    const wasPlaying = useRef<boolean | undefined>(undefined);

    const getFractionPosition = useCallback((event: React.PointerEvent<T>) => {
      const bounds = event.currentTarget.getBoundingClientRect();
      const x = Math.round(event.clientX - bounds.left);
      return Math.max(0, Math.min(1, x / bounds.width));
    }, []);

    const handleMouseDown = useCallback((event: React.PointerEvent<T>) => {
      if (wasPlaying.current !== undefined || event.button !== 0) {
        return;
      }

      const fraction = getFractionPosition(event);
      const state = native!.getPlaybackState();

      wasPlaying.current = state === 'play';
      seekPointerId.current = event.pointerId;

      if (state !== 'pause') {
        native!.pause();
      }
      native!.setPlaybackPosition(fraction * native!.getTrackLength());

      (event.target as T).setPointerCapture(event.pointerId);
    }, [getFractionPosition, native]);

    const handleMouseMove = useCallback((event: React.PointerEvent<T>) => {
      if (seekPointerId.current !== event.pointerId) {
        return;
      }

      if (wasPlaying.current !== undefined) {
        const fraction = getFractionPosition(event);
        native!.setPlaybackPosition(fraction * native!.getTrackLength());
      }
    }, [getFractionPosition, native]);

    const handleMouseUp = useCallback((event: React.PointerEvent<T>) => {
      if (seekPointerId.current !== event.pointerId) {
        return;
      }

      if (wasPlaying.current !== undefined) {
        const fraction = getFractionPosition(event);
        native!.setPlaybackPosition(fraction * native!.getTrackLength());

        if (wasPlaying.current) {
          native!.play();
        }

        wasPlaying.current = undefined;
      }
    }, [getFractionPosition, native]);

    const handleMouseCancel = useCallback((event: React.PointerEvent<T>) => {
      if (seekPointerId.current !== event.pointerId) {
        return;
      }

      wasPlaying.current = undefined;
    }, []);

    return (
      <WrappedComponent 
        {...props} 
        onPointerDown={handleMouseDown}
        onPointerMove={handleMouseMove}
        onPointerUp={handleMouseUp}
        onPointerCancel={handleMouseCancel}
        />
    );
  };
  WithSeekingComponent.displayName = `Seeking(${WrappedComponent.displayName})`;

  return WithSeekingComponent;
}
