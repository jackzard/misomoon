<script lang="ts" module>
	import type { Row } from '../lib/api'

	export interface Column {
		key: keyof Row
		label: string
		format: (v: number) => string
	}

	export interface PanelTab {
		/** unique key when two tabs query the same property */
		id?: string
		/** breakdown property to query */
		property: string
		label: string
		/** dimension used when a row is clicked; defaults to property */
		filter?: string | null
		/** maps a row to the filter it applies, when that depends on the row */
		filterFor?: (key: string) => [dim: string, value: string] | null
		columns?: Column[]
		/** what the main number counts; defaults to Visitors */
		valueLabel?: string
		/** custom body instead of the list (e.g. the map) */
		custom?: boolean
	}
</script>

<script lang="ts">
	import Maximize2 from '@lucide/svelte/icons/maximize-2'
	import type { Snippet } from 'svelte'
	import type { BreakdownResponse } from '../lib/api'
	import { getDash, Resource } from '../lib/dash.svelte'
	import { num, pct } from '../lib/format'
	import { displayKey, favicon, iconDomain, prefix } from '../lib/labels'
	import Details from './Details.svelte'

	interface Props {
		title: string
		tabs: PanelTab[]
		/** renders a tab with custom: true */
		custom?: Snippet<[{ tab: PanelTab; data: BreakdownResponse | null }]>
		rowIcon?: Snippet<[{ tab: PanelTab; row: Row }]>
		limit?: number
		storageKey?: string
	}

	let { title, tabs, custom, rowIcon, limit = 9, storageKey }: Props = $props()
	const dash = getDash()

	function initialTab() {
		try {
			const saved = storageKey && localStorage.getItem(`misomoon.tab.${storageKey}`)
			if (saved && tabs.some((t) => key(t) === saved)) return saved
		} catch {}
		return key(tabs[0])
	}
	function key(t: PanelTab) {
		return t.id ?? t.property
	}
	let active = $state(initialTab())
	const detailsKey = $derived(storageKey ?? title)
	const tab = $derived(tabs.find((t) => key(t) === active) ?? tabs[0])

	function choose(p: string) {
		active = p
		try {
			if (storageKey) localStorage.setItem(`misomoon.tab.${storageKey}`, p)
		} catch {}
	}

	const res = new Resource<BreakdownResponse>(() =>
		dash.site ? `/api/v1/stats/breakdown?${dash.params}&property=${encodeURIComponent(tab.property)}&limit=${tab.custom ? 100 : limit}&_=${dash.tick}` : null,
	)
	// After a tab switch the previous tab's response is still in `res` until the
	// new one lands; it is not this tab's data, so show the loading rows instead.
	const fresh = $derived(res.data?.property === tab.property)
	const rows = $derived(fresh ? (res.data?.rows ?? []) : [])
	const max = $derived(Math.max(1, ...rows.map((r) => r.visitors)))
	const total = $derived(res.data?.total_visitors ?? 0)
	const filterDim = $derived(tab.filter === undefined ? tab.property : tab.filter)
	const cols = $derived(tab.columns ?? [])
</script>

<section class="card panel">
	<header>
		<h3>{title}</h3>
	</header>
	{#if tabs.length > 1}
		<div class="tabs chips" role="tablist">
			{#each tabs as t (key(t))}
				<button role="tab" aria-selected={key(t) === active} class:on={key(t) === active} onclick={() => choose(key(t))}>{t.label}</button>
			{/each}
		</div>
	{/if}

	<div class="body" class:stale={res.loading && rows.length > 0}>
		{#if tab.custom && custom}
			{@render custom({ tab, data: res.data })}
		{:else}
			<div class="head">
				<span>{tab.label}</span>
				<span class="cols">
					{#each cols as c (c.key)}<span class="col">{c.label}</span>{/each}
					<span class="col">{tab.valueLabel ?? 'People'}</span>
				</span>
			</div>
			{#if !fresh && !res.error}
				{#each Array(6) as _, i (i)}
					<div class="row sk"><span class="skeleton" style="width: {80 - i * 9}%; height: 14px"></span></div>
				{/each}
			{:else if res.error}
				<div class="empty">Couldn't load this. {res.error}</div>
			{:else if rows.length === 0}
				<div class="empty">No visits in this range.</div>
			{:else}
				<ul>
					{#each rows.slice(0, limit) as row (row.key)}
						{@const domain = iconDomain(tab.property, row.key)}
						{@const pre = prefix(tab.property, row.key)}
						{@const on = filterDim ? dash.hasFilter(filterDim, row.key) : false}
						<li>
							<button
								class="row"
								class:on
								disabled={!filterDim}
								onclick={() => filterDim && dash.toggleFilter(filterDim, row.key)}
								title={filterDim ? (on ? 'Remove filter' : `Filter by ${displayKey(tab.property, row.key)}`) : undefined}
							>
								<span class="bar" style:width="{(row.visitors / max) * 100}%"></span>
								<span class="key">
									{#if rowIcon}
										{@render rowIcon({ tab, row })}
									{:else if domain}
										<img src={favicon(domain)} alt="" width="14" height="14" loading="lazy" onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')} />
									{:else if pre}
										<span class="flag">{pre}</span>
									{/if}
									<span class="text">{displayKey(tab.property, row.key)}</span>
								</span>
								<span class="cols">
									{#each cols as c (c.key)}
										<span class="col num">{row[c.key] == null ? '—' : c.format(row[c.key] as number)}</span>
									{/each}
									<span class="col num v">
										{#if !cols.length}<span class="share">{pct(total ? (row.visitors / total) * 100 : 0, 0)}</span>{/if}
										{num(row.visitors)}
									</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>

	{#if !tab.custom}
		<footer>
			<button class="more" onclick={() => (dash.details = detailsKey)} disabled={!rows.length}>
				<Maximize2 size={13} /> See all
			</button>
		</footer>
	{/if}
</section>

{#if dash.details === detailsKey}
	<Details {tab} title={tab.label} />
{/if}

<style>
	.panel {
		display: flex;
		flex-direction: column;
		min-height: 440px;
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 14px 16px 8px 18px;
	}
	h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 700;
		letter-spacing: -0.01em;
		white-space: nowrap;
	}
	.tabs {
		padding: 0 14px 10px;
	}
	.body {
		flex: 1;
		padding: 0 10px;
		transition: opacity var(--dur);
	}
	.body.stale {
		opacity: 0.6;
	}
	.head {
		display: flex;
		justify-content: space-between;
		padding: 6px 8px 8px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		color: var(--text-4);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.row {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		width: 100%;
		height: 32px;
		padding: 0 8px;
		margin-bottom: 2px;
		border-radius: var(--radius);
		text-align: left;
		isolation: isolate;
	}
	.row:disabled {
		cursor: default;
	}
	.row.sk {
		display: flex;
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
		gap: 9px;
		min-width: 0;
		font-size: 13px;
	}
	.key img {
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
	.cols {
		display: flex;
		gap: 4px;
		flex: none;
	}
	.col {
		width: 64px;
		text-align: right;
		font-size: 12.5px;
		color: var(--text-2);
	}
	.head .col {
		color: var(--text-4);
		font-family: var(--font-sans);
	}
	.v {
		position: relative;
		color: var(--text);
		font-weight: 500;
	}
	.share {
		position: absolute;
		right: calc(100% + 8px);
		color: var(--text-3);
		font-weight: 400;
		opacity: 0;
		transform: translateX(4px);
		transition: all var(--dur-fast);
	}
	.row:hover .share {
		opacity: 1;
		transform: none;
	}
	.empty {
		display: grid;
		place-items: center;
		height: 280px;
		color: var(--text-3);
		font-size: 13px;
	}
	footer {
		display: flex;
		justify-content: center;
		padding: 6px 0 12px;
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
	@media (max-width: 560px) {
		.col:not(.v) {
			display: none;
		}
	}
</style>
