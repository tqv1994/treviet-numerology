<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const myAgent = getMyAgent(session.user);
		let treeViews: AgentTreeView[];
		let role = session.user.roles[0]?.name || '';
		if (myAgent) {
			try {
				const res = await fetch(`/p/tree-view/${myAgent.id}`);

				if (res.ok) {
					const data = await res.json();
					treeViews = data.results;
				} else {
					const err = await res.json();
					console.error(err);
				}
			} catch (error) {
				console.log(error);
			}
		}
		return {
			props: {
				treeViews,
				myAgent,
				role
			}
		};
	};
</script>

<script lang="ts">
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import { fade } from 'svelte/transition';
	import type { Load } from '@sveltejs/kit';
	import Folder from '$lib/components/ABS/Global/SystemTree/Folder.svelte';
	import { getMyAgent } from '$lib/utils/user';
	import type { Agent, AgentTreeView } from '$lib/stores/agent';
	import { packagesStore } from '$lib/stores/package';
	export let myAgent: Agent;
	export let treeViews: AgentTreeView[];
	export let role: string;

	console.log(treeViews);
	
	let packages = $packagesStore;
	let listColor = convertListColor(packages);
	
	function convertListColor(packages) {
		return packages.map(item => item.color).reverse();
	}
</script>

<div transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center">
			<div class="col-lg-6 col-7" />
			<div class="col-lg-6 col-5 text-right" />
		</div>
	</BaseHeader>
	<div class="container-fluid mt--6">
		<div class="row">
			<div class="col-lg-12">
				<div class="card-wrapper">
					<!-- Input groups -->
					<Card>
						<!-- Card header -->
						<h6 class="h2 d-inline-block mb-0">Đại lý</h6>
						<nav
							aria-label="breadcrumb"
							class="d-none d-md-inline-block ml-md-4"
							style="color: #2DCE89"
						>
							<span> - Cây hệ thống </span>
						</nav>
						<!-- Card body -->
						{#if myAgent}
							<Folder
								agentTreeViews={treeViews}
								ref_code={myAgent.ref_code_agent}
								expanded={true}
								role={role}
								colors={listColor}
							/>
						{/if}
					</Card>
				</div>
			</div>
		</div>
	</div>
</div>
