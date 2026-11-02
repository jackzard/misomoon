# Use the dashboard

The dashboard is where you read your traffic and change how misomoon tracks a site. The
Worker that runs the API and the tracker serves it at `/` on your misomoon host, such as
`https://analytics.example.com/`. To look around first, open [the demo](#the-demo-dashboard).
[What the numbers mean](metrics.md) explains each number.

## Find your way around

The bar across the top holds the site menu, the views, the live counter, the **Docs**
button, which opens docs.misomoon.com in a new tab, the command palette and theme buttons,
and your initial, which shows your name, email, and role and
lets you sign out. Select the site name to switch sites or, when signed in, to
**Add a site**. The menu opens on **Search sites**, which matches a site's name or domain;
Enter opens the first match. It shows five sites at a time and scrolls for the rest. The live counter, such as **3 here now**, counts visitors in the last 5
minutes. Select it to open **Live**.

| View | Key | What it shows |
| --- | --- | --- |
| **Overview** | `1` | The summary, the KPI tiles and chart, the globe, and the panels |
| **Live** | `2` | Who is on the site now, minute by minute |
| **Funnels** | `3` | How many people get through a series of steps |
| **Paths** | `4` | Where people go after a page, or how they reached it |
| **Behavior** | `5` | Clicks, scroll depth, forms, site search, errors, media, and content blocks |
| **Speed** | `6` | Web Vitals measured in real visitors' browsers |
| **Settings** | `7` | The script tag, goals, sharing, integrations, revenue, team, sites, and account |

Each view's header holds the period menu, **Filter**, **Saved filters**, and **More**, the
`…` button. **Live** and **Settings** show only a refresh button. Filters in effect show
under the header, after **Filtered by**. The theme follows your system until you pick
one, and the dashboard saves the choice in the `localStorage` key `misomoon.theme`.

With no site yet, the dashboard asks **Which site should we watch?** and shows a form to
add one. The same form is under **Settings** > **Sites**. On a server with more than one
data region, it shows a card for each region below the domain, under **Where to store its
stats**. These are the regions the server has shards for (`SHARD_EU_0`, `SHARD_US_0`,
`SHARD_APAC_0`; see [configuration](configuration.md)). The region nearest the site's
timezone is picked and marked **Nearest**. You can't move a site to another region later.
With one region, the form says the stats are stored there; with none, it says nothing.
**Settings** > **Sites** shows each site's region, and **none** for a site added before the
server had regions, whose stats may be stored on any of its databases. Before a site's first visit, **Overview** is a setup guide: the script tag to
copy, links to the install guides for common platforms, and a line that turns green when
the first visit arrives. The dashboard checks for it every 4 seconds. **Check my site**
opens the site's home page and says whether the tag is there, belongs to another site,
or is missing, or why the page couldn't be read
([Check the install](api.md#check-the-install)). A new site opens on this guide. The
Billing role sees **Billing access** on every view except **Settings**. On misomoon Cloud,
**See the plan** there opens the team's plan in **Settings** > **Team**.

### Plan banners on misomoon Cloud

On misomoon Cloud, a banner across the top of every view tells the members of the open
site's team when the team needs to act:

| Banner | When | Until |
| --- | --- | --- |
| **The free trial ends in 2 days** (or **within a day**) | The team's trial ends within 2 days. | The team has a plan, or the trial ends. |
| **The free trial has ended** | The trial ended, and the team has no plan. Its sites record nothing. | The team has a plan. |
| **This team has no plan** | The team never had a trial, because each person gets one on their first team, and has no plan. | The team has a plan. |
| **This month's events passed the plan** | The month's events reached 100% of the plan's. | The next month starts, or the team moves to a bigger plan. |
| **Tracking is paused** | The month's events reached 125% of the plan's, and the team's sites record nothing. | The 1st of next month, 00:00 UTC, or a move to a plan with room. |

Owners, admins, and billing members get **See the plan**, which opens **Settings** >
**Team** ([Settings](settings.md#team)). Editors and viewers see the banner with a line to
ask an owner of the team. The banner reads `GET /api/v1/me` when the dashboard loads, so a
plan change shows after a reload. A guest on a site sees no banner for its team, and a
self-hosted server shows none. [Use misomoon Cloud](cloud.md#go-past-your-monthly-events)
has the rules.

## Pick a period

Open the period menu and select a period, or press its key while you aren't typing in a
field. The default is the last 30 days. Days follow the site's timezone, which you set in
[Sites](settings.md#sites). **Live** and **Settings** have no period.

| Key | Period | `period` value |
| --- | --- | --- |
| `D` | Today | `today` |
| `E` | Yesterday | `yesterday` |
| `H` | Last 24 hours | `24h` |
| `W` | Last 7 days | `7d` |
| `F` | Last 28 days | `28d` |
| `T` | Last 30 days | `30d` |
| `N` | Last 90 days | `90d` |
| `M` | Month to date | `mtd` |
| `L` | Last month | `lastmonth` |
| `Y` | Year to date | `ytd` |
| `S` | Last 6 months | `6mo` |
| `Z` | Last 12 months | `12mo` |
| `A` | All time | `all` |

### Pick a custom range

1. Open the period menu.
2. On the calendar, select the first day and the last, in either order.
3. Select **Apply**.

A range covers at most 400 days and can't include days after today. **Clear** starts
over. To zoom in, drag across the chart on **Overview**. The days you drag over become a
custom range. Zoom works when the chart shows days, weeks, or months.

### Compare two periods

Open the period menu and pick an option under **Compare with**.

| Option | Compares with | `compare` value |
| --- | --- | --- |
| **Off** | Nothing | `0` |
| **Previous period** | The same length of time just before. This is the default. | not set |
| **Last year** | The same dates a year earlier | `year` |

The period button then adds **vs previous** or **vs last year**, each KPI tile shows its
change, and the chart draws a second line. **Left at once** changes in percentage points,
and a drop shows as an improvement.

### Include imported history

**Include imported history** is in the **More** menu when the site has history imported
from Google or a CSV export. It is on by default, with a check mark. While it is on,
reports without filters add the imported days. Filtered reports never include them. To
bring in history, see [Bring your history](import.md).

### Refresh and export

Both are in the **More** menu. **Refresh** loads every number again. **Live** also
refreshes by itself.

**Export CSV** downloads a zip for the current period and filters: `visitors.csv` with
one row per chart point, one file per breakdown, such as `sources.csv` and `pages.csv`,
with up to 1,000 rows each, and `conversions.csv` for your goals.

## Read the overview

**Overview** opens with a summary, such as "1,204 people visited in the last 30 days, up
12% on the period before." The summary always compares with the period before, whatever
**Compare with** says.

### Pick a metric on the chart

Select a KPI tile to draw its metric on the chart. Hover over a tile to read its
definition. **Revenue** shows only when the period has revenue.

| Tile | `metric` value | What it counts |
| --- | --- | --- |
| **People** | `visitors` | Different people, counted without cookies |
| **Visits** | `visits` | Times someone came by. A visit ends after 30 quiet minutes. |
| **Pageviews** | `pageviews` | Pages opened, reloads included |
| **Pages per visit** | `views_per_visit` | Pages a visit opens on average |
| **Left at once** | `bounce_rate` | Visits that saw one page and did nothing else |
| **Time per visit** | `visit_duration` | Time from the first page to the last action of a visit |
| **Revenue** | `revenue` | Revenue sent with events and payments |

The buttons above the chart switch the time step: `minute` up to 6 hours, `hour` up to 8
days, `day` for 2 to 400 days, `week` from 14 days, and `month` from 60 days. A dashed end
means the last step is still in progress.

### Mark an event on the chart

Select **Note** above the chart, type what happened in up to 200 characters, and select
**Add**. The note shows as a flag at the moment you added it. The Owner, Admin, Editor,
and Guest editor roles can add notes. To date a note earlier, or to mark deploys from CI,
post it with a `ts` through the [API](api.md). The dashboard can't delete notes.

### Read the globe

The globe and the list beside it show where people were. Select a country to break it down
by **Regions**, **Cities**, **Languages**, or **Came via**. Drag to turn the globe. With
reduced motion turned on in your system, it stays still.

## Read the panels

Below the globe, six panels break the period down. Selecting a row filters the dashboard.

| Panel | Tabs | A row opens to show |
| --- | --- | --- |
| **Where they come from** | **Channels**, **Sites**, **Campaigns** | A channel's **Sites**, **Search terms**, **Links**, **Campaigns**, **Mediums**, and **Landed on** |
| **What they read** | **Most opened**, **First page**, **Last page** | Rows filter |
| **What changed** | **Gaining**, **Losing** | Rows filter |
| **What they did** | **Goals**, **Events**, **Details sent** | Rows filter |
| **What they use** | **Devices**, **Browsers**, **Systems** | A device's **Browsers**, **Systems**, **Screens**, and **Networks** |
| **How fast it feels** | Web Vitals | **Open Speed** opens **Speed** |

Rows on **Channels**, **Countries**, and **Devices** open in place. To filter by one, use
the filter icon on the row or **Filter the dashboard by** at the bottom of the panel.
**Search terms** needs Google Search Console, and its rows don't filter. **Details sent**
lists the custom properties sent with events, such as `plan: pro`.

With a comparison on, each row shows its change in people, such as **▲ 12%**. **new**
means the row had no people before. A row shows no change when it wasn't in the
comparison period's top 200. Search terms, goals, and **Details sent** show no change.

**What changed** lists the sources, pages, and countries that gained or lost the most
people, ranked by people, not percent. A row needs at least 3 people, and 1% of the
period's people, before or after. It compares the top 25 of each.

To see every row, select **See all** at the bottom of a panel. The window that opens can
search, sort by any column, and **Load more** in steps of 50 rows.

## Filter the dashboard

A filter narrows every number in every view to the visits that match. Filters stay when
you switch views, clear when you switch sites, and go into the URL. To filter by a row,
select it in a panel. A chip such as **Browser is Chrome** shows after **Filtered by**.

### Build a filter

1. Select **Filter**.
2. Pick a dimension. A dot marks one that already has a filter.
3. Pick **is**, **is not**, **contains**, or **does not contain**.
4. Select one or more values. Several values match any of them, as in **Browser is Chrome
   or Safari**. The box above the list searches it. To match text that isn't listed,
   type it with no value selected and press `Enter`.
5. Select **Apply**.

A `*` is a wildcard, as in `/blog/*`. Each dimension takes one filter, and a new one
replaces the old. To filter by a property you send with events, pick **Custom property**
and a value such as `plan: pro`. One filter covers one property.

| Group | Dimensions, with their URL ids |
| --- | --- |
| Content | Page `page`, Entry page `entry_page`, Exit page `exit_page`, Hostname `hostname` |
| Acquisition | Channel `channel`, Source `source`, Referrer `referrer`, UTM source `utm_source`, UTM medium `utm_medium`, UTM campaign `utm_campaign`, UTM term `utm_term`, UTM content `utm_content` |
| Location | Country `country`, Region `region`, City `city`, Continent `continent`, Timezone `timezone`, Network `network` |
| Technology | Browser `browser`, Browser version `browser_version`, OS `os`, OS version `os_version`, Device `device`, Screen `screen`, Language `language` |
| Behaviour | Goal `goal`, Event `event`, Custom property `prop:` followed by the property name |

| Operator | Matches | In the URL |
| --- | --- | --- |
| **is** | The exact value, with `*` as a wildcard | `==` |
| **is not** | Everything except the value | `!=` |
| **contains** | Values that contain the text | `~` |
| **does not contain** | Values that don't contain the text | `!~` |

The server accepts at most 8 filters, 6 values in one filter, and 16 values in all,
with no `;` or `|` inside a value. To remove filters, select the close button on a chip,
select **Clear all**, or press `Esc` to remove the last one, on **Live** too.

### Save filters

A saved filter is a named set of filters. The API calls it a segment.

1. Sign in and set the filters.
2. Select **Saved filters** next to **Filter**, and type a name. An existing name gets
   replaced.
3. To share it with everyone who can see the site, select **Everyone on the site sees
   it**. Without it, only you see it, marked **you**.
4. Select **Save current filters**.

The **Saved filters** button shows once the site has a saved filter you can see, or once
you are signed in and have set a filter. To apply one, open **Saved filters** and select
its name. To delete one, select the close
button next to it. You can delete your own. The Owner, Admin, Editor, and Guest editor
roles can also share saved filters and delete shared ones. A shared link can be limited
to one shared saved filter ([Sharing](settings.md#sharing)). While a link uses a saved
filter, it can't be deleted: delete the link first.

## Watch visitors live

**Live** updates every 5 seconds while the tab is visible, and ignores the period. It shows visitors in the last 5
minutes, pageviews for each of the last 30 minutes, the latest 40 pageviews and events,
and the top 8 **Pages**, **Sources**, and **Countries**. Select a row to filter by it.

## Build a funnel

**Funnels** counts how many people get through a series of steps, and where the others
drop out.

1. Select the new funnel button next to **Saved**.
2. Name the funnel and pick a **Funnel type**: **Sequential**, **Strict**, or **Flexible**.
3. For each step, pick **Visits page** or **Triggers event**, and type a path or an event
   name. **Add step** adds up to 8 steps.
4. Select **Save funnel**.

[Goals, funnels, and paths](conversions.md#build-a-funnel) covers funnels in depth.

## Follow paths through the site

**Paths** shows the pages people opened one after another. **Where they go next** starts
from the pages where visits began. **How they got there** starts from the pages where
visits ended. Select a page to add a column, up to 6. **Start over** clears the trail.
[Goals, funnels, and paths](conversions.md) explains how misomoon builds paths.

## See what people do on a page

**Behavior** has seven reports: **Clicks**, **Scroll**, **Forms**, **Search**, **Errors**,
**Media**, and **Content**. Each report except **Scroll** needs its feature ticked in
[What to track](settings.md#install). **Clicks** and **Scroll** report on one page: the
page you filtered by with **is**, or the one you pick in **Page**. **Show on your site**
draws the clicks and scroll depth over the page in a new tab.
[See what people do on a page](tracking.md#see-what-people-do-on-a-page) describes each
report.

## Check page speed

**Speed** shows five Web Vitals measured in real visitors' browsers. To collect them, tick
**Web Vitals** in [What to track](tracking.md#choose-what-to-track). Each tile shows the
75th percentile, the number of samples, and a rating: a circle for **Good**, a square for
**Needs work**, and a triangle for **Poor**.

| Vital | Measures | Good | Poor |
| --- | --- | --- | --- |
| LCP | Time until the main content is visible | 2.5 s or less | Over 4 s |
| INP | How fast the page responds to clicks and taps | 200 ms or less | Over 500 ms |
| CLS | How much the layout moves while it loads | 0.1 or less | Over 0.25 |
| FCP | Time until the first text or image appears | 1.8 s or less | Over 3 s |
| TTFB | Time until the server starts to respond | 800 ms or less | Over 1.8 s |

Values between the limits rate **Needs work**. INP needs clicks or taps, so pages people
only read collect fewer INP samples. **Slice by** lists the top **Pages**, **Devices**,
**Countries**, and **Browsers**. Select a row to see its vitals.

## Change settings

**Settings** has eight tabs. Each shows only when it has something for your role.

| Tab | Holds |
| --- | --- |
| [**Install**](settings.md#install) | The script tag, what to track, privacy, and the proxy |
| [**Goals**](settings.md#goals) | The site's goals |
| [**Sharing**](settings.md#sharing) | Shared links and email reports |
| [**Integrations**](settings.md#integrations) | AI tools over MCP, imported history, and Google Search Console |
| [**Revenue**](settings.md#revenue) | The payment provider |
| [**Team**](settings.md#team) | The people on the site's team, invitations, and on misomoon Cloud the team's plan |
| [**Sites**](settings.md#sites) | The site's name, timezone, and currency, your other sites, and deleting a site |
| [**Account**](settings.md#account) | Your name, password, API keys, and account |

## Use keyboard shortcuts

Outside a text field, `1` to `7` open the views and the period keys pick a period. `Esc`
closes the open menu or window, or removes the last filter. `⌘` `K` on macOS, or `Ctrl`
`K` elsewhere, opens the command palette. The palette goes to a view, picks a period,
switches site, turns the comparison on or off, clears all filters, and switches the theme.

## Go back and forward

The browser's Back and Forward buttons move through where you've been in the dashboard,
and Back returns you to the same spot on the page. A reload keeps the spot too. Back leaves
the dashboard only after you've stepped through everything you did there.

Each of these adds a step:

- Another view, site, or Settings tab
- A period or a filter
- A Behavior report or page
- Another funnel, or a new one
- A page added to or removed from a path
- Opening a "See all" window

Back closes a "See all" window, and so does closing it yourself, which leaves no extra step
behind. Picking a row in the window adds its filter as a step, so Back opens the list again.

The comparison, the chart metric, and the imported-history switch don't add a step. They
stay with the step you're on, and they're still set when you come back to it.

A place can change after you've left it. Back to a site you've since left or deleted stays
on the current site, and Back to a deleted funnel opens the first saved one. Unsaved edits
to a funnel or a form don't come back: save them before you move on.

The demo inside another page, `/demo?embed`, adds no steps, so the Back button of the page
around it keeps working.

## Link to a view

The URL follows what you look at, so copy it to share the exact view, period, and filters
with someone who can open the site. The dashboard leaves out a parameter at its default,
and uses the default for a value it doesn't accept.

| Parameter | Values | Default |
| --- | --- | --- |
| `site` | A site id | The demo site when you can see it, otherwise your first site |
| `view` | `overview`, `realtime`, `funnels`, `journeys`, `behavior`, `vitals`, `settings` | `overview` |
| `tab` | `install`, `goals`, `sharing`, `connect`, `revenue`, `team`, `sites`, `account`, with `view=settings` | The first tab you can see |
| `report` | `clicks`, `scroll`, `search`, `errors`, `forms`, `media`, `content`, with `view=behavior` | `clicks` |
| `page` | A page path for a per-page report, with `view=behavior` | The page with the most views |
| `funnel` | A saved funnel's id, or `new` for an empty one, with `view=funnels` | The first saved funnel |
| `dir` | `backward` reads the path back from its last page, with `view=journeys` | Forward |
| `step` | A page on the path, repeated once per page, up to 6, with `view=journeys` | None |
| `details` | `sources`, `pages`, `actions`, `tech`, `places`, `vitals`: the panel whose "See all" window is open, with `view=overview` or `view=vitals` | Closed |
| `period` | A value from the [period table](#pick-a-period), or `custom` | `30d` |
| `from`, `to` | Dates as `YYYY-MM-DD`, at most 400 days apart, with `period=custom` | None |
| `f` | Filters, as below | None |
| `compare` | `0` for off, `year` for last year | The previous period |
| `metric` | A value from the [tile table](#pick-a-metric-on-the-chart) | `visitors` |
| `imported` | `0` leaves imported history out | Included |

Each filter in `f` is a [dimension id and an operator](#build-a-filter), then one or more
values. A semicolon separates filters, and a pipe separates values. When you build the
URL by hand, encode the value. The [Stats API](api.md) reads the same grammar. This keeps
visits from Germany or France to pages that contain `/blog`:

```text
f=country==DE|FR;page~/blog
```

| Path | Opens |
| --- | --- |
| `/share/<slug>` | A [shared link](#open-a-shared-or-public-dashboard) |
| `/invite/<token>` | An invitation from an email, on the sign-in screen |
| `/reset/<token>` | A password reset from an email, on the sign-in screen |
| `/?login=<code>` | The way back from Google: the dashboard trades the code for a session ([Sign in with Google](sign-in.md)) |
| `/?login_error=<reason>` | A Google sign-in that failed, on the sign-in screen ([When sign-in fails](sign-in.md#when-sign-in-fails)) |
| `/?signup` | The sign-up form, or **Sign in** when `SIGNUPS` is `invite` or `closed` ([Configuration](configuration.md)) |

## Open a shared or public dashboard

A shared link opens the dashboard read-only at `/share/<slug>`. If the link has a
password, the browser tab stays unlocked for up to 7 days after you enter it. A viewer
sees every view except **Settings**, and can change the period, compare, filter, and
export. They can't add notes, save filters, or save funnels. A link limited to a saved
filter applies it to every number and ignores the viewer's own filter on the same
dimension.

Signed out, the dashboard's address opens the sign-in screen, with a link to the
[demo](#the-demo-dashboard) under it. A public site opens read-only for signed-out
visitors from a link with its id, such as `/?site=demo`. Once you sign in, the site menu
lists only the sites where you have a role. [Share a dashboard](sharing.md) covers both.

## The demo dashboard

`/demo` on your misomoon host opens the dashboard on Acme, a made-up outdoor store with
purchases, goals, two funnels, and data for every **Behavior** report. The landing page
embeds it at `misomoon.com/demo`. It is the real dashboard, always signed out, with
**Settings** hidden, but it doesn't ask the API: it reads a recording of Acme's reports
that ships with the dashboard, so every view opens at once. Each period's recording loads
only when that period is shown, and none of it loads anywhere but `/demo`. Its logo leads
back to misomoon.com, and **Start free trial** at the top right opens the sign-up form.

The recording moves its dates so that it ends today, in Acme's time zone. What it doesn't
hold is made up from what it does:

- A filter keeps its value's share of visitors, read from the recorded breakdown of that
  dimension, and scales every count by it. Rates and averages stay the same. The rows
  under an opened channel or device were recorded with that filter, so they are exact.
- A custom range shows the preset period closest to it in length.
- **Paths** past the first pick follow what came after the last page picked, scaled to the
  people who got there.
- A funnel other than Acme's two counts each step's visitors from the page and event
  reports, and never more than the step before.
- **Live** plays the recorded events in a loop that ends now, so a few people are always
  online and new ones arrive while it is open. Its counts come from those events.
- **Behavior** opens its Clicks and Scroll reports on the home page rather than the most
  viewed page, `/shop`, which has no clicks in the recording.
- Anything that saves, such as a note on the chart, answers that the demo is read-only.
  **Export CSV** still asks the API.

To record it again, run `pnpm --filter @misomoon/dashboard demo:data`. It reads the
sample site from misomoon Cloud, or from `API_URL`, two requests at a time and waiting
whenever the stats API's limit of 100 requests a minute is reached, and writes
`apps/dashboard/src/demo/`. It records only the periods that have no file yet; `FRESH=1`
records them all again. The sample site itself comes from
[`SAMPLE_SITE`](configuration.md#variables).

The landing page's fig. 1 shows the same demo in a frame, at `/demo?embed&theme=dark` or
`theme=light`. In this mode the dashboard hides its top bar, view tabs, plan banner, and
the **Export CSV** and **Refresh** controls. It opens on **Overview** and shows
**← Overview** when a click leads to another view. It takes the theme from the URL and
doesn't save it. The page around it switches the theme
without reloading the frame by posting `{"type": "misomoon:theme", "theme": "dark"}`.
`?embed` works only on `/demo`; any other path ignores it.

Fig. 1 loads the frame only when the figure is within a screen of view and the browser is
idle, so it never delays the page. Until then the window is empty. The button at the frame's top right
opens it full screen; the X, Escape or a click outside closes it, and the dashboard stays
on the view you left it on.
