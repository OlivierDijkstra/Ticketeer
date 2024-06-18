import type { Event } from '@repo/lib';
import { describe, expect, it } from 'vitest';

import * as utils from '@/lib/utils'

import generateMedia from '../helpers';

const mockEvent: Event = {
  id: 1,
  name: 'Test Event',
  slug: 'test-event',
  description: 'Test Description',
  description_short: '',
  service_price: 0,
  enabled: true,
  featured: false,
  media: [
    generateMedia({
        cover: true,
    })
  ],
  statistics_slug: 'test-event',
  created_at: '2021-06-01T00:00:00',
  updated_at: '2021-06-01T00:00:00',
  deleted_at: null,
};

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