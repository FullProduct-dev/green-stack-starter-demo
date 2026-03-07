import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import SlugScreen from '../../../screens/SlugScreen'

/* --- /subpages/[slug] ------------------------------------------------------------------------ */

export default (props: any) => (
    <UniversalRouteScreen
        {...props}
        routeScreen={SlugScreen}
    />
)
