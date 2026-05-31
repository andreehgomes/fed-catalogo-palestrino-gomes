import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { SSR_ORIGIN } from './core/tokens/ssr-origin.token';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: SSR_ORIGIN,
      useFactory: () => `http://localhost:${process.env['PORT'] ?? '4000'}`,
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
