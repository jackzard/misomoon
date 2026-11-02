import { describe, expect, it } from 'vite-plus/test'
import { filterProblem, historyStep, parseFilters, readUrlState, serializeFilters, writeUrlState, type Filter } from '../src/lib/url'

describe('filters in the URL (F7)', () => {
	it('splits at the first operator in the text, like the server', () => {
		expect(parseFilters('page~/a==b')).toEqual([{ dim: 'page', op: '~', values: ['/a==b'] }])
		expect(parseFilters('source!~x;browser!=Safari|Edge')).toEqual([
			{ dim: 'source', op: '!~', values: ['x'] },
			{ dim: 'browser', op: '!=', values: ['Safari', 'Edge'] },
		])
	})

	it('drops parts with no operator or no value', () => {
		expect(parseFilters('page;country==;browser==Chrome')).toEqual([{ dim: 'browser', op: '==', values: ['Chrome'] }])
		expect(parseFilters(null)).toEqual([])
	})

	it('round-trips through serializeFilters', () => {
		const f: Filter[] = [
			{ dim: 'country', op: '==', values: ['US', 'CA'] },
			{ dim: 'page', op: '!~', values: ['/blog/*'] },
		]
		expect(serializeFilters(f)).toBe('country==US|CA;page!~/blog/*')
		expect(parseFilters(serializeFilters(f))).toEqual(f)
	})
})

describe('checking a filter before adding it (F30)', () => {
	const f = (dim: string, ...values: string[]): Filter => ({ dim, op: '==', values })

	it('accepts a filter within the server limits', () => {
		expect(filterProblem([], f('country', 'US'))).toBeNull()
	})

	it('refuses a ninth filter', () => {
		const eight = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((d) => f(d, 'x'))
		expect(filterProblem(eight, f('page', '/'))).toBe('at most 8 filters')
		// replacing one of the eight is fine
		expect(filterProblem(eight, f('a', 'y'))).toBeNull()
	})

	it('allows 6 values in one filter and 16 in total, and no more', () => {
		expect(filterProblem([], f('country', '1', '2', '3', '4', '5', '6'))).toBeNull()
		expect(filterProblem([], f('country', '1', '2', '3', '4', '5', '6', '7'))).toBe('at most 6 values in one filter')
		const many = [f('a', '1', '2', '3', '4', '5', '6'), f('b', '1', '2', '3', '4', '5', '6')]
		expect(filterProblem(many, f('c', '1', '2', '3', '4'))).toBeNull()
		expect(filterProblem(many, f('c', '1', '2', '3', '4', '5'))).toBe('at most 16 filter values in total')
	})

	it('refuses values the URL grammar cannot carry', () => {
		expect(filterProblem([], f('page', 'a;b'))).toBe('filter values cannot contain ; or |')
		expect(filterProblem([], f('page', 'a|b'))).toBe('filter values cannot contain ; or |')
	})
})

describe('reading the URL (F30)', () => {
	it('falls back to the defaults for unknown period, metric and view', () => {
		expect(readUrlState('?period=bogus&metric=foo&view=nope')).toMatchObject({ period: '30d', metric: 'visitors', view: 'overview' })
	})

	it('falls back to People for a metric the chart has no tile for', () => {
		expect(readUrlState('?metric=events').metric).toBe('visitors')
	})

	it('keeps a valid custom range, up to 400 days', () => {
		expect(readUrlState('?period=custom&from=2026-01-01&to=2026-01-31')).toMatchObject({ period: 'custom', from: '2026-01-01', to: '2026-01-31' })
		expect(readUrlState('?period=custom&from=2025-01-01&to=2026-02-04')).toMatchObject({ period: 'custom', from: '2025-01-01', to: '2026-02-04' })
	})

	it.each([
		['over 400 days', '?period=custom&from=2025-01-01&to=2026-02-05'],
		['backwards', '?period=custom&from=2026-02-01&to=2026-01-01'],
		['not a date', '?period=custom&from=yesterday&to=2026-01-01'],
		['missing to', '?period=custom&from=2026-01-01'],
	])('drops a custom range that is %s', (_label, search) => {
		expect(readUrlState(search)).toMatchObject({ period: '30d', from: null, to: null })
	})

	it('reads site, filters, compare and a known metric', () => {
		expect(readUrlState('?site=shop&f=country==US&compare=0&metric=bounce_rate&view=vitals')).toEqual({
			site: 'shop',
			period: '30d',
			from: null,
			to: null,
			compare: false,
			compareTo: 'previous',
			imported: true,
			filters: [{ dim: 'country', op: '==', values: ['US'] }],
			view: 'vitals',
			metric: 'bounce_rate',
			settingsTab: '',
			report: 'clicks',
			page: null,
			funnel: null,
			direction: 'forward',
			steps: [],
			details: null,
		})
	})

	it('reads a year-over-year comparison and imports turned off', () => {
		expect(readUrlState('?compare=year&imported=0&period=6mo&view=journeys')).toMatchObject({ compare: true, compareTo: 'year', imported: false, period: '6mo', view: 'journeys' })
	})
})

describe('writing the state to the URL', () => {
	const state = (search = '') => readUrlState(search)

	it('leaves out defaults', () => {
		expect(writeUrlState(state())).toBe('')
	})

	it('round-trips everything a link can carry', () => {
		const search =
			'site=a&view=journeys&dir=backward&step=%2Fa&step=%2Fb%7Cc&period=custom&from=2026-01-01&to=2026-01-31&f=country%3D%3DDE&compare=year&metric=visits&imported=0'
		expect(writeUrlState(state(search))).toBe(search)
	})

	it("writes a view's own selections only on that view", () => {
		const open = { ...state('site=a'), settingsTab: 'team', report: 'scroll' as const, page: '/a', funnel: 'f1', direction: 'backward' as const, steps: ['/a'], details: 'pages' }
		expect(writeUrlState(open)).toBe('site=a&details=pages')
		expect(writeUrlState({ ...open, view: 'settings' })).toBe('site=a&view=settings&tab=team')
		expect(writeUrlState({ ...open, view: 'behavior' })).toBe('site=a&view=behavior&report=scroll&page=%2Fa')
		expect(writeUrlState({ ...open, view: 'funnels' })).toBe('site=a&view=funnels&funnel=f1')
		expect(writeUrlState({ ...open, view: 'journeys' })).toBe('site=a&view=journeys&dir=backward&step=%2Fa')
		expect(writeUrlState({ ...open, view: 'vitals' })).toBe('site=a&view=vitals&details=pages')
		expect(writeUrlState({ ...open, view: 'realtime' })).toBe('site=a&view=realtime')
	})

	it('falls back for a report it does not know, and caps a path at six steps', () => {
		expect(state('report=nope').report).toBe('clicks')
		expect(state('report=forms').report).toBe('forms')
		expect(state('step=1&step=2&step=3&step=4&step=5&step=6&step=7').steps).toEqual(['1', '2', '3', '4', '5', '6'])
	})
})

describe('what a change does to the history', () => {
	it('starts a new page for another site, view or Settings tab', () => {
		expect(historyStep('?site=a', '?site=b')).toBe('page')
		expect(historyStep('?site=a', '?site=a&view=funnels')).toBe('page')
		expect(historyStep('?site=a&view=settings&tab=team', '?site=a&view=settings&tab=goals')).toBe('page')
	})

	it('adds an entry within the page for what changes the report', () => {
		for (const to of ['period=7d', 'f=page%3D%3D%2Fa', 'details=pages', 'report=scroll', 'page=%2Fa', 'funnel=x', 'dir=backward', 'step=%2Fa']) {
			expect(historyStep('?site=a', `?site=a&${to}`)).toBe('within')
		}
		expect(historyStep('?site=a&step=%2Fa', '?site=a&step=%2Fa&step=%2Fb')).toBe('within')
		expect(historyStep('?site=a&period=custom&from=2026-01-01&to=2026-01-02', '?site=a&period=custom&from=2026-01-01&to=2026-01-03')).toBe('within')
	})

	it('keeps the entry for an adjustment to the same report', () => {
		expect(historyStep('?site=a', '?site=a&metric=visits')).toBe('replace')
		expect(historyStep('?site=a', '?site=a&compare=0')).toBe('replace')
		expect(historyStep('?site=a', '?site=a&imported=0')).toBe('replace')
	})

	it('keeps the entry when the only difference is how the URL is written, or a parameter it drops', () => {
		expect(historyStep('?site=a&f=page==/a', '?site=a&f=page%3D%3D%2Fa')).toBe('replace')
		expect(historyStep('?site=a&checkout_id=x', '?site=a')).toBe('replace')
	})

	it('adds no entry until both sides have a site, since Back would land on the same redirect', () => {
		expect(historyStep('', '?site=a')).toBe('replace')
		expect(historyStep('?view=settings', '?site=a&view=settings')).toBe('replace')
		expect(historyStep('?site=a', '')).toBe('replace')
	})
})
