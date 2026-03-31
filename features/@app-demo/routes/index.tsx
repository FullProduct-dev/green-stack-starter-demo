import { universalRouteProps } from '@green-stack/navigation/useRouteParams.helpers'
import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import DemoScreen, { queryBridge } from '../screens/DemoScreen'

/* --- / --------------------------------------------------------------------------------------- */

export default (props: any) => (
    <UniversalRouteScreen
        {...universalRouteProps(props)}
        routeScreen={DemoScreen}
        queryBridge={queryBridge}
    />
)
