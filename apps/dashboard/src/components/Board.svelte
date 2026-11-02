<script lang="ts" module>
	import type { Row } from '../lib/api'

	export interface Column {
		key: keyof Row
		label: string
		format: (v: number) => string
	}
	export interface Lens {
		property: string
		label: string
		/** only offered inside a row that passes, e.g. search terms inside Organic Search */
		when?: (value: string) => boolean
	}
	export interface BoardTab {
		property: string
		label: string
		/** "channels", for "All channels" */
		plural?: string
		columns?: Column[]
		/** selecting a row opens it and breaks it down by these; without them, a row filters the dashboard */
		lenses?: Lens[]
		/** the filter a row sets, when it isn't `property == key` */
		filterFor?: (key: string) => [dim: string, value: string] | null
	}

	/** A row's change on the comparison period: a percent, null for "new", undefined when unknown. */
	export function rowChange(r: Row): number | null | undefined {
		const before = r.previous_visitors
		if (before == null) return undefined
		if (before === 0) return r.visitors ? null : undefined
		return Math.round(((r.visitors - before) / before) * 1000) / 10
	}
</script>

<script lang="ts">
	import ChevronLeft from '@lucide/svelte/icons/chevron-left'
	import ChevronRight from '@lucide/svelte/icons/chevron-right'
	import FilterIcon from '@lucide/svelte/icons/filter'
	import Maximize2 from '@lucide/svelte/icons/maximize-2'
	import type { Snippet } from 'svelte'
	import type { BreakdownResponse } from '../lib/api'
	import { getDash, Resource } from '../lib/dash.svelte'
	import { money, moneyShort, num, pct } from '../lib/format'
	import { displayKey, favicon, iconDomain, prefix } from '../lib/labels'
	import { serializeFilters } from '../lib/url'
	import Delta from './Delta.svelte'
	import Details from './Details.svelte'

	/**
	 * One list with its tabs on a single line. A tab with lenses opens a row in place:
	 * select Organic Search and the same card lists its search engines, terms and links,
	 * with a way back. Nothing is filtered until you ask, with the funnel on a row or the
	 * button at the bottom of an opened row.
	 */
	interface Props {
		title: string
		tabs: BoardTab[]
		storageKey: string
		/** rows shown */
		limit?: number
		/** rows fetched for the first level, when something else (the globe) reads them all */
		fetch?: number
		/** drawn before a row's name, after its flag or favicon */
		icon?: Snippet<[{ property: string; row: Row }]>
		/** no card of its own, for a board inside another card */
		bare?: boolean
		/** the first level's rows, for the globe */
		rows?: Row[]
		/** the opened row's key */
		opened?: string | null
	}
	let { title, tabs, storageKey, limit = 8, fetch, icon, bare = false, rows = $bindable([]), opened = $bindable(null) }: Props = $props()
	const dash = getDash()

	const remember = (k: string, v?: string) => {
		try {
			if (v === undefined) return localStorage.getItem(`misomoon.${k}.${storageKey}`)
			localStorage.setItem(`misomoon.${k}.${storageKey}`, v)
		} catch {}
		return null
	}
	let tabKey = $state(remember('tab') ?? '')
	let lensKey = $state(remember('lens') ?? '')
	const tab = $derived(tabs.find((t) => t.property === tabKey) ?? tabs[0])

	const compare = $derived(dash.compare ? `&compare=${dash.compareTo}` : '')
	const top = new Resource<BreakdownResponse>(() =>
		dash.site ? `/api/v1/stats/breakdown?${dash.params}&property=${encodeURIComponent(tab.property)}&limit=${fetch ?? limit}${compare}&_=${dash.tick}` : null,
	)
	// a response for another tab is still in `top` until this tab's lands
	const topRows = $derived(top.data?.property === tab.property ? top.data.rows : [])
	$effect(() => {
		rows = topRows
	})
	// an opened row that the new period or filters no longer have closes
	const inside = $derived(tab.lenses && opened != null && (topRows.some((r) => r.key === opened) || !top.data) ? opened : null)
	const offered = $derived(inside == null ? [] : (tab.lenses ?? []).filter((l) => !l.when || l.when(inside)))
	const lens = $derived(offered.find((l) => l.property === lensKey) ?? offered[0])

	const scoped = $derived.by(() => {
		if (!dash.site || inside == null || !lens) return null
		const p = new URLSearchParams(dash.params)
		const others = dash.filters.filter((f) => f.dim !== tab.property)
		p.set('filters', serializeFilters([...others, { dim: tab.property, op: '==', values: [inside] }]))
		return p.toString()
	})
	const sub = new Resource<BreakdownResponse>(() =>
		scoped ? `/api/v1/stats/breakdown?${scoped}&property=${encodeURIComponent(lens.property)}&limit=${limit}${compare}&_=${dash.tick}` : null,
	)
	const subRows = $derived(sub.data?.property === lens?.property ? sub.data.rows : [])

	const res = $derived(inside == null ? top : sub)
	const property = $derived(inside == null ? tab.property : lens.property)
	const shown = $derived((inside == null ? topRows : subRows).slice(0, limit))
	const loading = $derived(inside == null ? !top.data || top.data.property !== tab.property : !sub.data || sub.data.property !== lens?.property)
	// Search Console reports clicks on searches, not visits
	const terms = $derived(property === 'search_term')
	const value = (r: Row) => (terms ? (r.clicks ?? 0) : r.visitors)
	const max = $derived(Math.max(1, ...shown.map(value)))
	const total = $derived(res.data?.total_visitors ?? 0)
	const cols = $derived(inside == null ? (tab.columns ?? []) : [])

	function chooseTab(p: string) {
		tabKey = p
		opened = null
		remember('tab', p)
	}
	function chooseLens(p: string) {
		lensKey = p
		remember('lens', p)
	}
	function filterOf(r: Row): [string, string] | null {
		if (inside != null) return terms ? null : [lens.property, r.key]
		return tab.filterFor ? tab.filterFor(r.key) : [tab.property, r.key]
	}
	function select(r: Row) {
		if (inside == null && tab.lenses) {
			opened = r.key
			return
		}
		const f = filterOf(r)
		if (!f) return
		// a row inside an opened row filters by both
		if (inside != null) dash.setFilter({ dim: tab.property, op: '==', values: [inside] })
		dash.toggleFilter(f[0], f[1])
	}
</script>

<section class="board" class:card={!bare}>
	<header>
		{#if inside != null}
			<div class="crumb">
				<button class="back" onclick={() => (opened = null)} aria-label="Back to {tab.label}"><ChevronLeft size={15} /></button>
				<span class="from">{tab.label}</span>
				<span class="sep">/</span>
				<strong>{@render mark(tab.property, { key: inside } as Row)}{displayKey(tab.property, inside)}</strong>
			</div>
		{:else}
			<h3>{title}</h3>
		{/if}
		{#if inside != null ? offered.length > 1 : tabs.length > 1}
			<div class="tabs" role="tablist" aria-label={inside != null ? `Break down ${displayKey(tab.property, inside)}` : title}>
				{#if inside != null}
					{#each offered as l (l.property)}
						<button role="tab" aria-selected={l === lens} class:on={l === lens} onclick={() => chooseLens(l.property)}>{l.label}</button>
					{/each}
				{:else}
					{#each tabs as t (t.property)}
						<button role="tab" aria-selected={t === tab} class:on={t === tab} onclick={() => chooseTab(t.property)}>{t.label}</button>
					{/each}
				{/if}
			</div>
		{/if}
	</header>

	<div class="head">
		<span>{inside != null ? lens.label : tab.label}</span>
		<span class="nums">
			{#each cols as c (c.key)}<span class="col">{c.label}</span>{/each}
			<span class="col v">{terms ? 'Clicks' : 'People'}</span>
		</span>
	</div>

	<div class="body" class:stale={res.loading && !loading}>
		{#if res.error}
			<p class="empty">Couldn't load this. {res.error}</p>
		{:else if loading}
			{#each Array(5) as _, i (i)}<div class="sk"><span class="skeleton" style="width: {84 - i * 11}%"></span></div>{/each}
		{:else if !shown.length}
			<p class="empty">{inside != null ? 'Nothing more to split here.' : 'No visits in this range.'}</p>
		{:else}
			<ul>
				{#each shown as row (row.key)}
					{@const f = filterOf(row)}
					{@const on = f ? dash.hasFilter(f[0], f[1]) : false}
					{@const opens = inside == null && !!tab.lenses}
					<li>
						<button
							class="row"
							class:on
							disabled={!opens && !f}
							onclick={() => select(row)}
							title={opens ? `Look inside ${displayKey(property, row.key)}` : f ? (on ? 'Remove filter' : `Filter by ${displayKey(property, row.key)}`) : undefined}
						>
							<span class="bar" style:width="{(value(row) / max) * 100}%"></span>
							<span class="key">
								{@render mark(property, row)}
								<span class="text">{displayKey(property, row.key)}</span>
								{#if row.revenue}<span class="rev num" title="{money(row.revenue, dash.current?.currency)} revenue">{moneyShort(row.revenue, dash.current?.currency)}</span>{/if}
							</span>
							<span class="nums">
								{#each cols as c (c.key)}
									<span class="col num">{row[c.key] == null ? '—' : c.format(row[c.key] as number)}</span>
								{/each}
								{#if dash.compare && !terms}<span class="change"><Delta value={rowChange(row)} /></span>{/if}
								<span class="col v num">
									{#if !cols.length && total && !(dash.compare && !terms)}<span class="share">{pct((value(row) / total) * 100, 0)}</span>{/if}
									{num(value(row))}
								</span>
								{#if opens}<ChevronRight size={14} class="chev" />{/if}
							</span>
						</button>
						{#if opens}
							<button
								class="pin"
								class:active={on}
								onclick={() => dash.toggleFilter(tab.property, row.key)}
								title={on ? 'Stop filtering' : `Only show ${displayKey(tab.property, row.key)} everywhere`}
								aria-label={on ? 'Stop filtering' : `Filter by ${displayKey(tab.property, row.key)}`}><FilterIcon size={12} /></button
							>
						{/if}
					</li>
				{/each}
			</ul>
		{/if}
	</div>

	<footer>
		{#if inside != null}
			{@const on = dash.hasFilter(tab.property, inside)}
			<button class="more" onclick={() => dash.toggleFilter(tab.property, inside)}>
				<FilterIcon size={13} />
				{on ? 'Stop filtering by' : 'Filter the dashboard by'}
				{displayKey(tab.property, inside)}
			</button>
		{:else}
			<button class="more" onclick={() => (dash.details = storageKey)} disabled={!shown.length}><Maximize2 size={13} /> See all {tab.plural ?? ''}</button>
		{/if}
	</footer>
</section>

{#snippet mark(prop: string, row: Row)}
	{@const domain = iconDomain(prop, row.key)}
	{@const pre = prefix(prop, row.key)}
	{#if icon}{@render icon({ property: prop, row })}{/if}
	{#if domain}
		<img src={favicon(domain)} alt="" width="14" height="14" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
	{:else if pre}
		<span class="flag">{pre}</span>
	{/if}
{/snippet}

{#if dash.details === storageKey}
	<Details tab={{ property: tab.property, label: tab.label, filterFor: tab.filterFor }} title={tab.label} />
{/if}

<style>
	.board {
		display: flex;
		flex-direction: column;
		min-width: 0;
		overflow: hidden;
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px 16px;
		min-height: 52px;
		padding: 12px 14px 6px 18px;
	}
	h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.crumb {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		font-size: 13px;
	}
	.crumb strong {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-size: 15px;
	}
	.back {
		display: grid;
		place-items: center;
		width: 26px;
		height: 26px;
		margin-left: -6px;
		border-radius: var(--radius-sm);
		border: 1.5px solid var(--line-strong);
		color: var(--text-2);
	}
	.back:hover {
		border-color: var(--edge);
		color: var(--text);
		background: var(--surface-hover);
	}
	.from {
		color: var(--text-3);
	}
	.sep {
		color: var(--text-4);
	}
	/* One line of tabs, never two: when they don't fit, they scroll sideways and fade at the edge. */
	.tabs {
		display: flex;
		gap: 4px;
		flex: 0 1 auto;
		min-width: 0;
		max-width: 100%;
		overflow-x: auto;
		scrollbar-width: none;
		padding: 2px 3px 4px 2px;
		mask-image: linear-gradient(to right, #000 calc(100% - 18px), transparent);
	}
	.tabs::-webkit-scrollbar {
		display: none;
	}
	.tabs > button {
		flex: none;
		height: 26px;
		padding: 0 10px;
		border: 1.5px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 12px;
		font-weight: 500;
		color: var(--text-3);
		white-space: nowrap;
		transition:
			background var(--dur-fast),
			color var(--dur-fast);
	}
	.tabs > button:last-child {
		margin-right: 14px;
	}
	.tabs > button:hover {
		color: var(--text);
		background: var(--surface-3);
	}
	.tabs > button.on {
		border-color: var(--edge);
		background: var(--vermilion);
		color: var(--on-vermilion);
		font-weight: 600;
		box-shadow: var(--shadow-sm);
	}
	/* the strip scrolls, which clips an outside ring, so focus is drawn inside the tab */
	.tabs > button:focus-visible {
		box-shadow:
			inset 0 0 0 2px var(--cobalt),
			inset 0 0 0 3.5px var(--surface);
	}
	.tabs > button.on:focus-visible {
		box-shadow:
			var(--shadow-sm),
			inset 0 0 0 2px var(--cobalt),
			inset 0 0 0 3.5px var(--surface);
	}
	.head {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 4px 18px 6px;
		font-size: 10.5px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-4);
	}
	.body {
		flex: 1;
		padding: 0 10px 6px;
		transition: opacity var(--dur);
	}
	.stale {
		opacity: 0.6;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex: 1;
		min-width: 0;
		height: 34px;
		padding: 0 8px;
		margin-bottom: 2px;
		border-radius: var(--radius);
		text-align: left;
		isolation: isolate;
	}
	.row:disabled {
		cursor: default;
	}
	.bar {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--dots);
		box-shadow: inset 0 -2px 0 var(--miso);
		z-index: -1;
		transition: width var(--dur-slow) var(--ease-out);
	}
	.row:not(:disabled):hover .bar,
	.row.on .bar {
		background: var(--dots-dense);
	}
	.row.on {
		box-shadow: inset 0 0 0 1.5px var(--edge);
	}
	/* the selected style sets its own shadow, so the focus ring is added back on top of it */
	.row.on:focus-visible {
		box-shadow:
			inset 0 0 0 1.5px var(--edge),
			var(--focus);
	}
	.key {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
		flex: 1;
		font-size: 13px;
	}
	.key img,
	.crumb img {
		border-radius: var(--radius-xs);
		flex: none;
	}
	.flag {
		font-size: 15px;
		line-height: 1;
	}
	.text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.rev {
		flex: none;
		font-size: 11px;
		color: var(--good);
		background: var(--good-soft);
		padding: 1px 5px;
		border-radius: var(--radius-xs);
	}
	.nums {
		display: flex;
		align-items: center;
		gap: 14px;
		flex: none;
	}
	.col {
		min-width: 44px;
		text-align: right;
		font-size: 12.5px;
		color: var(--text-2);
	}
	.head .col {
		color: inherit;
		font-size: inherit;
	}
	.col.v {
		position: relative;
		min-width: 48px;
		font-weight: 600;
		color: var(--text);
	}
	.head .col.v {
		font-weight: inherit;
		color: inherit;
	}
	.head .nums {
		padding-right: 36px;
	}
	.change {
		display: flex;
		justify-content: flex-end;
		min-width: 56px;
	}
	.share {
		position: absolute;
		right: calc(100% + 8px);
		font-weight: 400;
		color: var(--text-3);
		opacity: 0;
		transition: opacity var(--dur-fast);
	}
	.row:hover .share {
		opacity: 1;
	}
	.row :global(.chev) {
		color: var(--text-4);
		margin-right: -4px;
	}
	.row:hover :global(.chev) {
		color: var(--text);
	}
	.pin {
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		flex: none;
		border-radius: var(--radius-sm);
		color: var(--text-4);
		opacity: 0;
	}
	li:hover .pin,
	.pin.active,
	.pin:focus-visible {
		opacity: 1;
	}
	.pin:hover {
		color: var(--text);
		background: var(--surface-hover);
	}
	.pin.active {
		color: var(--miso);
	}
	/* rows that don't open have no pin; keep their numbers in line with the ones that do */
	li:not(:has(.pin)) .row {
		margin-right: 26px;
	}
	.sk {
		display: flex;
		align-items: center;
		height: 34px;
		padding: 0 8px;
	}
	.sk .skeleton {
		height: 14px;
	}
	.empty {
		display: grid;
		place-items: center;
		min-height: 180px;
		margin: 0;
		padding: 0 12px;
		text-align: center;
		font-size: 13px;
		color: var(--text-3);
	}
	footer {
		display: flex;
		justify-content: center;
		padding: 6px 0 10px;
		border-top: 1px solid var(--line);
	}
	.more {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		height: 26px;
		padding: 0 10px;
		border-radius: var(--radius-sm);
		color: var(--text-3);
		font-size: 12px;
	}
	.more:hover:not(:disabled) {
		color: var(--text);
		background: var(--surface-hover);
	}
	/* on a phone the change stays and the extra columns go */
	@media (max-width: 560px) {
		.col:not(.v) {
			display: none;
		}
		.nums {
			gap: 8px;
		}
		.change {
			min-width: 0;
		}
		header {
			padding-left: 16px;
		}
	}
</style>
