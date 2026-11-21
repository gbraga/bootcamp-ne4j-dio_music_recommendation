import { TestBed } from '@angular/core/testing';
import { ListeningRepository } from '../data/repositories/listening.repository';
import { TrackRepository } from '../data/repositories/track.repository';
import { ListeningService } from './listening.service';

function setup(written: boolean) {
  const calls: unknown[][] = [];
  TestBed.configureTestingModule({
    providers: [
      {
        provide: ListeningRepository,
        useValue: {
          registerListen: async (...args: unknown[]) => (calls.push(['listen', ...args]), written),
          setLiked: async (...args: unknown[]) => (calls.push(['like', ...args]), written),
        },
      },
      { provide: TrackRepository, useValue: {} },
    ],
  });
  return { service: TestBed.inject(ListeningService), calls };
}

describe('ListeningService writes', () => {
  it('persists plays and likes for the given user and track', async () => {
    const { service, calls } = setup(true);

    await service.registerListen('u1', 't1');
    await service.setLiked('u1', 't1', true);

    expect(calls).toEqual([
      ['listen', 'u1', 't1'],
      ['like', 'u1', 't1', true],
    ]);
  });

  it('fails loudly when the user or track no longer exists (MATCH returned no row)', async () => {
    const { service } = setup(false);
    await expect(service.registerListen('gone', 't1')).rejects.toThrow(/não encontrados/);
    await expect(service.setLiked('gone', 't1', true)).rejects.toThrow(/não encontrados/);
  });
});
