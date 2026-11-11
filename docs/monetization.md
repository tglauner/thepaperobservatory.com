# Monetization and distribution

Monetization is a product requirement. The learning content remains usable without a purchase, account or advertisement interaction. The initial commercial priority is relevant training; advertising and social distribution add revenue and discovery after their accounts and integrations are verified.

The dated [90-day monetization plan](monetization-plan.md) sets priorities, experiments, measurement and illustrative economics. Routine implementation and daily email reporting are delegated to the [growth agent](growth-agent.md); the plan is not evidence that a commercial integration is active.

The owner-approved course scope is Interest Rate Derivatives, MBS/ABS and FRTB. The Value at Risk course is excluded from Observatory promotions and monetization planning; it was removed from the deployed catalog on 2026-11-10.

## Revenue sequence

| Channel | Implementation direction | Activation condition |
| --- | --- | --- |
| Owned training courses | Contextual course recommendations on `/learn/` and relevant companions; clear course outcome and destination | Verified course URL and offer; no invented coupon, price or expiry |
| Affiliate training/books/tools | A small number of sources that support the actual lesson | Real affiliate relationship and visible disclosure; ordinary links otherwise |
| Google AdSense | Restrained placements between reading sections or after an exhibit; reserved space avoids layout shifts | Approved publisher/site, correct IDs, ads.txt where required and appropriate consent integration |
| YouTube | Longer visual explanations and Shorts that point to one canonical exhibit | Verified owned account, original educational value, destination-specific disclosure and monetization eligibility |
| TikTok / Instagram Reels | A concise demonstration with one question, one visual result, one qualification and an exhibit CTA | Verified owned accounts and authorized posting |
| Sponsorship | Clearly separated sponsorship of a topic/learning series | A real agreement and explicit disclosure; no effect on source claims |
| Newsletter / memberships | Consider only after recurring demand and a useful recurring benefit | Working subscription, delivery and consent infrastructure; no nonfunctional sign-up form |

## The conversion path

Short-form content should make one research mechanism understandable, then point to its interactive companion. The companion offers a related next experiment and, when genuinely useful, a course that teaches the prerequisite or extension. Use consistent campaign naming and canonical URLs; never split traffic among invented accounts or duplicate paper URLs.

Create a per-paper draft pack containing a 9:16 visual storyboard, concise narration, captions, thumbnail/cover copy, source citation and one CTA. Preserve the paper's uncertainty and scope in the caption or spoken qualification. A short-form draft is not authorization to post or send messages. Avoid performance promises or synthetic backtests presented as actual results.

Course links should explain the skill learned. Do not manufacture coupons or imply a discount without separately verifying the code, price and expiry. Commercial relationships belong near the recommendation. No purchase is required to run a lab.

## Advertising behavior

Keep ads away from sliders, play/reset controls, menu toggles, source citations and downloads. Do not style advertising as experiment output or ask readers to click ads. Leave Google scripts disabled until real publisher configuration and the appropriate consent mechanism are present. Never put secret values into browser config; a public publisher ID is different from a private credential.

Google's publisher policies cover content, ad behavior and authorization; read the current [Google Publisher Policies](https://support.google.com/adsense/answer/10502938) when activating ads. Follow the relevant [European regulations guidance](https://support.google.com/adsense/answer/13554116) for traffic requiring a certified consent-management platform. Exact eligibility and regional obligations must be checked during activation rather than inferred from this document.

## Platform quality and AI disclosure

The site's fully AI-generated production method is public. Each video still needs a distinct, source-grounded educational explanation rather than a superficial template with changed names. YouTube's [channel monetization policy](https://support.google.com/youtube/answer/1311392) addresses repetitive/mass-produced content and original educational value. TikTok's [AI-generated content guidance](https://support.tiktok.com/en/using-tiktok/creating-videos/ai-generated-content) describes labeling, and its [Creator Rewards guidance](https://support.tiktok.com/en/business-and-creator/creator-rewards-program) governs eligibility. Verify Instagram/Meta's current rules in the owned account before activating its monetization features. No platform payout is assumed or promised.

## Measurement and cost

When a measurement system is intentionally enabled, compare qualified exhibit visits, course outbound clicks/conversions, returning learners, ad revenue per session and total generation/QA cost per exhibit. Separate draft reach from verified production traffic and revenue. Start with the lean static architecture; avoid a paid social automation stack until actual volume justifies it. A source-faithful, reusable explanation is more valuable than publication count.

## Implemented commercial configuration

`shared/site-config.js` holds verified TGIR course destinations and the public repository URL. `shared/ObservatoryShell.jsx` discloses the publisher relationship at the course recommendation and provides cross-paper navigation and sharing. `scripts/social-packs.mjs` builds deterministic draft narration, shot lists, carousel outlines and channel-specific UTM links from `content/social/<slug>/concept.json`. Generated download packs are public; posting requires the owner's actual social account. No accounts, followers or published videos are invented.

`shared/advertising.js` is inactive by default. An agent can activate advertising after the owner supplies an approved AdSense publisher/slot and a configured Google-certified CMP. Public build settings are `VITE_ADSENSE_ENABLED`, `VITE_ADSENSE_PUBLISHER_ID`, `VITE_ADSENSE_SLOT_ID` and `VITE_GOOGLE_CMP_READY`, documented without credentials in `.env.example`. These identifiers are not API keys. The runtime waits for the CMP's TCF signal and withholds ads when the CMP is unavailable, still loading or consent is denied. Google evaluates the remaining consent signal. Review the live CMP, advertising privacy choices, `ads.txt`, privacy notice and ad-placement behavior together before enabling. This release has no approved publisher configuration and makes no ad requests. A deployment agent should perform this activation; Tim need not hand-edit application code.
