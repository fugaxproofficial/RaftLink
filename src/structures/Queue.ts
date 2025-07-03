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

    /**
     * Removes a track from the queue at the specified index.
     * @param index The index of the track to remove.
     * @returns The removed track, or undefined if the index is out of bounds.
     */
    public remove(index: number): Track | undefined {
        if (index < 0 || index >= this.length) return undefined;
        return this.splice(index, 1)[0];
    }

    /**
     * Gets a track from the queue at the specified index.
     * @param index The index of the track to get.
     * @returns The track at the specified index, or undefined if the index is out of bounds.
     */
    public get(index: number): Track | undefined {
        if (index < 0 || index >= this.length) return undefined;
        return this[index];
    }

    /** Returns the queue as an array. */
    /**
     * Moves a track from one position to another within the queue.
     * @param fromIndex The current index of the track.
     * @param toIndex The desired index for the track.
     * @returns The moved track, or undefined if indices are out of bounds.
     */
    public move(fromIndex: number, toIndex: number): Track | undefined {
        if (fromIndex < 0 || fromIndex >= this.length || toIndex < 0 || toIndex >= this.length) return undefined;
        const [movedTrack] = this.splice(fromIndex, 1);
        this.splice(toIndex, 0, movedTrack);
        return movedTrack;
    }

    /** Returns the queue as an array. */
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param start The zero-based location in the array from which to start removing elements.
     * @param deleteCount The number of elements to remove.
     * @param items Elements to insert into the array in place of the deleted elements.
     * @returns An array containing the elements that were deleted.
     */
    public splice(start: number, deleteCount?: number, ...items: Track[]): Track[] {
        return super.splice(start, deleteCount === undefined ? this.length - start : deleteCount, ...items);
    }

    /** Returns the queue as an array. */
    public toArray(): Track[] {
        return [...this];
    }
}