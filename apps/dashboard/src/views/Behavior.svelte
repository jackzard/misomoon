<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link'
	import Select from '../components/Select.svelte'
	import Topbar from '../components/Topbar.svelte'
	import type { BehaviorReport, BreakdownResponse, ClickMap, ContentReport, ErrorReport, FormReport, MediaReport, ScrollMap, SiteSearch } from '../lib/api'
	import { getDash, Resource } from '../lib/dash.svelte'
	import { ago, num, pct } from '../lib/format'
	import { openOverlay } from '../lib/overlay'
	import { siteFeatures, type Feature } from '@misomoon/core/features'

	const dash = getDash()
	// `feature` is the Settings checkbox a report needs; scroll depth is always collected
	const TABS: { key: BehaviorReport; label: string; page?: boolean; feature?: Feature }[] = [
		{ key: 'clicks', label: 'Clicks', page: true, feature: 'clicks' },
		{ key: 'scroll', label: 'Scroll', page: true },
		{ key: 'forms', label: 'Forms', feature: 'fields' },
		{ key: 'search', label: 'Search', feature: 'search' },
		{ key: 'errors', label: 'Errors', feature: 'errors' },
		{ key: 'media', label: 'Media', feature: 'media' },
		{ key: 'content', label: 'Content', feature: 'content' },
	]
	const tab = $derived(dash.report)
	const perPage = $derived(TABS.find((t) => t.key === tab)?.page ?? false)
	const off = $derived.by(() => {
		const t = TABS.find((x) => x.key === tab)
		return !!(t?.feature && dash.current && !siteFeatures(dash.current.features).includes(t.feature)) ? t.label : null
	})
	const openTracking = () => ((dash.settingsTab = 'install'), (dash.view = 'settings'))

	// Clicks and scroll are per page: the page filter if there is one, else a page picked here.
	const filtered = $derived.by(() => {
		const f = dash.filters.find((x) => x.dim === 'page' && x.op === '==' && x.values.length === 1)
		return f?.values[0] ?? null
	})
	const pages = new Resource<BreakdownResponse>(() => (dash.site && perPage && !filtered ? `/api/v1/stats/breakdown?${dash.params}&property=page&limit=50&_=${dash.tick}` : null))
	const picked = $derived(dash.page)
	// the demo's recordings predate the sample site's clicks on /shop, its top page, so it opens on the home page
	const first = $derived(dash.isSample ? (pages.data?.rows.find((r) => r.key === '/') ?? pages.data?.rows[0]) : pages.data?.rows[0])
	const page = $derived(filtered ?? (picked && pages.data?.rows.some((r) => r.key === picked) ? picked : (first?.key ?? null)))
	const pageOptions = $derived((pages.data?.rows ?? []).map((r) => ({ value: r.key, label: r.key })))

	const url = (report: BehaviorReport, extra = '') => `/api/v1/stats/behavior?${dash.params}&report=${report}${extra}&_=${dash.tick}`
	const report = new Resource<unknown>(() => {
		if (!dash.site) return null
		if (perPage) return page ? url(tab, `&page=${encodeURIComponent(page)}&limit=100`) : null
		return url(tab, '&limit=100')
	})
	// a result belongs to the tab that asked for it; until the next one lands, show nothing stale
	const data = $derived(report.data && (report.data as { report?: string }).report === tab ? report.data : null)
	const clicks = $derived(tab === 'clicks' ? (data as ClickMap | null) : null)
	const scroll = $derived(tab === 'scroll' ? (data as ScrollMap | null) : null)
	const forms = $derived(tab === 'forms' ? (data as FormReport | null) : null)
	const search = $derived(tab === 'search' ? (data as SiteSearch | null) : null)
	const errors = $derived(tab === 'errors' ? (data as ErrorReport | null) : null)
	const media = $derived(tab === 'media' ? (data as MediaReport | null) : null)
	const content = $derived(tab === 'content' ? (data as ContentReport | null) : null)

	let blocked = $state(false)
	function showOnSite() {
		if (!dash.current || !page) return
		blocked = !openOverlay(dash.current, page, () => dash.params)
	}
	const share = (part: number, whole: number) => (whole ? (part / whole) * 100 : 0)
</script>

<Topbar title="Behavior" subtitle="What people do on a page: where they click, how far they read, the forms they give up on. Counts only, never a recording." />

<div class="tools">
	<div class="tabs scroll-thin">
		<div class="group" role="tablist" aria-label="Report">
			{#each TABS as t (t.key)}
				<button role="tab" aria-selected={tab === t.key} class:on={tab === t.key} onclick={() => (dash.report = t.key)}>{t.label}</button>
			{/each}
		</div>
	</div>
	{#if perPage}
		<div class="page-pick">
			{#if filtered}
				<span class="crumb mono">{filtered}</span>
				<span class="muted small">from the page filter</span>
			{:else if pageOptions.length}
				<Select label="Page" value={page ?? ''} options={pageOptions} onchange={(v) => (dash.page = v)} class="page-select" />
			{/if}
		</div>
	{/if}
</div>

{#if report.error ?? pages.error}<p class="error-text">{report.error ?? pages.error}</p>{/if}
{#if off}
	<section class="card off">
		<p><strong>{off} is turned off for this site.</strong> Nothing new is collected until it is ticked under Settings, Install, What to track.</p>
		{#if dash.canEdit}<button class="btn" onclick={openTracking}>Open settings</button>{/if}
	</section>
{/if}

{#if perPage && !page && pages.data}
	<section class="card empty"><h3>No pages in this period</h3><p class="muted">Once the page gets visits, its clicks and scroll depth show here.</p></section>
{:else if !data && !(report.error ?? pages.error)}
	<section class="card body">
		{#each Array(6) as _, i (i)}<div class="row sk"><span class="skeleton" style="width: {90 - i * 11}%; height: 14px"></span></div>{/each}
	</section>
{:else if clicks}
	<div class="kpis">
		<div class="card kpi"><span class="label">Clicks</span><strong class="num">{num(clicks.clicks)}</strong><span class="muted small">{num(clicks.pageviews)} pageviews</span></div>
		<div class="card kpi"><span class="label">Clicks per pageview</span><strong class="num">{clicks.pageviews ? (clicks.clicks / clicks.pageviews).toFixed(1) : '0'}</strong></div>
		<div class="card kpi"><span class="label">Rage clicks</span><strong class="num" class:bad={clicks.rage}>{num(clicks.rage)}</strong><span class="muted small">3 quick clicks on one spot</span></div>
		<div class="card kpi"><span class="label">Dead clicks</span><strong class="num" class:warn={clicks.dead}>{num(clicks.dead)}</strong><span class="muted small">nothing happened after</span></div>
	</div>
	<section class="card body">
		<header class="head">
			<h3>Clicked elements</h3>
			<button class="btn primary" onclick={showOnSite} disabled={!dash.current}><ExternalLink size={14} /> Show on your site</button>
		</header>
		<p class="muted small note">
			Opens {dash.current?.domain}{page} in a new tab and draws these clicks over the page. That page needs the misomoon script, and this tab must stay open.
			{#if blocked}<strong class="bad">The browser blocked the new tab; allow pop-ups for this dashboard and try again.</strong>{/if}
		</p>
		{#if !clicks.elements.length}
			<p class="muted empty-line">No clicks on this page yet.</p>
		{:else}
			<div class="table" role="table">
				<div class="tr th" role="row"><span role="columnheader">Element</span><span role="columnheader">Clicks</span><span role="columnheader">Visitors</span><span role="columnheader">Rage</span><span role="columnheader">Dead</span></div>
				{#each clicks.elements as e (e.selector)}
					<div class="tr" role="row">
						<span class="cell key" role="cell">
							<span class="bar" style:width="{share(e.clicks, clicks.elements[0].clicks)}%"></span>
							<span class="name">{e.label || '(no text)'}</span>
							<span class="sel mono">{e.selector}</span>
						</span>
						<span class="num" role="cell">{num(e.clicks)}</span>
						<span class="num" role="cell">{num(e.visitors)}</span>
						<span class="num" class:bad={e.rage} role="cell">{num(e.rage)}</span>
						<span class="num" class:warn={e.dead} role="cell">{num(e.dead)}</span>
					</div>
				{/each}
			</div>
			{#if clicks.truncated}<p class="muted small">Only the most clicked elements are listed.</p>{/if}
		{/if}
	</section>
{:else if scroll}
	<div class="split">
		<section class="card body">
			<header class="head">
				<h3>How far people read</h3>
				<span class="muted small">{num(scroll.visits)} visits · {pct(scroll.average, 0)} on average</span>
			</header>
			{#if !scroll.visits}
				<p class="muted empty-line">No scroll data for this page yet.</p>
			{:else}
				<!-- the page, top to bottom: each band is how many visits saw it -->
				<div class="sheet" aria-label="Share of visits that reached each part of the page">
					{#each scroll.reached.slice(1) as r (r.depth)}
						<div class="band" style:--share={r.share / 100}>
							<span class="depth mono">{r.depth - 10}–{r.depth}%</span>
							<span class="reach num">{pct(r.share, 0)}</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>
		<section class="card body notes">
			<h3>Reading this</h3>
			<p>Each band is a tenth of the page. Its number is the share of visits that scrolled at least that far, counting a short page someone saw whole as read to the end.</p>
			<p class="muted">A sharp drop between two bands marks where people stop reading. Move what matters above it.</p>
			<button class="btn" onclick={showOnSite} disabled={!dash.current}><ExternalLink size={14} /> Show on your site</button>
		</section>
	</div>
{:else if forms}
	{#if !forms.forms.length}
		<section class="card empty">
			<h3>No form activity yet</h3>
			<p class="muted">misomoon notes which field a visit starts and where it stops, never what anyone types. Give a form an <code>id</code> or <code>name</code> so it shows up by name; <code>data-misomoon-ignore</code> on a form leaves it out.</p>
		</section>
	{:else}
		<div class="forms">
			{#each forms.forms as f (f.form)}
				{@const drop = Math.max(1, ...f.fields.map((x) => x.dropoffs))}
				<section class="card body">
					<header class="head">
						<h3 class="mono">{f.form}</h3>
						<span class="muted small">{num(f.starts)} started · {num(f.submissions)} sent · <strong>{pct(f.conversion, 0)}</strong> finished</span>
					</header>
					<div class="table" role="table">
						<div class="tr th fields" role="row"><span role="columnheader">Field</span><span role="columnheader">Used</span><span role="columnheader">Left here</span></div>
						{#each f.fields as x (x.field)}
							<div class="tr fields" role="row">
								<span class="cell key" role="cell"><span class="bar drop" style:width="{share(x.dropoffs, drop)}%"></span><span class="name mono">{x.field}</span></span>
								<span class="num" role="cell">{num(x.interactions)}</span>
								<span class="num" class:bad={x.dropoffs} role="cell">{num(x.dropoffs)}</span>
							</div>
						{/each}
					</div>
					{#if !f.fields.length}<p class="muted small">No field use recorded for this form in this period.</p>{/if}
				</section>
			{/each}
		</div>
	{/if}
{:else if search}
	{#if !search.terms.length}
		<section class="card empty">
			<h3>No site searches yet</h3>
			<p class="muted">The term comes from the page URL: <code>?q=</code>, <code>?s=</code>, <code>?search=</code>, <code>?query=</code> or <code>?keyword=</code>. If your search uses another parameter, add it under Settings, Install, What to track.</p>
		</section>
	{:else}
		<div class="kpis">
			<div class="card kpi"><span class="label">Searches</span><strong class="num">{num(search.searches)}</strong></div>
			<div class="card kpi"><span class="label">Visitors who searched</span><strong class="num">{pct(share(search.visitors, search.total_visitors), 1)}</strong><span class="muted small">{num(search.visitors)} of {num(search.total_visitors)}</span></div>
		</div>
		<section class="card body">
			<div class="table" role="table">
				<div class="tr th three" role="row"><span role="columnheader">Term</span><span role="columnheader">Searches</span><span role="columnheader">Visitors</span></div>
				{#each search.terms as t (t.term)}
					<div class="tr three" role="row">
						<span class="cell key" role="cell"><span class="bar" style:width="{share(t.searches, search.terms[0].searches)}%"></span><span class="name">{t.term}</span></span>
						<span class="num" role="cell">{num(t.searches)}</span>
						<span class="num" role="cell">{num(t.visitors)}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}
{:else if errors}
	{#if !errors.errors.length}
		<section class="card empty"><h3>No JavaScript errors</h3><p class="muted">Uncaught errors and rejected promises show here, grouped by message and file.</p></section>
	{:else}
		<div class="kpis">
			<div class="card kpi"><span class="label">Errors</span><strong class="num bad">{num(errors.count)}</strong></div>
			<div class="card kpi"><span class="label">Visitors who hit one</span><strong class="num">{num(errors.visitors)}</strong></div>
		</div>
		<section class="card body">
			<ul class="errors">
				{#each errors.errors as e (e.message + e.source)}
					<li>
						<div class="msg mono">{e.message}</div>
						<div class="meta muted small">
							{#if e.source}<span class="mono">{e.source}</span> ·{/if}
							<span>{num(e.count)} times, {num(e.visitors)} visitors</span> · <span>last {ago(e.last_seen)}</span>
						</div>
						<div class="meta muted small">On {e.pages.join(', ')}{e.browsers.length ? ` · ${e.browsers.join(', ')}` : ''}</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}
{:else if media}
	{#if !media.media.length}
		<section class="card empty">
			<h3>No video or audio played yet</h3>
			<p class="muted">Plays of <code>&lt;video&gt;</code> and <code>&lt;audio&gt;</code> are counted on their own once Video and audio is ticked in Settings. Name one with <code>data-misomoon-media="Product tour"</code>; muted background loops are left out.</p>
		</section>
	{:else}
		<section class="card body">
			<div class="table" role="table">
				<div class="tr th media" role="row"><span role="columnheader">Media</span><span role="columnheader">Plays</span><span role="columnheader">25%</span><span role="columnheader">50%</span><span role="columnheader">75%</span><span role="columnheader">End</span></div>
				{#each media.media as m (m.name + m.type)}
					<div class="tr media" role="row">
						<span class="cell key" role="cell"><span class="name">{m.name}</span><span class="sel">{m.type}</span></span>
						<span class="num" role="cell">{num(m.plays)}</span>
						{#each m.reached as r, i (i)}
							<span class="num meter" role="cell"><span class="fill" style:width="{r}%"></span><span>{pct(r, 0)}</span></span>
						{/each}
					</div>
				{/each}
			</div>
		</section>
	{/if}
{:else if content}
	{#if !content.content.length}
		<section class="card empty">
			<h3>Nothing tagged yet</h3>
			<p class="muted">Add <code>data-misomoon-content="Hero banner"</code> to a banner, a card or a call to action. misomoon counts how often half of it was on screen, and how often it was clicked.</p>
		</section>
	{:else}
		<section class="card body">
			<div class="table" role="table">
				<div class="tr th content" role="row"><span role="columnheader">Content</span><span role="columnheader">Seen</span><span role="columnheader">Clicked</span><span role="columnheader">Click rate</span><span role="columnheader">Visitors</span></div>
				{#each content.content as c (c.name)}
					<div class="tr content" role="row">
						<span class="cell key" role="cell"><span class="bar" style:width="{share(c.impressions, content.content[0].impressions)}%"></span><span class="name">{c.name}</span></span>
						<span class="num" role="cell">{num(c.impressions)}</span>
						<span class="num" role="cell">{num(c.clicks)}</span>
						<span class="num" role="cell"><strong>{pct(c.ctr, 1)}</strong></span>
						<span class="num" role="cell">{num(c.visitors)}</span>
					</div>
				{/each}
			</div>
		</section>
	{/if}
{/if}

<style>
	.tools {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
		margin: 20px 0 16px;
	}
	.tabs {
		max-width: 100%;
		overflow-x: auto;
		padding: 0 4px 4px 0;
	}
	.page-pick {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}
	.page-pick :global(.page-select) {
		min-width: 220px;
		max-width: 420px;
	}
	.crumb {
		font-size: 12px;
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		background: var(--miso-soft);
		border: 1px solid var(--miso-line);
	}
	.small {
		font-size: 12px;
	}
	.bad {
		color: var(--bad);
	}
	.warn {
		color: var(--warn);
	}
	code {
		font-family: var(--font-mono);
		font-size: 0.9em;
		padding: 1px 4px;
		border-radius: var(--radius-xs);
		background: var(--surface-3);
	}
	.kpis {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
		gap: 12px;
		margin-bottom: 16px;
	}
	.kpi {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 14px;
	}
	.kpi .label {
		font-family: var(--font-mono);
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
	}
	.kpi strong {
		font-size: 24px;
		font-weight: 700;
	}
	.body {
		padding: 14px;
	}
	.off {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-wrap: wrap;
		padding: 14px 18px;
		margin-bottom: 14px;
		max-width: 680px;
	}
	.off p {
		margin: 0;
		flex: 1;
		min-width: 220px;
		font-size: 13px;
		line-height: 1.5;
	}
	.empty {
		padding: 22px;
		max-width: 680px;
	}
	.empty h3,
	.body h3 {
		margin: 0;
		font-size: 15px;
	}
	.empty p {
		margin: 8px 0 0;
		line-height: 1.55;
	}
	.empty-line {
		font-size: 13px;
		padding: 8px 0;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		margin-bottom: 10px;
	}
	.note {
		margin: 0 0 12px;
		line-height: 1.5;
	}
	.table {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.tr {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 72px 72px 56px 56px;
		align-items: center;
		gap: 8px;
		min-height: 38px;
		font-size: 13px;
	}
	.tr.three {
		grid-template-columns: minmax(0, 1fr) 80px 80px;
	}
	.tr.fields {
		grid-template-columns: minmax(0, 1fr) 64px 80px;
	}
	.tr.media {
		grid-template-columns: minmax(0, 1fr) 64px repeat(4, 64px);
	}
	.tr.content {
		grid-template-columns: minmax(0, 1fr) 64px 64px 80px 64px;
	}
	.tr.th {
		min-height: 28px;
		font-family: var(--font-mono);
		font-size: 10.5px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-3);
		border-bottom: 1px solid var(--line);
	}
	.tr > .num {
		text-align: right;
	}
	.tr:not(.th):hover {
		background: var(--surface-hover);
	}
	.cell.key {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
		padding: 4px 8px;
		align-self: stretch;
	}
	.bar {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--dots);
		box-shadow: inset 0 -2px 0 var(--miso);
		transition: width var(--dur-slow) var(--ease-out);
	}
	.bar.drop {
		border-right-color: var(--bad);
	}
	.name,
	.sel {
		position: relative;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.name {
		font-weight: 600;
	}
	.sel {
		font-size: 11px;
		color: var(--text-3);
	}
	.meter {
		position: relative;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		height: 22px;
		padding: 0 6px;
		border: 1px solid var(--line-strong);
		border-radius: var(--radius-xs);
		overflow: hidden;
	}
	.meter .fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--bar-hover);
	}
	.meter span:last-child {
		position: relative;
	}
	.split {
		display: grid;
		grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
		gap: 16px;
		align-items: start;
	}
	.notes p {
		font-size: 13px;
		line-height: 1.55;
	}
	.sheet {
		border: 1.5px solid var(--edge);
		border-radius: var(--radius);
		overflow: hidden;
		max-width: 420px;
	}
	.band {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 34px;
		padding: 0 12px;
		font-size: 12px;
		background: color-mix(in srgb, var(--miso) calc(var(--share) * 70%), var(--surface));
		color: var(--text);
	}
	.band + .band {
		border-top: 1px dashed var(--line-strong);
	}
	.reach {
		font-weight: 700;
	}
	.forms {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: 16px;
	}
	.errors {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.errors li {
		padding: 10px 4px;
		border-bottom: 1px solid var(--line);
	}
	.errors li:last-child {
		border-bottom: 0;
	}
	.msg {
		font-size: 12.5px;
		font-weight: 600;
		color: var(--bad);
		word-break: break-word;
	}
	.meta {
		margin-top: 3px;
		word-break: break-all;
	}
	.row.sk {
		height: 32px;
		display: flex;
		align-items: center;
	}
	@media (max-width: 760px) {
		.split {
			grid-template-columns: 1fr;
		}
		.tr {
			grid-template-columns: minmax(0, 1fr) 56px 56px 44px 44px;
		}
		.tr.media {
			grid-template-columns: minmax(0, 1fr) repeat(5, 48px);
		}
		.tr.content {
			grid-template-columns: minmax(0, 1fr) repeat(4, 52px);
		}
	}
</style>
