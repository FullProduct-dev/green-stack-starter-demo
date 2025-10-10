import React from 'react'
import { View, Text, Link, Pressable, getThemeColor } from '../components/styled'
import { useRouter } from '@green-stack/navigation/useRouter'
import { schema, z } from '@green-stack/schemas'
import { Icon } from '@green-stack/components/Icon'
import { isServer } from '@app/config'
import { useDidMount } from '@green-stack/hooks/useDidMount'

/* --- Props ----------------------------------------------------------------------------------- */

const BackButtonProps = schema('BackButtonProps', {
    color: z.string().default(getThemeColor('--background')),
    iconSize: z.number().default(24),
    backText: z.string().optional().example('Back'),
    backLink: z.string().default('/'),
})

type BackButtonProps = z.input<typeof BackButtonProps>

/* --- <BackButton/> --------------------------------------------------------------------------- */

const BackButton = (props: BackButtonProps) => {
    // Props
    const { color, iconSize, backText, backLink } = BackButtonProps.applyDefaults(props)

    // Routing
    const { canGoBack, back } = useRouter()

    // Hooks
    const didMount = useDidMount()

    // Vars
    const showBackButton = !isServer && didMount && canGoBack()

    // -- Prerender --

    const innerBackButton = (
        <View className="flex flex-row bg-stone-900 p-2 items-center pointer-events-none rounded-md border border-muted opacity-90 hover:opacity-100 z-0">
            <Icon name="ArrowLeftFilled" color={color} size={iconSize} />
            {!!backText && (
                <>
                    <View className="w-[5px]" />
                    <Text className={`text-xl text-[${color}]`} style={{ color }}>
                        {`Back`}
                    </Text>
                </>
            )}
        </View>
    )

    // -- Render --

    return showBackButton ? (
        <Pressable
            className="absolute top-12 web:top-5 left-5 pointer-events-box-only" // @ts-ignore
            onPress={back}
        >
            {innerBackButton}
        </Pressable>
    ) : (
        <Link
            className={`absolute top-12 web:top-5 left-5 text-[${color}] no-underline`}
            href={backLink}
        >
            {innerBackButton}
        </Link>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default BackButton
