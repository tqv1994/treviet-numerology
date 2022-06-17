<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const myAgent = getMyAgent(session.user);
		let myChildAgents: AgentTreeView[] = [];
		let treeViews: AgentTreeView[] = [];

		if (myAgent) {
			if (myAgent.ref_code_agent !== null) {
				return redirectAgent('/transfers');
			}
			try {
				const res = await fetch(`/p/tree-view/${myAgent.id}`);
				if (res.ok) {
					const data: { results: AgentTreeView[] } = await res.json();
					console.log(data);
					treeViews = data.results;
					myChildAgents = (data.results || []).filter((item) => item.id !== myAgent.id);
					
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
				myChildAgents,
				treeViews,
				myAgent
			}
		};
	};
</script>

<script lang="ts">
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Tabs from '$lib/components/ABS/Tab/Tabs.svelte';
	import ReceiveMapHistory from './components/tabs/ReceiveMapHistory.svelte';
	import ListMapTransferHistory from './components/tabs/ListMapTransferHistory.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { fade } from 'svelte/transition';
	import type { Tab } from '$lib/components/ABS/Tab/Tabs.svelte';
	import type { AgentTreeView } from '$lib/stores/agent';
	import type { Load } from '@sveltejs/kit';
	import Folder from '$lib/components/ABS/Global/SystemTree/Folder.svelte';
	import TransferMapHistory from './components/tabs/TransferMapHistory.svelte';
	import { getMyAgent, getReferralLink } from '$lib/utils/user';
	import { authStore } from '$lib/stores/auth';
	import { formatDate } from '$lib/helper/datetime';
	import { packagesAllStore, packagesStore, type Package } from '$lib/stores/package';
	import CreateTranfer from './components/tabs/createTranfer.svelte';
	import { redirectAgent } from '$lib/components/redirect.svelte';

	export let myChildAgents: AgentTreeView[];
	export let treeViews: AgentTreeView[];
	export let myAgent: {};

	let toggleSystemTree: boolean = false;

	let tabs: Tab[] = [
		{
			id: 1,
			name: 'Lịch sử giao dịch MAP',
			component: ListMapTransferHistory,
			prop: { myAgent: myAgent }
		},
		{ id: 2, name: 'Lịch sử nhận MAP', component: ReceiveMapHistory, prop: { myAgent: myAgent } },
		{ id: 3, name: 'Lịch sử chuyển MAP', component: TransferMapHistory, prop: { myAgent: myAgent } }
	];

	console.log($packagesStore);
	
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
	<div class="container-fluid mt--6 mb-7">
		<div class="card-wrapper">
			<Card>
				<!-- Card header -->
				<h3 slot="header" class="mb-0">REF LINK</h3>
				<!-- Card body -->
				<form action="javascript:void(0);">
					<!-- Input groups with icon -->
					<div class="row">
						<div class="col-lg-6">
							<div class="">
								<BaseInput value={getReferralLink($authStore)} disabled />
							</div>
						</div>
						<div class="col-lg-6">
							<div class="text-left" style="float: left">
								<button
									class="btn btn-success btn"
									type="button"
									on:click={() => {
										/* Copy the text inside the text field */
										navigator.clipboard.writeText(getReferralLink($authStore) || '');

										/* Alert the copied text */
										window.notice({
											text: 'Link giới thiệu đã được sao chép',
											type: 'success'
										});
									}}>Sao chép</button
								>
							</div>
						</div>
					</div>
				</form>
			</Card>
			<!-- Input groups -->
		</div>
	</div>
	<div class="container-fluid mt--6 mb-7">
		<div class="card-wrapper">
			<CreateTranfer {myChildAgents} />
			<!-- Input groups -->
		</div>
	</div>
	<div class="container-fluid mt--6 mb-7">
		<div class="card-wrapper">
			<Card>
				<!-- Card header -->
				<h3 slot="header" class="mb-0">
					Hệ thống đại lý
					<button class="badge-pill {!toggleSystemTree ? 'badge-success' : ''} badge ml-4" on:click={()=>{
						toggleSystemTree = false;
					}}>Close All</button>
					<button class="badge-pill badge {toggleSystemTree ? 'badge-success' : ''}" on:click={()=>{
						toggleSystemTree = true;
					}}>Open All</button>
				</h3>
				<!-- Card body -->
				<Folder
					expanded={toggleSystemTree}
					agentTreeViews={treeViews}
					ref_code={null}
					role="member"
					packages={$packagesAllStore}
				/>
			</Card>
			<!-- Input groups -->
		</div>
	</div>
</div>
<!-- Tab -->
<div>
	<Tabs {tabs} tabSelected={tabs[0]} />
</div>

<style lang="scss">
	.text-systerm {
		color: #f032e6;
		font-size: 12px;
	}
	.filter-form-content {
		display: flex;
	}
</style>
