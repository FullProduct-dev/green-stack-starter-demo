import { UniversalRouteScreen } from '@green-stack/core/navigation/UniversalRouteScreen'
import ImagesScreen from '../../../screens/ImagesScreen'

/* --- /demos/images --------------------------------------------------------------------------- */

export default (props: any) => (
    <UniversalRouteScreen
        {...props}
        routeScreen={ImagesScreen}
    />
)
