# Built with [FullProduct.dev](https://fullproduct.dev?v=gh-demo-readme) 🚀

<a href="https://www.youtube.com/watch?v=wCNDcxYhRbg" target="_blank">
  <img
    src="https://github.com/user-attachments/assets/dd5bedc0-675c-4e81-82b1-63b0279a52b6"
    alt="FullProduct.dev in 100 seconds on YouTube"
    width="480"
  />
</a>

> This project is built with [FullProduct.dev](https://fullproduct.dev?v=gh-demo-readme) ✦ 

> A universal starter kit for building apps with Expo (iOS / Android) and Next.js (Web + SSR) - Providing a familiar but optimized, write-once, app router experience.

> [!NOTE]  
> While the core of FullProduct.dev is pretty mature, it's still early when it comes to our available list of plugins and integrations. But this shouldn't be a huge problem for a good dev team as it's easy to add your own reusable features as git plugins.

---

<details>
<summary>Why FullProduct.dev? ⚡️</summary>

---

[![FullProduct.dev Bento Slide](https://fullproduct.dev/full-product-dev-bento.jpg)](https://fullproduct.dev?v=gh-premium-readme)

## The [FullProduct.dev](https://fullproduct.dev?v=gh-premium-readme) 🚀 Starterkit

![It's a lot harder and costly to add a mobile app later than it is to start universally](https://fullproduct.dev/blog-assets/imgs/start-universally.jpg)

- **Universal from the Start 🙌 + Write-once UI:**
  - Build for web, iOS, and Android with a single codebase.
  - No more writing features at 2x / 3x the time, resources or cost.
  - 90%+ of your UI and logic = shared across platforms.
  - Use React Native primitives (`View`, `Text`, `Image`) + NativeWind for max portability
  - ... while still styling your universal UI with Tailwind.

![Write once + Universal UI](https://fullproduct.dev/blog-assets/imgs/write-once-universal-ui.jpg)

- **The GREEN Stack ✅ for an *Evergreen* project setup:**
  - **G**raphQL, **R**eact-Native, **E**xpo, **N**ext.js.
  - Designed to be powerful, future-proof, flexible
  - Easy to evolve as your project grows

![Code colocation comparison, a vertical versus a horizontal split](https://fullproduct.dev/blog-assets/imgs/horizontal-vs-vertical-split.jpg)

- **Copy-Pasteable 📂 - Monorepo Architecture:**
  - Turborepo config already set up for you.
  - Features are organized by domain, not by front-end/back-end split.
  - This makes it easy to copy, reuse, and scale features between projects.
  - Each feature workspace is self-contained: UI, API, models, schemas, utils, and more...
  - All of it co-located in portable workspace packages.

---

<details>
<summary>What does that look like? 💡</summary>

---

![Example Workspace Architecture](https://fullproduct.dev/blog-assets/imgs/colocate-by-feature-workspaces.jpg)

The idea is that each feature is a self-contained workspace, that defines its own UI, APIs, schemas, models, etc. and has automation scripts re-export them to the right places.

![](https://fullproduct.dev/blog-assets/imgs/feature-routes-to-universal-links.jpg)

This allows you to copy-paste **"feature folders"** between projects, without the need for manual linking like you'd typically have to do without this architecture.

</details>

---

![Matt Pocock - The right abstraction, found at the right time, can save you weeks of work. It's often worth putting the time in](https://fullproduct.dev/blog-assets/imgs/matt-pocock-right-abstractions.jpg)

- **Single Sources of Truth 💎 - The Right Abstractions**
  - Define your data shape once using Zod schema
  - Derive or (auto-)generate types, validation, docs, db models, and more from them.
  - Avoid bugs and wasted time by keeping your types, validation, and docs in sync automatically.

![Universal Data Fetching](https://fullproduct.dev/blog-assets/imgs/universal-data-fetching.jpg)

- **Universal Data Fetching 🔀 - For Expo and Next.js**
  - GraphQL + React Query for type-safe, cross-platform data fetching.
  - Fetch data the same way on server, browser, and mobile.
  - Derive all GraphQL definitions and queries from Zod schemas.
  - Use `react-query` to fetch serverside, in the browser and on mobile.

![Generators vs AI Codegen](https://fullproduct.dev/blog-assets/imgs/generators-vs-ai.jpg)

- **Modern DX & Codegen ⚙️ - Beyond just the Setup**
  - Built-in code generators for schemas, resolvers, forms, and more.
  - Fast monorepo setup with Turborepo (or use standalone if you prefer).
  - Includes a generator to quickly add new generators and scripts.

[![Rich Interactive docs example](https://fullproduct.dev/blog-assets/imgs/nextra-url-docs-example.jpg)](https://fullproduct.dev/docs/@app-core/components/Button?showCode=true)

- **Rich Interactive Docs 📚 - Automatically grow with your project**
  - Full documentation at [fullproduct.dev/docs](https://fullproduct.dev/docs?v=gh-prfl)
  - Best practices and guides included in the built-in docs
  - Automatic UI, API and Types docs generation from Zod schemas [(e.g.)](https://fullproduct.dev/docs/@app-core/components/Button?showCode=true)
  - Easy Onboardings / Handovers + *Great Context for LLMs*

## ❇️ The GREEN stack:

> 📗 **Docs** at [Fullproduct.dev/docs](https://fullproduct.dev/docs)

![Combining Next.ts and Expo-Router app routers](https://fullproduct.dev/blog-assets/imgs/combining-app-routers.jpg)

The goal of any tech stack should be to stay **'Evergreen'**

- ✅ **GraphQL** - Universal, type-safe data fetching
- ✅ **React-Native** - Write-once UI that feels native
- ✅ **Expo** - Cross-platform app dev (Web / iOS / Android)
- ✅ **EAS** - Effortless builds and deploys to App Stores
- ✅ **Next.js** - Web-vitals and best-in-class SSR / SEO optimization

These are proven and widely supported technologies.

> Paired with TypeScript, Zod, and Tailwind (via Nativewind), this stack is designed to be robust, flexible, and here to stay. While still allowing you the freedom to choose your own Database and other core stack choices.

## 📦 What’s Included? - Demo

![How portable feature workspaces combine into an Expo + Next.js app](https://fullproduct.dev/blog-assets/imgs/reusing-features-in-apps.jpg)

- Well-Rounded Universal App Setup (Expo + Next.js)
- Turborepo - Monorepo Workspace Structure
- Universal Routing, (Deep)Linking and Navigation
- Right Abstractions built around Zod as the Single Source of Truth
- GraphQL and API routes with Next.js
- Universal React Query setup - both for Expo and Next

> **Note:** Git Based Plugins (for Auth, DB, Email, Payments, etc.) are coming soon! This base version is designed to be extended with plugins and your own features.

## 💡 Frequently Asked Questions

![What about reusing web code?](https://fullproduct.dev/blog-assets/imgs/reusing-web-code.jpg)

> Just use Expo's new `"use dom"` directive [(here's how)](https://docs.expo.dev/guides/dom-components/?utm_source=fullproduct.dev&utm_medium=readme)

...

- **What is FullProduct.dev?**
  - A universal app starterkit to help you launch cross-platform apps faster, with best-in-class DX and monorepo architecture set up and designed for copy-paste.
- **Why use this over other starters?**
  - Most starters are either too opinionated or too barebones. This kit gives you a solid, flexible foundation and is designed for maximum code reuse across platforms, *and projects*.
- **I'm just starting out, should I use it?**
  - If you know the basics of JS & React, this kit will teach you how to build universal apps that can be used in a browser / found in Google, but also be installable from the iOS / Android App Stores.
  - Learning and knowing `react-native` and `expo` leads to a great skill potential employers *will* appreciate.
  - Built-in markdown docs will help both you and AI coding assistants better understand your project and way of working.
- **I'm an experienced engineer, why should I use it?**
  - Seniors like us know the right abstractions can save weeks / months of time. Start with a bunch of them already set up for you.
  - Eases onboardings and handovers thanks to built-in docs that automatically grow as you build.
  - Spend less time on boilerplate thanks to our generators and automation scripts.
  - Architecture is designed for copy-paste, maximum reusability, across platforms, *and projects*.
- **How do I convince my boss to use this?**
  - Show your non-technical lead the [FullProduct.dev](https://fullproduct.dev?v=gh-demo-readme) website.
  - Direct your technical lead to the [docs](https://fullproduct.dev/docs?v=gh-demo-readme), specifically the [core-concepts](https://fullproduct.dev/docs/core-concepts?v=gh-demo-readme).
  - Highlight the benefits of write-once universal apps: Bigger market share. More platforms = More trust = Higher margins. Maximum shareability with Universal Deeplinks > More viral potential.
  - Emphasize flexibility to pick + choose your own stack while still having a solid foundation. (Mergeable ready-made `git` based plugins & PRs soon)
- **How is it licensed?**
  - See `LICENSE.md` and the [eula](https://fullproduct.dev/eula?v=gh-demo-readme-license) for the details.
  - Base / demo version is open source, but not full-on open contribution.
  - Premium version and plugins are coming soon for [commercial licensing](https://fullproduct.dev/eula?v=gh-demo-readme-license).

## Built with 💚 - by 🟢 [Thorr ⚡️ @codinsonn.dev](https://codinsonn.dev)

![Timeline comparison to when I started experimenting with these universal app concepts vs. the releases Expo did, and the Web-Only boilerplate that have skyrocketed](https://fullproduct.dev/blog-assets/imgs/cross-platform-experimentation.jpg)

> Hi 👋 I'm Thorr, creator of the **❇️ [FullProduct.dev](https://fullproduct.dev)** - *Universal App Starter kit*

This stack and kit are the result of years of experimentation building both web and mobile apps in startups, agencies, and as a freelancer + solopreneur.

It's become a collection of best practices, patterns & tools I wish I had during **[my career ↗️](https://codinsonn.dev/resume?v=gh-demo-readme)**

- <img src="https://img.shields.io/badge/Studies-white" alt="Studies"> <img src="https://img.shields.io/badge/- Design -- Development -- Motion Graphics -- JS / TS -grey" alt="Design, Development, Motion Graphics"> 
- <img src="https://img.shields.io/badge/Agencies-white" alt="Agencies"> <img src="https://img.shields.io/badge/- B2B -- MVPs -- React SSR -- Automatic Docgen -- Expo EAS -grey" alt="B2B, MVPs, React SSR, Automatic Docgen, Expo EAS"> 
- <img src="https://img.shields.io/badge/Startups-white" alt="Startups"> <img src="https://img.shields.io/badge/- Web -- App Stores -- Deeplinks -- Drivers -- Zod -- AI -- Stripe -grey" alt="Web, Mobile, Deeplinks, Drivers, Zod, AI"> 
- <img src="https://img.shields.io/badge/Freelance-white" alt="Freelance"> <img src="https://img.shields.io/badge/- Onboardings -- Demos -- API -- Team Lead -- Docs -- Handovers -grey" alt="Onboardings, Demos, Team Lead, Docs, Handovers"> 
- <img src="https://img.shields.io/badge/SaaS-white" alt="SaaS"> <img src="https://img.shields.io/badge/- Building Apps -- Auth & Payments -- Portability -- Marketing -grey" alt=""> 

Across a number of international projects, countries and industries:

<img src="https://img.shields.io/badge/🇬🇧 Healthcare-black" alt="UK, Healthcare"> <img src="https://img.shields.io/badge/🇪🇺 B2B -- ECommerce-black" alt="Europe, B2B, ECommerce"> <img src="https://img.shields.io/badge/🇺🇸 Retail -- Incubator -- MVP -black" alt="US Retail, Incubator, MVP"> 

Now, I'm glad to share my learnings to help others build their own universal apps faster, with less manual boilerplate, and more code reusability than ever before.

[![Timeline of my professional experience, contemplating why I have to rebuild the same feature for the 6th time](https://fullproduct.dev/blog-assets/imgs/why-are-features-not-reusable.jpg)](https://codinsonn.dev/resume?v=gh-demo-readme)

> **Support the project** - *Please keep this entire collapsible section in your README* 🙏

- [FullProduct.dev Docs 📚](https://fullproduct.dev/docs?v=gh-demo-readme) - to learn / send to your lead architect
- [FullProduct.dev Landing Page](https://fullproduct.dev?v=gh-demo-readme) - upgrade / send to your boss
- [Read + Share the Blog](https://fullproduct.dev/blog?v=gh-demo-readme) or [Sponsor me](https://github.com/sponsors/codinsonn) 💚

[![Picture of me giving a talk on maximising efficiency by building universal apps](https://fullproduct.dev/blog-assets/imgs/maximise-efficiency-tech-talk-header.jpg)](https://fullproduct.dev/blog/maximize-efficiency-building-universal-apps?v=gh-demo-readme)

> ⭐️ Follow me for updates, tips and tricks:

- [codinsonn.dev](https://codinsonn.dev?v=gh-demo-readme) - Personal Website + social links
- Find me as [@codinsonn](https://twitter.com/codinsonn) - e.g. [GitHub](https://github.com/codinsonn) / [Twitter](https://twitter.com/codinsonn) / [LinkedIn](https://www.linkedin.com/in/thorr-stevens/)

</details>

---

[![FullProduct.dev screenshot](https://github.com/user-attachments/assets/a2eecfd2-7889-4079-944b-1b5af6cf5ddf)](https://fullproduct.dev/demos?v=universal-app-router-pr-docs)

## 🛠 Getting Started

Use **`git clone`**, or the GitHub UI to ❇️ **[generate a new project](https://github.com/new?template_name=green-stack-starter-demo&template_owner=FullProduct-dev&visibility=private&use_v2_form=true&description=🚧%20Make%20sure%20to%20run%20`npx%20@fullproduct/universal-app%20sync`%20to%20attach%20the%20starterkit%27s%20git%20history%20💡%20Run%20`npx%20@fullproduct/universal-app%20install%20plugins`%20afterwards%20to%20expand%20your%20setup)** from our **[template repo](https://github.com/FullProduct-dev/green-stack-starter-demo)**, then run:

```bash
npm install
npm run dev
```

- Open [http://localhost:3000](http://localhost:3000) for the Next.js app (web)
- Use [Expo Go](https://expo.io/client) or `npm run ios` / `npm run android` to test mobile

> **All set** 🚀 >> Continue from the **📗 [FullProduct.dev Docs](https://fullproduct.dev/docs?v=gh-demo-readme)**

> ⚡️ [Quickstart](https://fullproduct.dev/docs?v=gh-demo-readme) | 
💡 [Core Concepts](https://fullproduct.dev/docs/core-concepts?v=gh-demo-readme) | 
📂 [Project Structure](https://fullproduct.dev/docs/project-structure?v=gh-demo-readme) | 
❇️ [Codegen](https://fullproduct.dev/docs/generators?v=gh-demo-readme)

...

---

<details>
    <summary>FullProduct.dev - License</summary>

---

## FullProduct.dev - License (Premium version)

This repository is proprietary and provided under the **FullProduct.dev Premium Starterkit
Commercial License (EULA)** — see [`LICENSE.md`](./LICENSE.md).

- Access is limited to authorized users/seats under a paid license.
- The starterkit and all derivatives must remain private (no public redistribution).
- End Products may be shipped to clients/end users as permitted by the EULA.

</details>

---
