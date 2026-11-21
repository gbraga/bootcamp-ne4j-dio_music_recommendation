import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { NEO4J_CONFIG } from './core/neo4j/neo4j-config';
import { neo4jEnv } from '../environments/neo4j.env';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
    { provide: NEO4J_CONFIG, useValue: neo4jEnv },
  ],
};
