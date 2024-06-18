import { generateEvent } from '@repo/lib';
import { describe, expect, it } from 'vitest';

import * as utils from '@/lib/utils'

import generateMedia from '../helpers';

const mockEvent = generateEvent({
    media: [generateMedia({
        cover: true,
    })],
});

describe('utils', () => {
    describe('getEventCoverImage', () => {
        it('should return the cover image if it exists', () => {
            const coverImage = utils.getEventCoverImage(mockEvent);
            expect(coverImage).toBeDefined();
            expect(coverImage?.custom_properties.cover).toBe(true);
        });

        it('should return undefined if no cover image exists', () => {
            const eventWithoutCover = { ...mockEvent, media: [] };
            const coverImage = utils.getEventCoverImage(eventWithoutCover);
            expect(coverImage).toBeUndefined();
        });

        it('should return undefined if media array is empty', () => {
            const eventWithoutMedia = { ...mockEvent, media: [] };
            const coverImage = utils.getEventCoverImage(eventWithoutMedia);
            expect(coverImage).toBeUndefined();
        });

        it('should return undefined if media array does not contain a cover image', () => {
            const eventWithoutCoverImage = {
                ...mockEvent,
                media: [
                    generateMedia({
                        cover: false,
                    }),
                ],
            };
            const coverImage = utils.getEventCoverImage(eventWithoutCoverImage);
            expect(coverImage).toBeUndefined();
        });
    });
});