import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import DemoScreen, { queryBridge } from '../screens/DemoScreen'

/* --- / --------------------------------------------------------------------------------------- */

export default (props: any) => (
    <UniversalRouteScreen
        {...props}
        routeScreen={DemoScreen}
        queryBridge={queryBridge}
    />
)
