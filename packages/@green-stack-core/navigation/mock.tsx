
/* --- Link.types.ts --------------------------------------------------------------------------- */

export type KnownRoutes = string
export type ExtractParams<HREF extends any$Mock = any$Mock> = any$Mock
export type LinkParams<HREF extends any$Mock = any$Mock> = Record<string, any$Mock>
export type RequireParamsIfDynamic<HREF extends any$Mock = any$Mock> = Record<string, any$Mock>
export type UniversalLinkProps<HREF extends KnownRoutes = KnownRoutes> = any$Mock
export type NextLinkProps = any$Mock
export type ExpoLinkProps = any$Mock

/* --- Link.tsx / Link.web.tsx / Link.next.tsx / Link.expo.tsx --------------------------------- */

export const Link = (props: any$Mock) => <a href={props.href}>{props.children}</a>

/* --- UseRouter.types.ts ---------------------------------------------------------------------- */

export type UniversalRouterMethods = any$Mock

/* --- UseRouteParams.types.ts ----------------------------------------------------------------- */

export type UniversalRouteScreenProps = any$Mock
