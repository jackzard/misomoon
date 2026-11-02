import { MAX_FILTERS, MAX_TOTAL_VALUES, MAX_VALUES } from '@misomoon/core/filters'
import type { BehaviorReport } from './api'

export type View = 'overview' | 'realtime' | 'funnels' | 'journeys' | 'behavior' | 'vitals' | 'settings'
export type MetricKey = 'visitors' | 'visits' | 'pageviews' | 'views_per_visit' | 'bounce_rate' | 'visit_duration' | 'revenue'
export type FilterOp = '==' | '!=' | '~' | '!~'

export interface Filter {
	dim: string
	op: FilterOp
	values: string[]
}

export const PERIODS = [
	{ key: 'today', label: 'Today', short: 'Today', hotkey: 'd' },
	{ key: 'yesterday', label: 'Yesterday', short: 'Yesterday', hotkey: 'e' },
	{ key: '24h', label: 'Last 24 hours', short: '24h', hotkey: 'h' },
	{ key: '7d', label: 'Last 7 days', short: '7d', hotkey: 'w' },
	{ key: '28d', label: 'Last 28 days', short: '28d', hotkey: 'f' },
	{ key: '30d', label: 'Last 30 days', short: '30d', hotkey: 't' },
	{ key: '90d', label: 'Last 90 days', short: '90d', hotkey: 'n' },
	{ key: 'mtd', label: 'Month to date', short: 'MTD', hotkey: 'm' },
	{ key: 'lastmonth', label: 'Last month', short: 'Last month', hotkey: 'l' },
	{ key: 'ytd', label: 'Year to date', short: 'YTD', hotkey: 'y' },
	{ key: '6mo', label: 'Last 6 months', short: '6mo', hotkey: 's' },
	{ key: '12mo', label: 'Last 12 months', short: '12mo', hotkey: 'z' },
	{ key: 'all', label: 'All time', short: 'All', hotkey: 'a' },
] as const

export const VIEWS: View[] = ['overview', 'realtime', 'funnels', 'journeys', 'behavior', 'vitals', 'settings']
const METRIC_KEYS: MetricKey[] = ['visitors', 'visits', 'pageviews', 'views_per_visit', 'bounce_rate', 'visit_duration', 'revenue']
const REPORTS: BehaviorReport[] = ['clicks', 'scroll', 'search', 'errors', 'forms', 'media', 'content']
const OPS: FilterOp[] = ['!=', '==', '!~', '~']
const DAY = 86_400_000
/** The server's limit for a custom range (core resolvePeriod). */
const MAX_CUSTOM_DAYS = 400
/** The most pages a path can pick (the Paths view stops there). */
const MAX_STEPS = 6
/** The views with a "See all" window. */
const DETAILS_VIEWS: View[] = ['overview', 'vitals']

export function serializeFilters(filters: Filter[]): string {
	return filters.map((f) => `${f.dim}${f.op}${f.values.join('|')}`).join(';')
}

/** Mirrors the server grammar: the operator is the first one in the text, so a value may contain `==`. */
export function parseFilters(s: string | null | undefined): Filter[] {
	if (!s) return []
	const out: Filter[] = []
	for (const part of s.split(';')) {
		let op: FilterOp | undefined
		let idx = -1
		for (const o of OPS) {
			const i = part.indexOf(o)
			if (i >= 0 && (idx < 0 || i < idx)) [op, idx] = [o, i]
		}
		if (!op) continue
		const values = part
			.slice(idx + op.length)
			.split('|')
			.map((v) => v.trim())
			.filter(Boolean)
		if (values.length) out.push({ dim: part.slice(0, idx).trim(), op, values })
	}
	return out
}

/** Why the server would refuse `next` added to (or replacing its dimension in) `filters`, or null. */
export function filterProblem(filters: Filter[], next: Filter): string | null {
	if (next.values.some((v) => v.includes(';') || v.includes('|'))) return 'filter values cannot contain ; or |'
	if (next.values.length > MAX_VALUES) return `at most ${MAX_VALUES} values in one filter`
	const all = [...filters.filter((f) => f.dim !== next.dim), next]
	if (all.length > MAX_FILTERS) return `at most ${MAX_FILTERS} filters`
	if (all.reduce((n, f) => n + f.values.length, 0) > MAX_TOTAL_VALUES) return `at most ${MAX_TOTAL_VALUES} filter values in total`
	return null
}

function parseDate(s: string | null): number | null {
	if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null
	const t = Date.parse(`${s}T00:00:00Z`)
	return Number.isNaN(t) || new Date(t).toISOString().slice(0, 10) !== s ? null : t
}

/** A custom range the server accepts: both dates, in order, at most 400 days. */
export function validRange(from: string | null, to: string | null): boolean {
	const a = parseDate(from)
	const b = parseDate(to)
	return a != null && b != null && b >= a && b + DAY - a <= MAX_CUSTOM_DAYS * DAY
}

export interface UrlState {
	site: string | null
	period: string
	from: string | null
	to: string | null
	compare: boolean
	/** what the comparison is against: the previous period or the same dates a year earlier */
	compareTo: 'previous' | 'year'
	/** include imported history in unfiltered reports */
	imported: boolean
	filters: Filter[]
	view: View
	metric: MetricKey
	/** the open Settings tab; empty picks the first one the page offers */
	settingsTab: string
	/** Behavior: the open report */
	report: BehaviorReport
	/** Behavior: the page picked for a per-page report */
	page: string | null
	/** Funnels: a saved funnel's id, `new` for an unsaved one, null for the first saved one */
	funnel: string | null
	/** Paths: which way the path reads */
	direction: 'forward' | 'backward'
	/** Paths: the chosen pages, in the order they were picked */
	steps: string[]
	/** which panel's "See all" window is open */
	details: string | null
}

/** Reads the dashboard state from a query string, falling back to defaults for anything the server would refuse. */
export function readUrlState(search: string): UrlState {
	const q = new URLSearchParams(search)
	let period = q.get('period') ?? '30d'
	let from = q.get('from')
	let to = q.get('to')
	if (period === 'custom' ? !validRange(from, to) : !PERIODS.some((p) => p.key === period)) period = '30d'
	if (period !== 'custom') from = to = null
	const view = q.get('view') as View
	const metric = q.get('metric') as MetricKey
	const report = q.get('report') as BehaviorReport
	return {
		site: q.get('site'),
		period,
		from,
		to,
		compare: q.get('compare') !== '0',
		compareTo: q.get('compare') === 'year' ? 'year' : 'previous',
		imported: q.get('imported') !== '0',
		filters: parseFilters(q.get('f')),
		view: VIEWS.includes(view) ? view : 'overview',
		metric: METRIC_KEYS.includes(metric) ? metric : 'visitors',
		settingsTab: q.get('tab') ?? '',
		report: REPORTS.includes(report) ? report : 'clicks',
		page: q.get('page'),
		funnel: q.get('funnel'),
		direction: q.get('dir') === 'backward' ? 'backward' : 'forward',
		steps: q.getAll('step').slice(0, MAX_STEPS),
		details: q.get('details'),
	}
}

/** The query string for a dashboard state, without the `?`. It leaves out defaults and what the open view doesn't show. */
export function writeUrlState(s: UrlState): string {
	const q = new URLSearchParams()
	if (s.site) q.set('site', s.site)
	if (s.view !== 'overview') q.set('view', s.view)
	if (s.view === 'settings' && s.settingsTab) q.set('tab', s.settingsTab)
	if (s.view === 'behavior') {
		if (s.report !== 'clicks') q.set('report', s.report)
		if (s.page) q.set('page', s.page)
	}
	if (s.view === 'funnels' && s.funnel) q.set('funnel', s.funnel)
	if (s.view === 'journeys') {
		if (s.direction !== 'forward') q.set('dir', s.direction)
		for (const step of s.steps) q.append('step', step)
	}
	if (s.details && DETAILS_VIEWS.includes(s.view)) q.set('details', s.details)
	if (s.period !== '30d') q.set('period', s.period)
	if (s.period === 'custom' && s.from && s.to) {
		q.set('from', s.from)
		q.set('to', s.to)
	}
	if (s.filters.length) q.set('f', serializeFilters(s.filters))
	if (!s.compare) q.set('compare', '0')
	else if (s.compareTo === 'year') q.set('compare', 'year')
	if (s.metric !== 'visitors') q.set('metric', s.metric)
	if (!s.imported) q.set('imported', '0')
	return q.toString()
}

// Comparison, chart metric and imported history adjust the report you're on, so Back skips them.
const NEW_PAGE = ['site', 'view', 'tab']
const WITHIN_PAGE = ['report', 'page', 'funnel', 'dir', 'step', 'details', 'period', 'from', 'to', 'f']

/**
 * What going from one query string to another does to the browser's history. `page` and
 * `within` add an entry that Back returns to; `page` also starts at the top of the page.
 * Without a site on both sides the dashboard is still working out where it is, and an
 * entry for that would send Back straight into the same redirect.
 */
export function historyStep(from: string, to: string): 'page' | 'within' | 'replace' {
	const a = new URLSearchParams(from)
	const b = new URLSearchParams(to)
	const differs = (k: string) => a.getAll(k).join('\n') !== b.getAll(k).join('\n')
	if (!a.get('site') || !b.get('site')) return 'replace'
	if (NEW_PAGE.some(differs)) return 'page'
	return WITHIN_PAGE.some(differs) ? 'within' : 'replace'
}
