/**
 * Services barrel export
 */

export type {
  ContainerOptions,
  IAppConfig,
  IDomService,
  IRouterService,
  IStorageService,
  IThemeService,
  ServiceContainer,
} from "./container";
export { createContainer, defaultContainer } from "./container";
export { ServicesProvider, useService, useServices } from "./provider";
