import { describe, it, expect } from '@jest/globals';
import { GoogleAIBackend, VertexAIBackend } from '../lib/backend';
import { BackendType } from 'lib/public-types';
import { DEFAULT_LOCATION } from 'lib/constants';
describe('Backend', () => {
  describe('GoogleAIBackend', () => {
    it('sets backendType to GOOGLE_AI', () => {
      const backend = new GoogleAIBackend();
      expect(backend.backendType).toBe(BackendType.GOOGLE_AI); // Use toBe instead of to.equal
    });
  });

  describe('VertexAIBackend', () => {
    it('set backendType to VERTEX_AI', () => {
      const backend = new VertexAIBackend();
      expect(backend.backendType).toBe(BackendType.VERTEX_AI); // Use toBe instead of to.equal
      expect(backend.location).toBe(DEFAULT_LOCATION); // Use toBe instead of to.equal
    });

    it('sets custom location', () => {
      const backend = new VertexAIBackend('test-location');
      expect(backend.backendType).toBe(BackendType.VERTEX_AI); // Use toBe instead of to.equal
      expect(backend.location).toBe('test-location'); // Use toBe instead of to.equal
    });

    it('uses default location if location is empty string', () => {
      const backend = new VertexAIBackend('');
      expect(backend.backendType).toBe(BackendType.VERTEX_AI); // Use toBe instead of to.equal
      expect(backend.location).toBe(DEFAULT_LOCATION); // Use toBe instead of to.equal
    });

    it('uses default location if location is null', () => {
      const backend = new VertexAIBackend(null as any);
      expect(backend.backendType).toBe(BackendType.VERTEX_AI); // Use toBe instead of to.equal
      expect(backend.location).toBe(DEFAULT_LOCATION); // Use toBe instead of to.equal
    });
  });
});
