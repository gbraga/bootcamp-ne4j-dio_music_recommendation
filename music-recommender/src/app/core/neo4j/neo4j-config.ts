import { InjectionToken } from '@angular/core';

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  database: string;
}

export const NEO4J_CONFIG = new InjectionToken<Neo4jConfig>('NEO4J_CONFIG');
