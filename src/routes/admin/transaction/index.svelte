<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		const sort = url.searchParams.get('sort') || "-id";
		const perPage = url.searchParams.get('perPage') || 10;
		const userId = session.user.id;
		let purchaseDatas: DataWithPagination<Purchase> | undefined;
		let purchaseByIdDatas: DataWithPagination<Purchase> | undefined;
		let treeViews: AgentTreeView[];
		let agentsLevel1: [];

		const resPurchases = await fetch(
			`/p/purchases/filter?${objectToQueryString({ keyword, page: currentPage, sort, perPage })}`
		);
		const resPurchaseByUserId =  await fetch(
			`/p/purchases/filter?${objectToQueryString({ keyword, page: currentPage, create_user_id: userId, sort , perPage })}`
		);;
		const resTree = await fetch(`/p/tree-view/${session.user.id}`);
		const resAgents = await fetch(`/p/agents/filter?filter[level]=1`);

		if (resPurchases.ok) {
			const data = await resPurchases.json();
			purchaseDatas = data.results;
		} else {
			const err = await resPurchases.json();
			console.error(err);
		}

		if (resPurchaseByUserId.ok) {
			const data = await resPurchaseByUserId.json();
			purchaseByIdDatas = data.results;
		} else {
			const err = await resPurchaseByUserId.json();
			console.error(err);
		}

		if (resTree.ok) {
			const data = await resTree.json();
			treeViews = data.results;
		} else {
			const err = await resTree.json();
			console.error(err);
		}

		if (resAgents.ok) {
			const data = await resAgents.json();
			agentsLevel1 = data.results.data;
		} else {
			const err = await resAgents.json();
			console.error(err);
		}

		return {
			props: {
				keyword,
				currentPage,
				purchaseDatas,
				purchaseByIdDatas,
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
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import ListMapSystemHistory from './components/tabs/ListMapTransactionHistory.svelte';
	import MapTransactionHistory from './components/tabs/MapTransactionHistory.svelte';
	import Folder from '$lib/components/ABS/Global/SystemTree/Folder.svelte';
	import { fade } from 'svelte/transition';
	import { objectToQueryString } from '$lib/utils/string';
	import { createPurchaseService } from '$lib/services/purchase.service';
	import type { Tab } from '$lib/components/ABS/Tab/Tabs.svelte';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { Load } from '@sveltejs/kit';
	import type { AgentTreeView } from '$lib/stores/agent';
	import type { Purchase, PurchaseFormData } from '$lib/stores/purchase';
	import { getAgentsByUserId } from '$lib/services/agent.service';
	import { formatDate } from '$lib/helper/datetime';
	import { packagesStore } from '$lib/stores/package';
	import { getUserByUserName } from '$lib/services/auth.service';
	import { authStore } from '$lib/stores/auth';
	import CreateTranfer from './components/tabs/createTranfer.svelte';

	export let purchaseDatas: DataWithPagination<Purchase>;
	export let purchaseByIdDatas: DataWithPagination<Purchase>;
	export let treeViews: AgentTreeView[];
	export let keyword: string;
	export let currentPage: number;
	export let userId: number;
	export let agentsLevel1: [];
		console.log(agentsLevel1);
		
	let packages = $packagesStore;
	let listColor = convertListColor(packages);
	let formData: PurchaseFormData;
	let tabs: Tab[] = [
		{
			id: 1,
			name: 'Lịch sử chuyển MAP hệ thống',
			component: ListMapSystemHistory,
			prop: purchaseDatas
		},
		{ 
			id: 2, 
			name: 'Lịch sử chuyển MAP', 
			component: MapTransactionHistory, 
			prop: {
				purchaseByIdDatas: purchaseByIdDatas, 
				userId: userId
			} 
		}
	];

	reset();

	function convertListColor(packages) {
		return packages.map(item => item.color).reverse();
	}

	function reset() {
		formData = {
			agent_id: "",
			packages_id: 1,
			one_time_password: ''
		};
	}

	// async function onSubmit(event: CustomEvent<object>) {
	// 	// event.preventDefault();
	// 	const user = $authStore
	// 	if (user?.google2fa_secret === null) {
	// 		window.notice({
	// 			text: 'Bạn chưa tạo mã 2FA',
	// 			type: 'danger'
	// 		});
	// 	} else {
	// 		window.openLoading();
	// 		let finalFormData = {
	// 			...formData,
	// 			purchase_date: formatDate(new Date()),
	// 			amount: 1
	// 		}
			
	// 		try {
	// 			await createPurchaseService(finalFormData);
	// 			window.notice({
	// 				text: 'Xuất MAP thành công',
	// 				type: 'success'
	// 			});
	// 		} catch (err) {
	// 			window.notice({
	// 				text: err,
	// 				type: 'danger'
	// 			});
	// 		}
	// 		window.closeLoading();
	// 	}
	// }

	// async function searchUserName(event: CustomEvent<object>) {
	// 	agentName = "";
	// 	event.preventDefault()
	// 	let nameUserSearch = event.target.value;
	// 	let user = await getUserByUserName(nameUserSearch);
	// 	if (!user) {
	// 		window.notice({
	// 			text: 'Không tìm thấy username',
	// 			type: 'danger'
	// 		});
	// 	}
	// 	let agent = await getAgentsByUserId(user.id);
	// 	formData.agent_id = agent.id;
	// 	agentName = agent.agentname;		
	// }

	
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
