<script lang="ts">
	import Check from '@lucide/svelte/icons/check'
	import Copy from '@lucide/svelte/icons/copy'
	import Trash from '@lucide/svelte/icons/trash-2'
	import Upload from '@lucide/svelte/icons/upload'
	import Code from '@lucide/svelte/icons/code'
	import Globe from '@lucide/svelte/icons/globe'
	import Plug from '@lucide/svelte/icons/plug'
	import Share from '@lucide/svelte/icons/share-2'
	import Target from '@lucide/svelte/icons/target'
	import User from '@lucide/svelte/icons/user'
	import Users from '@lucide/svelte/icons/users'
	import Banknote from '@lucide/svelte/icons/banknote'
	import X from '@lucide/svelte/icons/x'
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right'
	import AddSite from '../components/AddSite.svelte'
	import BrandIcon from '../components/BrandIcon.svelte'
	import InstallCheck from '../components/InstallCheck.svelte'
	import Revenue from '../components/Revenue.svelte'
	import Select from '../components/Select.svelte'
	import SiteFields from '../components/SiteFields.svelte'
	import SupportText from '../components/SupportText.svelte'
	import { atSiteLimit, CNIL_DAYS, eventsMeter, planFacts, RETENTION, span, trialLine } from '../lib/plan'
	import PlanBilling from '../components/PlanBilling.svelte'
	import { SUPPORT_EMAIL } from '@misomoon/core/plans'
	import { docUrl, PLATFORMS, SDK } from '../lib/guides'
	import { regionName } from '../lib/places'
	import Topbar from '../components/Topbar.svelte'
	import { deployLinks, normalizePrefix, proxiedScriptTag, proxySnippets, type ProxySnippet } from '@misomoon/core/snippets'
	import { authHeaders, get, getHtml, googleReturn, loginReturn, send, setToken, type ApiKey, type Provider, type Goal, type ImportRow, type ReportSub, type Segment, type SharedLink, type TeamMembers, ApiError } from '../lib/api'
	import { can, type TeamRole } from '@misomoon/core/roles'
	import { DEFAULT_SEARCH_PARAMS, FEATURES, LIGHT_FEATURES, searchParams, siteFeatures, type Feature } from '@misomoon/core/features'
	import { OPT_OUT_SNIPPET, privacyPolicy, retentionDays } from '@misomoon/core/privacy'
	import { getDash, Resource } from '../lib/dash.svelte'
	import { loginMessage, onlyLogin, PROVIDER_NAME } from '../lib/account'
	import { IMPORTER_INFO, importerInfo } from '@misomoon/core/importers'

	const dash = getDash()
	const origin = location.origin
	const goals = new Resource<Goal[]>(() => (dash.site ? `/api/v1/sites/${dash.site}/goals?_=${dash.tick}` : null))

	let copied = $state<string | null>(null)
	let newGoal = $state<{ name: string; kind: 'event' | 'page'; match: string }>({ name: '', kind: 'event', match: '' })
	/** a key's secret, shown once after it is created or rotated, for the site it reads */
	let newKey = $state<{ id: string; site: string; key: string } | null>(null)
	/** the key whose Rotate button was pressed once, waiting for the second press */
	let confirmRotate = $state<string | null>(null)
	// a Google sign-in that failed comes back here; say why once
	let error = $state<string | null>(googleReturn.error ?? (loginReturn.error && loginReturn.settings ? loginMessage(loginReturn.error) : null))
	googleReturn.error = null
	/** the action now running, so a double click cannot send it twice */
	let busy = $state<string | null>(null)
	/** asks once more before removing a working proxy hostname */
	let confirmRemove = $state(false)

	interface ProxyState {
		available: boolean
		target: string | null
		domain: { hostname: string; status: string; ssl_status: string | null; active: boolean; records: { type: string; name: string; value: string }[]; script: string } | null
	}
	const proxy = new Resource<ProxyState>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/proxy?_=${dash.tick}` : null))
	let proxyHost = $state('')
	let prefix = $state('/relay')
	let platform = $state<ProxySnippet['id']>('cloudflare')
	const snippets = $derived(proxySnippets({ site: dash.site ?? 'your-site', upstream: origin, prefix }))
	const chosen = $derived(snippets.find((s) => s.id === platform) ?? snippets[0])
	const proxiedTag = $derived(proxiedScriptTag({ site: dash.site ?? 'your-site', prefix }))
	const managedTag = $derived(proxy.data?.domain ? `<script defer src="${proxy.data.domain.script}"><\/script>` : '')
	const deploys = deployLinks()
	const subdomain = $derived(`stats.${(dash.current?.domain ?? 'example.com').replace(/^www\./, '')}`)
	const subdomainTag = $derived(`<script defer src="https://${subdomain}/m.js?s=${dash.site ?? 'your-site'}"><\/script>`)
	const GEO: Record<ProxySnippet['geo'], string> = {
		full: 'Keeps the visitor’s IP and full location.',
		platform: 'Keeps the visitor’s IP; location comes from the platform’s headers where it sends them.',
		'country-unknown': 'Keeps the visitor’s IP; location shows as unknown unless you add x-misomoon-country (see docs).',
	}

	const snippet = $derived(`<script defer src="${origin}/m.js?s=${dash.site ?? 'your-site'}"><\/script>`)
	const shownKey = $derived(newKey && newKey.site === dash.current?.id ? newKey.key : null)
	const mcpCommand = $derived(`claude mcp add --transport http misomoon ${origin}/mcp --header "Authorization: Bearer ${shownKey ?? '<api key>'}"`)
	const mcpJson = $derived(
		JSON.stringify({ mcpServers: { misomoon: { type: 'http', url: `${origin}/mcp`, headers: { Authorization: `Bearer ${shownKey ?? '<api key>'}` } } } }, null, 2),
	)

	async function copy(text: string, id: string) {
		try {
			await navigator.clipboard.writeText(text)
			copied = id
		} catch {
			error = 'Could not copy; select the text and copy it by hand.'
			return
		}
		setTimeout(() => (copied = null), 1500)
	}


	async function run(id: string, fn: () => Promise<unknown>) {
		if (busy) return
		busy = id
		error = null
		try {
			await fn()
			dash.tick++
		} catch (e) {
			error = (e as Error).message
		} finally {
			busy = null
		}
	}

	const addGoal = () =>
		run('goal', async () => {
			await send('POST', `/api/v1/sites/${dash.site}/goals`, newGoal)
			newGoal = { name: '', kind: 'event', match: '' }
		})
	const connectProxy = () => run('proxy', () => send('PUT', `/api/v1/sites/${dash.site}/proxy`, { hostname: proxyHost }))
	function disconnectProxy() {
		if (!confirmRemove) return void (confirmRemove = true)
		confirmRemove = false
		run('proxy', () => send('DELETE', `/api/v1/sites/${dash.site}/proxy`))
	}
	const removeGoal = (id: string) => run(`goal:${id}`, () => send('DELETE', `/api/v1/sites/${dash.site}/goals/${id}`))
	// Scoped to the selected site, so the key cannot read your other sites.
	const makeKey = () =>
		run('key', async () => {
			if (!dash.current) throw new Error('Pick a site first.')
			const made = await send<{ id: string; key: string }>('POST', '/api/v1/keys', { name: `MCP · ${dash.current.name}`, site: dash.current.id })
			newKey = { id: made.id, site: dash.current.id, key: made.key }
		})
	// A new secret for the same key. Clients using the old one stop working, so it asks twice.
	function rotateKey(id: string) {
		if (confirmRotate !== id) return void (confirmRotate = id)
		confirmRotate = null
		run('key', async () => {
			const site = dash.current?.id
			const made = await send<{ id: string; key: string }>('POST', `/api/v1/keys/${id}/rotate`)
			if (site) newKey = { id: made.id, site, key: made.key }
		})
	}

	// ------------------------------------------------------------ site details
	let details = $state({ name: '', timezone: '', currency: '' })
	let detailsSaved = $state(false)
	// reload the form whenever another site is opened
	// Each card's form starts over only when its own saved values change: every save
	// reloads dash.current, which must not throw away what another card has unsaved.
	const savedDetails = $derived(dash.current ? JSON.stringify([dash.current.id, dash.current.name, dash.current.timezone, dash.current.currency]) : '')
	$effect(() => {
		if (!savedDetails) return
		const [, name, timezone, currency] = JSON.parse(savedDetails)
		details = { name, timezone, currency }
	})
	const detailsChanged = $derived(!!dash.current && (details.name.trim() !== dash.current.name || details.timezone !== dash.current.timezone || details.currency !== dash.current.currency))
	const saveDetails = () =>
		run('details', async () => {
			await send('PATCH', `/api/v1/sites/${dash.site}`, details)
			await dash.load()
			detailsSaved = true
			setTimeout(() => (detailsSaved = false), 2000)
		})

	// ------------------------------------------------------------ features
	// What the tracker collects beyond pageviews. m.js?s=<site> carries the code for the ticked ones only.
	const FEATURE_INFO: Record<Feature, { label: string; hint: string }> = {
		outbound: { label: 'Outbound links', hint: 'An event for each click on a link to another site' },
		downloads: { label: 'Downloads', hint: 'An event for each click on a link to a file such as .pdf or .zip' },
		forms: { label: 'Form submits', hint: 'A "Form sent" event for each form, named by its id or name' },
		events: { label: 'Tagged events', hint: 'Clicks and submits on elements with data-misomoon-event' },
		payments: { label: 'Payments', hint: 'Links each checkout to its visit; ticked when you connect a payment provider' },
		vitals: { label: 'Web Vitals', hint: 'Load speed and responsiveness from real visits (LCP, INP, CLS)' },
		clicks: { label: 'Clicks', hint: 'Click map, rage clicks and clicks that do nothing' },
		errors: { label: 'JavaScript errors', hint: 'Error messages and where they come from, without the query string' },
		fields: { label: 'Form fields', hint: 'Which fields people start and where they give up; never what they type' },
		media: { label: 'Video and audio', hint: 'Plays and how far people watch' },
		content: { label: 'Content blocks', hint: 'Views and clicks on elements marked data-misomoon-content' },
		search: { label: 'Site search', hint: 'Search terms read from the page URL; adds nothing to the script' },
	}
	let features = $state<Feature[]>([])
	let tracking = $state({ search: '', include: '', exclude: '' })
	let featuresSaved = $state(false)
	const savedTracking = $derived(dash.current ? JSON.stringify([dash.current.id, dash.current.features, dash.current.search_params, dash.current.include_paths, dash.current.exclude_paths]) : '')
	$effect(() => {
		if (!savedTracking) return
		const [, f, search, include, exclude] = JSON.parse(savedTracking)
		features = siteFeatures(f)
		tracking = { search: search ?? '', include: include ?? '', exclude: exclude ?? '' }
	})
	const list = (text: string | null) => (text ?? '').split(',').map((p) => p.trim()).filter(Boolean)
	const featuresChanged = $derived(
		!!dash.current &&
			(features.join() !== siteFeatures(dash.current.features).join() ||
				list(tracking.search).join() !== list(dash.current.search_params).join() ||
				list(tracking.include).join() !== list(dash.current.include_paths).join() ||
				list(tracking.exclude).join() !== list(dash.current.exclude_paths).join()),
	)
	const toggleFeature = (f: Feature, on: boolean) => (features = FEATURES.filter((x) => (x === f ? on : features.includes(x))))
	// presets tick the boxes; Save still applies them
	const PRESETS: { label: string; hint: string; features: readonly Feature[] }[] = [
		{ label: 'Everything', hint: 'Every feature, 4.8 KB gzipped; new sites start here', features: FEATURES },
		{ label: 'Light', hint: 'Outbound links, downloads, form submits and tagged events, 1.9 KB gzipped', features: LIGHT_FEATURES },
		{ label: 'Pageviews only', hint: 'The core script alone, under 1 KB', features: [] },
	]
	const saveFeatures = () =>
		run('features', async () => {
			await send('PATCH', `/api/v1/sites/${dash.site}`, { features, search_params: list(tracking.search), include_paths: list(tracking.include), exclude_paths: list(tracking.exclude) })
			await dash.load()
			featuresSaved = true
			setTimeout(() => (featuresSaved = false), 2000)
		})

	// ------------------------------------------------------------ privacy
	// the site's longest and its default when it sets none: the server's, within its team's
	// plan when the server enforces plans; 0 is no limit
	const limits = $derived(dash.current?.retention ?? dash.me?.retention ?? { max: 0, default: 0 })
	let privacy = $state({ retention: '', ips: '', signals: false })
	let privacySaved = $state(false)
	const savedPrivacy = $derived(dash.current ? JSON.stringify([dash.current.id, dash.current.retention_days, dash.current.exclude_ips, dash.current.privacy_signals]) : '')
	$effect(() => {
		if (!savedPrivacy) return
		const [, retention, ips, signals] = JSON.parse(savedPrivacy)
		privacy = { retention: retention == null ? '' : String(retention), ips: ips ?? '', signals: !!signals }
	})
	const retentionOptions = $derived.by(() => {
		const days = RETENTION.map(([d]) => d).filter((d) => !limits.max || d <= limits.max)
		// a server limit between the presets, and a value saved through the API, get their own row
		for (const d of [limits.max >= 30 ? limits.max : 0, Number(privacy.retention)]) if (d && !days.includes(d)) days.push(d)
		const none = { value: '', label: limits.default ? `Default: ${span(limits.default)}` : 'Keep everything' }
		return [none, ...days.sort((a, b) => a - b).map((d) => ({ value: String(d), label: span(d) }))]
	})
	const privacyChanged = $derived(
		!!dash.current &&
			(privacy.retention !== (dash.current.retention_days == null ? '' : String(dash.current.retention_days)) ||
				list(privacy.ips).join() !== list(dash.current.exclude_ips).join() ||
				privacy.signals !== !!dash.current.privacy_signals),
	)
	const savePrivacy = () =>
		run('privacy', async () => {
			await send('PATCH', `/api/v1/sites/${dash.site}`, { retention_days: privacy.retention ? Number(privacy.retention) : null, exclude_ips: list(privacy.ips), privacy_signals: privacy.signals })
			await dash.load()
			privacySaved = true
			setTimeout(() => (privacySaved = false), 2000)
		})
	// the policy follows what the site has saved, so it never describes unsaved boxes
	const policy = $derived(
		dash.current
			? privacyPolicy({
					domain: dash.current.domain,
					features: siteFeatures(dash.current.features),
					retentionDays: retentionDays(dash.current.retention_days, limits),
					signals: !!dash.current.privacy_signals,
					// the hosted service runs at app.misomoon.com; any other host is someone's own server
					hosted: location.hostname === 'app.misomoon.com',
					region: dash.current.region,
				})
			: '',
	)

	// ------------------------------------------------------------ account
	const keys = new Resource<ApiKey[]>(() => (dash.signedIn ? `/api/v1/keys?_=${dash.tick}` : null))
	const siteKeys = $derived((keys.data ?? []).filter((k) => k.site_id === dash.current?.id))
	let account = $state({ name: dash.me?.user?.name ?? '', current: '', password: '' })
	let saved = $state(false)
	// an account made through Google sets its first password without a current one
	const hasPassword = $derived(dash.me?.user?.has_password !== false)
	const saveAccount = () =>
		run('saveAccount', async () => {
			await send('PATCH', '/api/v1/me', { name: account.name, ...(account.password ? { password: account.password, ...(hasPassword ? { current_password: account.current } : {}) } : {}) })
			account = { ...account, current: '', password: '' }
			await dash.load()
			saved = true
			setTimeout(() => (saved = false), 2000)
		})
	const removeKey = (id: string) =>
		run('removeKey', async () => {
			await send('DELETE', `/api/v1/keys/${id}`)
			if (newKey?.id === id) newKey = null
		})
	/** Connects Google: off to the provider, which sends the browser back here. */
	const connectLogin = (p: Provider) =>
		run('connectLogin', async () => {
			location.href = (await send<{ url: string }>('POST', `/api/v1/auth/oauth/${p}`, {})).url
		})
	const disconnectLogin = (p: Provider) => run('disconnectLogin', async () => (await send('DELETE', `/api/v1/me/logins/${p}`), await dash.load()))
	let closing = $state({ open: false, password: '' })
	const deleteAccount = () =>
		run('deleteAccount', async () => {
			await send('DELETE', '/api/v1/me', hasPassword ? { password: closing.password } : { email: closing.password })
			setToken(null)
			location.href = '/'
		})
	async function signOut() {
		await send('POST', '/api/v1/auth/logout').catch(() => {})
		setToken(null)
		location.href = '/'
	}

	// ------------------------------------------------------------ team
	const team = $derived(dash.me?.teams.find((t) => t.id === dash.current?.team_id) ?? null)
	const teamRole = $derived<TeamRole | null>(team?.role ?? null)
	const members = new Resource<TeamMembers>(() => (team && dash.canManage ? `/api/v1/teams/${team.id}/members?_=${dash.tick}` : null))
	const TEAM_ROLES: { role: TeamRole; label: string; hint: string }[] = [
		{ role: 'owner', label: 'Owner', hint: 'Everything, including team settings and moving sites' },
		{ role: 'admin', label: 'Admin', hint: 'Manages people and sites' },
		{ role: 'editor', label: 'Editor', hint: 'Changes site settings, goals and reports' },
		{ role: 'viewer', label: 'Viewer', hint: 'Sees the stats' },
		{ role: 'billing', label: 'Billing', hint: 'Handles the plan, no stats' },
	]
	const GUEST_ROLES: { value: string; label: string }[] = [
		{ value: 'editor', label: 'Guest editor' },
		{ value: 'viewer', label: 'Guest viewer' },
	]
	const assignable = $derived(TEAM_ROLES.filter((r) => teamRole === 'owner' || r.role !== 'owner'))
	let invite = $state<{ email: string; role: string; scope: 'team' | 'site' }>({ email: '', role: 'viewer', scope: 'team' })
	let inviteLink = $state<{ url: string; sent: boolean } | null>(null)
	let teamName = $state('')
	const savedTeamName = $derived(team ? `${team.id}\u0000${team.name}` : '')
	$effect(() => {
		teamName = savedTeamName.split('\u0000')[1] ?? ''
	})
	const isMe = (id: string) => id === dash.me?.user?.id
	const sendInvite = () =>
		run('sendInvite', async () => {
			const r = await send<{ url: string; sent: boolean }>('POST', `/api/v1/teams/${team!.id}/invitations`, {
				email: invite.email,
				role: invite.scope === 'site' ? (invite.role === 'editor' ? 'editor' : 'viewer') : invite.role,
				site: invite.scope === 'site' ? dash.site : undefined,
			})
			inviteLink = r
			invite = { ...invite, email: '' }
		})
	// a refused role change redraws the role menus, which had already moved to the new role
	let roleReset = $state(0)
	const setRole = async (userId: string, role: string) => {
		await run('setRole', () => send('PATCH', `/api/v1/teams/${team!.id}/members/${userId}`, { role }))
		if (error) roleReset++
	}
	const removeMember = (userId: string) => run('removeMember', async () => (await send('DELETE', `/api/v1/teams/${team!.id}/members/${userId}`), isMe(userId) && (await dash.load())))
	const setGuest = async (userId: string, role: string) => {
		await run('setGuest', () => send('PATCH', `/api/v1/sites/${dash.site}/guests/${userId}`, { role }))
		if (error) roleReset++
	}
	const removeGuest = (userId: string) => run('removeGuest', () => send('DELETE', `/api/v1/sites/${dash.site}/guests/${userId}`))
	const withdraw = (id: string) => run('withdraw', () => send('DELETE', `/api/v1/teams/${team!.id}/invitations/${id}`))
	const renameTeam = () => run('renameTeam', async () => (await send('PATCH', `/api/v1/teams/${team!.id}`, { name: teamName }), await dash.load()))
	const leaveSite = () =>
		run('leaveSite', async () => {
			if (team) await send('DELETE', `/api/v1/teams/${team.id}/members/${dash.me!.user!.id}`)
			else await send('DELETE', `/api/v1/sites/${dash.site}/guests/${dash.me!.user!.id}`)
			dash.site = null
			await dash.load()
		})

	// ------------------------------------------------------------ tabs
	// Each tab shows only when it has something for your role; with no site yet, only Sites and Account.
	const tabs = $derived(
		[
			{ id: 'install', label: 'Install', icon: Code, show: !!dash.current },
			{ id: 'goals', label: 'Goals', icon: Target, show: !!dash.current },
			{ id: 'sharing', label: 'Sharing', icon: Share, show: !!dash.current && dash.canEdit },
			{ id: 'connect', label: 'Integrations', icon: Plug, show: !!dash.current },
			{ id: 'revenue', label: 'Revenue', icon: Banknote, show: !!dash.current && dash.canEdit },
			// owners and admins manage people; with plans on, a billing member sees the plan here
			{ id: 'team', label: 'Team', icon: Users, show: !!team && (dash.canManage || (!!dash.me?.plans && can(dash.role, 'billing'))) },
			{ id: 'sites', label: 'Sites', icon: Globe, show: dash.signedIn },
			{ id: 'account', label: 'Account', icon: User, show: true },
		].filter((t) => t.show),
	)
	const tab = $derived(tabs.some((t) => t.id === dash.settingsTab) ? dash.settingsTab : tabs[0].id)

	// ------------------------------------------------------------ danger zone
	let confirmDelete = $state('')
	let moveTo = $state('')
	const moveTargets = $derived((dash.me?.teams ?? []).filter((t) => t.id !== dash.current?.team_id && (t.role === 'owner' || t.role === 'admin')))
	const deleteSite = () =>
		run('deleteSite', async () => {
			await send('DELETE', `/api/v1/sites/${dash.site}`)
			dash.site = null
			confirmDelete = ''
			await dash.load()
		})
	const moveSite = () => run('moveSite', async () => (await send('POST', `/api/v1/sites/${dash.site}/transfer`, { team: moveTo }), await dash.load()))
	// ------------------------------------------------------------ imports
	// bumped by the poll below, so it reloads only this list
	let importPoll = $state(0)
	const imports = new Resource<ImportRow[]>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/imports?_=${dash.tick}.${importPoll}` : null))
	let uploading = $state(false)
	let grant = $state<string | null>(googleReturn.grant)
	let properties = $state<{ id: string; name: string; account: string }[] | null>(null)
	let gaProperty = $state('')
	let gaFrom = $state('')
	let gaTo = $state('')

	async function upload(e: Event) {
		const input = e.currentTarget as HTMLInputElement
		if (!input.files?.length) return
		const form = new FormData()
		for (const f of input.files) form.append('file', f)
		uploading = true
		await run('upload', async () => {
			const res = await fetch(`/api/v1/sites/${dash.site}/imports`, { method: 'POST', headers: authHeaders(), body: form })
			if (!res.ok) throw new ApiError(res.status, (await res.json().catch(() => null))?.error ?? res.statusText)
			await dash.load()
		})
		uploading = false
		input.value = ''
	}
	const connectGoogle = () => run('connectGoogle', async () => (location.href = (await send<{ url: string }>('POST', `/api/v1/sites/${dash.site}/imports/google/connect`)).url))
	$effect(() => {
		if (!grant || !dash.site || properties) return
		get<{ id: string; name: string; account: string }[]>(`/api/v1/sites/${dash.site}/imports/google/properties?grant=${grant}`)
			.then((p) => {
				properties = p
				gaProperty = p[0]?.id ?? ''
			})
			.catch((e) => {
				error = (e as Error).message
				// this grant is no good, so opening Settings again shouldn't retry it
				googleReturn.grant = null
			})
	})
	const startGoogle = () =>
		run('startGoogle', async () => {
			const name = properties?.find((p) => p.id === gaProperty)?.name
			await send('POST', `/api/v1/sites/${dash.site}/imports/google`, { grant, property: gaProperty, from: gaFrom || undefined, to: gaTo || undefined, label: name ? `Google: ${name}` : undefined })
			grant = googleReturn.grant = null
			properties = null
		})
	// an import from another tool's API: the form its importer asks for
	let tool = $state('')
	let toolInput = $state<Record<string, string>>({})
	let toolFrom = $state('')
	let toolTo = $state('')
	const toolInfo = $derived(tool ? importerInfo(tool) : undefined)
	const startTool = () =>
		run('startTool', async () => {
			await send('POST', `/api/v1/sites/${dash.site}/imports/api`, { importer: tool, input: toolInput, from: toolFrom || undefined, to: toolTo || undefined })
			tool = ''
			toolInput = {}
			toolFrom = ''
			toolTo = ''
		})
	const importSource = (source: string) => (source === 'google' ? 'Google' : source === 'csv' ? 'CSV' : (importerInfo(source)?.name ?? source))
	const removeImport = (id: string) => run('removeImport', async () => (await send('DELETE', `/api/v1/sites/${dash.site}/imports/${id}`), await dash.load()))
	$effect(() => {
		// poll while an import runs in the background; an API import moves every few minutes
		const running = imports.data?.filter((i) => i.status === 'importing') ?? []
		if (!running.length) return
		const t = setTimeout(() => importPoll++, running.some((i) => i.days_total == null) ? 4000 : 30_000)
		return () => clearTimeout(t)
	})

	// ------------------------------------------------------------ Search Console
	interface SearchState {
		available: boolean
		connected: { property: string; created_at: number; connected_by: string | null } | null
	}
	const search = new Resource<SearchState>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/search-console?_=${dash.tick}` : null))
	let searchGrant = $state<string | null>(googleReturn.searchGrant)
	let searchProps = $state<{ property: string; matches: boolean }[] | null>(null)
	let searchProp = $state('')
	$effect(() => {
		if (!searchGrant || !dash.site || searchProps) return
		get<{ property: string; matches: boolean }[]>(`/api/v1/sites/${dash.site}/search-console/properties?grant=${searchGrant}`, undefined, 0)
			.then((p) => {
				searchProps = p
				searchProp = p[0]?.property ?? ''
			})
			.catch((e) => {
				error = (e as Error).message
				googleReturn.searchGrant = null
			})
	})
	const connectSearch = () => run('connectSearch', async () => (location.href = (await send<{ url: string }>('POST', `/api/v1/sites/${dash.site}/search-console/connect`)).url))
	const saveSearch = () =>
		run('saveSearch', async () => {
			await send('PUT', `/api/v1/sites/${dash.site}/search-console`, { grant: searchGrant, property: searchProp })
			searchGrant = googleReturn.searchGrant = null
			searchProps = null
			await dash.load()
		})
	const disconnectSearch = () => run('disconnectSearch', async () => (await send('DELETE', `/api/v1/sites/${dash.site}/search-console`), await dash.load()))
	const propLabel = (p: string) => (p.startsWith('sc-domain:') ? `${p.slice(10)} (domain)` : p)

	// ------------------------------------------------------------ shared links
	const shared = new Resource<SharedLink[]>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/shared?_=${dash.tick}` : null))
	const segments = new Resource<Segment[]>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/segments?_=${dash.tick}` : null))
	let newShare = $state({ name: '', password: '', segment_id: '', expires_days: 0 })
	const addShare = () =>
		run('addShare', async () => {
			await send('POST', `/api/v1/sites/${dash.site}/shared`, { ...newShare, expires_days: newShare.expires_days || undefined })
			newShare = { name: '', password: '', segment_id: '', expires_days: 0 }
		})
	const removeShare = (slug: string) => run('removeShare', () => send('DELETE', `/api/v1/sites/${dash.site}/shared/${slug}`))
	const shareUrl = (slug: string) => `${origin}/share/${slug}`

	// ------------------------------------------------------------ email reports
	const reports = new Resource<{ subscriptions: ReportSub[]; sending: boolean }>(() => (dash.site && dash.canEdit ? `/api/v1/sites/${dash.site}/reports?_=${dash.tick}` : null))
	let newReport = $state<{ email: string; kind: ReportSub['kind']; threshold: number }>({ email: '', kind: 'weekly', threshold: 0 })
	let sentTest = $state(false)
	const KIND: Record<ReportSub['kind'], string> = { weekly: 'Weekly report', monthly: 'Monthly report', spike: 'Traffic spike', drop: 'No traffic' }
	/** what the server uses when an alert has no threshold (api reports.ts) */
	const THRESHOLD: Partial<Record<ReportSub['kind'], number>> = { spike: 10, drop: 12 }
	const addReport = () =>
		run('addReport', async () => {
			await send('POST', `/api/v1/sites/${dash.site}/reports`, { ...newReport, threshold: newReport.kind === 'spike' || newReport.kind === 'drop' ? newReport.threshold || undefined : undefined })
			newReport = { ...newReport, email: '' }
		})
	const removeReport = (id: string) => run('removeReport', () => send('DELETE', `/api/v1/sites/${dash.site}/reports/${id}`))
	const testReport = () =>
		run('testReport', async () => {
			await send('POST', `/api/v1/sites/${dash.site}/reports/test`, { email: newReport.email || reports.data?.subscriptions[0]?.email, kind: newReport.kind === 'monthly' ? 'monthly' : 'weekly' })
			sentTest = true
			setTimeout(() => (sentTest = false), 2500)
		})
	async function previewReport() {
		if (busy) return
		busy = 'previewReport'
		error = null
		try {
			const html = await getHtml(`/api/v1/sites/${dash.site}/reports/preview?kind=${newReport.kind === 'monthly' ? 'monthly' : 'weekly'}`)
			const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
			window.open(url, '_blank', 'noopener')
			setTimeout(() => URL.revokeObjectURL(url), 60_000)
		} catch (e) {
			error = (e as Error).message
		} finally {
			busy = null
		}
	}
	const day = (ms: number | null) => (ms ? new Date(ms).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '')
</script>

<Topbar title="Settings" subtitle="Install the script, set goals, and manage sharing, your team and your sites." periodless />

{#if error}<p class="error banner" role="alert"><span><SupportText text={error} /></span><button class="btn ghost icon" onclick={() => (error = null)} aria-label="Dismiss"><X size={14} /></button></p>{/if}

<!-- two sides: the sections in a sidebar, the open one beside it -->
<div class="split">
<div class="nav" role="tablist" aria-label="Settings" aria-orientation="vertical">
	{#each tabs as t (t.id)}
		<button role="tab" aria-selected={tab === t.id} class:on={tab === t.id} onclick={() => (dash.settingsTab = t.id)}><t.icon size={15} strokeWidth={1.75} />{t.label}</button>
	{/each}
</div>

<div class="grid">
	{#if tab === 'install'}
		<section class="card block">
			<h3>Install</h3>
			<p class="muted">Add this to the <code>&lt;head&gt;</code> of every page. No cookies, and nothing stored on the visitor's device.</p>
			<div class="code">
				<pre>{snippet}</pre>
				<button class="btn ghost icon" onclick={() => copy(snippet, 'snippet')} aria-label="Copy">
					{#if copied === 'snippet'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
			<p class="muted small">
				Custom events: <code>misomoon('Signup', &#123; props: &#123; plan: 'pro' &#125; &#125;)</code>. Revenue:
				<code>misomoon('Purchase', &#123; revenue: &#123; amount: 19, currency: 'USD' &#125; &#125;)</code>. Outbound links, downloads, forms and more are
				boxes under What to track; turn a ticked one off on one page with <code>data-disable="forms,outbound"</code>.
			</p>
			<InstallCheck visits />
		</section>
		<section class="card block">
			<div class="head-row">
				<h3>Install guides</h3>
				<a class="doc-link" href={docUrl('integrations')} target="_blank" rel="noopener">All guides <ArrowUpRight size={13} /></a>
			</div>
			<p class="muted">Where the tag goes on your platform, step by step.</p>
			<ul class="brands">
				{#each PLATFORMS as g (g.label)}
					<li>
						<a href={docUrl(g.page, g.hash)} target="_blank" rel="noopener"><BrandIcon brand={g.brand} />{g.label}</a>
					</li>
				{/each}
			</ul>
		</section>
		<section class="card block">
			<div class="head-row">
				<h3>SDK</h3>
				<a class="doc-link" href={docUrl('sdk')} target="_blank" rel="noopener">SDK docs <ArrowUpRight size={13} /></a>
			</div>
			<p class="muted">For apps and servers a script tag can't reach, and typed events in bundled apps.</p>
			<div class="code">
				<pre>npm install @misomoon/sdk</pre>
				<button class="btn ghost icon" onclick={() => copy('npm install @misomoon/sdk', 'sdk')} aria-label="Copy">
					{#if copied === 'sdk'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
			<ul class="brands sdk">
				{#each SDK as e (e.pkg)}
					<li>
						<a href={docUrl(e.page, e.hash)} target="_blank" rel="noopener"
							><BrandIcon brand={e.brand} /><span>{e.label}<small>{e.pkg}</small></span></a
						>
					</li>
				{/each}
			</ul>
		</section>
		<section class="card block">
			<h3>What to track</h3>
			<p class="muted">
				Pageviews, time on page and scroll depth are always on, in under 1 KB. Each box adds the code for that feature to the same script, only on sites that
				tick it. Changes reach visitors within a few minutes.
			</p>
			<form
				class="features"
				onsubmit={(e) => {
					e.preventDefault()
					saveFeatures()
				}}
			>
				<div class="presets" role="group" aria-label="Presets">
					{#each PRESETS as p (p.label)}
						<button
							type="button"
							class="btn"
							class:on={features.join() === p.features.join()}
							aria-pressed={features.join() === p.features.join()}
							title={p.hint}
							disabled={!dash.canEdit}
							onclick={() => (features = [...p.features])}>{p.label}</button
						>
					{/each}
				</div>
				{#each FEATURES as f (f)}
					<label class="feature">
						<input type="checkbox" checked={features.includes(f)} disabled={!dash.canEdit} onchange={(e) => toggleFeature(f, e.currentTarget.checked)} />
						<span><strong>{FEATURE_INFO[f].label}</strong><small>{FEATURE_INFO[f].hint}</small></span>
					</label>
				{/each}
				{#if features.includes('search')}
					<label class="params">
						<span>Search parameters</span>
						<small>URL parameters that hold the search term, comma-separated. Empty uses {DEFAULT_SEARCH_PARAMS.join(', ')}.</small>
						<input class="input" bind:value={tracking.search} disabled={!dash.canEdit} placeholder={searchParams(null).join(', ')} aria-label="Search parameters" />
					</label>
				{/if}
				<label class="params">
					<span>Only count these paths</span>
					<small>Comma-separated; <code>*</code> matches within one part of the path, <code>**</code> across. Empty counts every path.</small>
					<input class="input" bind:value={tracking.include} disabled={!dash.canEdit} placeholder="/blog/**, /docs/*" aria-label="Only count these paths" />
				</label>
				<label class="params">
					<span>Never count these paths</span>
					<small>Views and time on these pages are left out; events still count.</small>
					<input class="input" bind:value={tracking.exclude} disabled={!dash.canEdit} placeholder="/admin/**, /preview" aria-label="Never count these paths" />
				</label>
				{#if dash.canEdit}
					<div class="details-save">
						<button class="btn primary" disabled={!featuresChanged || busy === 'features'}>{busy === 'features' ? 'Saving…' : 'Save'}</button>
						{#if featuresSaved}<span class="muted">Saved</span>{/if}
					</div>
				{:else}
					<p class="muted small">Owners, admins and editors can change this.</p>
				{/if}
			</form>
		</section>
		<section class="card block">
			<h3>Privacy</h3>
			<p class="muted">How long stats are kept, whose visits never count, and the text for your privacy policy.</p>
			<form
				class="features"
				onsubmit={(e) => {
					e.preventDefault()
					savePrivacy()
				}}
			>
				<div class="params">
					<span>Keep stats for</span>
					<small
						>Older visits and events are deleted once a day.{limits.max ? ` ${dash.me?.plans ? 'Your plan keeps' : 'This server keeps'} them for ${span(limits.max)} at most.` : ''}{!limits.max || limits.max > CNIL_DAYS
							? ' More than 25 months goes past what the CNIL allows without consent.'
							: ''}</small
					>
					<Select label="Keep stats for" options={retentionOptions} bind:value={privacy.retention} disabled={!dash.canEdit} />
				</div>
				<label class="params">
					<span>Never count these IP addresses</span>
					<small>Comma-separated addresses or ranges, such as your office's <code>203.0.113.7</code> or <code>2001:db8::/32</code>. Up to 50.</small>
					<input class="input" bind:value={privacy.ips} disabled={!dash.canEdit} placeholder="203.0.113.7, 198.51.100.0/24" aria-label="Never count these IP addresses" />
				</label>
				<label class="feature">
					<input type="checkbox" bind:checked={privacy.signals} disabled={!dash.canEdit} />
					<span
						><strong>Respect Global Privacy Control and Do Not Track</strong><small>Visitors whose browser sends either signal are not counted, and their payments aren't linked to a visit</small></span
					>
				</label>
				{#if dash.canEdit}
					<div class="details-save">
						<button class="btn primary" disabled={!privacyChanged || busy === 'privacy'}>{busy === 'privacy' ? 'Saving…' : 'Save'}</button>
						{#if privacySaved}<span class="muted">Saved</span>{/if}
					</div>
				{/if}
			</form>
			<h4 class="gap">Text for your privacy policy</h4>
			<p class="muted small">It lists what this site's saved settings collect, so copy it again after you change them. Check it with whoever looks after your legal pages.</p>
			<div class="code tall">
				<pre>{policy}</pre>
				<button class="btn ghost icon" onclick={() => copy(policy, 'policy')} aria-label="Copy the privacy policy text">
					{#if copied === 'policy'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
			<h4 class="gap">Opt-out button</h4>
			<p class="muted small">Put this on your privacy page. It stops misomoon counting the visitor's browser on this site, and a second press undoes it.</p>
			<div class="code">
				<pre>{OPT_OUT_SNIPPET}</pre>
				<button class="btn ghost icon" onclick={() => copy(OPT_OUT_SNIPPET, 'optout')} aria-label="Copy the opt-out button">
					{#if copied === 'optout'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
		</section>
		<section class="card block">
			<h3>Proxy</h3>
			<p class="muted">
				Serve misomoon from your own domain. Ad blockers that drop third-party analytics leave first-party requests alone, so you count the visitors they
				would hide. Pick a managed subdomain or run a few lines on your own stack.
			</p>
			<div class="proxy">
				<div class="opt">
					<h4>Managed subdomain</h4>
					{#if !dash.canEdit}
						<p class="muted small">Owners, admins and editors can set this up.</p>
					{:else if proxy.error}
						<p class="error small">Couldn't check the managed subdomain: {proxy.error}</p>
					{:else if !proxy.data}
						<span class="skeleton" style="height: 38px"></span>
					{:else if !proxy.data.available}
						<p class="muted small">Not enabled on this server. It needs Cloudflare for SaaS; use your own proxy instead.</p>
					{:else if proxy.data?.domain}
						{@const d = proxy.data.domain}
						<p class="small">
							<strong>{d.hostname}</strong>
							<span class="pill {d.active ? 'ok' : ''}">{d.active ? 'live' : d.ssl_status === 'pending_validation' ? 'waiting for DNS' : d.status}</span>
						</p>
						{#if !d.active}
							<p class="muted small">Add these records at your DNS provider. This page checks again whenever you open it.</p>
							<table class="records">
								<tbody>
									{#each d.records as r (r.name + r.type)}
										<tr><td>{r.type}</td><td><code>{r.name}</code></td><td><code>{r.value}</code></td></tr>
									{/each}
								</tbody>
							</table>
						{/if}
						<div class="code">
							<pre>{managedTag}</pre>
							<button class="btn ghost icon" onclick={() => copy(managedTag, 'managed')} aria-label="Copy">
								{#if copied === 'managed'}<Check size={14} />{:else}<Copy size={14} />{/if}
							</button>
						</div>
						<div class="inline">
							<button class="btn ghost" onclick={disconnectProxy} disabled={busy === 'proxy'}>
								{confirmRemove ? `Click again to stop serving from ${d.hostname}` : `Remove ${d.hostname}`}
							</button>
							{#if confirmRemove}<button class="btn ghost" onclick={() => (confirmRemove = false)}>Keep it</button>{/if}
						</div>
					{:else}
						<p class="muted small">Point a subdomain at <code>{proxy.data.target ?? '…'}</code> with a CNAME. We issue the certificate.</p>
						<div class="inline">
							<input class="input grow" aria-label="Proxy hostname" placeholder={`stats.${dash.current?.domain ?? 'example.com'}`} bind:value={proxyHost} />
							<button class="btn primary" onclick={connectProxy} disabled={!proxyHost || busy === 'proxy'}>Connect</button>
						</div>
					{/if}
				</div>
				<div class="opt">
					<h4>One click</h4>
					<div class="inline">
						{#each deploys as d (d.id)}
							<a class="btn" href={d.href} target="_blank" rel="noopener">{d.label}</a>
						{/each}
					</div>
					<p class="muted small">
						Deploy, then add <code>{subdomain}</code> as a custom domain (Cloudflare: {deploys[0].then}; Vercel: {deploys[1].then}) and load the script from
						it:
					</p>
					<div class="code">
						<pre>{subdomainTag}</pre>
						<button class="btn ghost icon" onclick={() => copy(subdomainTag, 'stag')} aria-label="Copy">
							{#if copied === 'stag'}<Check size={14} />{:else}<Copy size={14} />{/if}
						</button>
					</div>
					<h4 class="gap">Or add it to your own stack</h4>
					<div class="inline">
						<label class="small muted" for="prefix">Path on your site</label>
						<input id="prefix" class="input" bind:value={prefix} onblur={() => (prefix = normalizePrefix(prefix))} />
					</div>
					<div class="tabs chips" role="tablist">
						{#each snippets as s (s.id)}
							<button role="tab" aria-selected={platform === s.id} class:on={platform === s.id} onclick={() => (platform = s.id)}>{s.label}</button>
						{/each}
					</div>
					<p class="muted small"><code>{chosen.file}</code> · {GEO[chosen.geo]}</p>
					<div class="code">
						<pre>{chosen.code}</pre>
						<button class="btn ghost icon" onclick={() => copy(chosen.code, 'proxy')} aria-label="Copy">
							{#if copied === 'proxy'}<Check size={14} />{:else}<Copy size={14} />{/if}
						</button>
					</div>
					<p class="muted small">Then load the script from your own path:</p>
					<div class="code">
						<pre>{proxiedTag}</pre>
						<button class="btn ghost icon" onclick={() => copy(proxiedTag, 'ptag')} aria-label="Copy">
							{#if copied === 'ptag'}<Check size={14} />{:else}<Copy size={14} />{/if}
						</button>
					</div>
				</div>
			</div>
		</section>
	{:else if tab === 'goals'}
		<section class="card block">
			<h3>Goals</h3>
			<p class="muted">Goals turn events or page visits into conversion rates across the dashboard.</p>
			<ul class="goals">
				{#if goals.error}
					<li class="error">Couldn't load goals: {goals.error}</li>
				{:else if !goals.data}
					<li><span class="skeleton" style="width: 60%; height: 14px"></span></li>
				{/if}
				{#each goals.data ?? [] as g (g.id)}
					<li>
						<span class="pill {g.kind}">{g.kind}</span>
						<strong>{g.name}</strong>
						<code class="muted">{g.match}</code>
						{#if dash.canEdit}<button class="btn ghost icon" onclick={() => removeGoal(g.id)} disabled={busy === `goal:${g.id}`} aria-label="Delete goal {g.name}"><Trash size={14} /></button>{/if}
					</li>
				{:else}
					{#if goals.data}<li class="muted">No goals yet.</li>{/if}
				{/each}
			</ul>
			{#if dash.canEdit}
				<div class="inline">
					<Select label="Goal type" bind:value={newGoal.kind} options={[{ value: 'event', label: 'Event' }, { value: 'page', label: 'Page' }]} />
					<input
						class="input grow"
						aria-label={newGoal.kind === 'event' ? 'Event name' : 'Path'}
						placeholder={newGoal.kind === 'event' ? 'Event name, e.g. Signup' : 'Path, e.g. /thanks or /docs/*'}
						bind:value={newGoal.match}
					/>
					<input class="input" aria-label="Goal label" placeholder="Label (optional)" bind:value={newGoal.name} />
					<button class="btn primary" onclick={addGoal} disabled={!newGoal.match || busy === 'goal'}>Add</button>
				</div>
			{/if}
		</section>
	{:else if tab === 'sharing'}
			<section class="card block">
				<h3>Shared links</h3>
				<p class="muted">A read-only dashboard for a client or your team. Lock it with a password, limit it to saved filters, or let it expire.</p>
				<ul class="goals">
					{#each shared.data ?? [] as l (l.slug)}
						<li>
							<strong>{l.name}</strong>
							{#if l.protected}<span class="pill event">password</span>{/if}
							{#if l.segment_id}<span class="pill page">{segments.data?.find((s) => s.id === l.segment_id)?.name ?? 'saved filter'}</span>{/if}
							<span class="muted small grow">{l.expires_at ? `until ${day(l.expires_at)}` : ''}</span>
							<button class="btn ghost icon" onclick={() => copy(shareUrl(l.slug), l.slug)} aria-label="Copy link">
								{#if copied === l.slug}<Check size={14} />{:else}<Copy size={14} />{/if}
							</button>
							<button class="btn ghost icon" onclick={() => removeShare(l.slug)} aria-label="Delete link"><Trash size={14} /></button>
						</li>
					{:else}
						<li class="muted">No shared links yet.</li>
					{/each}
				</ul>
				<div class="inline">
					<input class="input grow" placeholder="Name, e.g. Acme" bind:value={newShare.name} />
					<input class="input" type="password" placeholder="Password (optional)" bind:value={newShare.password} />
				</div>
				<div class="inline">
					<Select label="Saved filter" class="grow" bind:value={newShare.segment_id} options={[{ value: '', label: 'All traffic' }, ...(segments.data ?? []).filter((s) => !s.personal).map((s) => ({ value: s.id, label: s.name }))]} />
					<Select
						label="Expires"
						bind:value={newShare.expires_days}
						options={[
							{ value: 0, label: 'Never expires' },
							{ value: 7, label: '7 days' },
							{ value: 30, label: '30 days' },
							{ value: 90, label: '90 days' },
							{ value: 365, label: '1 year' },
						]}
					/>
					<button class="btn primary" onclick={addShare}>Create link</button>
				</div>
			</section>
			<section class="card block">
				<h3>Email reports</h3>
				<p class="muted">
					A weekly or monthly summary, plus alerts when traffic spikes or stops.
					{#if reports.data && !reports.data.sending}Set up an email provider on the worker to send them: the <code>EMAIL</code> binding or Amazon SES (docs/configuration.md).{/if}
				</p>
				<ul class="goals">
					{#each reports.data?.subscriptions ?? [] as r (r.id)}
						<li>
							<span class="pill {r.kind === 'spike' || r.kind === 'drop' ? 'page' : 'event'}">{r.kind}</span>
							<strong class="grow">{r.email}</strong>
							<span class="muted small">
								{#if r.kind === 'spike'}{r.threshold ?? THRESHOLD.spike}+ online{:else if r.kind === 'drop'}no pageviews for {r.threshold ?? THRESHOLD.drop}h{/if}
								{r.last_sent_at ? ` · sent ${day(r.last_sent_at)}` : ''}
							</span>
							<button class="btn ghost icon" onclick={() => removeReport(r.id)} aria-label="Unsubscribe"><Trash size={14} /></button>
						</li>
					{:else}
						<li class="muted">Nobody is subscribed.</li>
					{/each}
				</ul>
				<div class="inline">
					<input class="input grow" type="email" placeholder="you@example.com" bind:value={newReport.email} />
					<Select label="Kind" bind:value={() => newReport.kind, (kind) => (newReport = { ...newReport, kind, threshold: THRESHOLD[kind] ?? 0 })} options={(Object.entries(KIND) as [ReportSub['kind'], string][]).map(([k, l]) => ({ value: k, label: l }))} />
					{#if newReport.kind === 'spike' || newReport.kind === 'drop'}
						<input class="input narrow" type="number" min="1" max={newReport.kind === 'drop' ? 168 : undefined} placeholder={newReport.kind === 'spike' ? 'Visitors' : 'Hours'} aria-label={newReport.kind === 'spike' ? 'Visitors online' : 'Hours without a pageview'} bind:value={newReport.threshold} />
					{/if}
					<button class="btn primary" onclick={addReport} disabled={!newReport.email}>Subscribe</button>
				</div>
				<div class="inline">
					<button class="btn ghost" onclick={previewReport} disabled={!!busy}>Preview report</button>
					<button class="btn ghost" onclick={testReport} disabled={!newReport.email && !reports.data?.subscriptions.length}>{sentTest ? 'Sent' : 'Send a test'}</button>
				</div>
			</section>
	{:else if tab === 'connect'}
		<section class="card block">
			<div class="head-row">
				<h3>Connect AI tools (MCP)</h3>
				<a class="doc-link" href={docUrl('mcp')} target="_blank" rel="noopener">MCP docs <ArrowUpRight size={13} /></a>
			</div>
			<p class="muted">Ask Claude, Cursor or any MCP client about your traffic. Use a key scoped to this site, then add the server.</p>
			{#if dash.signedIn && dash.current}
				{#if siteKeys.length}
					<ul class="goals">
						{#each siteKeys as k (k.id)}
							<li>
								<code class="muted">{k.prefix}…</code>
								<strong class="grow">{k.name}</strong>
								<span class="muted small">{k.last_used_at ? `used ${day(k.last_used_at)}` : 'never used'}</span>
								<button class="btn ghost" onclick={() => rotateKey(k.id)} onblur={() => confirmRotate === k.id && (confirmRotate = null)} disabled={busy === 'key'}>
									{confirmRotate === k.id ? 'Confirm rotate' : 'Rotate'}
								</button>
							</li>
						{/each}
					</ul>
					{#if confirmRotate}
						<p class="muted small">Rotating gives the key a new secret. Tools using the old one stop working until you paste the new one.</p>
					{/if}
				{:else if keys.data}
					<div><button class="btn" onclick={makeKey} disabled={busy === 'key'}>Create API key for {dash.current.name}</button></div>
				{/if}
			{/if}
			{#if shownKey}
				<p class="small">Copy this key now, it won't be shown again: <code class="key">{shownKey}</code></p>
			{/if}
			<div class="code">
				<pre>{mcpCommand}</pre>
				<button class="btn ghost icon" onclick={() => copy(mcpCommand, 'cmd')} aria-label="Copy">
					{#if copied === 'cmd'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
			<div class="code">
				<pre>{mcpJson}</pre>
				<button class="btn ghost icon" onclick={() => copy(mcpJson, 'json')} aria-label="Copy">
					{#if copied === 'json'}<Check size={14} />{:else}<Copy size={14} />{/if}
				</button>
			</div>
		</section>
		{#if dash.canEdit}
			<section class="card block">
				<div class="head-row">
					<h3>Import history</h3>
					<a class="doc-link" href={docUrl('import')} target="_blank" rel="noopener">Import docs <ArrowUpRight size={13} /></a>
				</div>
				<p class="muted">Bring your past data. Upload a CSV export (the zip or its CSV files), import straight from a Google property, or read it from another analytics tool. Imported numbers show in unfiltered reports, next to what misomoon collects. An import keeps only the days before misomoon started counting, so no day counts twice.</p>
				<ul class="goals">
					{#each imports.data ?? [] as i (i.id)}
						<li>
							<span class="pill {i.status === 'failed' ? 'page' : 'event'}">{importSource(i.source)}</span>
							<strong class="grow">{i.label}</strong>
							<span class="muted small">
								{#if i.status === 'importing'}Importing…{#if i.days_total} {(i.days_done ?? 0).toLocaleString()} of {i.days_total.toLocaleString()} days{/if}{:else if i.status === 'failed'}Failed: {i.error}{:else}{i.from_day} to {i.to_day}, {i.rows.toLocaleString()} rows{#if i.skipped_days}. Skipped {i.skipped_days.toLocaleString()} {i.skipped_days === 1 ? 'day' : 'days'} already counted{/if}{/if}
							</span>
							<button class="btn ghost icon" onclick={() => removeImport(i.id)} aria-label="Delete import"><Trash size={14} /></button>
						</li>
					{:else}
						<li class="muted">Nothing imported yet.</li>
					{/each}
				</ul>
				{#if properties}
					<div class="inline">
						<Select label="Google property" class="grow" bind:value={gaProperty} options={properties.map((p) => ({ value: p.id, label: `${p.account}: ${p.name}`, keywords: p.id }))} />
						<input class="input" type="date" bind:value={gaFrom} aria-label="From" />
						<input class="input" type="date" bind:value={gaTo} aria-label="To" />
						<button class="btn primary" onclick={startGoogle} disabled={!gaProperty}>Import</button>
					</div>
					<p class="muted small">Leave the dates empty to import everything Google has. The import ends the day before misomoon started counting, and skips days an earlier import covers.</p>
				{:else if toolInfo}
					<div class="tool-form">
						<div class="head-row">
							<h4>Import from {toolInfo.name}</h4>
							<a class="doc-link" href={docUrl(toolInfo.guide)} target="_blank" rel="noopener">Switching guide <ArrowUpRight size={13} /></a>
						</div>
						{#each toolInfo.fields.filter((f) => !f.when || !!toolInput[f.when.field]?.trim() === f.when.set) as f (f.name)}
							<label class="params">
								<span>{f.label}{f.optional ? '' : ' *'}</span>
								{#if f.help}<small>{f.help}</small>{/if}
								<input class="input" type={f.kind === 'secret' ? 'password' : f.kind === 'url' ? 'url' : 'text'} bind:value={toolInput[f.name]} placeholder={f.placeholder} autocomplete="off" spellcheck="false" aria-label={f.label} />
							</label>
						{/each}
						<div class="inline">
							<label class="params dates"><span>From</span><input class="input" type="date" bind:value={toolFrom} /></label>
							<label class="params dates"><span>To</span><input class="input" type="date" bind:value={toolTo} /></label>
							<button class="btn primary" onclick={startTool} disabled={busy === 'startTool'}>{busy === 'startTool' ? 'Checking…' : 'Import'}</button>
							<button class="btn ghost" onclick={() => (tool = '')}>Cancel</button>
						</div>
						<p class="muted small">
							misomoon checks the sign-in now, then reads a day at a time on the server, so you can close the page. Leave the dates empty to import everything before misomoon started counting. The sign-in is deleted when the import ends.
						</p>
					</div>
				{:else}
					<div class="inline">
						<label class="btn file">
							<Upload size={14} />
							{uploading ? 'Uploading…' : 'Upload CSV or zip'}
							<!-- visually hidden, not `hidden`, so the keyboard can reach it -->
							<input type="file" accept=".zip,.csv,.gz" multiple onchange={upload} disabled={uploading} />
						</label>
						<button class="btn" onclick={connectGoogle}>Connect Google</button>
						<Select label="Import from another tool" placeholder="Import from another tool…" bind:value={tool} options={IMPORTER_INFO.map((i) => ({ value: i.id, label: i.name }))} />
					</div>
				{/if}
			</section>
			<section class="card block">
				<div class="head-row">
					<h3>Google Search Console</h3>
					<a class="doc-link" href={docUrl('import', 'connect-search-console')} target="_blank" rel="noopener">Search Console docs <ArrowUpRight size={13} /></a>
				</div>
				<p class="muted">See the Google searches that bring people here, with clicks, impressions, click-through rate and position, under Sources → Search terms.</p>
				{#if search.data?.connected}
					<ul class="goals">
						<li>
							<span class="pill event">connected</span>
							<strong class="grow">{propLabel(search.data.connected.property)}</strong>
							<span class="muted small">{search.data.connected.connected_by ? `by ${search.data.connected.connected_by}, ` : ''}{day(search.data.connected.created_at)}</span>
							<button class="btn ghost icon" onclick={disconnectSearch} aria-label="Disconnect Search Console"><Trash size={14} /></button>
						</li>
					</ul>
					<p class="muted small">Google reports searches about two days late, so the last days of a period fill in later.</p>
				{:else if searchProps}
					{#if searchProps.length}
						<div class="inline">
							<Select
								label="Search Console property"
								class="grow"
								bind:value={searchProp}
								options={searchProps.map((p) => ({ value: p.property, label: `${propLabel(p.property)}${p.matches ? ' · matches this site' : ''}` }))}
							/>
							<button class="btn primary" onclick={saveSearch} disabled={!searchProp}>Connect</button>
						</div>
					{:else}
						<p class="muted small">This Google account has no verified Search Console properties. Add {dash.current?.domain} in Search Console first, or sign in with another account.</p>
					{/if}
				{:else if search.data && !search.data.available}
					<p class="muted small">Not enabled on this server: it needs <code>GOOGLE_CLIENT_ID</code> and <code>GOOGLE_CLIENT_SECRET</code> with the Search Console API turned on.</p>
				{:else}
					<div class="inline"><button class="btn" onclick={connectSearch}>Connect Search Console</button></div>
				{/if}
			</section>
		{/if}
	{:else if tab === 'revenue'}
		<Revenue />
	{:else if tab === 'team'}
		{#if team?.plan && dash.me?.plans}
			{@const trialNote = trialLine(team.plan)}
			{@const meter = eventsMeter(team.plan)}
			<section class="card block">
				<div class="head">
					<h3>Plan</h3>
					{#if team.plan.trial}<span class="pill event">Free trial</span>
					{:else if team.plan.lapsed}<span class="pill bad">No plan</span>
					{:else if team.plan.stopped}<span class="pill bad">Paused</span>{/if}
				</div>
				{#if trialNote}<p class="plan-note {trialNote.tone}" role="status">{trialNote.text}</p>{/if}
				<dl class="plan">
					{#each planFacts(team.plan) as [label, value] (label)}
						<div><dt>{label}</dt><dd>{value}</dd></div>
					{/each}
				</dl>
				<div class="meter {meter.tone}">
					<div class="meter-head"><span>{meter.label}</span><span class="mono">{Math.round(meter.share * 100)}%</span></div>
					<div class="bar" role="meter" aria-label="Events this month" aria-valuemin={0} aria-valuemax={team.plan.events_stop} aria-valuenow={Math.min(team.plan.events_used, team.plan.events_stop)}>
						<span class="fill" style="width: {Math.min(meter.share / meter.stopAt, 1) * 100}%"></span>
						<span class="tick" style="left: {100 / meter.stopAt}%"></span>
					</div>
					{#if meter.note}<p class="muted small">{meter.note}</p>{/if}
				</div>
				{#if atSiteLimit(team.plan)}
					<p class="muted small">{team.name} has all the sites its plan includes. It keeps them, but can't add or take in another.</p>
				{/if}
				<PlanBilling teamId={team.id} plan={team.plan.state === 'plan' ? team.plan.id : null} used={team.plan.events_used} canManage={teamRole === 'owner' || teamRole === 'billing'} />
				<p class="muted small">Every plan has every feature. For help with plans, email <a href="mailto:{SUPPORT_EMAIL}">{SUPPORT_EMAIL}</a>.</p>
			</section>
		{/if}
		{#if dash.canManage && team}
			<section class="card block">
				<div class="head">
					<h3>Team</h3>
					{#if teamRole === 'owner' || teamRole === 'admin'}
						<div class="inline rename">
							<input class="input" bind:value={teamName} aria-label="Team name" />
							{#if teamName.trim() && teamName !== team.name}<button class="btn" onclick={renameTeam}>Rename</button>{/if}
						</div>
					{/if}
				</div>
				<p class="muted">Everyone on <strong>{team.name}</strong> holds one role on all of its sites. Guests see one site only.</p>
				<div class="roles">
					{#each TEAM_ROLES as r (r.role)}<span><strong>{r.label}</strong> {r.hint}</span>{/each}
				</div>
				<ul class="goals people">
					{#each members.data?.members ?? [] as m (m.id)}
						<li>
							<span class="avatar">{m.name.slice(0, 1)}</span>
							<span class="grow person"><strong>{m.name}{isMe(m.id) ? ' (you)' : ''}</strong><span class="muted small">{m.email}</span></span>
							{#if m.role === 'owner' && teamRole !== 'owner'}
								<span class="pill" title="Only an owner can change another owner">Owner</span>
							{:else}
								{#key roleReset}
									<Select
										label="Role of {m.name}"
										value={m.role}
										onchange={(role) => setRole(m.id, role)}
										options={TEAM_ROLES.map((r) => ({ value: r.role, label: r.label, disabled: r.role === 'owner' && teamRole !== 'owner' }))}
									/>
								{/key}
								<button class="btn ghost icon" onclick={() => removeMember(m.id)} aria-label={isMe(m.id) ? 'Leave team' : `Remove ${m.name}`}><Trash size={14} /></button>
							{/if}
						</li>
					{/each}
					{#each (members.data?.guests ?? []).filter((g) => g.site_id === dash.site) as g (g.id)}
						<li>
							<span class="avatar guest">{g.name.slice(0, 1)}</span>
							<span class="grow person"><strong>{g.name}</strong><span class="muted small">{g.email} · guest on {dash.current?.name}</span></span>
							{#key roleReset}<Select label="Guest role of {g.name}" value={g.role} onchange={(role) => setGuest(g.id, role)} options={GUEST_ROLES} />{/key}
							<button class="btn ghost icon" onclick={() => removeGuest(g.id)} aria-label="Remove {g.name}"><Trash size={14} /></button>
						</li>
					{/each}
					{#each members.data?.invitations ?? [] as i (i.id)}
						<li class="pending">
							<span class="avatar">?</span>
							<span class="grow person"><strong>{i.email}</strong><span class="muted small">invited as {i.site_id ? `guest ${i.role}` : i.role} · until {day(i.expires_at)}</span></span>
							<span class="pill">pending</span>
							<button class="btn ghost icon" onclick={() => withdraw(i.id)} aria-label="Withdraw invitation"><Trash size={14} /></button>
						</li>
					{/each}
				</ul>
				<div class="inline">
					<input class="input grow" type="email" placeholder="colleague@example.com" bind:value={invite.email} />
					<Select
						label="Access to"
						bind:value={invite.scope}
						options={[
							{ value: 'team', label: 'Whole team' },
							{ value: 'site', label: `Only ${dash.current?.name ?? 'this site'}` },
						]}
					/>
					<Select label="Role" bind:value={invite.role} options={invite.scope === 'team' ? assignable.map((r) => ({ value: r.role as string, label: r.label })) : GUEST_ROLES} />
					<button class="btn primary" onclick={sendInvite} disabled={!invite.email}>Invite</button>
				</div>
				{#if inviteLink}
					<div class="code">
						<pre>{inviteLink.url}</pre>
						<button class="btn ghost icon" onclick={() => copy(inviteLink!.url, 'invite')} aria-label="Copy">
							{#if copied === 'invite'}<Check size={14} />{:else}<Copy size={14} />{/if}
						</button>
					</div>
					<p class="muted small">{inviteLink.sent ? 'We emailed the invitation. You can also send this link yourself.' : 'Email is not set up here, so send this link yourself. It works for 7 days.'}</p>
				{/if}
			</section>
		{/if}
	{:else if tab === 'sites'}
		{#if dash.current && dash.canEdit}
			<section class="card block">
				<h3>{dash.current.name}</h3>
				<form
					class="details"
					onsubmit={(e) => {
						e.preventDefault()
						saveDetails()
					}}
				>
					<label>
						<span>Name</span>
						<small>Shown in the site menu and in email reports</small>
						<input class="input" bind:value={details.name} aria-label="Site name" />
					</label>
					<SiteFields bind:timezone={details.timezone} bind:currency={details.currency} />
					{#if dash.current.region}
						<p class="region">Data region: {regionName[dash.current.region]}. A site keeps the region it was added with.</p>
					{:else if dash.me?.regions?.length}
						<p class="region">Data region: none. This site was added before the server had regions, so its stats may be stored on any of its databases.</p>
					{/if}
					<div class="details-save">
						<button class="btn primary" disabled={!detailsChanged || busy === 'details'}>{busy === 'details' ? 'Saving…' : 'Save'}</button>
						{#if detailsSaved}<span class="muted">Saved</span>{/if}
					</div>
				</form>
			</section>
		{/if}
		<section class="card block">
			<h3>Your sites</h3>
			{#if dash.sites.length}
				<ul class="goals">
					{#each dash.sites as s (s.id)}
						<li>
							<strong>{s.name}</strong>
							<code class="muted">{s.domain}</code>
							{#if s.id === dash.site}<span class="pill event">open</span>{:else}<button class="btn ghost" onclick={() => dash.switchSite(s.id)}>Open</button>{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="muted">No sites yet. Add your first one below.</p>
			{/if}
			<h4 class="gap">Add a site</h4>
			<AddSite onadded={() => (dash.view = 'overview')} />
		</section>
		{#if dash.signedIn && dash.current}
			<section class="card block danger">
				<h3>{dash.canManage ? 'Danger zone' : 'Leave'}</h3>
				{#if can(dash.role, 'own') && moveTargets.length}
					<p class="muted">Move {dash.current.name} to another team you run. Its members get access, and guests keep theirs.</p>
					<div class="inline">
						<Select label="Team" class="grow" placeholder="Pick a team" bind:value={moveTo} options={moveTargets.map((t) => ({ value: t.id, label: t.name }))} />
						<button class="btn" onclick={moveSite} disabled={!moveTo}>Move site</button>
					</div>
				{/if}
				{#if dash.canManage}
					<p class="muted">Deleting {dash.current.name} removes all of its stats for good. Type <code>{dash.current.domain}</code> to confirm.</p>
					<div class="inline">
						<input class="input grow" bind:value={confirmDelete} placeholder={dash.current.domain} aria-label="Confirm domain" />
						<button class="btn bad" onclick={deleteSite} disabled={confirmDelete !== dash.current.domain}>Delete site</button>
					</div>
				{/if}
				{#if dash.role !== 'owner'}
					<p class="muted">{team ? `Leave ${team.name}: you lose access to all of its sites.` : `Stop being a guest on ${dash.current.name}.`}</p>
					<div class="inline"><button class="btn ghost" onclick={leaveSite}>{team ? 'Leave team' : 'Leave site'}</button></div>
				{/if}
			</section>
		{/if}
	{:else}
		<section class="card block">
			<h3>Account</h3>
			{#if dash.me?.user}
				<p class="muted">Signed in as <strong>{dash.me.user.email}</strong>{dash.role ? `, ${dash.role.replace('guest_', 'guest ')} on ${dash.current?.name}` : ''}.</p>
				<div class="inline">
					<input class="input grow" placeholder="Name" bind:value={account.name} aria-label="Name" />
				</div>
				<div class="inline">
					{#if hasPassword}<input class="input grow" type="password" placeholder="Current password" autocomplete="current-password" bind:value={account.current} />{/if}
					<input class="input grow" type="password" placeholder={hasPassword ? 'New password' : 'Set a password'} autocomplete="new-password" bind:value={account.password} />
				</div>
				<div class="inline">
					<button class="btn primary" onclick={saveAccount} disabled={!account.name.trim() || (hasPassword && !!account.password && !account.current)}>{saved ? 'Saved' : 'Save'}</button>
					<button class="btn ghost" onclick={signOut}>Sign out</button>
				</div>
				{#if !account.name.trim()}<p class="muted small">Enter your name to save.</p>{:else if hasPassword && account.password && !account.current}<p class="muted small">Enter your current password to set a new one.</p>{:else if !hasPassword}<p class="muted small">You sign in with {(dash.me.user.logins ?? []).map((p) => PROVIDER_NAME[p]).join(' or ')}. A password lets you sign in with your email too.</p>{/if}
				{#if dash.me.providers?.length}
					<h4 class="gap">Sign in with</h4>
					{#each dash.me.providers as p (p)}
						{@const on = (dash.me.user.logins ?? []).includes(p)}
						<div class="inline">
							<span class="grow login"><BrandIcon brand={p} size={15} /> {PROVIDER_NAME[p]}{#if on}<span class="muted"> · connected{loginReturn.linked === p ? ' just now' : ''}</span>{/if}</span>
							{#if on && onlyLogin(dash.me.user, p)}
								<span class="muted small">Set a password to disconnect</span>
							{:else if on}
								<button class="btn ghost" onclick={() => disconnectLogin(p)} disabled={busy === 'disconnectLogin'}>Disconnect</button>
							{:else}
								<button class="btn" onclick={() => connectLogin(p)} disabled={busy === 'connectLogin'}>Connect</button>
							{/if}
						</div>
					{/each}
				{/if}
				<h4 class="gap">Delete your account</h4>
				{#if closing.open}
					<p class="muted small">
						This deletes your account at once, with the teams only you are in, their sites and all of their stats. You leave your other teams. Export anything you want
						to keep first. If you are the only owner of a team with other members, make one of them an owner first.
					</p>
					<div class="inline">
						{#if hasPassword}
							<input class="input grow" type="password" placeholder="Your password" autocomplete="current-password" bind:value={closing.password} aria-label="Your password" />
						{:else}
							<input class="input grow" placeholder={dash.me.user.email} bind:value={closing.password} aria-label="Type your email to confirm" />
						{/if}
						<button class="btn bad" onclick={deleteAccount} disabled={!closing.password || busy === 'deleteAccount'}>{busy === 'deleteAccount' ? 'Deleting…' : 'Delete account'}</button>
						<button class="btn ghost" onclick={() => (closing = { open: false, password: '' })}>Cancel</button>
					</div>
				{:else}
					<div class="inline"><button class="btn ghost bad" onclick={() => (closing = { open: true, password: '' })}>Delete account…</button></div>
				{/if}
				{#if keys.data?.length}
					<h4 class="gap">API keys</h4>
					<ul class="goals">
						{#each keys.data as k (k.id)}
							<li>
								<code class="muted">{k.prefix}…</code>
								<strong>{k.name}</strong>
								<span class="muted small">{k.site_id ?? 'all your sites'}{k.last_used_at ? ` · used ${day(k.last_used_at)}` : ''}</span>
								<button class="btn ghost icon" onclick={() => removeKey(k.id)} aria-label="Revoke key"><Trash size={14} /></button>
							</li>
						{/each}
					</ul>
					<p class="muted small">A key acts with your role, so it loses access when you do.</p>
				{/if}
			{:else}
				<p class="muted">{dash.isDemo ? 'You are looking at the public demo. ' : ''}Sign in to see your own sites, invite your team and connect AI tools.</p>
				<div class="inline"><button class="btn primary" onclick={() => (dash.authOpen = true)}>Sign in or create an account</button></div>
			{/if}
		</section>
	{/if}
</div>
</div>

<style>
	.file {
		position: relative;
	}
	.file input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		pointer-events: none;
	}
	.file:has(input:focus-visible) {
		box-shadow: var(--focus);
	}
	.split {
		display: grid;
		grid-template-columns: 210px minmax(0, 1fr);
		gap: 24px;
		align-items: start;
		margin-top: 24px;
	}
	/* the sections stay in view beside a long page */
	.nav {
		position: sticky;
		top: 88px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 8px;
		border: 1.5px solid var(--edge);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow);
	}
	.nav > button {
		display: flex;
		align-items: center;
		gap: 10px;
		height: 36px;
		padding: 0 12px;
		border: 1.5px solid transparent;
		border-radius: var(--radius-sm);
		font-size: 13.5px;
		font-weight: 500;
		color: var(--text-2);
		text-align: left;
		white-space: nowrap;
	}
	.nav > button:hover {
		background: var(--surface-3);
		color: var(--text);
	}
	.nav > button.on {
		border-color: var(--edge);
		background: var(--vermilion);
		color: var(--on-vermilion);
		font-weight: 600;
		box-shadow: var(--shadow-sm);
	}
	/* on a phone the list scrolls, which clips an outside ring, so focus is drawn inside */
	.nav > button:focus-visible {
		box-shadow:
			inset 0 0 0 2px var(--cobalt),
			inset 0 0 0 3.5px var(--surface);
	}
	.nav > button.on:focus-visible {
		box-shadow:
			var(--shadow-sm),
			inset 0 0 0 2px var(--cobalt),
			inset 0 0 0 3.5px var(--surface);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 16px;
	}
	/* on a narrow screen the sections become one scrolling strip above the page */
	@media (max-width: 860px) {
		.split {
			grid-template-columns: minmax(0, 1fr);
			gap: 16px;
		}
		.nav {
			position: static;
			flex-direction: row;
			overflow-x: auto;
			scrollbar-width: none;
			padding: 6px;
			box-shadow: var(--shadow-sm);
		}
		.nav::-webkit-scrollbar {
			display: none;
		}
		.nav > button {
			flex: none;
			height: 32px;
		}
	}
	.block {
		padding: 20px 22px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	h3 {
		margin: 0;
		font-family: var(--font-display);
		font-stretch: var(--display-stretch);
		font-weight: var(--display-weight);
		text-transform: uppercase;
		letter-spacing: -0.005em;
		line-height: 1;
		font-size: 24px;
	}
	p {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
	}
	.small {
		font-size: 12px;
	}
	code {
		font-family: var(--font-mono);
		font-size: 12px;
	}
	.details {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
		gap: 14px;
		align-items: end;
	}
	.details label {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.details label span {
		font-size: 12.5px;
		font-weight: 600;
	}
	.details label small {
		font-size: 11.5px;
		color: var(--text-3);
		margin-bottom: 4px;
	}
	.details .input {
		height: 36px;
	}
	.features {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		gap: 10px 18px;
	}
	.presets {
		grid-column: 1 / -1;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.feature {
		display: flex;
		gap: 10px;
		align-items: flex-start;
		cursor: pointer;
	}
	.feature input {
		margin-top: 3px;
		accent-color: var(--vermilion);
	}
	.feature span,
	.params {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: 13px;
	}
	.feature small,
	.params small {
		font-size: 11.5px;
		color: var(--text-3);
	}
	.params {
		grid-column: 1 / -1;
	}
	.tool-form {
		display: grid;
		gap: 10px;
		margin-top: 8px;
	}
	.tool-form h4 {
		margin: 0;
	}
	.tool-form .inline {
		align-items: flex-end;
	}
	.params.dates {
		grid-column: auto;
	}
	.params > span {
		font-weight: 600;
		font-size: 12.5px;
	}
	.params .input {
		height: 36px;
		margin-top: 4px;
	}
	.region {
		grid-column: 1 / -1;
		margin: 0;
		font-size: 12.5px;
		color: var(--text-3);
	}
	.details-save {
		display: flex;
		align-items: center;
		gap: 10px;
		grid-column: 1 / -1;
	}
	.head-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
	}
	.doc-link {
		display: inline-flex;
		align-items: center;
		gap: 3px;
		font-size: 12.5px;
		font-weight: 600;
		color: var(--text-2);
		white-space: nowrap;
	}
	.doc-link:hover {
		color: var(--miso);
	}
	.brands {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 6px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.brands a {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 36px;
		padding: 6px 10px;
		line-height: 1.25;
		border: 1.5px solid var(--line-strong);
		border-radius: var(--radius-sm);
		font-size: 13px;
		font-weight: 500;
		color: var(--text);
		text-decoration: none;
		transition:
			background var(--dur-fast),
			border-color var(--dur-fast);
	}
	.brands a :global(svg) {
		flex: none;
		color: var(--text-2);
	}
	.brands a:hover {
		border-color: var(--edge);
		background: var(--surface-hover);
	}
	.brands a:hover :global(svg) {
		color: var(--text);
	}
	.brands.sdk {
		grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
	}
	.brands.sdk a {
		min-height: 44px;
	}
	.brands.sdk span {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.brands.sdk small {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 11px;
		color: var(--text-3);
	}
	.code {
		position: relative;
		border-radius: var(--radius-sm);
		background: var(--surface-2);
		border: 1.5px solid var(--line-strong);
	}
	.code.tall pre {
		max-height: 320px;
		overflow: auto;
	}
	.code pre {
		margin: 0;
		padding: 14px 48px 14px 14px;
		font-family: var(--font-mono);
		font-size: 12px;
		white-space: pre-wrap;
		tab-size: 2;
		word-break: break-all;
		color: var(--text-2);
	}
	.code button {
		position: absolute;
		top: 8px;
		right: 8px;
	}
	.currency {
		width: 76px;
		text-transform: uppercase;
	}
	.inline {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
	.grow,
	.inline > :global(.select.grow) {
		flex: 1;
		min-width: 160px;
	}
	.proxy {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
		gap: 24px;
	}
	.opt {
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-width: 0;
	}
	h4 {
		margin: 0;
		font-size: 13px;
		font-weight: 600;
	}
	.login {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 13.5px;
	}
	h4.gap {
		margin-top: 10px;
	}
	a.btn {
		text-decoration: none;
	}
	.inline label {
		align-self: center;
	}
	.records {
		border-collapse: collapse;
		font-size: 12px;
	}
	.records td {
		padding: 6px 10px 6px 0;
		border-bottom: 1px solid var(--line);
		word-break: break-all;
	}
	.pill.ok {
		background: var(--good-soft);
		color: var(--good);
	}
	.goals {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
	}
	.goals li {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 0;
		border-bottom: 1px solid var(--line);
		font-size: 13px;
	}
	.narrow {
		width: 96px;
	}
	.goals li .grow {
		flex: 1;
	}
	.head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
	}
	.rename .input {
		width: 220px;
	}
	.roles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 18px;
		font-size: 12px;
		color: var(--text-3);
	}
	.roles strong {
		color: var(--text);
		font-weight: 600;
		margin-right: 3px;
	}
	/* the plan card: mono labels over bold values, like a receipt */
	.plan {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 12px 18px;
		margin: 0;
	}
	.plan div {
		display: flex;
		flex-direction: column;
		gap: 3px;
		min-width: 0;
	}
	.plan dt {
		font-family: var(--font-mono);
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
	}
	.plan dd {
		margin: 0;
		font-size: 14px;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	/* the trial line: a tinted strip, its words carry the state */
	.plan-note {
		margin: 0 0 14px;
		padding: 8px 12px;
		border-radius: var(--radius-sm);
		font-size: 13px;
		background: var(--surface-3);
	}
	.plan-note.warn {
		background: var(--warn-soft);
	}
	.plan-note.bad {
		background: var(--bad-soft);
		color: var(--bad);
	}
	/* this month's events: the bar runs to where tracking pauses, the tick marks the plan's events */
	.meter {
		margin-top: 16px;
	}
	.meter-head {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		font-size: 13px;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		margin-bottom: 6px;
	}
	.bar {
		position: relative;
		height: 12px;
		border: 1.5px solid var(--edge);
		border-radius: var(--radius-xs);
		background: var(--surface-3);
		overflow: hidden;
	}
	.bar .fill {
		position: absolute;
		inset: 0 auto 0 0;
		background: var(--miso);
	}
	.meter.warn .fill {
		background: var(--warn);
	}
	.meter.bad .fill {
		background: var(--bad);
	}
	.bar .tick {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		margin-left: -1px;
		background: var(--edge);
	}
	.pill.bad {
		background: var(--bad-soft);
		color: var(--bad);
	}
	.people .avatar {
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 50%;
		border: 1.5px solid var(--edge);
		background: var(--miso-soft);
		color: var(--miso);
		font-weight: 700;
		font-size: 12px;
		text-transform: uppercase;
	}
	.people .avatar.guest {
		border-style: dashed;
		background: transparent;
	}
	.person {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.people :global(.select) {
		height: 30px;
		font-size: 12.5px;
	}
	.pending {
		opacity: 0.8;
	}
	.danger {
		border-color: var(--miso-line);
	}
	.btn.bad {
		background: var(--miso);
		color: var(--on-vermilion);
	}
	/* opens a delete: red text, so it reads as one before the filled button confirms it */
	.btn.ghost.bad {
		background: transparent;
		color: var(--miso);
	}
	.btn.ghost.bad:hover {
		background: var(--surface-hover);
		color: var(--miso);
	}
	.goals li strong {
		font-weight: 500;
		flex: 1;
	}
	.pill {
		font-size: 10.5px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 2px 7px;
		border-radius: var(--radius-xs);
		background: var(--surface-3);
		color: var(--text-2);
	}
	.pill.event {
		background: var(--miso-soft);
		color: var(--miso);
	}
	.key {
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		background: var(--miso-soft);
		color: var(--miso);
	}
	.error {
		margin-top: 16px;
		padding: 10px 14px;
		border-radius: var(--radius);
		background: var(--bad-soft);
		color: var(--bad);
		font-size: 13px;
	}
	.banner {
		position: sticky;
		top: 12px;
		z-index: 5;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		box-shadow: var(--shadow, none);
	}
	@media (max-width: 1100px) {
		.proxy {
			grid-template-columns: 1fr;
		}
	}
</style>
