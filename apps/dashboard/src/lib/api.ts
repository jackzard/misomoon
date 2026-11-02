import { embedFrom } from './embed'
import { googleError } from './google'
import type { TeamPlanInfo } from '@misomoon/core/plans'
import type { SiteRole, TeamRole } from '@misomoon/core/roles'
import type { Region } from '@misomoon/core/shard'

const TOKEN_KEY = 'misomoon.token'

/** Links from emails: /invite/<token> and /reset/<token>. */
export const emailLink: { kind: 'invite' | 'reset'; token: string } | null = (() => {
	const m = /^\/(invite|reset)\/(m[ir]_[a-f0-9]+)\/?$/.exec(location.pathname)
	return m ? { kind: m[1] as 'invite' | 'reset', token: m[2] } : null
})()

/**
 * The demo dashboard (/demo), which the landing embeds: the sample site only, always
 * signed out, so it never uses (or shows) the viewer's own account.
 */
export const demoPath: boolean = /^\/demo\/?$/.test(location.pathname)

/** `/demo?embed`: the demo inside the landing's fig. 1. Read at load, since the dashboard rewrites the URL. */
export const embedded = embedFrom(location.pathname, location.search)

/** `?signup` on the URL, from the landing's Start free buttons: open on the sign-up form. */
export const signupLink: boolean = !demoPath && new URLSearchParams(location.search).has('signup')

/** `?checkout_id=` on the URL: back from paying in Polar's checkout, before Polar's webhook may have set the plan. Read at load, since the dashboard rewrites the URL. */
export const checkoutReturn: boolean = !demoPath && new URLSearchParams(location.search).has('checkout_id')

/**
 * Back from Google: `?login=` a one-time code to trade for a session,
 * `?login_error=` why there is none, or `?linked=` the provider just connected in Settings.
 * `settings` marks a return from connecting a provider there, which shows its error in
 * Settings, not on the sign-in screen. Read at load, since the dashboard rewrites the URL.
 */
export const loginReturn: { code: string | null; error: string | null; linked: string | null; settings: boolean } = (() => {
	const q = new URLSearchParams(demoPath ? '' : location.search)
	return { code: q.get('login'), error: q.get('login_error'), linked: q.get('linked'), settings: q.get('view') === 'settings' }
})()

/**
 * Back from connecting Google in Settings: `?google=` a grant to pick an Analytics property
 * with, `?search=` one to pick a Search Console property with, or `?google_error=` why there
 * is none. Settings clears each once it's used. Read at load, since the dashboard rewrites
 * the URL, which also keeps a used grant out of what Back returns to.
 */
export const googleReturn: { grant: string | null; searchGrant: string | null; error: string | null } = (() => {
	const search = demoPath ? '' : location.search
	const q = new URLSearchParams(search)
	return { grant: q.get('google'), searchGrant: q.get('search'), error: googleError(search) }
})()

/** The slug when the dashboard is opened from a shared link (/share/<slug>). */
export const shareSlug: string | null = /^\/share\/([a-z0-9]+)\/?$/.exec(location.pathname)?.[1] ?? null

export function getShareToken(): string | null {
	try {
		return shareSlug ? sessionStorage.getItem(`misomoon.share.${shareSlug}`) : null
	} catch {
		return null
	}
}

export function setShareToken(token: string) {
	try {
		sessionStorage.setItem(`misomoon.share.${shareSlug}`, token)
	} catch {}
	shareMemory = token
	cache.clear()
}
let shareMemory: string | null = null

export function getToken(): string | null {
	// a shared link and the demo never use (or leak) the viewer's own token
	if (demoPath) return null
	if (shareSlug) return getShareToken() ?? shareMemory
	try {
		return localStorage.getItem(TOKEN_KEY)
	} catch {
		return null
	}
}

export function setToken(token: string | null) {
	try {
		if (token) localStorage.setItem(TOKEN_KEY, token)
		else localStorage.removeItem(TOKEN_KEY)
	} catch {}
	cache.clear()
}

export class ApiError extends Error {
	constructor(
		public status: number,
		message: string,
	) {
		super(message)
	}
}

function headers(json = false): HeadersInit {
	const h: Record<string, string> = {}
	const t = getToken()
	if (t) h.Authorization = `Bearer ${t}`
	if (json) h['Content-Type'] = 'application/json'
	return h
}

/** The Authorization header, for requests that bypass `get` and `send` (uploads). */
export const authHeaders = () => headers()
async function failure(res: Response): Promise<ApiError> {
	const body = await res.json().catch(() => null)
	return new ApiError(res.status, body?.error || res.statusText || `request failed (${res.status})`)
}

// Short-lived response cache so flipping between tabs and periods is instant.
const cache = new Map<string, { at: number; value: unknown }>()
const TTL = 30_000

/**
 * The demo answers from recorded data (lib/demo.ts) instead of the API, so it opens at once.
 * It's a separate chunk that only /demo downloads.
 */
async function demo<T>(answer: (d: typeof import('./demo')) => Promise<unknown>): Promise<T> {
	const d = await import('./demo')
	try {
		return (await answer(d)) as T
	} catch (e) {
		throw e instanceof d.DemoError ? new ApiError(e.status, e.message) : e
	}
}

export async function get<T>(path: string, signal?: AbortSignal, ttl = TTL): Promise<T> {
	if (demoPath) return demo((d) => d.demoGet(path))
	const hit = cache.get(path)
	if (hit && Date.now() - hit.at < ttl) return hit.value as T
	const res = await fetch(path, { headers: headers(), signal })
	if (!res.ok) throw await failure(res)
	const value = (await res.json()) as T
	cache.set(path, { at: Date.now(), value })
	return value
}

/** Loads a page the API renders, such as an email report preview, uncached. */
export async function getHtml(path: string): Promise<string> {
	const res = await fetch(path, { headers: headers() })
	if (!res.ok) throw await failure(res)
	return res.text()
}

export async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
	if (demoPath) return demo((d) => d.demoSend(method, path, body))
	const res = await fetch(path, { method, headers: headers(true), body: body === undefined ? undefined : JSON.stringify(body) })
	if (!res.ok) throw await failure(res)
	cache.clear()
	return res.status === 204 ? (null as T) : ((await res.json()) as T)
}

/**
 * Trades the one-time code from Google for a session. It sends no saved token: one that
 * expired during the round trip would get the exchange refused before it runs.
 */
export async function exchangeLogin(code: string): Promise<{ token: string; site: string | null }> {
	const res = await fetch('/api/v1/auth/exchange', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) })
	if (!res.ok) throw await failure(res)
	cache.clear()
	return res.json()
}

// ---------------------------------------------------------------- types

export interface Site {
	id: string
	domain: string
	name: string
	timezone: string
	team_id: string
	currency: string
	public: number
	/** ticked features, comma-separated; null means the defaults (see @misomoon/core/features) */
	features: string | null
	/** URL parameters that hold the site search term, comma-separated; null means the defaults */
	search_params: string | null
	/** path globs a page must match to count, comma-separated; null counts every path */
	include_paths: string | null
	/** path globs that never count, comma-separated */
	exclude_paths: string | null
	/** visitor IP addresses and CIDR ranges that are never counted, comma-separated */
	exclude_ips: string | null
	/** 1 when browsers that send Global Privacy Control or Do Not Track are not counted */
	privacy_signals: number
	/** days events and visits are kept; null keeps them as long as the server does */
	retention_days: number | null
	/** where the site's events are stored, set when it is added; null on a server without regions */
	region: Region | null
	/** your role on the site; null on the public demo and shared links */
	role: SiteRole | null
	/** from /api/v1/me: the longest the site may keep its data and what it keeps without a setting, within its team's plan when the server enforces plans; 0 is no limit */
	retention?: { max: number; default: number }
}

export interface User {
	id: string
	email: string
	name: string
	/** false for an account made through Google that hasn't set a password */
	has_password?: boolean
	/** the providers connected for signing in: google */
	logins?: Provider[]
}

/** Sign-in with another account */
export type Provider = 'google'

export interface Team {
	id: string
	name: string
	role: TeamRole
	/** the team's plan and its limits; null on a server that enforces no plans */
	plan?: TeamPlanInfo | null
	/** with billing on: how the team's Polar subscription stands. active, past_due while Polar retries a failed payment, canceled while it runs to plan_period_end; null without one */
	plan_status?: 'active' | 'past_due' | 'canceled' | null
	/** the end of the paid period, ms; for a canceled plan, when it ends */
	plan_period_end?: number | null
	/** the team has a Polar customer, so Manage billing can open Polar's portal */
	billing_portal?: boolean
}

export interface TeamMembers {
	members: (User & { role: TeamRole; created_at: number })[]
	guests: (User & { role: 'editor' | 'viewer'; site_id: string })[]
	invitations: { id: string; email: string; role: string; site_id: string | null; expires_at: number }[]
}

export interface ApiKey {
	id: string
	name: string
	prefix: string
	site_id: string | null
	created_at: number
	last_used_at: number | null
}

export interface Me {
	kind: 'user' | 'key' | 'share' | 'anonymous'
	user: User | null
	teams: Team[]
	sites: Site[]
	demo: string | null
	/** the sample site (Acme) that the demo dashboard shows */
	sample?: string | null
	/** open sign-up on this server */
	signups: boolean
	/** the sign-in buttons this server offers */
	providers?: Provider[]
	share: { slug: string; segment: string | null } | null
	/** sites that have imported history */
	imported?: string[]
	/** sites with Google Search Console connected */
	search?: string[]
	/** regions a new site can store its data in, empty on a server without regions */
	regions?: Region[]
	/** days of data a site keeps: the server's longest, and what a site that sets none keeps; 0 is no limit */
	retention?: { max: number; default: number }
	/** whether this server enforces misomoon Cloud plans (PLANS=on) */
	plans?: boolean
	/** whether teams can pay for a plan here: PLANS=on and Polar set up (docs/billing.md) */
	billing?: boolean
}

export interface Journey {
	direction: 'forward' | 'backward'
	path: string[]
	visitors: number
	steps: { key: string; visitors: number; share: number }[]
}

/** /api/v1/stats/behavior: what people did on a page, from the engagement beacon. */
export type BehaviorReport = 'clicks' | 'scroll' | 'search' | 'errors' | 'forms' | 'media' | 'content'

export interface ClickMap {
	pageviews: number
	visitors: number
	clicks: number
	rage: number
	dead: number
	elements: { page: string; selector: string; label: string; clicks: number; visitors: number; rage: number; dead: number }[]
	truncated?: boolean
}

export interface ScrollMap {
	visits: number
	average: number
	/** depth 0, 10 … 100: the visits that saw at least that much of the page */
	reached: { depth: number; visits: number; share: number }[]
}

export interface SiteSearch {
	searches: number
	visitors: number
	total_visitors: number
	terms: { term: string; searches: number; visitors: number }[]
	truncated?: boolean
}

export interface ErrorReport {
	count: number
	visitors: number
	errors: { message: string; source: string; count: number; visitors: number; last_seen: number; pages: string[]; browsers: string[] }[]
}

export interface FormReport {
	forms: {
		form: string
		starts: number
		submissions: number
		conversion: number
		visitors: number
		fields: { field: string; interactions: number; dropoffs: number; position: number }[]
	}[]
}

export interface MediaReport {
	/** reached: the share of plays that got to 25, 50, 75% and the end */
	media: { name: string; type: 'video' | 'audio'; plays: number; visitors: number; reached: number[] }[]
}

export interface ContentReport {
	content: { name: string; impressions: number; clicks: number; ctr: number; visitors: number }[]
}

export interface ImportRow {
	id: string
	/** csv, google, or an importer id (IMPORTER_INFO in @misomoon/core/importers) */
	source: string
	label: string
	from_day: string | null
	to_day: string | null
	status: 'importing' | 'done' | 'failed'
	error: string | null
	rows: number
	/** days left out because misomoon or an earlier import counted them already */
	skipped_days: number
	created_at: number
	/** while an import from another tool runs: the days read so far, and all it will read */
	days_done: number | null
	days_total: number | null
}

export interface SharedLink {
	slug: string
	name: string
	protected: number | boolean
	segment_id: string | null
	expires_at: number | null
}

export interface ReportSub {
	id: string
	email: string
	kind: 'weekly' | 'monthly' | 'spike' | 'drop'
	threshold: number | null
	last_sent_at: number | null
}

export interface Annotation {
	id: string
	ts: number
	text: string
	source: string
}

export interface Aggregate {
	visitors: number
	visits: number
	pageviews: number
	views_per_visit: number
	bounce_rate: number
	visit_duration: number
	events: number
	revenue: number
	average_revenue: number
}

export interface AggregateResponse {
	current: Aggregate
	previous: Aggregate | null
	change: Record<keyof Aggregate, number | null> | null
}

export interface Point extends Aggregate {
	t: number
}

export interface TimeseriesResponse {
	interval: 'minute' | 'hour' | 'day' | 'week' | 'month'
	window: { from: number; to: number }
	points: Point[]
	previous: Point[] | null
}

export interface Row {
	key: string
	visitors: number
	pageviews: number
	events: number
	visits: number
	bounce_rate: number
	visit_duration: number
	time_on_page?: number
	scroll_depth?: number
	conversion_rate?: number
	revenue?: number
	average_revenue?: number
	exit_rate?: number | null
	/** visitors in the comparison period, with `compare`; null when it can't be known */
	previous_visitors?: number | null
	/** Search Console rows */
	clicks?: number
	impressions?: number
	ctr?: number
	position?: number
	kind?: string
	match?: string
}

export interface BreakdownResponse {
	property: string
	rows: Row[]
	total_visitors: number
	has_more: boolean
}

export interface Vital {
	name: 'lcp' | 'inp' | 'cls' | 'fcp' | 'ttfb'
	p75: number | null
	samples: number
	good: number
	needs_improvement: number
	poor: number
}

export interface RealtimeResponse {
	visitors: number
	pageviews: number
	minutes: { t: number; pageviews: number; visitors: number }[]
	pages: { key: string; visitors: number }[]
	sources: { key: string; visitors: number }[]
	countries: { key: string; visitors: number }[]
	feed: { ts: number; name: string; pathname: string; country: string | null; city: string | null; browser: string; device: string; source: string }[]
}

export interface Goal {
	id: string
	name: string
	kind: 'event' | 'page'
	match: string
}

export interface FunnelStep {
	kind: 'page' | 'event'
	match: string
	label?: string
}

export interface Funnel {
	id: string
	name: string
	steps: FunnelStep[]
	mode?: FunnelMode
}

export type FunnelMode = 'sequential' | 'strict' | 'flexible'

export interface FunnelResult {
	mode: FunnelMode
	entered: number
	completed: number
	steps: { label: string; visitors: number; conversion: number; dropoff: number }[]
}

export interface Segment {
	id: string
	name: string
	filters: string
	/** only its author sees it */
	personal: number
}

/** Downloads a URL that needs the API token, such as the CSV export. */
export async function download(path: string) {
	const res = await fetch(path, { headers: headers() })
	if (!res.ok) throw new ApiError(res.status, (await res.json().catch(() => null))?.error ?? res.statusText)
	const name = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? 'misomoon-export.zip'
	const url = URL.createObjectURL(await res.blob())
	const a = document.createElement('a')
	a.href = url
	a.download = name
	a.click()
	setTimeout(() => URL.revokeObjectURL(url), 1000)
}

