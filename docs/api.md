# API reference

The API Worker serves every route on this page from the dashboard's origin. The examples
use `https://analytics.example.com`. The MCP tools have their own page,
[Ask AI tools about your traffic](mcp.md), and the blog's content API is in
[Publish posts and pages](content.md#content-api).

## Quick start

1. In the dashboard, open **Settings** > **Integrations** and click **Create API key**.
   Copy the `mm_` key. It is shown once.
2. Ask for the last 7 days of one site:

```sh
curl -H "Authorization: Bearer mm_..." "https://analytics.example.com/api/v1/stats/aggregate?site=shop&period=7d"
```

```json
{
  "site": "shop",
  "window": { "from": 1792540800000, "to": 1793145600000 },
  "current": { "visitors": 3361, "visits": 4286, "pageviews": 9332, "views_per_visit": 2.18, "bounce_rate": 48.9, "visit_duration": 96, "events": 1830, "revenue": 5192, "average_revenue": 40.9 },
  "previous": null,
  "change": null
}
```

`compare=previous` fills `previous` and `change`. The other stats routes take the same
[query parameters](#query-parameters).

## Authentication

Send a token in the `Authorization: Bearer` header. The API ignores a token in the query
string, so a key never lands in logs or browser history. A request without a token can
read public sites, such as the demo.

| Prefix | What it is | How you get it |
| --- | --- | --- |
| `mm_` | API key. It acts with its owner's role. A key limited to one site has no role on other sites. | **Settings** > **Integrations** for one site, or `POST /api/v1/keys` for one site or all of them |
| `ms_` | Browser session, valid for 30 days | `POST /api/v1/auth/login`. The dashboard stores it. |
| `sh_` | Shared link: read-only, one site, with the link's segment applied to every query | `POST /api/v1/share/:slug` |

A Google sign-in hands the dashboard a one-time `ml_` code, which `POST /api/v1/auth/exchange` trades for an `ms_` session.

The **Role** column in the tables below names the least access a route needs.

| Role | Who has it |
| --- | --- |
| Public | Anyone. No token is needed. |
| Any | Any token, or none. The answer depends on who asks. |
| Viewer | `read` on the site: a team owner, admin, editor, or viewer, or a guest of the site. Also a public site without a token, and a shared link's site with its `sh_` token, unless the row says otherwise. A billing member reads no stats. |
| Editor | `edit`: a team owner, admin, or editor, or a guest editor of the site. |
| Admin | `manage`: a team owner or admin. |
| Owner | `own`: a team owner. |
| Session | A signed-in user with an `ms_` token. An API key gets `403` (`API keys cannot do this; sign in to the dashboard`). No token gets `401`. |

## Errors

Every error is JSON with an `error` message, such as `{"error": "unknown property: pagee"}`.
An error that a client can act on also has a stable `code`.

| Status | Meaning |
| --- | --- |
| `400` | Invalid request: an unknown period, dimension, or filter, a range over 400 days, a missing or malformed field, or a body that is not JSON. |
| `401` | No token, an expired token, an unknown API key, or a wrong password. |
| `402` | Polar could not charge the card for a plan switch, with the code `payment_failed`. Nothing changed ([Billing](#billing)). |
| `403` | Your role does not allow this, or the route needs a browser session and got an API key. On a server that enforces plans, also a plan limit, with a `code` (see [Plan limits](#plan-limits)). |
| `404` | The site or resource does not exist, or the `/api/*` path is unknown. |
| `405` | `GET /mcp`. The MCP server takes `POST` only. |
| `409` | A conflict: a domain, site id, goal name, account, or team member that already exists, a team that still has sites, a change that leaves a team without an owner, an import while the site's history moves between shards, or search terms for a site without Search Console. For billing, a team that has not paid for a plan yet, or a change Polar refuses. |
| `413` | A body over 256 KB for a payment webhook or the Polar billing webhook, or 64 KB for `/mcp`. `POST /api/event` drops a body over 16 KB and still answers `202`. |
| `429` | Over a rate limit. The `Retry-After` header gives the seconds to wait ([Rate limits](#rate-limits)). |
| `500` | An unexpected error: `{"error": "internal error"}`. |
| `501` | The server lacks what the feature needs: `CF_API_TOKEN`, `CF_ZONE_ID`, and `PROXY_CNAME_TARGET` for the managed proxy, `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for Google import and Search Console, the `BROWSER` binding for a PDF report preview, or a Polar setting for billing ([Billing](configuration.md#billing)). The message names what is missing. |
| `502` | Google, the Cloudflare API, or Polar returned an error, or Polar did not answer. The message carries theirs. |
| `503` | No email provider is set up, the provider refused the email, or Browser Run could not print a PDF preview. |

`/mcp` answers with JSON-RPC errors. Payment webhooks have their own statuses, listed in
[Payment webhooks](#payment-webhooks), and so does the Polar billing webhook
([Billing](#billing)).

### Plan limits

On misomoon Cloud, and any server with [`PLANS=on`](configuration.md#plans), a team's plan
limits its sites and how long they keep stats, and a team needs a plan once its free trial
ends. A request past a limit answers `403` with a `code`. The message names the limit and
what to do about it.

| `code` | Returned by | When |
| --- | --- | --- |
| `plan_required` | `POST /api/v1/sites`, `POST /api/v1/sites/:id/transfer` | The team that would own the site has lapsed: it has no plan, and no free trial running ([Try it free for 7 days](cloud.md#try-it-free-for-7-days)). The message points to **Settings** > **Team** to choose a plan. |
| `plan_site_limit` | `POST /api/v1/sites`, `POST /api/v1/sites/:id/transfer` | The team that would own the site has all the sites its plan includes. Only the team's own sites count. |
| `plan_retention_limit` | `PATCH /api/v1/sites/:id` | `retention_days` is longer than the team's plan keeps. The value the site saved already is accepted, even past a plan the team moved down to. |

```json
{
	"error": "This team is on the Starter plan, which includes 1 site. To add another site, choose a bigger plan in Settings > Team.",
	"code": "plan_site_limit"
}
```

A server without `PLANS=on` returns none of them.

The monthly event limit answers no request. `POST /api/event` always answers `202`, and a
team past 125% of its plan's events, or lapsed, has its beacons dropped there
([Go past your monthly events](cloud.md#go-past-your-monthly-events)). `GET /api/v1/me`
shows the state as `stopped` on the team's `plan`.

## Rate limits

`/api/v1/stats/*`, `/api/v2/query`, and `POST /mcp` share a limit of 100 requests per
minute per API key, or per IP address without a key (`STATS_LIMIT`). Each request in an
MCP batch counts. Signed-in dashboards and shared links have no limit. Over it,
`/api/v1/stats/*` and `/api/v2/query` return `429` with
`{"error": "rate limit exceeded, try again in a minute"}`, and `/mcp` returns `429` with
the JSON-RPC error `{"jsonrpc": "2.0", "id": 1, "error": {"code": -32000, "message": "rate limit exceeded, try again in a minute"}}`.
Its `id` is the request's own, or `null` for a batch or a body that isn't one request.

These routes have the same limit per IP address, counted for each route on its own:
`POST /api/v1/share/:slug`, `POST /api/v1/auth/signup`, `POST /api/v1/auth/login`,
`POST /api/v1/auth/forgot`, `POST /api/v1/auth/reset`, `POST /api/v1/auth/oauth/:provider`,
`POST /api/v1/auth/exchange`, `DELETE /api/v1/me`, and
`POST /api/v1/invitations/:token/accept`. Over it, they return `429` with
`too many attempts, wait a minute`. `POST /api/v1/teams/:team/invitations` has the same
limit per person sending the invitations instead of per address.

On these routes an IPv6 address counts by its /64 block, since one subscriber usually
holds a whole /64. The Stats API and MCP count a signed-out caller by the whole address,
so people who share a /64, like an office, each get their own 100. An IPv4 address
counts on its own everywhere.

The limits are approximate, and each Cloudflare location counts on its own, as
[Cloudflare's rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)
does.

Every `429` carries a `Retry-After` header with the seconds to wait: `60` for these
limits, and the time until the oldest send of the hour expires for
[test reports](reports.md#limits). Pages on another origin can read it: the API's CORS
headers expose `Retry-After`.

`POST /api/v1/auth/forgot` also sends at most one reset email a minute to an account,
whoever asks. It answers the same either way, and the link already sent keeps working.
If the email provider refuses the email, the next request can send one at once.

## Query parameters

Every `GET /api/v1/stats/*` route takes these parameters.

| Parameter | Values | Default |
| --- | --- | --- |
| `site` | A site id. `site_id` also works. | Required |
| `period` | `realtime`, `today`, `yesterday`, `24h`, `7d`, `28d`, `30d`, `90d`, `mtd`, `lastmonth`, `ytd`, `6mo`, `12mo`, `all`, `custom` | `30d` |
| `from`, `to` | `YYYY-MM-DD` in the site's time zone, both days included, at most 400 days. Required with `period=custom`. | |
| `filters` | See [Filters](#filters) | None |
| `compare` | `previous` (the same length just before), `year` (the same dates a year earlier), `true` or `1` (same as `previous`), or `0`. Other values compare nothing. | `0` |
| `interval` | `minute`, `hour`, `day`, `week`, `month` | Picked from the period |
| `imported` | `0` leaves imported history out | Included in unfiltered reports |

Days, weeks, and months follow the site's time zone, including daylight saving changes.

## Filters

A filter string holds up to 8 filters separated by `;`. Each filter is a dimension, an
operator, and up to 6 values separated by `|`, with at most 16 values in the query.

```text
country==US|CA;page~/blog;browser!=Safari
```

| Operator | Matches |
| --- | --- |
| `==` | One of the values. `*` is a wildcard: `page==/blog/*`. |
| `!=` | None of the values. Rows with no value match too, unless `(none)` is one of the values. `*` is a wildcard. |
| `~` | Contains one of the values |
| `!~` | Contains none of the values |

`(none)` matches rows with no value, as in `referrer==(none)`.

Dimensions: `page`, `entry_page`, `exit_page`, `hostname`, `event`, `goal`, `source`,
`referrer`, `channel`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`,
`utm_content`, `country`, `region`, `city`, `continent`, `timezone`, `network`,
`browser`, `browser_version`, `os`, `os_version`, `device`, `screen`, `language`, and
`prop:<name>` for a custom property, where the name is 1 to 64 letters, digits, `_`, `.`,
or `-`. `GET /api/v1/meta/dimensions` (Public) returns the list as `key` and `label`
pairs, without `goal`.

`goal==Signup` filters by the saved goal named `Signup`, its page or its event. One goal
filter can't mix page goals and event goals. `channel` takes `Direct`, `Organic Search`,
`Paid Search`, `AI Assistants`, `Organic Social`, `Paid Social`, `Email`, `Video`,
`Affiliates`, `Display`, or `Referral`.

## Stats endpoints

Every stats route needs Viewer on the site.

| Method and path | What it returns |
| --- | --- |
| `GET /api/v1/stats/aggregate` | `site`, `window` (`from` and `to` in milliseconds), and the headline metrics in `current`, `previous`, and `change`, as in the [quick start](#quick-start). `visitors` is unique per day, `bounce_rate` is a percent of visits, and `visit_duration` is seconds from the first to the last pageview or custom event of a visit. `change` is percent, except `bounce_rate`, in percentage points. |
| `GET /api/v1/stats/timeseries` | `interval`, `window`, `points`, and `previous` (`null` without `compare`). Each point has `t`, the bucket start in milliseconds, and the fields of `current`. Empty buckets are zeros. |
| `GET /api/v1/stats/breakdown` | The top values of one dimension. See below. |
| `GET /api/v1/stats/realtime` | Visitors in the last 5 minutes, pageviews per minute for the last 30 minutes, the top pages, sources, and countries now, and recent events. It ignores `period`. |
| `GET /api/v1/stats/vitals` | For `lcp`, `inp`, `cls`, `fcp`, and `ttfb`: the 75th percentile, the sample count, and the counts rated good, needs improvement, and poor. All but CLS are in milliseconds. |
| `POST /api/v1/stats/funnel` | Conversion through 2 to 8 steps. See below. |
| `GET /api/v1/stats/journeys` | The next or previous page after `path` (comma-separated, such as `/,/pricing`). Takes `direction` (`forward` or `backward`) and `limit` (1 to 50, default 12). Rows include `(exit)` and `(entrance)`. A reload counts once. |
| `GET /api/v1/stats/behavior` | Clicks, scroll, site search, errors, forms, media, and content. See below. |
| `GET /api/v1/stats/export` | A ZIP of CSV files. See below. |

A breakdown or behavior response with `truncated: true` came from a shard that had more
than 500 rows, so the rarest rows may be missing.

### GET /api/v1/stats/breakdown

| Parameter | Values | Default |
| --- | --- | --- |
| `property` | A dimension, `goal` (conversions per goal), `props` (every custom property as `key: value` rows), or `search_term` (Google Search Console) | `page` |
| `limit` | 1 to 200, or up to 1000 for `search_term` | `10` |
| `page` | 1 and up | `1` |
| `search` | Only values that contain this text | None |

Returns `property`, `rows`, `total_visitors`, and `has_more`. Every row has `key`,
`visitors`, `visits`, `pageviews`, `events`, `bounce_rate`, and `visit_duration`. Some
rows have more:

| Rows of | Also have |
| --- | --- |
| `page` | `time_on_page` (seconds), `scroll_depth` (percent) |
| `exit_page` | `exit_rate` |
| `event`, `goal`, `props`, `prop:<name>` | `conversion_rate`, `revenue`, `average_revenue`. Goal rows also have `kind` and `match`. |
| Visit dimensions, such as `source` | `revenue` and `average_revenue`, when the visits had revenue |
| Any but `props`, `goal`, `search_term`, with `compare` | `previous_visitors`: `0` when the value had no visitors then, `null` when the comparison window has over 200 values and this one is not in its top 200 |

`search_term` rows have `key`, `clicks`, `impressions`, `ctr` (percent), `position` (1 is
the top), and `visitors`, which holds the clicks. They come live from Google and stay
cached for ten minutes. A site without [Search Console](#google-search-console) returns
`409`. Search terms need a role on the site: a shared link token, or a request without a
token for a public site, returns `403` with `search terms are shown to the site's team only`.

### POST /api/v1/stats/funnel

The body takes the query parameters as JSON fields (`site`, not `site_id`), plus `mode`
and 2 to 8 `steps`, such as `{"kind": "event", "match": "Signup", "label": "Signed up"}`.
Each step has `kind` (`page` or `event`), `match` (a path or event name, cut to 200
characters), and an optional `label` (cut to 80). In place of `steps`, `funnel` takes the
id of a [saved funnel](#funnels). A `mode` in the body overrides the saved one.

| Mode | A visitor completes a step when |
| --- | --- |
| `sequential` (default, also for an unknown mode) | The steps happen in order. Other pages and events may come between them. |
| `strict` | The steps happen in order with nothing between them. |
| `flexible` | The middle steps happen in order. The last step counts anyone who reached it after the first. |

Returns `mode`, `entered`, `completed`, and `steps`, each with `label`, `visitors`,
`conversion` (percent of the first step), and `dropoff`.

### GET /api/v1/stats/behavior

What people did on pages, from the engagement beacon
([tracking guide](tracking.md#see-what-people-do-on-a-page)). Takes `report` (required),
`page` (one path without `;` or `|`, which replaces any page filter), and `limit`
(default 50, at most 500).

| `report` | Returns |
| --- | --- |
| `clicks` | `pageviews`, `visitors`, `clicks`, `rage`, `dead`, and `elements`: `page`, `selector`, `label`, `clicks`, `visitors`, `rage`, `dead` |
| `scroll` | `visits`, `average` (percent), and `reached`: for each depth 0, 10 … 100, the `visits` that scrolled that far and their `share` |
| `search` | `searches`, `visitors`, `total_visitors`, and `terms`: `term`, `searches`, `visitors` |
| `errors` | `count`, `visitors`, and `errors`: `message`, `source`, `count`, `visitors`, `last_seen`, up to 5 `pages` and `browsers` |
| `forms` | `forms`: `form`, `starts`, `submissions`, `conversion`, `visitors`, and `fields` in page order: `field`, `interactions`, `dropoffs`, `position` |
| `media` | `media`: `name`, `type`, `plays`, `visitors`, and `reached`, the percent of plays that got to 25, 50, 75% and the end |
| `content` | `content`: `name`, `impressions`, `clicks`, `ctr`, `visitors` |

### GET /api/v1/stats/export

A ZIP named `misomoon_<site>_<from>_<to>.zip`, with one CSV file per report for the period
and filters. Each breakdown file holds at most 1000 rows.

| File | Columns |
| --- | --- |
| `visitors.csv` | `date`, `visitors`, `visits`, `pageviews`, `views_per_visit`, `bounce_rate`, `visit_duration`, `events`, `revenue`. One row per day, week, or month, from `interval`. `minute` and `hour` give days. |
| `pages.csv` | `name`, `visitors`, `pageviews`, `bounce_rate`, `time_on_page`, `scroll_depth` |
| `entry_pages.csv` | `name`, `visitors`, `visits`, `bounce_rate`, `visit_duration` |
| `exit_pages.csv` | `name`, `visitors`, `visits`, `exit_rate` |
| `custom_events.csv` | `name`, `visitors`, `events`, `conversion_rate`, `revenue`, `average_revenue` |
| `conversions.csv` | The same columns as `custom_events.csv`, one row per goal: the top 10 goals by visitors, or `limit` goals (at most 200) |
| `channels.csv`, `sources.csv`, `referrers.csv`, `utm_sources.csv`, `utm_mediums.csv`, `utm_campaigns.csv`, `utm_contents.csv`, `utm_terms.csv`, `countries.csv`, `regions.csv`, `cities.csv`, `browsers.csv`, `browser_versions.csv`, `operating_systems.csv`, `operating_system_versions.csv`, `devices.csv`, `screens.csv`, `languages.csv` | `name`, `visitors`, `visits`, `pageviews`, `bounce_rate`, `visit_duration` |

## Stats API v2

`POST /api/v2/query` takes one JSON query and returns rows, with no dimension, one time
dimension, or one property dimension. It needs Viewer on the site.

```json
{
  "site_id": "shop",
  "metrics": ["visitors", "pageviews", "bounce_rate"],
  "date_range": "7d",
  "dimensions": ["visit:source"],
  "filters": [["is", "visit:country", ["US", "CA"]]],
  "order_by": [["visitors", "desc"]],
  "pagination": { "limit": 20, "offset": 0 }
}
```

| Field | Values |
| --- | --- |
| `site_id` | Required. A site id or the site's domain. |
| `metrics` | Required. Any field of the [aggregate](#stats-endpoints), timeseries, or breakdown rows, such as `visitors`, `bounce_rate`, `conversion_rate`, or `time_on_page`. `total_revenue` reads `revenue`. `percentage` and `group_conversion_rate` read `conversion_rate`. A metric the rows lack returns `null`. |
| `date_range` | Required. `day` (today), `24h`, `7d`, `28d`, `30d`, `91d` (the `90d` period), `month` (month to date), `6mo`, `12mo`, `year` (year to date), `all`, or two days such as `["2026-01-01", "2026-01-31"]`. Any other name returns `400`. |
| `dimensions` | At most one: `time`, `time:minute`, `time:hour`, `time:day`, `time:week`, `time:month`, or a property dimension. |
| `filters` | A list of `[operator, dimension, values]`, all applied. `["and", [filter, ...]]` groups filters. |
| `order_by` | A list of `[metric or dimension, "asc" or "desc"]`. The first pair sorts first. |
| `include` | `imports: false` leaves imported history out. `total_rows: true` adds `meta.total_rows`. `time_labels: true` adds `meta.time_labels` for a time dimension. |
| `pagination` | `limit` (1 to 10000, default 10000) and `offset` (default 0) |

Property dimensions: `event:page`, `event:hostname`, `event:name`, `event:goal`,
`visit:entry_page`, `visit:exit_page`, `visit:source`, `visit:referrer`,
`visit:channel`, `visit:utm_source`, `visit:utm_medium`, `visit:utm_campaign`,
`visit:utm_content`, `visit:utm_term`, `visit:device`, `visit:browser`,
`visit:browser_version`, `visit:os`, `visit:os_version`, `visit:country`,
`visit:region`, `visit:city`, `visit:screen`, and `event:props:<name>`.
`visit:country_name`, `visit:region_name`, and `visit:city_name` return the same values
as `visit:country`, `visit:region`, and `visit:city`. Each returns at most the top 200
values by visitors. Filters take the same dimensions and the operators `is`, `is_not`,
`contains`, `contains_not`, `matches_wildcard`, and `matches_wildcard_not`.
`matches_wildcard` is `is` with `*` as a wildcard.

The response is `{"results": [{"dimensions": [...], "metrics": [...]}], "meta": {...}, "query": {...}}`,
with `metrics` in the query's order. A time label is the bucket start in UTC:
`YYYY-MM-DD HH:MM:SS` for `time:minute` and `time:hour`, `YYYY-MM-DD` otherwise.

## Sites

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites` | Any | Lists the sites you can read, each with your `role`. Without a token, the public sites. With a shared link, its one site. Both have `role: null`. |
| `POST /api/v1/sites` | Session | Adds a site. Returns `201` and the site. See [Add a site](#add-a-site). |
| `GET /api/v1/sites/:id` | Viewer | One site. |
| `PATCH /api/v1/sites/:id` | Editor | Changes the settings below. Returns the site. |
| `DELETE /api/v1/sites/:id` | Admin | Deletes the site, all of its data on every shard, and its managed proxy hostname. Returns `204`. |
| `GET /api/v1/sites/:id/usage` | Viewer, not public or shared | The ingest cap and what the site stored per UTC day for 31 days: `{"cap": 500000, "blocked": false, "days": [{"day": "2026-10-23", "events": 812, "stored": 1544, "dropped": 0, "capped": false}]}`. `cap` is `null` without a cap. `events` counts pageviews and custom events. `stored` counts every stored row: those events, and the ref-only beacons of a site that takes payments. An engagement beacon adds to its pageview's row and counts in neither. |
| `GET /api/v1/sites/:id/check` | Editor | Opens the site's home page, `https://<domain>/`, and looks for its script tag. See [Check the install](#check-the-install). |
| `POST /api/v1/sites/:id/demo` | Admin | Writes synthetic traffic through the real write path, for local development. `403` unless `DEMO_SEED=1`. Optional body: `days` (default 35, at most 120), `perDay` (default 140, at most 2000), `seed` (default 7). Returns `{"site": ..., "events": <rows written>}`. |

A site object has `id`, `domain`, `name`, `timezone`, `currency`, `team_id`, `public`
(`0` or `1`), `ingest_cap`, `features`, `search_params`, `include_paths`,
`exclude_paths`, `exclude_ips`, `privacy_signals` (`0` or `1`), `retention_days`,
`region` (`eu`, `us`, `apac`, or `null`), and `created_at` in milliseconds. The lists are
comma-separated strings, or `null` for the defaults.

`PATCH /api/v1/sites/:id` takes any of these fields. A `region` other than the site's own
returns `400`.

| Field | Values |
| --- | --- |
| `name`, `timezone`, `currency`, `public` | As in [Add a site](#add-a-site) |
| `features` | What the tracker collects beyond pageviews: any of `outbound`, `downloads`, `forms`, `events`, `payments`, `vitals`, `clicks`, `errors`, `fields`, `media`, `content`, `search` ([Choose what to track](tracking.md#choose-what-to-track)) |
| `search_params` | Up to 10 URL parameters that hold the site search term. An empty list restores `q`, `s`, `search`, `query`, `keyword`. |
| `include_paths`, `exclude_paths` | Up to 20 paths each, starting with `/`. `*` matches within one part of the path and `**` across parts. An empty list removes them. |
| `exclude_ips` | Up to 50 IPv4 or IPv6 addresses or CIDR ranges, such as `203.0.113.7` or `2001:db8::/32`, whose visits never count. An empty list or `null` removes them. |
| `privacy_signals` | `true` drops visits from browsers that send Global Privacy Control or Do Not Track. |
| `retention_days` | Days after which the site's events, visits, and payments are deleted: 30 up to the server's `RETENTION_DAYS` (3650 when that is `0`), or `null` for `RETENTION_DEFAULT_DAYS`. A longer one returns `400`. With plans on, the longest is also the plan's, and a value past it returns `403` with `plan_retention_limit` ([Plan limits](#plan-limits)). `GET /api/v1/me` returns the site's limits as `retention` on each site ([Privacy settings](compliance.md#privacy-settings)). |

### Add a site

`POST /api/v1/sites` needs a browser session. API keys can't add sites. A domain or id
that is already taken returns `409`. With plans on, a team that has lapsed returns `403`
with `plan_required`, and a team that has all the sites its plan includes returns `403`
with `plan_site_limit` ([Plan limits](#plan-limits)).

| Field | Meaning |
| --- | --- |
| `domain` | Required. Lowercased, without `http://`, `https://`, `www.`, or a path. A port, such as `localhost:5173`, stays. |
| `id` | 2 to 40 characters of `a-z`, `0-9`, and `-`. Defaults to the domain with each run of other characters turned into `-`, such as `shop-example-com`. |
| `name` | At most 80 characters. Defaults to the domain. |
| `timezone` | An IANA name. Defaults to `UTC`. |
| `currency` | An ISO 4217 code. Defaults to `USD`. |
| `public` | `true` lets anyone read the stats without a token. |
| `team` | The team that owns the site, where you are owner, admin, or editor, or `403`. Defaults to the first team you joined with one of those roles. Without one, the server makes a team named `My sites` with you as owner. |
| `region` | Where the stats are stored: `eu`, `us`, or `apac`, one of `regions` in `GET /api/v1/me`. Defaults to the region of `timezone`, or the server's first region. It can't change later ([Add data regions](upgrading.md#add-data-regions)). A region the server lacks returns `400`, and so does any `region` on a server without regions. |

### Goals

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/goals` | Viewer | Lists the goals: `id`, `site_id`, `name`, `kind`, `match`. |
| `POST /api/v1/sites/:id/goals` | Editor | Adds a goal. Takes `kind` (`event` or `page`, required), `match` (required: the event name, or the page path with `*` as a wildcard, cut to 200 characters), and `name` (cut to 80, default `match`). Returns `201` and the goal. |
| `DELETE /api/v1/sites/:id/goals/:goal` | Editor | Deletes a goal. Returns `204`. |

A site has at most 50 goals, so the 51st returns `400`. A name the site already uses
returns `409`.

### Funnels

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/funnels` | Viewer | Lists the saved funnels: `id`, `name`, `steps`, `mode`. |
| `POST /api/v1/sites/:id/funnels` | Editor | Saves a funnel. Takes `name` (required, cut to 80 characters), `steps` (at least 2, the first 8 are kept), and `mode` (default `sequential`), as in [POST /api/v1/stats/funnel](#post-apiv1statsfunnel). Returns `201` with its `id`. |
| `PUT /api/v1/sites/:id/funnels/:funnel` | Editor | Replaces a funnel's name, steps, and mode, with the same body. `404` for an unknown funnel. |
| `DELETE /api/v1/sites/:id/funnels/:funnel` | Editor | Deletes a funnel. Returns `204`, or `404` for an unknown funnel. |

### Segments

The dashboard calls segments **Saved filters**. The API keeps the `segments` routes and
`segment_id`. A segment is a saved [filter string](#filters). A site segment is shared
with everyone who can read the site. A personal segment is visible to its author only,
so a viewer can save one.

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/segments` | Viewer | Lists the site's segments and your personal ones, by name: `id`, `name`, `filters`, `personal` (`0` or `1`). |
| `POST /api/v1/sites/:id/segments` | Editor, or Viewer with a session for a personal segment | Saves a segment. Takes `name` (required, cut to 80 characters), `filters` (required), and `personal` (`true` for a personal segment). A name the same owner already has gets the new filters and keeps its id. Returns `201` with `id`, `name`, `filters`, and `personal`. |
| `DELETE /api/v1/sites/:id/segments/:segment` | Editor for a site segment, the author for a personal one | Deletes a segment. Returns `204`, also when it doesn't exist, and `409` while a shared link is limited to it. |

### Annotations

Notes on the chart, such as deploys.

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/annotations` | Viewer | Lists up to 500 annotations by time: `id`, `ts`, `text`, `source`. `from` (default 0) and `to` (default a day from now) are milliseconds. |
| `POST /api/v1/sites/:id/annotations` | Editor | Adds an annotation. Takes `text` (required, cut to 200 characters), `ts` (milliseconds or an ISO date, default now), and `source` (cut to 40 characters, default `manual`). Returns `201` and the annotation. |
| `DELETE /api/v1/sites/:id/annotations/:annotation` | Editor | Deletes an annotation. Returns `204`. |

An editor's API key can post one, so CI can mark deploys:

```sh
curl -X POST "https://analytics.example.com/api/v1/sites/shop/annotations" \
	-H "Authorization: Bearer $MISOMOON_KEY" -H "Content-Type: application/json" \
	-d '{"text": "Deployed v2.3.0", "source": "ci"}'
```

### Shared links

A shared link opens a read-only dashboard of one site.

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/shared` | Editor | Lists the links: `slug`, `name`, `protected`, `segment_id`, `expires_at`, `created_at`. |
| `POST /api/v1/sites/:id/shared` | Editor | Makes a link. Takes `name` (cut to 80 characters, default `Shared link`), `password`, `segment_id` (a site segment, not a personal one, applied to every query through the link; `400` for any other id), and `expires_days` (at most 3650, or no expiry). Returns `201` with `slug`, `name`, `protected`, `segment_id`, and `expires_at`. |
| `DELETE /api/v1/sites/:id/shared/:slug` | Editor | Deletes a link. Returns `204`. |
| `GET /api/v1/share/:slug` | Public | `{"name": ..., "protected": true}`, so the page knows to ask for a password. `404` for a link that expired or was removed. |
| `POST /api/v1/share/:slug` | Public | Trades the link and its `password`, if it has one, for a `sh_` token: `{"token": ..., "site": ..., "name": ..., "expires_at": ...}`. A wrong password returns `401`. |

A `sh_` token lasts 7 days, or until the link expires if that is sooner.

### Email reports and alerts

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/reports` | Editor | `{"subscriptions": [...], "sending": true}`. A subscription has `id`, `email`, `kind`, `threshold`, `last_sent_at`. `sending` is `false` without an email provider. |
| `POST /api/v1/sites/:id/reports` | Editor | Subscribes `email` to `kind`, with an optional whole-number `threshold`. Returns `201` with `{"ok": true}`, or `400` when the site already has 20 subscriptions ([the limits](reports.md#limits)). |
| `DELETE /api/v1/sites/:id/reports/:report` | Editor | Deletes a subscription. Returns `204`. |
| `GET /api/v1/sites/:id/reports/preview` | Editor | The report as it would go out now, as HTML. `kind` is `weekly` (default) or `monthly`. `format=pdf` returns the PDF attachment, which needs the `BROWSER` binding (`501` without it, `503` when printing fails). |
| `POST /api/v1/sites/:id/reports/test` | Editor | Sends the `weekly` (default) or `monthly` report now to `email`. Returns `{"ok": true}`, `429` after 10 tests from the site in an hour ([the limits](reports.md#limits)), or `503` when the email could not go out. |

A second subscription for the same email and kind replaces the threshold. A threshold
out of range returns `400`.

| `kind` | What it sends | `threshold` |
| --- | --- | --- |
| `weekly` | The last full week, Monday to Sunday, in the site's time zone | Not stored |
| `monthly` | The last full month | Not stored |
| `spike` | An alert when visitors online in the last 5 minutes reach the threshold. Checked every 5 minutes, sent at most once in 12 hours. | Visitors online, 1 or more. Default 10. |
| `drop` | An alert when the site has had no pageview for the threshold, if it had pageviews the week before. Checked hourly, sent once until traffic returns. | Hours, 1 to 168. Default 12. |

### Imports

Imported history from a CSV export or a Google Analytics property. Unfiltered reports add
it to the site's own data.

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/imports` | Editor | Lists the imports, newest first: `id`, `site_id`, `source`, `label`, `from_day`, `to_day`, `status` (`importing`, `done`, or `failed`), `error`, `rows`, `skipped_days` (days left out because misomoon or an earlier import counted them), `created_at`, and for an import from another tool that is still running, `days_done` and `days_total` (otherwise `null`). `source` is `csv`, `google`, or the importer's id. |
| `POST /api/v1/sites/:id/imports` | Editor | Imports the `file` fields of a multipart form: a CSV export as a ZIP or its `imported_*.csv` files, or another tool's export that misomoon reads ([Upload CSV files](import.md#upload-csv-files)), with `.gz` files unzipped first. It leaves out the days misomoon or an earlier import counted ([Days that count once](import.md#days-that-count-once)). Returns `201` and the import, or `400` when no day is left or an export can't be read, with the reason. |
| `DELETE /api/v1/sites/:id/imports/:import` | Editor | Deletes the import and its rows on every shard. Returns `204`. |
| `POST /api/v1/sites/:id/imports/api` | Editor | Imports from another tool's API ([Import from another tool](import.md#import-from-another-tool)). Takes `importer` (the tool's id, such as `umami`), `input` (an object of the tool's form fields as strings, such as `website` and `key`), and `from` and `to` (`YYYY-MM-DD`, optional, with the same defaults as the form). Checks the sign-in first and returns `400` with the tool's answer when it fails, or `202` with `{"id": ..., "status": "importing"}`. The import goes on in the background. |
| `POST /api/v1/sites/:id/imports/google/connect` | Editor | Step 1 of a Google import. Returns `{"url": ...}`, the Google consent page. Sign-in must finish within an hour. Google then returns the person to the dashboard settings with `google=<grant id>` in the URL. |
| `GET /api/v1/sites/:id/imports/google/properties` | Editor | Step 2. The Google Analytics properties the Google account can read, for `grant=<grant id>`: `id` (`properties/123`), `name`, `account`. |
| `POST /api/v1/sites/:id/imports/google` | Editor | Step 3. Takes `grant` and `property` (both required), `from` and `to` (`YYYY-MM-DD`, default the earliest day Google serves and the day before misomoon's first counted day, or yesterday in UTC before it). A `to` on or after misomoon's first day becomes the day before it, and a `from` after that returns `400`. Also takes `label`. Imports in the background and returns `202` with `{"id": ..., "status": "importing"}`. The server deletes the grant when the import finishes. |

The CSV import takes `multipart/form-data` with one or more `file` fields: a ZIP of the
export, or its CSV files named `imported_<table>.csv` or
`imported_<table>_YYYYMMDD_YYYYMMDD.csv`. It reads the tables `visitors`, `sources`,
`pages`, `entry_pages`, `exit_pages`, `locations`, `browsers`, `operating_systems`,
`devices`, and `custom_events`, and returns `400` when no file matches. While the site's
history moves between shards, it returns `409`, so try again a few hours later.

Without Google configured, the Google routes return `501`.

A `connect` route also sets the `misomoon_google` cookie (`HttpOnly`, `SameSite=Lax`,
`Secure` over HTTPS, path `/api/v1/google`, one hour), which holds the OAuth state. Google
sends the person to `GET /api/v1/google/callback`, which finishes the sign-in only when
that cookie matches the state, and clears it. Without the cookie, or with another
sign-in's, it answers `403` with a page saying the sign-in was started in another browser,
and asks Google for nothing. Call `connect` from the browser that opens the consent page.
Otherwise it redirects to `/?site=<id>&view=settings&tab=connect`, with `google=<grant>` for
an import, `search=<grant>` for Search Console, or `google_error=<reason>` when the sign-in
failed. The dashboard reads these once and takes them out of the URL.

### Google Search Console

The connected property feeds `property=search_term` in
[GET /api/v1/stats/breakdown](#get-apiv1statsbreakdown).

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/search-console` | Editor | `{"available": true, "connected": {"property": ..., "created_at": ..., "connected_by": <name>}}`. `available` is `false` without Google configured. `connected` is `null` until a property is connected. |
| `POST /api/v1/sites/:id/search-console/connect` | Editor | Starts Google sign-in. Returns `{"url": ...}`. Google returns the person to the dashboard settings with `search=<grant id>`. |
| `GET /api/v1/sites/:id/search-console/properties` | Editor | The verified properties the Google account can read, for `grant=<grant id>`: `property` and `matches` (whether it is the site's domain), matches first. |
| `PUT /api/v1/sites/:id/search-console` | Editor | Connects one of the listed properties. Takes `grant` and `property`. Returns the same object as `GET`. |
| `DELETE /api/v1/sites/:id/search-console` | Editor | Disconnects the property and revokes the Google token. Returns `204`. |

### Payment webhooks

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/revenue` | Editor | `{"sources": [...], "last_30_days": {"payments": 12, "attributed": 9}}`. A source has `provider`, `webhook_url`, `created_at`, `last_event_at`, `last_test_at`, and `last_error`. |
| `PUT /api/v1/sites/:id/revenue/:provider` | Editor | Connects `stripe`, `polar`, `dodo`, `lemonsqueezy`, or `custom`, and turns on the site's `payments` feature. Takes `{"secret": "whsec_..."}`, the signing secret, required for `stripe`, `polar`, and `dodo`. For `lemonsqueezy` and `custom` it is optional and at least 16 characters. Without one, the server makes a secret and returns it once as `secret`. Returns `provider` and `webhook_url`. An unknown provider returns `404`. |
| `DELETE /api/v1/sites/:id/revenue/:provider` | Editor | Disconnects a provider. Returns `204`. |
| `POST /api/webhooks/:provider/:site` | Public, signed by the provider | Takes the provider's webhook. Returns `{"ok": true, "counted": 2}`, or `{"ok": true, "test": true, "counted": 0}` for a test event. |

The webhook returns `404` for an unknown provider or a site without that webhook, `413`
for a body over 256 KB, `401` when the signature does not match, and `400` for a body it
can't read. [Connect payments](revenue.md) lists each provider's events and the `custom`
body.

### Managed proxy

The site's own subdomain, such as `stats.example.com`, pointed at misomoon with a CNAME
([Serve the tracker from your own domain](PROXY.md)).

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/sites/:id/proxy` | Editor | `{"available": true, "target": <CNAME target>, "domain": {...}}`. `domain` has `hostname`, `status`, `ssl_status`, `active`, `records` (the CNAME and any TXT records to add), and `script` (the tracker URL on the hostname), or is `null`. While the hostname is not active, each call refreshes its state from Cloudflare. |
| `PUT /api/v1/sites/:id/proxy` | Editor | Sets `{"hostname": "stats.example.com"}`, a subdomain of the site's domain other than `www`. It replaces any old one. Returns the same object as `GET`, or `501` without Cloudflare for SaaS configured (`available` is then `false`). |
| `DELETE /api/v1/sites/:id/proxy` | Editor | Removes the hostname. Returns the same object with `domain: null`. |

A Cloudflare API error returns `502`.

### Check the install

`GET /api/v1/sites/:id/check` reads the first 512 KB of the site's home page, following
redirects, with 8 seconds to answer. It returns:

```json
{ "url": "https://shop.com/", "status": "found", "http_status": 200, "sites": ["shop-com"] }
```

| `status` | Means |
| --- | --- |
| `found` | The page has a script tag whose `m.js` URL carries this site's id in `s=`. |
| `other_site` | The page has misomoon tags, but only for the site ids in `sites`. |
| `missing` | The page has no misomoon tag. |
| `unreachable` | The page wasn't read. `error` says why, and `http_status` holds an error status, or `null` when the page never answered. |

Tags count from misomoon, a managed subdomain, or a proxy path. A tag inside an HTML
comment doesn't count. A tag that Google Tag Manager, the SDK, or a script adds after
the page loads is not in the HTML, so the check reports `missing`: wait for the first
visit instead. A domain that is not a public host, such as `localhost`, an IP address,
or a domain with a port, is not opened, and the check reports `unreachable` with
`url: null`.

## Accounts and teams

Roles, from most to least access: owner, admin, editor, viewer, and billing.
[Architecture](ARCHITECTURE.md#auth-and-team-roles) lists what each role can do.

### Sign-in

| Method and path | Role | What it does |
| --- | --- | --- |
| `POST /api/v1/auth/signup` | Public | Takes `email`, `password`, and `name` (cut to 80 characters, default the part of the email before `@`). Creates the account and a team named `<name>'s sites` with you as owner. With plans on, that team gets your free trial. Returns `201` with `token`, `expires_at`, and `user`. A taken email returns `409`. |
| `POST /api/v1/auth/login` | Public | Takes `email` and `password`. Returns `token`, `expires_at`, and `user`, or `401`. |
| `POST /api/v1/auth/logout` | Any | Ends the `ms_` session in the header. Returns `204`. |
| `POST /api/v1/auth/forgot` | Public | Emails a reset link for `email`, valid for an hour, replacing any earlier link. Always returns `{"ok": true, "sending": ...}`. `sending` is `false` without an email provider. |
| `POST /api/v1/auth/reset` | Public | Takes `token` (the code from the link) and `password`. Signs out every other session and returns a new `token` and `expires_at`. An expired link returns `400`. |
| `POST /api/v1/auth/oauth/:provider` | Any | Starts a sign-in with `google`, the one provider. Takes an optional `invite` (the `mi_` code from an invitation link) to accept on the way. Returns `{"url": "..."}`, the provider's page to open, and sets the `misomoon_login` cookie, which the callback checks. With an `ms_` session, it connects the provider to your account instead. Returns `404` for another provider, and `501` without the provider's client secrets. |
| `GET /api/v1/auth/oauth/:provider/callback` | Public | The provider sends the browser here. Redirects to the dashboard with `login=<ml_ code>`, valid for a minute, or `login_error=<reason>` ([When sign-in fails](sign-in.md#when-sign-in-fails)). Connecting a provider redirects to `/?view=settings&tab=account` with `linked=<provider>` or `login_error=<reason>`. |
| `POST /api/v1/auth/exchange` | Public | Takes `code`, the `ml_` code from the callback, and works only with the `misomoon_login` cookie the callback set, so only in the browser that signed in. Returns `token`, `expires_at`, `user`, and `site` (the site an accepted invitation opens, or `null`). Each code works once: a used or expired one returns `400`. |

A password has 10 to 200 characters. `SIGNUPS` ([Variables](configuration.md#variables))
decides who can sign up: anyone when it is unset or `open`, only the first account when it
is `invite`, and no one when it is `closed`. A closed sign-up returns `403`. Invitations
work in every mode. Sign-in with Google follows the same rules
([Sign in with Google](sign-in.md)).

### Your account

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/me` | Any | Who you are, and what you can open. |
| `PATCH /api/v1/me` | Session | Changes `name` (cut to 80 characters), or `password` with `current_password`. An account without a password sets its first one without `current_password`. Returns `id`, `email`, and `name`. A wrong `current_password` returns `401`. |
| `DELETE /api/v1/me/logins/:provider` | Session | Disconnects `google` from your account. Returns `204`, `404` for another provider, or `409` when it is the last way to sign in to an account without a password. |
| `DELETE /api/v1/me` | Session | Deletes your account. Takes `{"password": "..."}`, or `{"email": "..."}` (your email address) for an account without a password, or returns `401`. Deletes the teams only you are in, with their sites and data, and your sessions, API keys, saved segments, pending invitations, and email reports. You leave your other teams and lose guest access. Returns `204`, or `409` while you are the only owner of a team with other members, or while a team only you are in has a paid plan that still renews. |

`GET /api/v1/me` returns:

| Field | Meaning |
| --- | --- |
| `kind` | `user`, `key`, `share`, or `anonymous` |
| `user` | `id`, `email`, and `name` of the signed-in user or the key's owner, `has_password` (`false` for an account made with Google that hasn't set one), and `logins` (the connected providers, such as `["google"]`), or `null` |
| `teams` | Your teams with `id`, `name`, your `role`, and `plan`. Empty except for a browser session. `plan` is `null` on a server without plans. Otherwise it is `id` and `name` of the plan the team works under (the trial's without a plan); `state`: `plan`, `trial` (no plan, and the free trial runs), or `lapsed` (no plan, and no trial running); `trial` and `lapsed` (`true` for those states); `trial_ends_at` (when the free trial ends or ended, in ms, or `null` for a team that had none); `events` (included a month); `events_used` (pageviews and custom events this UTC month, across the team's sites); `events_stop` (where the month stops recording: 125% of `events`); `stopped` (`true` while its beacons are dropped: lapsed, or `events_used` reached `events_stop`); `month_ends_at` (when the next UTC month starts, in ms); `retention_days` (the longest a site may keep stats); `retention_default_days` (what a site without a setting keeps); `sites` (`null` for no limit); and `sites_used`. |
| `sites` | The same list as `GET /api/v1/sites`, and on each site `retention`: its `max` and `default` days, the server's within its team's plan |
| `plans` | Whether the server enforces plans (`PLANS=on`) |
| `billing` | Whether teams can pay for a plan here: `PLANS=on` and every Polar setting ([Billing](configuration.md#billing)). Each team in `teams` also has `plan_status`, `plan_period_end`, and `billing_portal`. `plan_status` is `active`, `past_due` while Polar tries a failed payment again, `canceled` while a canceled plan runs to its end, or `null` without a subscription. `plan_period_end` is the end of the paid period, or the day a canceled plan ends, in ms. `billing_portal` is `true` once the team has a Polar customer. Without billing, they are `null`, `null`, and `false`. |
| `demo` | The public demo site's id (`DEMO_SITE`), or `null` |
| `sample` | The sample site's id (`SAMPLE_SITE`), which `/demo` is recorded from, or `null` |
| `signups` | Whether `POST /api/v1/auth/signup` is open |
| `providers` | The sign-in providers this server has a client for: `["google"]`, or `[]` |
| `imported` | The ids of your sites with a finished import |
| `search` | The ids of your sites with Search Console connected |
| `regions` | The data regions a new site can use, in the order `eu`, `us`, `apac`. Empty without regional shards. |
| `retention` | `max`, the most days any site keeps data (`RETENTION_DAYS`), and `default`, the days for `retention_days: null` (`RETENTION_DEFAULT_DAYS`). `0` is no limit. |
| `share` | For a shared link, `slug` and `segment` (its filter string). Otherwise `null`. |

### API keys

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/keys` | Session | Your keys, newest first: `id`, `name`, `prefix`, `site_id`, `created_at`, `last_used_at`. |
| `POST /api/v1/keys` | Session | Makes a key. Takes `name` (cut to 80 characters, default `API key`) and `site`, which limits the key to one site you can read. Without `site`, the key reads every site you can. Returns `201` with `id`, `name`, `key`, `prefix`, and `site_id`. `key` is shown once. |
| `POST /api/v1/keys/:key/rotate` | Session | Gives a key a new secret and returns it once. The name and site stay. The old secret stops working at once. |
| `DELETE /api/v1/keys/:key` | Session | Deletes a key. Returns `204`. |

### Teams and members

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /api/v1/teams` | Session | Your teams: `id`, `name`, your `role`, and the number of `members` and `sites`. |
| `POST /api/v1/teams` | Session | Makes a team with you as owner. Takes `name` (cut to 80 characters, default `My team`). Returns `201` with `id`, `name`, `created_at`, and `role`. With plans on, the team gets the free trial only if it is the first team you create; otherwise it needs a plan before it can add a site. |
| `PATCH /api/v1/teams/:team` | Session, team owner or admin | Renames the team. Takes `name`. |
| `DELETE /api/v1/teams/:team` | Session, team owner | Deletes the team. Returns `204`, or `409` while it has sites or a paid plan that still renews. |
| `GET /api/v1/teams/:team/members` | Session, team owner or admin | `{"members": [...], "guests": [...], "invitations": [...]}`. Members have `id`, `email`, `name`, `role`, `created_at`. Guests have `id`, `email`, `name`, `role`, `site_id`. Invitations have `id`, `email`, `role`, `site_id`, `expires_at`, `created_at`. |
| `PATCH /api/v1/teams/:team/members/:user` | Session, team owner or admin | Changes a member's `role` to `owner`, `admin`, `editor`, `viewer`, or `billing`. |
| `DELETE /api/v1/teams/:team/members/:user` | Session, team owner or admin, or the member | Removes a member, or leaves the team. Returns `204`. |
| `POST /api/v1/sites/:id/transfer` | Session, owner of the site's team | Moves the site to `team`, where you are owner or admin. Guests who are members of the new team stop being guests, and the site's pending invitations are deleted. With plans on, a `team` that has lapsed returns `403` with `plan_required`, and one that has all the sites its plan includes returns `403` with `plan_site_limit`. Either way, nothing changes. |

A `:user` who is not on the team returns `404`. An admin can't make, change, or remove an
owner (`403`). A change that leaves the team without an owner returns `409`.

### Invitations

| Method and path | Role | What it does |
| --- | --- | --- |
| `POST /api/v1/teams/:team/invitations` | Session, team owner or admin. For a guest, Admin on `site`. | Invites `email` with `role`. Returns `201` with `id`, `email`, `role`, `site_id`, `url`, and `sent`. |
| `DELETE /api/v1/teams/:team/invitations/:invitation` | Session, team owner or admin | Withdraws an invitation. Returns `204`. |
| `GET /api/v1/invitations/:token` | Public | `email`, `role`, `team`, `site`, `invited_by`, and `has_account`. `404` for an invitation that expired or was withdrawn. |
| `POST /api/v1/invitations/:token/accept` | Public, or Session as the invited email | Joins the team, or the site as a guest. Returns `site` (the guest site, or the team's first site) and `team`. |

Without `site`, the invitation is for a team member with a team `role`. Only an owner can
invite an owner, and an email already on the team returns `409`. With `site`, it is for a
guest of that one site of the team, with `role` `editor` or `viewer`. A new invitation
for the same email and site replaces the earlier one. The server emails the `url`, which
works for 7 days, and `sent` says whether the email went out.

To accept while signed in with the invited email, send no body. Another signed-in email
gets `403`. Without a session, send `name` and `password`. The server creates the account
and also returns `token` and `expires_at`.

### Guests

| Method and path | Role | What it does |
| --- | --- | --- |
| `PATCH /api/v1/sites/:id/guests/:user` | Admin | Changes a guest's `role` to `editor` or `viewer`. |
| `DELETE /api/v1/sites/:id/guests/:user` | Admin, or the guest | Removes a guest from the site, or leaves it. Returns `204`. |

### Billing

Paying for misomoon Cloud through Polar ([Pay for misomoon Cloud](billing.md)). On a server
without `PLANS=on`, these routes answer `404`. With `PLANS=on` and a Polar setting missing,
they answer `501` and name it ([Billing](configuration.md#billing)).

| Method and path | Role | What it does |
| --- | --- | --- |
| `POST /api/v1/teams/:team/checkout` | Session, team owner or billing member | Takes `{"plan": "growth"}`: `starter`, `growth`, or `scale`. For a team without a subscription, it first asks Polar for a subscription carrying the team id in its metadata, then creates a Polar checkout with the team id in its metadata, your email filled in, and **Settings** > **Team** as the way back, and returns `{"url": ...}` to open. For a team that pays for a subscription, including one Polar has and whose webhook hasn't come yet, it switches that subscription to the plan, resuming it first when it is canceled, and returns the team's new state: `url` (`null`), `plan`, `plan_status`, `plan_period_end`, and `pending` (`plan` and `applies_at` for a switch Polar applies at the next renewal, or `null`). |
| `POST /api/v1/teams/:team/portal` | Session, team owner or billing member | Opens a Polar customer portal session for the team's customer, for the card, invoices, and cancelling. Returns `{"url": ...}`. |
| `POST /api/billing/polar/webhook` | Public, signed by Polar | Takes Polar's `subscription.*` webhooks and sets the team's plan from the subscription. Returns `{"ok": true}`, or `{"ok": true, "duplicate": true}` for a `webhook-id` it handled before. Another event, a product that is none of the plans, or a subscription without a team returns `202` with `{"ok": true, "ignored": true}`. |

An admin, editor, viewer, or API key gets `403`, and a team you are not on `404`. An
unknown `plan` returns `400`. When Polar can't charge the card for a switch, the checkout
route returns `402` with the code `payment_failed`, and nothing changes. While the team's
last checkout is still taking the payment, it returns `409` with the code
`payment_pending` and opens no checkout. A change Polar refuses, or the portal for a team that has not paid yet, returns `409`. When Polar refuses
a request or does not answer, the routes return `502`.

The webhook returns `401` when the signature does not match or the `webhook-timestamp` is
more than 5 minutes old, `400` for a body that is not JSON, and `413` for a body over
256 KB. [How Polar and misomoon keep the plan in step](billing.md#how-polar-and-misomoon-keep-the-plan-in-step)
lists what each event does.

## Event ingestion

`POST /api/event` (Public) takes one event as JSON. The tracker sends it as `text/plain`,
so the browser makes no preflight. It always answers `202`, even for a dropped event, so
it reveals nothing about which sites exist. `OPTIONS /api/event` answers a preflight with
`204`.

| Field | Meaning |
| --- | --- |
| `s` | Site id. Required. |
| `u` | The full page URL, `http` or `https`. Required. Its hostname must be the site's domain or a subdomain of it. |
| `n` | `pageview`, `engagement`, or a custom name of 1 to 120 characters without control characters, semicolons, or vertical bars. Without it, a beacon with `e` is an engagement and one with `w` a pageview, as `m.js` sends them. `engagement` is taken: an event with that name needs `e` and `y`, or only hands out payment keys in `k`. |
| `r`, `t` | `document.referrer`, `document.title` |
| `w`, `h`, `vw` | Screen width and height, viewport width |
| `l` | `navigator.language`. Defaults to the request's `Accept-Language`. |
| `p` | Custom properties: an object of strings, numbers, and booleans. The server keeps the first 30 whose keys are 1 to 64 letters, digits, `_`, `.`, or `-`, and cuts strings to 300 characters. |
| `$` | Revenue: `{ "a": 19, "c": "USD" }` or `{ "amount": 19, "currency": "USD" }` |
| `k` | Payment keys: a ref, or a list of up to 4 checkout ids |
| `i` | `false` keeps a custom event from ending a bounce |
| `q` | Pageview only: the site search term, kept when the site tracks `search`. Without it, the server reads the term from the page URL. |
| `y` | The page view's key, which the pageview and each of its engagements carry: a number between 0 and 1, or 16 to 64 letters, digits, `_`, or `-`. The server stores the pageview under it, and adds each engagement with the same key to that pageview instead of storing it. A resent pageview with the same key is stored once. |
| `e`, `d`, `v` | Engagement only: engaged milliseconds since the page view's last engagement, deepest scroll percent, and Web Vitals. The pageview adds up the time, keeps the deepest scroll, and keeps the latest value of each vital. An engagement without `y`, after its visit timed out (30 minutes), or whose pageview wasn't stored, is dropped. |
| `c`, `x`, `f`, `g`, `m`, `o` | Engagement only: counts since the page view's last engagement, as lists of arrays, which the pageview appends to its own. `c` clicks `[selector, label, clicks, rage, dead]` (at most 30), `x` errors `[message, source, count]` (5), `f` forms `[form, started, submitted]` (10), `g` form fields `[form, field, position, touched, dropped]` (50), `m` media `[name, type, played, 25%, 50%, 75%, 95%]` (10), `o` content `[name, seen, clicked]` (20). |
| `ts` | Client time in milliseconds. The server uses it when it is within 5 minutes of the server's clock and not on a later UTC day than the server's, and its own time otherwise. |
| `id` | A UUID. A second event with the same id is not stored, and a second engagement with the same id adds nothing, so a client can resend after a lost response. The server picks one when it is missing or not a UUID. A pageview with `y` is stored under its key instead. |

The server drops bodies over 16 KB, events past the site's
[daily ingest cap](configuration.md#daily-ingest-cap), bots (by Cloudflare's bot signals
and user-agent patterns), and pageviews and engagements on a path that `include_paths` or `exclude_paths`
leave out. It removes emails, ids, tokens, and numbers of 6 or more digits from `q` and
from the text in the interaction lists. Form fields carry names and flags, never values.

A server that sends events for a visitor sets `X-Misomoon-Ip` to the visitor's address and
`User-Agent` to the visitor's user agent. `X-Misomoon-Country`, `-Region`, `-City`,
`-Continent`, and `-Timezone` carry the location, URL-encoded, as a
[first-party proxy](PROXY.md) sets them. An app sends the user agent
`MisomoonApp/<sdk version> (<platform>) <app name>/<app version>`, and reports show the app
name in place of the browser ([the SDK guide](sdk.md)).

## Tracker files

| Method and path | Role | What it does |
| --- | --- | --- |
| `GET /m.js` | Public | The tracker. `?s=<site id>` adds the code for the features the site turned on. Without a known site, it is the core alone, which counts nothing. Browsers cache it for 5 minutes with `s` and an hour without. |
| `GET /overlay.js` | Public | Draws clicks and scroll depth on the site's own page. `m.js` loads it only on a page opened with `#misomoon-overlay` in the URL. Browsers cache it for an hour. |
| `GET /api/health` | Public | `200` with `{"ok": true}` when the Worker is up. |

On a managed proxy hostname, the Worker serves `/m.js`, `/overlay.js`, and `/api/event`
only. Every other path returns `404`.

## MCP endpoint

`POST /mcp` takes JSON-RPC 2.0 requests from MCP clients, with the same bearer tokens as
the API. A batch holds at most 20 requests, and a body over 64 KB returns `413`.
`GET /mcp` returns `405`, because the server does not stream.
[Ask AI tools about your traffic](mcp.md) lists the tools and the client setup.
