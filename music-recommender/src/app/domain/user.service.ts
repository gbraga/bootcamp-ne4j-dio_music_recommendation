import { Injectable, inject } from '@angular/core';
import { NationalityRepository } from '../data/repositories/nationality.repository';
import { UserRepository } from '../data/repositories/user.repository';
import { Nationality, NewUser, User } from './models';

export const USER_AGE_RANGE = { min: 10, max: 110 } as const;

const ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Random 10-char id, same format as the ids in the datasets. */
export function generateUserId(length = 10): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('');
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly users = inject(UserRepository);
  private readonly nationalities = inject(NationalityRepository);

  getUsers(): Promise<User[]> {
    return this.users.findAll();
  }

  getNationalities(): Promise<Nationality[]> {
    return this.nationalities.findAll();
  }

  async createUser(input: NewUser): Promise<User> {
    const name = input.name.trim().replace(/\s+/g, ' ');
    const age = Math.trunc(input.age);
    if (name.length < 2) throw new Error('Informe um nome com pelo menos 2 caracteres.');
    if (age < USER_AGE_RANGE.min || age > USER_AGE_RANGE.max) {
      throw new Error(`A idade deve estar entre ${USER_AGE_RANGE.min} e ${USER_AGE_RANGE.max} anos.`);
    }

    const created = await this.users.create(generateUserId(), { ...input, name, age });
    if (!created) throw new Error('Nacionalidade não encontrada. Recarregue a página e tente novamente.');
    return created;
  }
}
