import { TestBed } from '@angular/core/testing';
import { NationalityRepository } from '../data/repositories/nationality.repository';
import { UserRepository } from '../data/repositories/user.repository';
import { NewUser } from './models';
import { UserService, generateUserId } from './user.service';

function setup(create: (userId: string, user: NewUser) => Promise<unknown>) {
  TestBed.configureTestingModule({
    providers: [
      { provide: UserRepository, useValue: { create } },
      { provide: NationalityRepository, useValue: {} },
    ],
  });
  return TestBed.inject(UserService);
}

describe('UserService.createUser', () => {
  it('normalises the input and creates the user with a generated id', async () => {
    const calls: [string, NewUser][] = [];
    const service = setup(async (userId, user) => {
      calls.push([userId, user]);
      return { userId, name: user.name, age: user.age, nationality: 'Brasileira' };
    });

    const user = await service.createUser({ name: '  Marina   Duarte ', age: 31.7, nationalityId: 'n1' });

    expect(calls[0][1]).toEqual({ name: 'Marina Duarte', age: 31, nationalityId: 'n1' });
    expect(user.userId).toMatch(/^[A-Za-z0-9]{10}$/);
  });

  it('rejects invalid input without touching the database', async () => {
    let called = false;
    const service = setup(async () => (called = true));

    await expect(service.createUser({ name: ' A ', age: 30, nationalityId: 'n1' })).rejects.toThrow(/nome/);
    await expect(service.createUser({ name: 'Ana', age: 5, nationalityId: 'n1' })).rejects.toThrow(/idade/);
    expect(called).toBe(false);
  });

  it('fails when the nationality does not exist (query returns no row)', async () => {
    const service = setup(async () => undefined);
    await expect(service.createUser({ name: 'Ana', age: 30, nationalityId: 'x' })).rejects.toThrow(/Nacionalidade/);
  });
});

describe('generateUserId', () => {
  it('creates distinct 10-char alphanumeric ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateUserId()));
    expect(ids.size).toBe(50);
    ids.forEach((id) => expect(id).toMatch(/^[A-Za-z0-9]{10}$/));
  });
});
