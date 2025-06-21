import { cn, View, Text, H1, H2, H3, P, Link, getThemeColor } from '../components/styled'
import { calculateEfficiency } from '../utils/calculateEfficiency'
import { EfficiencyFormState, TECH_KNOWLEDGE } from '../screens/FormsScreen.types'
import { NumberStepper } from '../forms/NumberStepper.styled'
import { CheckList } from '../forms/CheckList.styled'
import { Button } from '../components/Button'
import { roundUpTo } from '@green-stack/utils/numberUtils'
import { Icon } from '@green-stack/components/Icon'
import { uppercaseFirstChar } from '@green-stack/utils/stringUtils'

/* --- Types ----------------------------------------------------------------------------------- */

export type EfficiencyResultsProps = {
    showBenefits: boolean
    formState: EfficiencyFormState
}

/* --- Components ------------------------------------------------------------------------------ */

const Li = ({ children }: { children: string | any$Todo }) => (
    <View className="flex-row items-center mb-2">
        <Icon name="CheckFilled" size={14} color={getThemeColor('--success')} className="mr-2" />
        <Text className="ml-1">{children}</Text>
    </View>
)

/* --- <EfficiencyResults/> -------------------------------------------------------------------- */

export const EfficiencyResults = (props: EfficiencyResultsProps) => {
    // Props
    const { showBenefits, formState } = props
    const { projectsPerYear, knownTech } = formState.values

    // -- Calculations --

    const results = calculateEfficiency(formState.values)
    const { formatRelativeTime } = results
    const { shipsWebOnly, shipsMobileOnly, shipsUniversal, isProvider, isDev } = results
    const { showEfficiencyBoost, showValueDelivered, showRepositioningBenefits } = results
    const { annualAvgEfficiencyBoost, annualHoursSaved } = results
    const { deliveryEfficiency, finalEfficiencyRate } = results
    const { learningGapHours, learningGapDecimals, setupHoursPerProject } = results
    const { projects, identity, benefitLevel, beneficial, convincee, handover } = results

    // -- Render --

    return (
        <>
            <View className="h-6" />

            <H1 className="text-primary text-5xl">
                {`Ship `}
                {showEfficiencyBoost ? (
                    <Text className="text-blue-400">
                        {`${annualAvgEfficiencyBoost}% `}
                    </Text>
                ) : (
                    <Text className="text-warn">
                        {`slightly `}
                    </Text>
                )}
                {`more efficiently`}
            </H1>

            <View className="h-6" />

            <View className="flex flex-row items-center">
                <Button
                    text={!shipsMobileOnly ? "✅  Web" : "❇️  + Web"}
                    type="outline"
                    size="sm"
                    className={cn('cursor-default', shipsMobileOnly && 'border-success')}
                    textClassName={cn(shipsMobileOnly && 'font-bold')}
                />
                <View className="w-4" />
                <Button
                    text={!shipsWebOnly ? "✅  iOS" : "❇️  + iOS"}
                    type="outline"
                    size="sm"
                    className={cn('cursor-default', shipsWebOnly && 'border-success')}
                    textClassName={cn(shipsWebOnly && 'font-bold')}
                />
                <View className="w-4" />
                <Button
                    text={!shipsWebOnly ? "✅  Android" : "❇️  + Android"}
                    type="outline"
                    size="sm"
                    className={cn('cursor-default', shipsWebOnly && 'border-success')}
                    textClassName={cn(shipsWebOnly && 'font-bold')}
                />
            </View>

            <View className="h-6" />

            {showValueDelivered && (
                <H2 className="text-slate-500 text-3xl">
                    <Text className="text-green-600 font-bold">{formatRelativeTime(annualHoursSaved)}</Text>
                    {` of extra value delivered yearly`}
                </H2>
            )}

            <View className="h-6" />

            <View className="flex flex-row items-center">
                <NumberStepper
                    key={`projects-per-year-${formState.values.identifiesWith}`}
                    placeholder="projects per year"
                    className="mr-4"
                    textInputClassName="max-w-[130]"
                    min={1}
                    {...formState.getInputProps('projectsPerYear')}
                />
                <H2 className="text-secondary opacity-50">
                    {`project${projectsPerYear > 1 ? 's' : ''} per year`}
                </H2>
            </View>

            <View className="h-12" />

            <H3 className="text-slate-400 text-2xl">
                <Text className="text-blue-400 font-bold">{formatRelativeTime(learningGapHours, roundUpTo, learningGapDecimals)}</Text>
                {` to learn the ropes`}
            </H3>

            <View className="h-6" />

            <H3 className="text-secondary">
                Team Knowledge?
            </H3>

            <View className="h-4" />

            <CheckList
                key={`known-tech-${knownTech.length}`}
                options={TECH_KNOWLEDGE.entries}
                {...formState.getInputProps('knownTech')}
            />

            <View className="h-6" />

            <View className="flex-row">
                <Button
                    text={showBenefits ? 'Breakdown' : 'Benefits & Breakdown'}
                    iconLeft={!showBenefits ? 'AddFilled' : undefined}
                    iconRight={showBenefits ? 'ChevronUpFilled' : undefined}
                    type={(showBenefits || !formState.values.identifiesWith) ? 'secondary' : 'success'}
                    size="md"
                    onPress={() => formState.handleChange('showBenefits', !showBenefits)}
                    disabled={!formState.values.identifiesWith}
                    fullWidth
                />
            </View>

            <View className="h-6" />

            {/* -- Benefits -- */}

            {showBenefits && (
                <>
                    <View className="h-2" />

                    {/* -- Efficiency -- */}

                    <P className="text-muted">
                        {`As a `}
                        <Text className="text-primary font-bold">{identity}</Text>
                        {`, you stand to benefit `}
                        <Text className="text-muted italic">{benefitLevel}</Text>
                        {` from the efficiency gains of this starterkit:`}
                    </P>

                    <View className="h-6" />

                    <Li>{`${setupHoursPerProject} hours on setup saved per project`}</Li>
                    <Li>{`Web + iOS + Android (write-once)`}</Li>
                    {!shipsUniversal && (
                        <Li>{`= ${(deliveryEfficiency - 1) * 100}% more deliverables / project (roughly)`}</Li>
                    )}


                    {showValueDelivered && (
                        <>
                            <View className="h-4" />

                            <Li>{`Only ${formatRelativeTime(learningGapHours, roundUpTo, learningGapDecimals)} to learn the stack`}</Li>
                            <Li>{`= ${formatRelativeTime(annualHoursSaved)} of setup saved at ${projectsPerYear} ${projects} / year`}</Li>
                            <Li>{`= ${finalEfficiencyRate}% extra features delivered / year`}</Li>
                        </>
                    )}

                    {showEfficiencyBoost && (
                        <>
                            <View className="h-4" />

                            <Li>{`Resulting in a ${annualAvgEfficiencyBoost}% total yearly value boost`}</Li>
                        </>
                    )}

                    {/* -- Positioning -- */}

                    {showRepositioningBenefits && (
                        <>
                            <View className="h-8" />

                            <P className="text-muted">
                                {`This ${beneficial} `}
                                <Text className="text-muted italic">
                                    {`increase in efficiency and deliverables,`}
                                </Text>
                                {` grants you `}
                                <Text className="text-primary font-bold">
                                    more flexibility
                                </Text>
                                {` towards clients and projects:`}
                            </P>

                            <View className="h-6" />

                            <Li>{`Reposition as a premium service provider`}</Li>
                            <Li>{`Gain an edge over competition`}</Li>
                            {!shipsUniversal && <Li>{`Charge higher for more platforms delivered`}</Li>}

                            <View className="h-4" />

                            <Li>{`Spend time won elsewhere (features / QA / R&D)`}</Li>
                            <Li>{`Underpromise, automatically overdeliver`}</Li>
                        </>
                    )}

                    {/* -- Universal Apps -- */}

                    {!shipsUniversal && (
                        <>
                            <View className="h-8" />

                            <P className="text-muted">
                                {`Software starting as `}
                                <Text className="text-primary font-bold">
                                    {`write-once, universal apps`}
                                </Text>
                                {` have some benefits of their own:`}
                            </P>

                            <View className="h-6" />

                            <Li>{`Be on any device / platform customers prefer`}</Li>
                            <Li><>{`More platforms = `}<Text className="italic">more trust</Text></></Li>
                            <Li>{`More trust = more sales / conversions`}</Li>

                            <View className="h-4" />

                            <Li><>{`Your app will have `}<Text className="font-bold">universal deeplinks</Text></></Li>
                            <Li>{`Whichever page / device, users can share urls`}</Li>
                            <Li>{`If a recipient has the app, it opens there`}</Li>
                            <Li>{`If not, the page opens on web instead`}</Li>

                            <View className="h-4" />

                            <Li>{`Organic traffic from web (SEO + cheaper ads)`}</Li>
                            <Li>{`Higher conversions from mobile`}</Li>
                        </>
                    )}

                    {/* -- Dev Benefits -- */}

                    <View className="h-8" />

                    <View className="h-1 w-12 my-6 bg-slate-300" />

                    <View className="h-6" />                                        

                    <P className="text-muted">
                        <Text className="text-primary font-bold">
                            {uppercaseFirstChar(convincee)}
                        </Text>
                        {` might like some docs on the productivity gains from this way of working:`}
                    </P>

                    <View className="h-6" />

                    <Li>
                        <Link href="https://fullproduct.dev/docs/universal-routing" target="_blank">
                            {`Universal Routing`}
                        </Link>
                        {` (file based, auto deeplinks)`}
                    </Li>
                    <Li>
                        <Link href="https://fullproduct.dev/docs/data-fetching" target="_blank">
                            {`Cross-platform Data-Fetching`}
                        </Link>
                        {` (react-query)`}
                    </Li>
                    <Li>
                        <Link href="https://fullproduct.dev/docs/write-once-styles" target="_blank">
                            {`Style universal UI`}
                        </Link>
                        {` with Nativewind (tailwind)`}
                    </Li>

                    <View className="h-4" />

                    <Li>
                        <Link href="https://fullproduct.dev/docs/single-sources-of-truth" target="_blank">
                            {`Schemas as Single Sources of Truth`}
                        </Link>
                        {` (zod)`}
                    </Li>
                    <Li>
                        <Link href="https://fullproduct.dev/docs/data-resolvers" target="_blank">
                            {`Effortless GraphQL API's`}
                        </Link>
                        {` (optional)`}
                    </Li>

                    {isProvider && (
                        <>
                            <View className="h-4" />

                            <Li>
                                <Link href="https://fullproduct.dev/docs/project-structure" target="_blank">
                                    {`Portable architecture`}
                                </Link>
                                {` (copy-paste features)`}
                            </Li>
                        </>
                    )}

                    {/* -- Docs Benefits -- */}

                    <View className="h-8" />

                    <View className="h-1 w-12 my-6 bg-slate-300" />

                    <View className="h-6" />

                    <P className="text-muted">
                        {`This starterkit can `}
                        <Text className="text-primary font-bold">
                            {`generate docs`}
                        </Text>
                        {` as you build. These docs will grow with your ${projects}, meaning:`}
                    </P>

                    <View className="h-6" />

                    <Li>{`Easier onboardings for new devs`}</Li>
                    <Li>{`Easier handovers ${handover}`}</Li>
                    <Li>{`Devs can send each other preview urls`}</Li>

                    <View className="h-6" />

                    <P className="text-muted">
                        {`Check out some `}
                        <Link href="https://fullproduct.dev/docs/@app-core/components/Button" target="_blank">
                            {`example component docs`}
                        </Link>
                        {` to know what that looks like. Try changing the preview, refreshing or sharing a url.`}
                    </P>

                    {isDev && <View className="h-4" />}

                    {isDev && (
                        <P className="text-muted">
                            {`It's a good example of what's possible when you use `}
                            <Link href="https://fullproduct.dev/docs/single-sources-of-truth#building-schemas-with-zod" target="_blank">
                                {`Zod schemas`}
                            </Link>
                            {` as the `}
                            <Link href="https://fullproduct.dev/docs/single-sources-of-truth" target="_blank">
                                {`Single Source of Truth`}
                            </Link>
                            {`.`}
                        </P>
                    )}

                    <View className="h-8" />

                    <View className="h-1 w-12 my-6 bg-slate-300" />
                </>
            )}
        </>
    )

}
