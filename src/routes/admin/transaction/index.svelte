<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const userId = session.user.id;
		let treeViews: AgentTreeView[];
		let agentsLevel1: [];

		const resTree = await fetch(`/p/tree-view/${session.user.id}`);
		const resAgents = await fetch(`/p/agents/filter?filter[level]=1`);

		if (resTree.ok) {
			const data = await resTree.json();
			treeViews = data.results;
		} else {
			const err = await resTree.json();
		}

		if (resAgents.ok) {
			const data = await resAgents.json();
			agentsLevel1 = data.results.data;
		} else {
			const err = await resAgents.json();
		}

		return {
			props: {
				treeViews,
				userId,
				agentsLevel1
			}
		};
	};
</script>

<script lang="ts">
	import Card from '$lib/components/Cards/Card.svelte';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Tabs from '$lib/components/ABS/Tab/Tabs.svelte';
	import ListMapSystemHistory from './components/tabs/ListMapTransactionHistory.svelte';
	import MapTransactionHistory from './components/tabs/MapTransactionHistory.svelte';
	import Folder from '$lib/components/ABS/Global/SystemTree/Folder.svelte';
	import { fade } from 'svelte/transition';
	import type { Tab } from '$lib/components/ABS/Tab/Tabs.svelte';
	import type { Load } from '@sveltejs/kit';
	import type { AgentTreeView } from '$lib/stores/agent';
	import { packagesStore } from '$lib/stores/package';
	import CreateTranfer from './components/tabs/createTranfer.svelte';

	export let treeViews: AgentTreeView[];
	export let userId: number;
	export let agentsLevel1: [];
		
	let packages = $packagesStore;
	let listColor = convertListColor(packages);
	let tabs: Tab[] = [
		{
			id: 1,
			name: 'Lịch sử chuyển MAP hệ thống',
			component: ListMapSystemHistory,
		},
		{ 
			id: 2, 
			name: 'Lịch sử chuyển MAP', 
			component: MapTransactionHistory, 
			prop: {
				userId: userId
			} 
		}
	];

	function convertListColor(packages) {
		return packages.map(item => item.color).reverse();
	}

</script>

<div class="content" transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center py-4">
			<div class="col-7 col-lg-6">
				<h6 class="h2 d-inline-block mb-0">Đại lý</h6>
			</div>
			<div class="col-5 col-lg-6 text-right" />
		</div>
	</BaseHeader>
	<div class="container-fluid mt--6 mb-4">
		<div class="card-wrapper">
			<Card>
				<!-- Card header -->
				<h3 slot="header" class="mb-0">Chuyển map cho đại lý</h3>
				<!-- Card body -->
					<!-- Input groups with icon -->
					<div class="row">
						<div class="col-12 mb-5">
							<!-- <h3 class="mb-0">Hệ thống đại lý lý</h3> -->
							<!-- Card body -->
							<div class="" style="color:mediumvioletred">
								<div class="mb-3">
									<span class=" badge-pill badge-success badge ml-4">Close All</span>
									<span class=" badge-pill badge-success badge">Open All</span>
								</div>
								<Folder expanded={true} agentTreeViews={treeViews} ref_code={null} colors={listColor}/>
							</div>
						</div>
					</div>

					<CreateTranfer {agentsLevel1}/>

			</Card>
			<!-- Input groups -->
		</div>
	</div>
</div>
<div style="position: relative;">
	<Tabs {tabs} tabSelected={tabs[0]} />
</div>

<style lang="scss">
	.text-systerm {
		color: 800000;
		font-size: 12px;
	}
	.filter-form-content {
		display: flex;
	}
	.badge-success {
		background-color: #1aae6f;
		color: white;
	}
</style>
