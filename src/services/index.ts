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
export type { AppEvents, IEventBusService } from "./event-bus";
export {
  ProvideService,
  ServicesProvider,
  useConfig,
  useOptionalService,
  useService,
  useServices,
  useServicesList,
} from "./provider";
