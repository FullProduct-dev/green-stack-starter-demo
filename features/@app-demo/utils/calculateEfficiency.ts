import { roundDownTo } from '@green-stack/utils/numberUtils'
import { FormScreenProps, IDENTITIES, TECH_KNOWLEDGE } from '../screens/FormsScreen.types'

/* --- Constants ------------------------------------------------------------------------------- */

export const oneDay = 8 // One day in work hours
export const oneWeek = oneDay * 5 // One work week in hours

export const annualWorkDays = 260 // Work days per year
export const annualWorkHours = annualWorkDays * oneDay // Work hours per year

/* --- calculateEfficiency() ------------------------------------------------------------------- */

export const calculateEfficiency = (rawValues: FormScreenProps) => {
    // Values
    const values = FormScreenProps.applyDefaults(rawValues)
    const { currentSetupHoursPerProject, pluginsToMerge, knownTech, identifiesWith } = values
    const { excitingFeatures, platformsTargeted = 1, projectsPerYear = 1 } = values    

    // Flags
    const isFullStackDev = identifiesWith === IDENTITIES.enum['full-product-dev']
    const isFreelanceDev = identifiesWith === IDENTITIES.enum['freelance-app-dev']
    const isStartupFounder = identifiesWith === IDENTITIES.enum['startup-founder']
    const isIndieHacker = identifiesWith === IDENTITIES.enum['indiehacker']
    const isStudioLead = identifiesWith === IDENTITIES.enum['studio-lead']

    const isDev = isFullStackDev || isFreelanceDev || isIndieHacker || isStudioLead
    const isProvider = isFreelanceDev || isStudioLead
    const isStartup = isStartupFounder || isIndieHacker

    const shipsWebOnly = platformsTargeted === 1
    const shipsMobileOnly = platformsTargeted === 2
    const shipsUniversal = platformsTargeted === 3

    // -- Result Calculation --

    // Starting point = 1 week of setup on average by default (editable)
    let setupHoursPerProject = currentSetupHoursPerProject || oneWeek

    // ⬇ Calculate additional plugin hours saved based on plugins merged

    let pluginHoursSaved = oneDay // Default to 1 day saved for other plugins
    if (pluginsToMerge.includes('auth')) pluginHoursSaved += oneDay // Auth plugins
    if (pluginsToMerge.includes('db')) pluginHoursSaved += 5 // DB plugins
    if (pluginsToMerge.includes('mail')) pluginHoursSaved += oneDay // Mail plugins
    if (pluginsToMerge.includes('notifications')) pluginHoursSaved += 5 // Notifications plugins
    if (pluginsToMerge.includes('payments')) pluginHoursSaved += oneDay * 2 // Payments plugins
    if (pluginsToMerge.includes('storage')) pluginHoursSaved += 4 // Storage plugins

    // ⬇ Add additional hours saved per project based on exciting features

    const wantsUniversalStarter = excitingFeatures.includes('universal-starter')
    const platformSetupHours = oneWeek * (platformsTargeted || 1)
    setupHoursPerProject += wantsUniversalStarter ? platformSetupHours : oneWeek

    if (excitingFeatures.includes('git-plugins')) setupHoursPerProject += pluginHoursSaved // Additional time saved
    if (excitingFeatures.includes('stack-freedom')) setupHoursPerProject += oneDay // No time spent removing unknonw tech
    if (excitingFeatures.includes('zod-query-toolkit')) setupHoursPerProject += 12 // Automating API typing and fetching
    if (excitingFeatures.includes('generators-scripts')) setupHoursPerProject += oneDay // No more boilerplate code
    if (excitingFeatures.includes('designed-for-copypaste')) setupHoursPerProject += 16 // Copy paste features from earlier projects
    if (excitingFeatures.includes('universal-fs-routing')) setupHoursPerProject += oneDay // Universal automated routing + deeplinks

    // ⬇ Figure out delivery efficiency based on platforms targeted

    let deliveryEfficiency = 1 // Default to Universal App Delivery
    if (platformsTargeted === 2) deliveryEfficiency = 1 + 0.75 // From Mobile = 75% more efficient
    if (platformsTargeted === 1) deliveryEfficiency = 1 + 1.5 // From Web = 150% more efficient
    
    setupHoursPerProject = setupHoursPerProject * deliveryEfficiency

    // ⬇ Subtract the learning gap hours based on known tech

    let learningGapHours = oneDay // 1 day for learning the universal starterkit and way of working
    if (!knownTech.includes('typescript')) learningGapHours += oneDay * 2 // TS basics
    if (!knownTech.includes('react')) learningGapHours += oneDay * 4 // React basics
    if (!knownTech.includes('react-native')) learningGapHours += oneDay * 2 // RN basics
    if (!knownTech.includes('expo')) learningGapHours += oneDay * 2 // Expo basics
    if (!knownTech.includes('nextjs')) learningGapHours += oneDay * 3 // Next.js basics
    if (!knownTech.includes('zod')) learningGapHours += oneDay / 2 // Zod basics
    if (!knownTech.includes('react-query')) learningGapHours += oneDay // React Query basics
    if (excitingFeatures.includes('git-plugins')) learningGapHours += 2 * pluginsToMerge.length // Plugin PR Reviews

    // ⬇ Add extra learning gap hours based on cumulative team knowledge gap
    
    const numRequiredTech = Object.keys(TECH_KNOWLEDGE.entries).length
    const numConceptsKnown = knownTech.length
    const numConceptsToLearn = Math.max(numRequiredTech - numConceptsKnown, 0)
    const cumulativeKnowledgeGapModifier = 1 + numConceptsToLearn * 0.15
    
    learningGapHours = Math.max(1, learningGapHours * cumulativeKnowledgeGapModifier)
    
    const learningGapDecimals = learningGapHours < (oneWeek * 2) ? 1 : 0
    
    // ⬇ Final efficiency calculation
    
    const formatRelativeTime = (
        hoursSaved = annualHoursSaved,
        roundFn = roundDownTo,
        decimals = 0,
    ) => {
        const daysSaved = roundFn(hoursSaved / 8, decimals)
        const weeksSaved = roundFn(daysSaved / 5, decimals) // Exclude weekends
        const monthsSaved = roundFn(weeksSaved / 4, decimals)
        if (monthsSaved > 1) return `${monthsSaved} month${monthsSaved > 1 ? 's' : ''}`
        if (weeksSaved >= 1.5) return `${weeksSaved} week${weeksSaved > 1 ? 's' : ''}`
        if (daysSaved >= 1.5) return `${daysSaved} day${daysSaved > 1 ? 's' : ''}`
        return `${hoursSaved} hour${hoursSaved > 1 ? 's' : ''}`
    }

    const estAnnualSetupHoursSaved = setupHoursPerProject * projectsPerYear
    const annualHoursSaved = roundDownTo(estAnnualSetupHoursSaved - learningGapHours)

    const currentEfficiencyMultiplier = !excitingFeatures.includes('universal-starter') ? 1 : deliveryEfficiency
    const currentEfficiencyRate = roundDownTo(Math.max(1, currentEfficiencyMultiplier - currentEfficiencyMultiplier / 10))
    
    const currentAnnualSetupHours = currentSetupHoursPerProject * projectsPerYear / currentEfficiencyRate
    const annualAvgEfficiencyBoost = roundDownTo((annualHoursSaved / currentAnnualSetupHours) * 10)

    const strAnnualSetupTimeSaved = formatRelativeTime(estAnnualSetupHoursSaved, roundDownTo)
    const [strSetupTimeUnitsSaved, rawDownRoundedUnit] = strAnnualSetupTimeSaved.split(' ')
    const numSetupTimeUnitsSaved = +strSetupTimeUnitsSaved

    let annualSetupHoursSaved = numSetupTimeUnitsSaved // Hours
    if (rawDownRoundedUnit.includes('day')) annualSetupHoursSaved = numSetupTimeUnitsSaved * oneDay
    if (rawDownRoundedUnit.includes('week')) annualSetupHoursSaved = numSetupTimeUnitsSaved * oneWeek
    if (rawDownRoundedUnit.includes('month')) annualSetupHoursSaved = numSetupTimeUnitsSaved * oneWeek * 4
    
    const annualHoursValueProvided = annualWorkHours + annualSetupHoursSaved
    const finalEfficiencyRate = roundDownTo(((annualHoursValueProvided / annualWorkHours) * 100) - 100)

    // ⬇ Determine benefits & breakdown data + highlights

    const efficiencyComparison = Math.max(deliveryEfficiency * 100 - 100, finalEfficiencyRate)
    const showValueDelivered = efficiencyComparison > 10 && annualHoursSaved > 0
    const showEfficiencyBoost = efficiencyComparison > 10 && annualAvgEfficiencyBoost > 0
    const showRepositioningBenefits = isProvider && efficiencyComparison > 34

    // -- Wordings --

    const projects = projectsPerYear > 1 ? 'projects' : 'project'

    let identity:string = IDENTITIES.entries[identifiesWith!] || 'mystery developer'

    if (shipsWebOnly && isFullStackDev) identity = 'Full-stack Web App Developer'
    if (shipsMobileOnly && isFullStackDev) identity = 'Full-stack Mobile App Developer'
    if (shipsUniversal && isFullStackDev) identity = 'Full-stack Universal App Developer'

    if (shipsWebOnly && isFreelanceDev) identity = 'Freelance Web App Developer'
    if (shipsMobileOnly && isFreelanceDev) identity = 'Freelance Mobile App Developer'
    if (shipsUniversal && isFreelanceDev) identity = 'Freelance Universal App Developer'

    if (isStudioLead) identity = 'Digital Product Studio'
    if (isStartupFounder) identity = 'Startup Founder'
    if (isIndieHacker) identity = 'Solo Indie Dev'

    let benefitLevel = 'only slightly'
    if (efficiencyComparison > 20) benefitLevel = 'moderately'
    if (efficiencyComparison > 50) benefitLevel = 'significantly'
    if (efficiencyComparison > 100) benefitLevel = 'immensely'

    let beneficial = 'slight'
    if (efficiencyComparison > 34) beneficial = 'somewhat significant'
    if (efficiencyComparison > 50) beneficial = 'significant'
    if (efficiencyComparison > 100) beneficial = 'immense'

    let convincee = 'you or your devs'
    if (isStartupFounder) convincee = 'your technical co-founder'
    if (isIndieHacker) convincee = 'the dev in you'
    if (isStudioLead) convincee = 'your dev team'
    if (isFreelanceDev) convincee = `your client's dev team`

    let handover = 'to other dev teams'
    if (isProvider) handover = 'to your clients'
    if (isStartup) handover = 'to potential acquirers'

    // -- Results --

    return {
        isFullStackDev,
        isFreelanceDev,
        isStartupFounder,
        isIndieHacker,
        isStudioLead,
        isDev,
        isProvider,
        isStartup,
        shipsWebOnly,
        shipsMobileOnly,
        shipsUniversal,
        setupHoursPerProject,
        pluginHoursSaved,
        wantsUniversalStarter,
        platformSetupHours,
        deliveryEfficiency,
        learningGapHours,
        numRequiredTech,
        numConceptsKnown,
        numConceptsToLearn,
        cumulativeKnowledgeGapModifier,
        learningGapDecimals,
        formatRelativeTime,
        estAnnualSetupHoursSaved,
        annualHoursSaved,
        currentEfficiencyMultiplier,
        currentEfficiencyRate,
        currentAnnualSetupHours,
        annualAvgEfficiencyBoost,
        strAnnualSetupTimeSaved,
        numSetupTimeUnitsSaved,
        annualSetupHoursSaved,
        finalEfficiencyRate,
        efficiencyComparison,
        showValueDelivered,
        showEfficiencyBoost,
        showRepositioningBenefits,
        projects,
        identity,
        benefitLevel,
        beneficial,
        convincee,
        handover,
    }
}
