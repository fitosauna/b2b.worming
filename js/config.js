/* Worming B2B page settings. Edit these values, commit, and the live page updates. */
window.WORMING_B2B = {
  // Where form submissions are sent (JSON POST). Leave empty until you have one.
  // Works with Formspree, Web3Forms, Make, Zapier or a GoHighLevel inbound webhook.
  // While empty, "Send my application" opens a pre-filled email to `email` below instead.
  formEndpoint: "",

  // Web3Forms needs an access key sent with each submission. Leave empty for other services.
  web3formsKey: "",

  // Company contact details shown on the page and used for the email fallback.
  email: "tomsupenieks@gmail.com",
  phone: "+37120252517",
  whatsapp: "37120252517", // digits only, used for wa.me links

  // Meta (Facebook) Pixel ID, e.g. "123456789012345". Empty = no pixel and no cookie banner.
  metaPixelId: "",

  // Founder video. Put an .mp4 in /video and set its path, e.g. "video/worming-partners.mp4".
  // Self-hosted video plays without a cookie banner. Leave empty to show the placeholder.
  videoSrc: "",
  videoPoster: "images/beds.jpg",

  // Launch offer. Each visitor gets a personal deadline: offerHours after their first visit (remembered in
  // their browser). The page shows a live countdown and hides the offer when their time is up.
  // Each application includes first_visit and offer_deadline, so you can check it before giving the discount.
  // offerDeadline is the date the whole campaign ends; after it nobody sees the offer.
  offerHours: 72,
  offerDeadline: "2027-01-31T23:59:59+02:00",
  offerLabel: "20% off first 3 orders",

  // Where home gardeners are sent after they pick "personal use".
  personalUseUrl: "https://wormingbio.com"
};
