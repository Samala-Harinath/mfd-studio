# MFD Studio — Templates and Visual Editor Guide

This guide explains how an MFD (Mutual Fund Distributor) picks a starting website, then adjusts the header, colours, and hero image, without being able to break the parts that must stay on every site.

It is written in plain language. The pattern is the one used by serious website products (Shopify themes, Webflow’s section editor, Squarespace templates): **a few finished looks, a short list of allowed adjustments, and a server that refuses anything outside that list.**

**Also read:** [MFD_Studio_Guide.md](./MFD_Studio_Guide.md) for how a site is created and saved today.

This feature is **built**. MFDs use **Dashboard → Design** (five templates, light/dark, background, text, brand and button colours, five fonts, three header layouts, three banner layouts, banner image, corner style). Admins use **Payload admin → Tenants → Live Preview**. The shared rules live in `src/lib/design.ts` and run in the browser and again in `saveSite`. Header position is picked from three tested layouts rather than free drag-and-drop, for the reasons in this guide.

---

## 1. The result, in one minute

1. The MFD opens **Create a website** and sees three finished templates: Classic, Bold, and Minimal. Each card is a small picture of a real site, not a colour swatch.
2. They pick one. The form fills in a whole look: header arrangement, light or dark, font, text colour, button colour, corner shape, and a starter hero.
3. Later, in the dashboard, they can change one piece at a time.
4. The header is changed by **dragging a header style into the allowed slot**, or by dragging the logo and the menu between the positions you designed (left, centre, one row). Dropping it anywhere else does nothing and shows an error.
5. They can switch **Light** or **Dark**, pick a **text colour**, pick a **button colour**, and set a **hero background image**.
6. They cannot remove the ARN, the market-risk line, or the Disclosures page. If the editor, or a crafted request, tries to, the server answers with an error and **does not save**.

Payload CMS stays the filing cabinet. The visual editor is a screen in your dashboard. It writes the same business record and page records you already save.

---

## 2. Words used in this guide

| Word | Plain meaning |
|---|---|
| **Template** | A finished starting look. Choosing it sets many fields at once. |
| **Token** | One saved choice: button colour, header position, light or dark. The public site reads tokens and applies them. The MFD never types CSS. |
| **Slot** | A place you designed, such as “logo on the left” or “hero image behind the headline”. Drag and drop only moves things between slots. |
| **Locked chrome** | The frame that is on every public site: ARN, AMFI line, market-risk sentence, Disclosures page. |
| **Tenant** | One MFD business. All of their look-and-feel choices live on this record. |
| **Server check** | A rule in `src/server/sites.ts` that runs on every save. The screen can also warn first. The server is the one that counts. |

---

## 3. What the MFD is allowed to change

These are design tokens. Each one is a field on the tenant, or a file in Media.

| What they change | Allowed values | Where it shows |
|---|---|---|
| Template | `classic`, `bold`, `minimal` | Sets the other tokens below as a starting point |
| Header position | `stacked-left`, `inline`, `centered` | Public header only |
| Theme | `light`, `dark` | Page background and default text |
| Text colour | A hex colour, for example `#0f172a` | Headings and body text |
| Button colour | A hex colour, for example `#0d9488` | Enquire button and other main buttons |
| Font | `modern`, `classic`, `friendly`, `simple` (already exists as `fontStyle`) | Headings and body |
| Shape | `sharp`, `soft`, `round` | Cards and buttons |
| Hero background | An image they upload, or “no image” | Home hero only |

Colour picking already exists as `primaryColour`. In this design, **button colour** is that main colour. **Text colour** is a separate field so a dark theme can use light text without turning the buttons white.

`secondaryColour` already exists on the tenant. Use it as the text colour so you do not invent a second place to store the same idea. If the name confuses people in the dashboard, label the control **Text colour** and keep saving it as `secondaryColour`.

---

## 4. What stays fixed

These items are not tokens. The visual editor does not offer a control for them. If a save still tries to change them, the server throws an error and leaves the stored site as it was.

| Fixed item | Rule |
|---|---|
| ARN | Shown in the header on every layout. It cannot be hidden or deleted. The number can still be corrected in Setup if it was typed wrong. |
| AMFI line | The words “AMFI-registered Mutual Fund Distributor” stay visible. |
| Market-risk sentence | The text in `MARKET_RISK` (`src/lib/format.ts`) stays at the bottom of every public page. The editor cannot edit or remove it. |
| Disclosures page | `locked: true`. It stays published. It cannot be deleted, unpublished, or dropped off the menu. |
| Banned phrases | `adviser`, `advisor`, and `wealth manager` are already rejected by `findRestrictedTerm`. The same check runs on hero text, button labels, and every other box in the editor. |
| Another MFD’s site | The tenant id comes from the logged-in user, never from the editor payload. |
| Header position outside the three layouts | Any other value is rejected. |
| Theme other than light or dark | Rejected. |
| Colours that are not a 6-digit hex | Rejected. The previous saved colour stays. |
| Hero image that is not their own upload | Rejected. No pasted HTML, no external script, no link used as a stylesheet. |
| Raw CSS, HTML, or JavaScript | There is no field for it. A request that includes one is rejected. |

The editor should show the fixed items as a quiet line, for example: “ARN, risk wording, and Disclosures stay on the site.” Do not draw a delete handle on them.

---

## 5. How a template works

A template is **not** a separate website and **not** a copy of HTML. It is a named bundle of tokens.

When the MFD clicks **Bold**, the form sets:

| Token | Bold example |
|---|---|
| Header | `centered` |
| Theme | `light` |
| Font | `classic` |
| Button colour | `#0f172a` |
| Text colour | `#0f172a` |
| Shape | `round` |
| Hero image | empty, until they upload one |

Classic might use `stacked-left`, the Modern font, and soft corners. Minimal might use `inline`, the Simple font, sharp corners, and a light background.

After they pick a template they can still change one token. Changing the header from centred to left does **not** require a new template. The template name can stay `bold` (they started there) or move to `custom` once they change a token. Use `custom` so support can see “this site no longer matches a preset.”

### Where the three templates live in code

Put the presets in `src/lib/themes.ts`, next to `fontPresets` and `themePresets`. The Create screen and the Branding screen both import that list. Do not write the three looks twice.

Each preset is data:

- id and public name
- one sentence a distributor understands (“Centred name, round buttons, quiet colours”)
- the token values above
- a preview image you designed, stored in the repo (a static picture), not in the database

The database stores only the chosen id plus the tokens. It does not store the preview picture per customer.

### What Create a website does

On the Look step (today this is colour and font):

1. Show the three template cards.
2. Clicking a card copies its tokens into the draft.
3. Under the cards, show the individual controls (header, light/dark, colours, font, shape) already filled from that template.
4. On submit, `buildTenant` in `src/lib/build-tenant.ts` carries those tokens onto the new tenant, the same way it already carries `primaryColour` and `fontStyle`.

The starter pages (Home, About, Services, Disclosures, and the rest) stay as they are. A template changes the frame and the hero, not the list of required pages.

---

## 6. Header position, including drag and drop

The header has three approved arrangements. You build three real headers. The MFD picks one. You do not let them drag the logo to an arbitrary pixel.

| Id | What the visitor sees |
|---|---|
| `stacked-left` | Logo and business name on the left. Enquire on the right. Menu on a second row. This is today’s header in `src/components/website/public-site.tsx`. |
| `inline` | Logo, menu, and Enquire on one row. |
| `centered` | Logo and name in the centre. Menu centred underneath. Enquire on the right of the menu row. |

ARN and the AMFI line are inside all three. They are not a draggable piece.

### How the drag and drop should behave

This is a **slot editor**, the industry pattern for theme editors.

1. The preview shows the site.
2. A tray lists the three header styles, or the movable pieces: logo block, menu, Enquire button.
3. The MFD drags a piece onto a highlighted slot (left, centre, or the single-row track).
4. Slots that would hide the ARN, push the risk line, or make the menu unreachable do not highlight.
5. On a legal drop, you set `headerLayout` to the matching id and the preview redraws that header component.
6. On an illegal drop, the piece snaps back. The screen says what was wrong, in one sentence.

Example errors from the screen:

- “The menu has to stay in the header.”
- “The ARN stays next to the business name.”
- “That header style is not available.”

Those sentences are hints. The save request still sends only `stacked-left`, `inline`, or `centered`.

### Why this is the professional version

Free dragging (any x/y position) produces a different layout per customer. You cannot test it, you cannot keep the ARN visible, and phone screens break. Shopify, Ghost, and most regulated brochure sites use named layouts for the header and drag-and-drop only for **sections in the page body**.

Use drag-and-drop for:

- choosing the header layout (drop onto the three style slots)
- later, reordering page sections (hero, services, text, contact)

Do not use it for placing the ARN, the risk line, or Disclosures.

---

## 7. Light and dark, text colour, button colour, hero image

### Light and dark

`themeMode` is either `light` or `dark`.

- **Light:** page background near white, default text near black.
- **Dark:** page background near black, default text near white.

The MFD’s text colour and button colour override the defaults when they pass the contrast check in section 8. A dark theme with black text is rejected, because nobody can read it.

The public site applies this with CSS variables on the site wrapper, the same way `fontStyleVars` in `src/lib/themes.ts` already swaps the font. One wrapper, every page follows.

### Text colour and button colour

Both are `#` plus six hex digits. `isHexColour` in `src/lib/themes.ts` already checks that shape.

- Button colour maps to today’s `primaryColour` (the Enquire button already uses it).
- Text colour maps to `secondaryColour`.
- The dashboard label says **Text colour** and **Button colour**, not the database names.

Give them the existing six swatches (Teal, Ocean, Indigo, Amber, Forest, Rose) plus a custom hex box. Swatches set the button colour. Text colour can follow automatically for light mode (dark ink) and dark mode (light ink) until they override it.

### Hero background image

The hero is the top block of the Home page only: the distributor’s name, their intro, and the Enquire button.

The background is optional:

- **No image.** A soft tint of the button colour. This is the default and the safest look.
- **Their image.** Uploaded through the Media collection, the same path as the logo (`resolveImage` in `src/server/sites.ts`).

Store the file as `heroImage` on the tenant, an upload field related to `media`, same as `logo` and `photo`.

Rules for the image:

- They can upload a picture they have rights to (office, city, a plain texture). The screen says that.
- You do not accept SVG. SVG can carry scripts. Accept JPEG, PNG, or WebP.
- Cap the file size (for example 2 MB) before it is stored.
- The hero text sits on a translucent panel so the name and intro stay readable on top of a busy photo. That panel is not optional.
- Removing the image is allowed. Removing the hero headline, the ARN, or the Enquire path to Contact is not.

The image is a background. It is not a place to paste HTML.

---

## 8. Errors: the screen warns, the server decides

A visual editor that only hides buttons is not enough. Someone can still send a save request. The check belongs in `saveSite`, which already throws `SiteError` with a status and a sentence. Follow that pattern for every new token.

### Check on the server, in this order

1. **Who.** The tenant id is the signed-in user’s business. Ignore any tenant id in the body.
2. **Fixed pages.** If the page list is missing the disclosures slug, or that page is not published, or `locked` is false, throw. Today `saveSite` already forces `status: published` when `locked` is true and refuses to delete locked rows. Keep that, and add an explicit error when the locked page is absent: `Disclosures stay on the public site.`
3. **Banned words.** Run `findRestrictedTerm` on the business name, intro, hero text, announcement, and page bodies. This already covers name and intro. Extend it to the new text fields.
4. **Header.** If `headerLayout` is not one of the three ids, throw `Choose a header style from the list.` Do not fall back silently in a way that saves the bad value. You may keep the previous value and still return the error so the dashboard can show it.
5. **Theme.** If the mode is not `light` or `dark`, throw `Choose light or dark.`
6. **Colours.** If button or text colour is not a hex colour, throw `Enter a colour like #0D9488.`
7. **Contrast.** If text and background are too close, throw `That text colour is too hard to read on this theme.` A simple industry check is enough: relative luminance contrast of at least 4.5 between text and the theme background. Button text is white on the button colour; if white fails that contrast, throw `Pick a darker button colour so the label can be read.`
8. **Hero file.** If a hero image is present, it must be a media row owned by this tenant, with an allowed image type. Otherwise throw `Upload a JPEG, PNG, or WebP from your computer.`
9. **Unknown design fields.** Strip anything that is not a known token. Do not write a `css` or `html` property if one is sent.

Return **400** for a rule the user can fix, and **403** if they are editing a business that is not theirs. The dashboard already shows save failures. Show the server sentence next to the control that failed.

### Errors the editor itself should show before save

Show these immediately, and still let the server repeat them:

| Action | Message |
|---|---|
| Drag ARN out of the header | “The ARN stays on every page.” |
| Drag the risk line away or clear it | “The market-risk line stays at the bottom of the site.” |
| Delete or unpublish Disclosures | “Disclosures stay published.” (The Pages screen already disables this.) |
| Type a banned phrase | ““advisor” cannot be used on the website.” |
| Drop the header outside a slot | “Drop the header on one of the three layouts.” |
| Pick a hero file that is not JPEG, PNG, or WebP | “Use a JPEG, PNG, or WebP image.” |

If the screen and the server disagree, the server wins. The screen is only a faster copy of the same rules.

### What “throw” means in this codebase

`throw new SiteError(400, "Disclosures stay on the public site.")` stops the save. Payload does not receive the bad update. The previous header, colours, and pages remain. The dashboard shows the sentence. You do not half-save “everything except the illegal part” in a way the user cannot see. One failed check, one message, no write.

---

## 9. How the public site uses the tokens

`PublicView` in `src/components/website/public-site.tsx` is the single public design. It already branches by page (`home`, `about`, `services`, …). Add a small branch for the frame:

1. Read `themeMode`, colours, `headerLayout`, `shape`, and `heroImage` from the tenant.
2. Set CSS variables for background, text, button, and radius.
3. Render one of the three header components. Shared inner content: logo, name, ARN, menu, Enquire. Only the arrangement changes.
4. On Home, render the hero with the image behind the existing headline and intro. The translucent panel stays.
5. Render `MARKET_RISK` in the footer on every page, including inside the dashboard preview (`embedded`).

The preview pane (`PreviewScreen` in `src/components/dashboard/operations.tsx`) already mounts `PublicView`. Once the tokens are on the tenant, the preview and the live site match without a second design.

Phone layout: the three headers collapse to a simple row plus a menu. Test each layout at a narrow width. A centred desktop header may become a left row on a phone. That collapse is part of the template, not a separate choice.

---

## 10. What to add in Payload

Add fields under **Look and feel** in `src/collections/tenants.ts`. Then run `pnpm generate:types` and restart `pnpm dev` so the database columns appear.

| Field | Type | Notes |
|---|---|---|
| `template` | select | `classic`, `bold`, `minimal`, `custom`. Default `classic`. |
| `headerLayout` | select | `stacked-left`, `inline`, `centered`. Default `stacked-left`. |
| `themeMode` | select | `light`, `dark`. Default `light`. |
| `shape` | select | `sharp`, `soft`, `round`. Default `soft`. |
| `primaryColour` | text | Already there. This is the button colour. |
| `secondaryColour` | text | Already there. This is the text colour. |
| `fontStyle` | select | Already there. |
| `heroImage` | upload → media | Optional. |

Do not add a rich text field, a code field, or a JSON blob of CSS for these choices. Selects and hex strings keep every site inside the designs you tested.

Pages stay as they are for this step. Disclosures remains `locked`. A later section editor (hero block, services block, and so on) is a separate field on `pages` and is described in the Studio guide, section 8.3. Header, theme, and colours are **site-wide**. They do not belong on each page.

Access does not change. The multi-tenant plugin already limits reads and writes to that MFD’s rows. Media uploads for the hero must be created with that tenant id, the same as the logo.

---

## 11. Suggested build order

Do these in order. Each step is visible in the preview before you start the next.

1. **Tokens on the tenant** — add the fields, save them from Branding, and paint the existing site with light/dark, text colour, and button colour. No drag and drop yet.
2. **Three headers** — a select is enough to prove all three render with the ARN still visible. Then replace the select with the drag-and-drop slots.
3. **Templates** — the three cards on Create and on Branding, writing the tokens.
4. **Hero image** — upload, remove, and the readable panel on top.
5. **Server errors** — add the checks in section 8 and try to break them (delete disclosures, send `headerLayout: "absolute"`, send black text on a dark theme). Each attempt returns the sentence and does not save.
6. **Contrast and file type** — the last polish, because it is easy to get wrong if you start there.

---

## 12. How you know it is done

- Picking Minimal, then Bold, changes header, font, and shape together, and the preview matches the public site.
- Dragging the header only lands on the three layouts. A drop outside them shows an error and does not change the saved value.
- Light and dark switch the page background. Text colour and button colour follow the fields.
- A hero image shows behind the home headline. A bad file type shows an error and is not stored.
- Unpublishing or deleting Disclosures shows “Disclosures stay published.” The page is still on the public site.
- Clearing the ARN in the editor shows an error. The public header still shows the ARN.
- A sentence containing “advisor” shows an error. Nothing else in that save is written.
- One MFD cannot save tokens onto another MFD’s tenant.

---

## 13. Practice notes

- Keep the template previews honest. The card should be a picture of that header and hero, not a generic mock.
- Name controls the way a distributor speaks: **Light or dark**, **Button colour**, **Header**, not `themeMode` or `headerLayout`.
- Log the server error sentence. Do not log the image file or the full tenant.
- When you add a fourth template later, add a preset in `themes.ts`, a preview image, and a select option. Do not add a new renderer unless the new template needs a header you do not already have.
