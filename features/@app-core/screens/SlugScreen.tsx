import React, { Fragment } from 'react'
import { StatusBar } from 'expo-status-bar'
import { useRouteParams } from '@green-stack/navigation/useRouteParams'
import { View, Text, H1, H3, P, Link, ScrollView, H2, cn } from '../components/styled'
import { useRouter } from '@green-stack/navigation/useRouter'
import type { UniversalRouteScreenProps } from '@green-stack/navigation/useRouteParams.types'
import BackButton from '../components/BackButton'
import { testableFeatures } from '../constants/testableFeatures'
import { isMobile } from '../appConfig'

/* --- <SlugScreen/> --------------------------------------------------------------------------- */

const SlugScreen = (props: UniversalRouteScreenProps) => {

    // Routing
    const { slug, count = 0 } = useRouteParams(props)
    const { push, navigate, replace, setParams } = useRouter()

    // -- Render --

    return (
        <>
            <StatusBar style="light" />
            <ScrollView
                className="flex flex-1 min-h-screen bg-slate-800"
                contentContainerClassName="min-h-screen"
            >
                <View className={cn(
                    "flex flex-1 min-h-screen bg-slate-800",
                    "px-6 web:pt-20 android:pt-32 ios:pt-32 pb-16",
                    "sm:max-w-[600px] sm:self-center",
                )}>
                    <H1 className="text-3xl text-white">
                        Universal Nav 🚀 📁
                    </H1>
                    <View className="h-2" />
                    <H2 className="text-xl text-gray-300 opacity-80">
                        → /subpages/<Text className="text-success">{decodeURIComponent(slug as string)}</Text>
                    </H2>
                    <View className="h-8" />
                    <P className="text-gray-300 text-base">
                        Universal URL routing in FullProduct.dev is built on the Expo & Next.js app routers. File based routes are shared between Web and Native. Enabling things like automatic deeplinks.
                    </P>
                    <View className="h-4" />
                    <View className="p-4 bg-slate-600 rounded-md border border-slate-500">
                        <Text className="text-gray-300 text-base">
                            /subpages/
                            <Text className="text-success font-bold">[slug]</Text>
                            {!!count && (
                                <>
                                    <Text className="text-gray-300">?count=</Text>
                                    <Text className="text-info font-bold">{count}</Text>
                                </>
                            )}
                        </Text>
                        <View className="absolute top-0 right-2 p-2 min-w-[40px] border border-slate-500 rounded-md mt-2 bg-slate-700">
                            <Text className="w-full text-center text-info text-sm font-semibold">
                                {count}
                            </Text>
                        </View>
                    </View>
                    <View className="h-4" />
                    <P className="text-gray-300 text-base">
                        Whichever device / platforms you're on, you can even save state in the URL, like this counter above us:
                    </P>
                    <View className="h-4" />
                    <Text className="select-none" onPress={() => setParams({ count: `${+count + 1}` })}>
                        <Text className="text-base text-link underline">router.setParams()</Text>
                        <Text className="text-gray-400 no-underline">{` - add to count query param`}</Text>
                    </Text>

                    {/* Nav & Routing Tests */}

                    <View className="h-1 w-12 my-6 bg-slate-600" />

                    <Text onPress={() => navigate('/subpages/navigate')}>
                        <Text className="text-base text-link underline">router.navigate()</Text>
                        <Text className="text-gray-400 no-underline">{` - Nav to href url`}</Text>
                    </Text>
                    <View className="h-4" />
                    <Text onPress={() => push('/subpages/push')}>
                        <Text className="text-base text-link underline">router.push()</Text>
                        <Text className="text-gray-400 no-underline">{` - Push new stack on mobile`}</Text>
                    </Text>
                    <View className="h-4" />
                    <Text onPress={() => replace('/subpages/replace')}>
                        <Text className="text-base text-link underline">router.replace()</Text>
                        <Text className="text-gray-400 no-underline">{` - Nav w/o updating history`}</Text>
                    </Text>

                    <View className="h-4" />
                    <P className="text-gray-300 text-base">
                        Notice the count is saved per page when navigating between urls. On mobile, screens are pushed onto a stack instead of just URL history.
                        {isMobile && (
                            <P className="text-gray-300 text-base">
                                {` (Try swiping back)`}
                            </P>
                        )}
                    </P>

                    {/* Other Tests */}

                    <View className="h-1 w-12 my-6 bg-slate-600" />

                    {testableFeatures.map((feature, index) => (
                        <Fragment key={feature.link}>
                            <Link
                                href={feature.link}
                                className={cn(
                                    'relative flex flex-col no-underline hover:opacity-80',
                                    'w-full sm:w-[400px] min-h-[90px] overflow-hidden',
                                    'bg-slate-600 rounded-md border border-slate-500',
                                    'px-4 py-3',
                                    'group',
                                )}
                            >
                                <View className="absolute right-4 w-full">
                                    <Text className="absolute right-0 top-0 text-4xl ios:scale-[2] android:scale-[2] web:scale-[250%] transition web:group-hover:scale-[280%] opacity-[0.15]">
                                        {feature.icon}
                                    </Text>
                                    <Text className="absolute right-0 top-0 text-4xl">
                                        {feature.icon}
                                    </Text>
                                </View>
                                {/* <View className="h-20" /> */}
                                <View className="flex flex-col w-[80%]">
                                    <H3 className="text-gray-300 text-lg">
                                        {feature.title}
                                    </H3>
                                    <View className="h-1" />
                                    <Text className="text-gray-200 text-sm">
                                        {feature.description}
                                    </Text>
                                </View>
                            </Link>
                            {index < (testableFeatures.length - 1) && (
                                <View className="h-2" />
                            )}
                        </Fragment>
                    ))}

                    {/* Try the full startkit? */}

                    <View className="h-1 w-12 my-6 bg-slate-600" />

                    <P className="mt-2 text-gray-300 text-base">
                        Upgrade your Universal App Setup?
                    </P>
                    <Link
                        className="mt-4 text-lg text-link font-bold no-underline"
                        href="https://fullproduct.dev"
                        target="_blank"
                    >
                        FullProduct.dev
                    </Link>

                </View>
            </ScrollView>
            <BackButton color="#FFFFFF" />
            <Link
                className="absolute top-12 web:top-5 right-5 pointer-events-box-only"
                href="https://fullproduct.dev/docs/universal-routing"
                target="_blank"
            >
                <View className="flex flex-row bg-stone-900 w-[44px] h-[44px] items-center pointer-events-none rounded-full border border-muted opacity-80 hover:opacity-100 z-0">
                    <Text className="w-full text-lg text-center">
                        {`📚`}
                    </Text>
                </View>
            </Link>
        </>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default SlugScreen
