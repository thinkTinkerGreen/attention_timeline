import { describe, it, expect } from 'vitest';
import mechanisms from '../data/mechanisms.json';

describe('mechanisms.json Data Integrity & Schema Tests', () => {
  it('should have at least 20 entries (has 29 entries)', () => {
    expect(mechanisms.length).toBeGreaterThanOrEqual(20);
  });

  it('should be strictly chronologically sorted by first_appearance.date', () => {
    for (let i = 0; i < mechanisms.length - 1; i++) {
      const currDate = mechanisms[i].first_appearance.date;
      const nextDate = mechanisms[i + 1].first_appearance.date;
      expect(currDate <= nextDate, `Sorting error at index ${i}: ${mechanisms[i].id} (${currDate}) is after ${mechanisms[i + 1].id} (${nextDate})`).toBe(true);
    }
  });

  it('every entry should have non-empty what_it_gives_up with specific downsides', () => {
    mechanisms.forEach((m) => {
      expect(m.what_it_gives_up.length, `Mechanism ${m.id} has empty what_it_gives_up`).toBeGreaterThan(0);
      m.what_it_gives_up.forEach((downside) => {
        expect(downside.trim().length, `Mechanism ${m.id} has empty downside string`).toBeGreaterThan(10);
      });
    });
  });

  it('every entry should have primary_url unless marked UNVERIFIED', () => {
    mechanisms.forEach((m) => {
      if (m.date_status !== 'UNVERIFIED') {
        expect(m.first_appearance.primary_url).toBeDefined();
        expect(m.first_appearance.primary_url.startsWith('http'), `Mechanism ${m.id} lacks valid primary URL`).toBe(true);
      }
    });
  });

  it('every responds_to id should refer to an earlier mechanism in the timeline', () => {
    const idToIndex = new Map<string, number>();
    mechanisms.forEach((m, idx) => {
      idToIndex.set(m.id, idx);
    });

    mechanisms.forEach((m, idx) => {
      m.responds_to.forEach((earlierId) => {
        const earlierIndex = idToIndex.get(earlierId);
        expect(earlierIndex, `Mechanism ${m.id} references unknown responds_to id: ${earlierId}`).toBeDefined();
        expect(earlierIndex, `Mechanism ${m.id} (index ${idx}) references later mechanism ${earlierId} (index ${earlierIndex})`).toBeLessThan(idx);
      });
    });
  });

  it('every entry has concrete workload guidance (choose_when and avoid_when)', () => {
    mechanisms.forEach((m) => {
      expect(m.choose_when.length, `Mechanism ${m.id} missing choose_when`).toBeGreaterThan(0);
      expect(m.avoid_when.length, `Mechanism ${m.id} missing avoid_when`).toBeGreaterThan(0);
    });
  });
});
