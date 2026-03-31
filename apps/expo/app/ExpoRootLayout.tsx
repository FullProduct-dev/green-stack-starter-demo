import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated'
import { isWeb } from '@app/config'
import UniversalAppProviders from '@app/screens/UniversalAppProviders'
import UniversalRootLayout from '@app/screens/UniversalRootLayout'
import { useColorScheme } from 'nativewind'
import { Image as ExpoContextImage } from '@green-stack/components/Image.expo'
import { Link as ExpoContextLink } from '@green-stack/navigation/Link.expo'
import { useRouter as useExpoContextRouter } from '@green-stack/navigation/useRouter.expo'
import { useRouteParams as useExpoRouteParams } from '@green-stack/navigation/useRouteParams.expo'

// -i- Expo Router's layout setup is much simpler than Next.js's layout setup
// -i- Since Expo doesn't require a custom document setup or server component root layout
// -i- Use this file to apply your Expo specific layout setup:
// -i- like rendering our Universal Layout and App Providers

/* --- Reanimated Setup ------------------------------------------------------------------------ */

configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false,
})

/* --- <ExpoRootLayout> ------------------------------------------------------------------------ */

export default function ExpoRootLayout() {
    
    // Navigation
    const expoContextRouter = useExpoContextRouter()

    // Theme
    const scheme = useColorScheme()

    // -- Effects --

    useEffect(() => {
        // -i- Make nativewind dark mode work with Expo for Web
        if (isWeb && typeof window !== 'undefined') {
            const $html = document.querySelector('html')
            const isDarkMode = scheme.colorScheme === 'dark'
            $html?.classList.toggle('dark', isDarkMode)
        }
    }, [scheme.colorScheme])

    // -- Render --

    return (
        <UniversalAppProviders
            contextImage={ExpoContextImage}
            contextLink={ExpoContextLink}
            contextRouter={expoContextRouter}
            useContextRouteParams={useExpoRouteParams}
            isExpo
        >
            <UniversalRootLayout>
                <Stack
                    screenOptions={{
                        headerShown: false,
                        contentStyle: { backgroundColor: '#FFFFFF' },
                        animation: 'slide_from_right',
                    }}
                />
            </UniversalRootLayout>
        </UniversalAppProviders>
    )
}
