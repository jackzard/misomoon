// @vitest-environment happy-dom
import { tick } from 'svelte'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'

// api.ts reads the page path on import (email and shared links)
const place = vi.hoisted(() => {
	const place = { pathname: '/', search: '' }
	;(globalThis as { location?: unknown }).location = place
	return place
})

type Entry = { search: string; state: unknown }

/** The browser's session history: one list of entries and a position in it. */
class FakeHistory {
	entries: Entry[] = []
	at = 0
	scrollRestoration = 'auto'
	reset(search: string, state: unknown = null) {
		place.search = search
		this.entries = [{ search, state }]
		this.at = 0
		this.scrollRestoration = 'auto'
	}
	get state() {
		return this.entries[this.at].state
	}
	private searchOf(url?: string | URL) {
		if (url === undefined) return place.search
		const s = String(url)
		return s.startsWith('?') ? s : ''
	}
	pushState(state: unknown, _: string, url?: string | URL) {
		this.entries.splice(this.at + 1)
		this.entries.push({ search: this.searchOf(url), state })
		this.at++
		place.search = this.entries[this.at].search
	}
	replaceState(state: unknown, _: string, url?: string | URL) {
		this.entries[this.at] = { search: this.searchOf(url), state }
		place.search = this.entries[this.at].search
	}
	back() {
		this.go(-1)
	}
	go(by: number) {
		this.at += by
		place.search = this.entries[this.at].search
		dispatchEvent(new Event('popstate'))
	}
}
const fake = new FakeHistory()

const site = (id: string) => ({ id, domain: `${id}.test`, name: id, role: 'owner' })
const signedIn = { kind: 'user', user: { id: 'u' }, teams: [], sites: [site('a'), site('b')], demo: null, sample: null }

async function boot(search = '?site=a', me: unknown = signedIn, pathname = '/') {
	place.pathname = pathname
	fake.reset(search)
	vi.resetModules()
	vi.stubGlobal(
		'fetch',
		vi.fn(async () => Response.json(me)),
	)
	const { Dash } = await import('../src/lib/dash.svelte')
	const dash = new Dash()
	await tick()
	await dash.load()
	await tick()
	running.push(dash)
	return dash
}
const running: { dispose(): void }[] = []

beforeEach(() => {
	vi.stubGlobal('history', fake)
	vi.stubGlobal('scrollTo', vi.fn())
	vi.stubGlobal('requestAnimationFrame', () => 1)
	vi.stubGlobal('cancelAnimationFrame', () => {})
})
afterEach(() => {
	for (const d of running.splice(0)) d.dispose()
	vi.unstubAllGlobals()
})

describe('going to a place', () => {
	it('adds one history entry for each place, and Back and Forward return to them', async () => {
		const dash = await boot()
		dash.view = 'funnels'
		await tick()
		dash.view = 'behavior'
		await tick()
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a', '?site=a&view=funnels', '?site=a&view=behavior'])

		fake.go(-1)
		expect(dash.view).toBe('funnels')
		fake.go(-1)
		expect(dash.view).toBe('overview')
		fake.go(2)
		expect(dash.view).toBe('behavior')
		await tick()
		// returning adds nothing
		expect(fake.entries).toHaveLength(3)
	})

	it('counts changes made together as one place', async () => {
		const dash = await boot()
		dash.settingsTab = 'team'
		dash.view = 'settings'
		await tick()
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a', '?site=a&view=settings&tab=team'])
	})

	it('undoes a filter and a period with Back', async () => {
		const dash = await boot()
		dash.toggleFilter('country', 'DE')
		await tick()
		dash.setPeriod('7d')
		await tick()
		fake.go(-1)
		expect([dash.period, dash.filters.length]).toEqual(['30d', 1])
		fake.go(-1)
		expect([dash.period, dash.filters.length]).toEqual(['30d', 0])
	})

	it('keeps an adjustment in its entry without adding one', async () => {
		const dash = await boot()
		dash.metric = 'visits'
		dash.compare = false
		await tick()
		expect(fake.entries).toHaveLength(1)
		dash.view = 'funnels'
		await tick()
		fake.go(-1)
		expect([dash.metric, dash.compare]).toEqual(['visits', false])
	})

	it('restores another site and its filters, which switching cleared', async () => {
		const dash = await boot('?site=a&f=country==DE')
		dash.switchSite('b')
		await tick()
		expect(dash.filters).toEqual([])
		fake.go(-1)
		expect(dash.site).toBe('a')
		expect(dash.filters).toEqual([{ dim: 'country', op: '==', values: ['DE'] }])
	})
})

describe("a view's own selections", () => {
	it('come back with Back', async () => {
		const dash = await boot('?site=a&view=journeys')
		dash.steps = ['/a']
		await tick()
		dash.steps = ['/a', '/b']
		await tick()
		fake.go(-1)
		expect(dash.steps).toEqual(['/a'])
		fake.go(-1)
		expect(dash.steps).toEqual([])
		fake.go(2)
		expect(dash.steps).toEqual(['/a', '/b'])
	})

	it('survive a trip to another view, by Back and by the menu', async () => {
		const dash = await boot('?site=a&view=behavior&report=scroll&page=/a')
		dash.view = 'overview'
		await tick()
		expect(place.search).toBe('?site=a')
		fake.go(-1)
		expect([dash.view, dash.report, dash.page]).toEqual(['behavior', 'scroll', '/a'])
		dash.view = 'overview'
		await tick()
		dash.view = 'behavior'
		await tick()
		expect(place.search).toBe('?site=a&view=behavior&report=scroll&page=%2Fa')
	})

	it('close and reopen the See all window with Back and Forward', async () => {
		const dash = await boot()
		dash.details = 'pages'
		await tick()
		fake.go(-1)
		expect(dash.details).toBe(null)
		fake.go(1)
		expect(dash.details).toBe('pages')
	})

	it('closing the See all window steps back, so the next Back does not reopen it', async () => {
		const dash = await boot()
		dash.view = 'vitals'
		await tick()
		dash.details = 'vitals'
		await tick()
		dash.closeDetails()
		expect(dash.details).toBe(null)
		await tick()
		// the window's entry stays ahead, for Forward, and Back leaves the view
		expect(fake.at).toBe(1)
		fake.go(-1)
		expect([dash.view, dash.details]).toEqual(['overview', null])
		fake.go(2)
		expect(dash.details).toBe('vitals')
		dash.closeDetails()
		expect([dash.view, dash.details]).toEqual(['vitals', null])
	})

	it('closing a See all window opened from a link stays on that entry', async () => {
		const dash = await boot('?site=a&details=pages')
		dash.closeDetails()
		await tick()
		expect([dash.details, place.search]).toEqual([null, '?site=a'])
		expect(fake.at).toBe(0)
	})

	it('a second close while the browser steps back does nothing', async () => {
		const dash = await boot()
		dash.details = 'pages'
		await tick()
		const back = vi.spyOn(fake, 'back').mockImplementation(() => {})
		dash.closeDetails()
		dash.closeDetails()
		expect(back).toHaveBeenCalledTimes(1)
		back.mockRestore()
	})

	it('are forgotten for another site, by switching and by going Back to it', async () => {
		const dash = await boot('?site=a&view=journeys&step=/a')
		dash.funnel = 'f1'
		dash.page = '/p'
		await tick()
		dash.view = 'overview'
		await tick()
		dash.switchSite('b')
		await tick()
		expect([dash.steps, dash.funnel, dash.page]).toEqual([[], null, null])
		dash.steps = ['/on-b']
		dash.view = 'journeys'
		await tick()
		dash.view = 'overview'
		await tick()
		fake.go(-3)
		expect(dash.site).toBe('a')
		expect(dash.view).toBe('overview')
		expect(dash.steps).toEqual([])
	})
})

describe('what must not add an entry', () => {
	it('picking the first site on arrival', async () => {
		await boot('')
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a'])
	})

	it('replacing a site that does not exist, so Back leaves instead of bouncing', async () => {
		await boot('?site=gone&view=funnels')
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a&view=funnels'])
	})

	it('cleaning a URL, a parameter from a return trip or a value it refuses', async () => {
		await boot('?site=a&period=nope&checkout_id=x&f=country==DE;bad')
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a&f=country%3D%3DDE'])
	})

	it('an explicit correction', async () => {
		const dash = await boot('?site=a&view=funnels')
		dash.funnel = 'first'
		dash.syncUrl(true)
		await tick()
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a&view=funnels&funnel=first'])
	})

	it('anything in the landing page, whose Back button it would take over', async () => {
		const me = { ...signedIn, kind: 'anonymous', sites: [site('acme')], sample: 'acme' }
		place.pathname = '/demo'
		fake.reset('?embed&theme=dark')
		vi.resetModules()
		const { Dash } = await import('../src/lib/dash.svelte')
		const dash = new Dash()
		running.push(dash)
		dash.me = me as never
		dash.site = 'acme'
		await tick()
		dash.view = 'funnels'
		await tick()
		dash.toggleFilter('country', 'DE')
		await tick()
		expect(fake.entries).toHaveLength(1)
		expect(fake.scrollRestoration).toBe('auto')
	})
})

describe('coming back from connecting Google', () => {
	const returned = async (search: string, pathname = '/') => {
		await boot(search, signedIn, pathname)
		const { googleReturn } = await import('../src/lib/api')
		return googleReturn
	}

	it('keeps what Settings needs after the URL is rewritten, and keeps it out of the history', async () => {
		const r = await returned('?site=a&view=settings&tab=connect&google=g1')
		expect(r).toEqual({ grant: 'g1', searchGrant: null, error: null })
		expect(fake.entries.map((e) => e.search)).toEqual(['?site=a&view=settings&tab=connect'])
	})

	it('keeps a Search Console grant the same way', async () => {
		expect(await returned('?site=a&view=settings&tab=connect&search=g2')).toEqual({ grant: null, searchGrant: 'g2', error: null })
		expect(place.search).toBe('?site=a&view=settings&tab=connect')
	})

	it('keeps the reason a sign-in failed', async () => {
		expect((await returned('?site=a&view=settings&tab=connect&google_error=denied')).error).toBe('The Google sign-in was canceled, so nothing was connected.')
		expect(place.search).toBe('?site=a&view=settings&tab=connect')
	})

	it('ignores all of it on the demo', async () => {
		const me = { ...signedIn, kind: 'anonymous' }
		place.pathname = '/demo'
		fake.reset('?google=g1&google_error=denied')
		vi.resetModules()
		vi.stubGlobal('fetch', vi.fn(async () => Response.json(me)))
		const { googleReturn } = await import('../src/lib/api')
		expect(googleReturn).toEqual({ grant: null, searchGrant: null, error: null })
	})
})

describe('going Back to a place that changed', () => {
	it('stays on the current site when the entry is for one you lost', async () => {
		const dash = await boot()
		dash.switchSite('b')
		await tick()
		dash.me = { ...signedIn, sites: [site('b')] } as never
		await tick()
		fake.go(-1)
		expect(dash.site).toBe('b')
		expect(place.search).toBe('?site=b')
	})

	it('opens the overview on read-only dashboards, which have no settings', async () => {
		const dash = await boot('?site=a&view=settings')
		dash.view = 'funnels'
		await tick()
		dash.me = { ...signedIn, share: { site: 'a' } } as never
		await tick()
		fake.go(-1)
		expect(dash.view).toBe('overview')
		expect(place.search).toBe('?site=a')
	})
})

describe('the scroll position', () => {
	const scrolled = (y: number) => {
		vi.stubGlobal('scrollY', y)
		dispatchEvent(new Event('scroll'))
	}

	it('starts a new view at the top, and keeps the place for a change within it', async () => {
		const dash = await boot()
		scrolled(800)
		dash.toggleFilter('country', 'DE')
		await tick()
		expect(scrollTo).not.toHaveBeenCalled()
		expect(fake.entries.map((e) => (e.state as { scroll: number }).scroll)).toEqual([800, 800])
		dash.view = 'funnels'
		await tick()
		expect(scrollTo).toHaveBeenCalledWith(0, 0)
		expect(fake.entries[1].state).toMatchObject({ scroll: 800 })
		expect(fake.entries[2].state).toMatchObject({ scroll: 0 })
	})

	it('keeps the entry and its scroll position while correcting a URL', async () => {
		const dash = await boot()
		fake.replaceState({ scroll: 300 }, '')
		dash.metric = 'visits'
		await tick()
		expect(fake.entries).toEqual([{ search: '?site=a&metric=visits', state: { scroll: 300 } }])
	})
})
