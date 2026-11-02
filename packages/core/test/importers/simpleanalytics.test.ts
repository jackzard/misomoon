import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vite-plus/test'
import { csvRows, ImportedSet, type ImportedRow } from '../../src/imported'
import { addExportFiles } from '../../src/importers/files'
import { isSimpleAnalyticsCsv, simpleAnalyticsHits } from '../../src/importers/simpleanalytics'

/**
 * One day of Simple Analytics' own public dashboard, simpleanalytics.com, as its Export API
 * gave it on 2026-10-26: `/api/export/datapoints?version=6&format=csv&type=pageviews` and
 * `type=events`, for 2026-10-20 in Europe/Amsterdam, without robots. Each session_id is
 * replaced by a number, the same in both files.
 */
const DAY = '2026-10-20'
const ZONE = 'Europe/Amsterdam'
const fixture = (name: string) => ({ name, text: readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8') })
const PAGES = fixture('simpleanalytics-pageviews.csv')
const EVENTS = fixture('simpleanalytics-events.csv')

/** The export's rows, as objects, to check the counts against */
function table(text: string): Record<string, string>[] {
	const [head, ...rows] = [...csvRows(text)]
	return rows.filter((r) => r.length > 1).map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ''])))
}
const views = table(PAGES.text)
const events = table(EVENTS.text)

function read(files = [PAGES, EVENTS]) {
	const set = new ImportedSet()
	const n = addExportFiles(set, files, ZONE)
	return { list: set.list(), n }
}
const dim = (list: ImportedRow[], d: string) => Object.fromEntries(list.filter((r) => r.dim === d).map((r) => [r.key, r]))
const sum = (list: ImportedRow[], d: string, f: 'visits' | 'pageviews' | 'events' | 'visitors') => list.filter((r) => r.dim === d).reduce((n, r) => n + r[f], 0)

describe("the Simple Analytics raw export, on a real day of Simple Analytics' public dashboard", () => {
	it('tells its exports from misomoon CSV files', () => {
		expect([isSimpleAnalyticsCsv(PAGES.text), isSimpleAnalyticsCsv(EVENTS.text)]).toEqual([true, true])
		expect(isSimpleAnalyticsCsv('date,visitors,pageviews\n2026-10-20,1,1\n')).toBe(false)
	})

	it("counts the visitors Simple Analytics counted, a visit per session, and every page view", () => {
		const { list, n } = read()
		expect(n).toBe(views.length + events.length)
		const total = dim(list, '')['']
		// is_unique marks the page view Simple Analytics counted as a visitor
		expect(total.visitors).toBe(views.filter((v) => v.is_unique === 'true').length)
		expect(total.visits).toBe(new Set(views.map((v) => v.session_id)).size)
		expect(total.pageviews).toBe(views.length)
		expect([total.visitors, total.visits, total.pageviews]).toEqual([625, 685, 817])
		expect(list.every((r) => r.day === DAY)).toBe(true)
	})

	it("counts a session with one page view and an event as no bounce", () => {
		const alone = read([PAGES]).list
		const both = read().list
		expect(dim(both, '')[''].bounces).toBe(273)
		expect(dim(alone, '')[''].bounces).toBeGreaterThan(273)
		// the first session's page view at 00:01, then its click at 00:01:07
		const first = views[0].session_id
		expect(events.some((e) => e.session_id === first)).toBe(true)
		expect(views.filter((v) => v.session_id === first)).toHaveLength(1)
	})

	it('files every visit under one source, channel, entry page, exit page and device', () => {
		const { list } = read()
		for (const d of ['source', 'channel', 'entry_page', 'exit_page', 'device']) expect([d, sum(list, d, 'visits')]).toEqual([d, 685])
		expect(sum(list, 'page', 'pageviews')).toBe(817)
		const sources = dim(list, 'source')
		expect([sources.Direct.visits, sources.Google.visits, sources.Bing.visits]).toEqual([502, 102, 7])
		// the site's own host is no referrer; its subdomains are, as the tracker counts them
		expect(sources['simpleanalytics.com']).toBeUndefined()
		expect(dim(list, 'referrer')['dashboard.simpleanalytics.com'].visits).toBe(20)
		expect(dim(list, 'channel')['Organic Search'].visits).toBe(113)
	})

	it("uses misomoon's names for browsers, systems, devices and Simple Analytics' own events", () => {
		const { list } = read()
		const browsers = dim(list, 'browser')
		expect(Object.keys(browsers)).not.toContain('Google Chrome')
		expect([browsers.Chrome.visits, browsers.Safari.visits, browsers.Edge.visits]).toEqual([406, 172, 53])
		// client hints give Windows 11 as 13 and up, here 14, 15 and 19
		expect(dim(list, 'os_version')['Windows 10/11'].visits).toBe(174)
		expect(Object.keys(dim(list, 'os_version')).filter((k) => /Windows (1[3-9]|19)/.test(k))).toEqual([])
		expect(Object.keys(dim(list, 'device')).sort()).toEqual(['Desktop', 'Mobile'])
		// auto-events.js sends outbound_<host>; misomoon has its own outbound link event
		const outbound = events.filter((e) => e.datapoint.startsWith('outbound_')).length
		expect(dim(list, 'event')['Outbound link'].events).toBe(outbound)
		expect(sum(list, 'event', 'events')).toBe(events.length)
		expect(dim(list, 'event').click_login_top_nav.events).toBe(329)
	})

	it('keeps time on page and scroll depth per page', () => {
		const { list } = read()
		const home = dim(list, 'page')['/']
		const rows = views.filter((v) => v.path === '/')
		expect(home.time_n).toBe(rows.filter((v) => v.duration_seconds !== '').length)
		expect(home.time_s).toBe(rows.reduce((n, v) => n + Number(v.duration_seconds || 0), 0))
		expect(home.scroll_n).toBe(rows.filter((v) => v.scrolled_percentage !== '').length)
	})

	it('reads an export of 200,000 page views, well under the size it takes', () => {
		const lines = ['added_iso,path,session_id,is_unique']
		for (let i = 0; i < 200_000; i++) lines.push(`2026-10-20T10:${String(i % 60).padStart(2, '0')}:00.000Z,/,session-${i},true`)
		const { list, n } = read([{ name: 'pageviews.csv', text: lines.join('\n') }])
		expect(n).toBe(200_000)
		expect(dim(list, '')['']).toMatchObject({ visitors: 200_000, visits: 200_000, pageviews: 200_000 })
	}, 30_000)

	it('leaves out an event row without a name, rather than count it as a page view', () => {
		const text = 'added_iso,datapoint,path,session_id\n2026-10-20T10:00:00.000Z,,/,s1\n2026-10-20T10:00:01.000Z,click,/,s1\n'
		expect(simpleAnalyticsHits(text).map((h) => h.event)).toEqual(['click'])
	})

	it('asks for session_id when the export has none', () => {
		const text = 'added_iso,path,is_unique\n2026-10-20T10:00:00.000Z,/,true\n'
		expect(() => simpleAnalyticsHits(text)).toThrow('this Simple Analytics export has no session_id column; export it again with session_id among the fields')
	})
})
