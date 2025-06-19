import React, { useEffect } from 'react'
import { Dimensions } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { HydratedRouteProps, createQueryBridge } from '@green-stack/navigation'
import { Pressable, ScrollView, View, Link, Image, P, H1, H3, Text, H2, cn } from '../components/styled'
import { healthCheckFetcher } from '../resolvers/healthCheck.query'
import { Icon } from '@green-stack/components/Icon'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { isMobile } from '@app/config'

/* --- Data Fetching --------------------------------------------------------------------------- */

// -i- Think of a `QueryBridge` as a bridge between the route component and the data-fetching logic.
// -i- It's a way to fetch data for a route, based on the route's parameters.

// -i- The closest thing you could compare it to is next.js's `getServerSideProps`...
// -i- Except it also works to fetch data on your Native App instead of just web SSR / CSR.

export const queryBridge = createQueryBridge({
    routeDataFetcher: healthCheckFetcher,
    routeParamsToQueryKey: (routeParams) => ['healthCheck', routeParams.echo],
    routeParamsToQueryInput: (routeParams) => ({
        healthCheckArgs: {
            echo: routeParams.echo,
            verbose: routeParams.verbose,
        },
    }),
    fetcherDataToProps: (fetcherData) => ({ serverHealth: fetcherData?.healthCheck }),
})

/* --- Types ----------------------------------------------------------------------------------- */

type HomeScreenProps = HydratedRouteProps<typeof queryBridge>

/* --- <HomeScreen/> --------------------------------------------------------------------------- */

const HomeScreen = (props: HomeScreenProps) => {
    // Props
    const { serverHealth } = props

    // Insets
    const insets = useSafeAreaInsets()
    const insetsMobileStyle = isMobile ? { top: 80 + Math.max(insets.top, 16) } : undefined

    // -- Effects --

    // TODO: Remove this useEffect once you're done with testing this demo
    useEffect(() => {
        const refetchServerHealth = async () => {
            const refetchedProps = await props.refetchInitialData?.()
            console.log({ props, refetchedProps })
        }
        if (serverHealth?.echo) refetchServerHealth()
    }, [!!serverHealth])

    // -- Render --

    return (
        <>
            <StatusBar style="light" />
            <ScrollView
                contentContainerClassName="relative min-w-screen min-h-screen"
                style={{ backgroundColor: '#1e293b' }}
            >
                <View
                    className={cn(
                        "flex flex-1 flex-col justify-between items-center bg-slate-800",
                        "lg:p-24 lg:justify-start",
                    )}
                >

                    <View
                        className="hidden invisible lg:visible lg:flex lg:w-full lg:max-w-5xl h-14 lg:h-16"
                        accessibilityElementsHidden
                    >
                        <GettingStarted />
                    </View>

                    {/* Side Icons */}

                    <View
                        className={cn(
                            "hidden invisible flex-row top-28 w-screen max-w-5xl h-20 items-center justify-between",
                            "lg:absolute lg:visible lg:flex lg:h-[90%] lg:top-0",
                            "ios:lg:top-24", // -i- If you need platform specifc flags, e.g. iPad in this case
                        )}
                    >
                        <View className="w-[57px] h-[98px] lg:w-[114px] lg:h-[197px]">
                            <Image
                                src={require('../assets/automagic-api-gen-icons.png')}
                                alt="FullProduct.dev Starterkit Logo"
                                quality={100}
                                fill
                            />
                        </View>
                        <View className="w-[81px] h-[116px] lg:w-[162px] lg:h-[233px]">
                            <Image
                                src={require('../assets/cross-platform-icons.png')}
                                alt="FullProduct.dev Starterkit Logo"
                                quality={100}
                                fill
                            />
                        </View>
                    </View>

                    {/* Logo & Tagline */}

                    <View
                        className={cn(
                            "flex flex-row absolute top-28 w-screen max-w-5xl h-20 items-center justify-center",
                            "lg:h-[90%] lg:top-0 lg:max-w-[100%]",
                            "ios:lg:top-24",
                        )}
                        style={insetsMobileStyle}
                    >
                        <Link href="https://fullproduct.dev" target="_blank" className="flex flex-row no-underline">
                        <View className="w-20 h-20 lg:w-24 lg:h-24">
                            <Image
                                src={require('../assets/green-stack-logo.png')}
                                alt="FullProduct.dev Starterkit Logo"
                                width="100%"
                                height="100%"
                            />
                        </View>
                        <View className="w-5" />
                        <View className="flex flex-col justify-center h-20 lg:h-24">
                            <H1 className="text-left text-gray-100 text-2xl lg:text-3xl">
                                FullProduct.dev ⚡️
                            </H1>
                            <View className="h-0.5 lg:h-1" />
                            <H3 className="text-left font-medium text-slate-200 text-base lg:text-2xl lg:text-slate-300">
                                Your Universal App Starterkit
                            </H3>
                        </View>
                        </Link>
                    </View>

                    {/* Learn More */}

                    <View className="h-64" />

                    <View
                        className={cn(
                            "flex flex-col relative bottom-auto w-screen max-w-5xl items-center justify-center px-8",
                            "lg:absolute lg:bottom-24 lg:flex-row lg:top-auto lg:items-start lg:px-0",
                        )}
                    >
                        <InfoSection
                            title="Docs 📚"
                            summary="Documentation that grows as you build or paste app features"
                            href="https://fullproduct.dev/docs/quickstart"
                            isBlank
                        />
                        <View className="w-0 h-8 lg:w-16 lg:h-0" />
                        <InfoSection
                            title="Concepts"
                            summary="Discover a way of working that's portable, write-once and universal"
                            href="https://fullproduct.dev/docs/core-concepts"
                            isBlank
                        />
                        <View className="w-0 h-8 lg:w-16 lg:h-0" />
                        <InfoSection
                            title="Cross Nav"
                            titleIcon={(
                                <Icon
                                    name="ArrowRightFilled"
                                    size={24}
                                    color="white"
                                    className="text-white"
                                />
                            )}
                            summary="Test universal navigation for Web & Mobile, and share up to 90% UI code"
                            href="/subpages/Universal%20Nav"
                        />
                        <View className="w-0 h-8 lg:w-16 lg:h-0" />
                        <InfoSection
                            title="Codegen"
                            summary="Build even faster with generators for Routes, APIs, GraphQL & more"
                            href="https://fullproduct.dev/docs/quickstart"
                            isBlank
                        />
                    </View>

                    {/* Made by */}

                    <View className="h-16 lg:h-0" />

                    <View
                        className={cn(
                            "flex flex-row relative w-screen max-w-5xl h-14 items-center justify-center",
                            "lg:bottom-auto lg:absolute lg:justify-end lg:h-16",
                            "ios:lg:top-24",
                        )}
                    >
                        <Link
                            className="flex flex-row items-center no-underline h-12 lg:h-16"
                            href="https://codinsonn.dev"
                            target="_blank"
                        >
                            <View className="h-12 lg:h-16 flex-row items-center">
                                <Text className="text-lg text-gray-100">By</Text>
                            </View>
                            <View className="w-2" />
                            <View className="w-12 h-12 lg:w-16 lg:h-16">
                                <Image
                                    className="rounded-full"
                                    src="https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&w=256&q=75"
                                    alt="Thorr / codinsonn's Profile Picture"
                                    unoptimized
                                    fill
                                />
                            </View>
                            <View className="w-2" />
                            <View className="h-12 lg:h-16 flex-row items-center">
                                <Text className="text-lg text-gray-100 font-bold">
                                    Thorr ⚡️ codinsonn.dev
                                </Text>
                            </View>
                        </Link>
                    </View>

                    <View className="h-16 lg:h-0" />

                </View>

            </ScrollView>

            {/* Start from */}

            <View className="flex lg:hidden absolute web:fixed top-0 w-screen h-14">
                <GettingStarted />
            </View>
            
        </>
    )
}

/* --- <GettingStarted/> ----------------------------------------------------------------------- */

const GettingStarted = () => {
    const insets = useSafeAreaInsets()
    const shouldUseInsets = isMobile && Dimensions.get('window').width < 1024
    const insetsMobileStyle = shouldUseInsets ? { paddingTop: Math.max(insets.top, 16) } : undefined
    return (
        <View
            className={cn(
                'flex flex-1 flex-row absolute h-14 lg:h-16 items-center justify-start left-0 right-0',
                'lg:ios:flex-col ios:lg:items-start',
            )}
        >
            <P
                className={cn(
                    'flex right-0 absolute left-0 top-0 justify-center bg-slate-700 border-b border-solid border-gray-700 pb-4 pt-4 text-center text-sm text-gray-100',
                    'lg:flex-grow-1 lg:flex-shrink-1 lg:flex-row lg:flex-initial lg:relative lg:rounded-xl lg:border lg:bg-gray-800 lg:p-4 lg:pt-4 lg:text-lg',
                )}
                style={insetsMobileStyle}
            >
                <Text className="flex flex-row text-white">
                    <Text className="text-white">Start from </Text>
                    <Text className="text-white font-bold">@app/core</Text>
                    <Text className="text-white">{` → `}</Text>
                    <Text className="text-white font-bold">HomeScreen.tsx</Text>
                </Text>
            </P>
        </View>
    )
}

/* --- <InfoSection/> -------------------------------------------------------------------------- */

const InfoSection = (props: {
    title: string,
    titleIcon?: any,
    summary: string,
    href: string,
    isBlank?: boolean,
}) => (
    <View className="flex flex-col flex-1 w-full max-w-[420px]">
        <Link
            className="flex flex-row w-full items-center justify-center lg:justify-start text-center lg:text-left no-underline mb-2 lg:mb-4"
            href={props.href}
            target={(props.isBlank || props.href.includes('http')) ? "_blank" : undefined}
            asChild
        >
            <Pressable className="flex flex-row items-center justify-center">
                <H2 className="text-gray-100 text-2xl lg:text-3xl">
                    {props.title}
                </H2>
                {!!props.titleIcon && (
                    <>
                        <View className="w-2" />
                        {props.titleIcon}
                    </>
                )}
            </Pressable>
        </Link>
        <P className="text-center lg:text-left text-lg text-gray-500">
            {props.summary}
        </P>
    </View>
)

/* --- Exports --------------------------------------------------------------------------------- */

export default HomeScreen
