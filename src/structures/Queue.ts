import { Track } from '../types';

/**
 * A feature-rich queue for managing tracks.
 */
export class Queue extends Array<Track> {
    /** The first track in the queue. */
    public get first(): Track | undefined {
        return this[0];
    }

    /** The total size of the queue. */
    public get size(): number {
        return this.length;
    }

    /** The total duration of the queue in milliseconds. */
    public get duration(): number {
        return this.reduce((acc, track) => acc + track.info.length, 0);
    }

    /**
     * Adds a track to the end of the queue.
     * @param track The track or tracks to add.
     */
    public add(track: Track | Track[]): void {
        if (Array.isArray(track)) this.push(...track);
        else this.push(track);
    }

    /** Removes the first track from the queue and returns it. */
    public removeFirst(): Track | undefined {
        return super.shift();
    }

    /** Clears the entire queue. */
    public clear(): void {
        this.length = 0;
    }

    /** Shuffles the tracks in the queue. */
    public shuffle(): void {
        for (let i = this.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this[i], this[j]] = [this[j], this[i]];
        }
    }

    /** Returns the queue as an array. */
    public toArray(): Track[] {
        return [...this];
    }
}