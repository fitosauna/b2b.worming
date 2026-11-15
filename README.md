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
2. **Video.** Done: `video/worming-partners.mp4` (1080p H.264, ~44 MB, compressed from the 114 MB original) with poster `images/video-poster.jpg`. To replace it, keep the file under 100 MB (GitHub limit).
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

## Hosting (SiteGround)
`.github/workflows/deploy-siteground.yml` uploads the site to SiteGround on every push to `main` (files listed in `.deployignore` are skipped).
Set the repository secrets `SG_HOST`, `SG_PORT`, `SG_USER`, `SG_SSH_KEY` and `SG_PATH` (for this page: `www/b2b.wormingbio.com/public_html/`).
Until they are set, the workflow skips the deploy. GitHub Pages preview: https://fitosauna.github.io/b2b.worming/

## Offers on the page (honour these)
- First pallet delivered free (freight paid by Worming on the first pallet, anywhere in Europe)
- Matches the spec or we replace it: if a delivery does not match its batch passport, reported within 14 days, replace or refund
- Partner starter kit: product photos, application guides by crop, 5 free sample bags for the partner's customers
- Price list within 24 hours on working days
- Launch offer (see above)
- Exit-intent offer (shown once per visitor when they try to leave): first pallet free, product and delivery, one per company. Applications that accepted it arrive with "FREE FIRST SHIPMENT" in the email subject.

## Quick path
"In a hurry? Just send me the price list" skips straight to the contact step and asks only for company and email. These arrive with `Request type: Quick price-list request` and tier `Quick`.
The turnover question has a "Skip this question" link.

## Lead score
Business type + first-year volume + turnover + start date + website → score. Tier A ≥ 75, B ≥ 45, else C. Call A leads first.

## Phone country code
The phone field has a country-code picker. The default is guessed from the visitor's time zone (no IP lookup, so no visitor data goes to a third party); the visitor can change it.
