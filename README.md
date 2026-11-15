# Worming B2B partner page (b2b.wormingbio.com)

One-page landing page for Meta (Facebook/Instagram) ads, recruiting distribution partners across Europe.
On purpose, the page does not mention private label or exclusivity: discuss those on the phone.
Plain HTML, CSS and JavaScript. No build step.

## Files
- `index.html`: all page copy and the 8-step qualification form
- `js/config.js`: **settings you edit** (form endpoint, Meta Pixel, video, contacts)
- `js/app.js`: form steps, lead score, tracking, pixel consent
- `css/b2b.css`: styles, using the wormingbio.com brand tokens and fonts
- `images/`: logo and photos copied from the main site's placeholder set

## Before launch
1. **Form delivery.** Set `formEndpoint` in `js/config.js` (Formspree, Web3Forms, Make, Zapier or a GoHighLevel inbound webhook). Each submission arrives as JSON with a subject like `Partner application [A]: Company (Country)`. Until it is set, the form opens a pre-filled email to `email` instead, so nothing is lost but the visitor has to press send.
2. **Video.** Add the founder video as `video/worming-partners.mp4` (H.264, under ~50 MB) and set `videoSrc`. Self-hosted video needs no cookie banner.
3. **Meta Pixel.** Set `metaPixelId`. A consent banner appears and the pixel loads only after "Allow". Events: `PageView`, `StartApplication` (custom), `ViewContent` (video play), `Lead` (submitted).
4. **Customer quotes.** Replace the three dashed red cards in the "Already in use" section with real quotes (name, role, company, country, volume), or delete them. Do not publish invented reviews.
5. **Check these placeholder facts** in `index.html`: lead time "5 to 10 working days", "prepayment for the first order", capacity "up to 100 m³ a month", pack sizes 3/10/20/50 L and 1 m³, heat treatment and PVD permit (all from the zz.lv article about Worming), the founder letter wording.
6. **Photos.** The images are the main site's placeholders. Replace with real photos, same file names.

## Launch offer
20% off the product price of the first 3 orders (within 12 months, freight excluded, one per company).
Each visitor has a personal deadline: 72 hours after their first visit (`offerHours`), shown as a live countdown.
When it runs out, the offer disappears for that visitor. Every application includes `first_visit`, `offer_deadline`
and `launch_offer` (only if they applied in time), so give the discount only to applications that carry the offer line.
`offerDeadline` ends the whole campaign. Keep this honest: do not reset or extend deadlines for people who missed them.

## Hosting (GitHub Pages)
- Settings → Pages → Deploy from a branch → `main` / root. Preview URL: https://fitosauna.github.io/b2b.worming/
- When wormingbio.com DNS is ready: add a CNAME record `b2b` → `fitosauna.github.io`, then enter `b2b.wormingbio.com` under Settings → Pages → Custom domain and tick "Enforce HTTPS".
- `personalUseUrl` in config sends home gardeners to the main site.

## Lead score
Business type + first-year volume + turnover + start date + website → score. Tier A ≥ 75, B ≥ 45, else C. Call A leads first.
