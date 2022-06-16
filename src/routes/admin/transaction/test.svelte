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
		let packages: [];
	
		const user: User = session.user;
        console.log(user);
        
		if (user) {
			if (user.google2fa_secret) {
				const res = await fetch('/p/get-qr-image', {
					method: 'POST',
					body: JSON.stringify({ email: user.email || '', key: user.google2fa_secret })
				});
				if (res.ok) {
					const data = await res.json();
					const imageQR = data['QR-image'];
					session.user.imageQR = imageQR;
					authStore.update((s) => {
						if (s) {
							s.imageQR = imageQR;
						}
						return s;
					});
				}
			}
		}


		const resPurchases = await fetch(
			`/p/purchases/filter?${objectToQueryString({ keyword, page: currentPage, sort, perPage })}`
		);
		const resPurchaseByUserId =  await fetch(
			`/p/purchases/filter?${objectToQueryString({ keyword, page: currentPage, create_user_id: userId, sort , perPage })}`
		);;
		const resTree = await fetch(`/p/tree-view/${session.user.id}`);

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

		return {
			props: {
				keyword,
				currentPage,
				purchaseDatas,
				purchaseByIdDatas,
				treeViews,
				userId
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

	export let purchaseDatas: DataWithPagination<Purchase>;
	export let purchaseByIdDatas: DataWithPagination<Purchase>;
	export let treeViews: AgentTreeView[];
	export let userId: number;
	export let agentName: string;
	export let status: false;
	export let hidden: string = '' ;
	
	import { authStore, type User } from '$lib/stores/auth';
	console.log($packagesStore);
	console.log($authStore);
	
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

	function reset() {
		formData = {
			agent_id: "",
			packages_id: 1,
			one_time_password: ''
		};
	}

	function show2FA() {
		status = true;
		hidden = "hidden"
	}

	async function onSubmit(event: CustomEvent<object>) {
		// event.preventDefault();
		const user = $authStore
		if (user?.google2fa_secret === null) {
			window.notice({
				text: 'Bạn chưa tạo mã 2FA',
				type: 'danger'
			});
		} else {
			window.openLoading();
			let finalFormData = {
				...formData,
				purchase_date: formatDate(new Date()),
				amount: 1
			}
			
			try {
				await createPurchaseService(finalFormData);
				window.notice({
					text: 'Xuất MAP thành công',
					type: 'success'
				});
			} catch (err) {
				window.notice({
					text: err,
					type: 'danger'
				});
			}
			window.closeLoading();
		}
	}

	async function searchUserName(event: CustomEvent<object>) {
		agentName = "";
		google2FA = "";
		event.preventDefault()
		let nameUserSearch = event.target.value;
		let user = await getUserByUserName(nameUserSearch);
		if (!user) {
			window.notice({
				text: 'Không tìm thấy username',
				type: 'danger'
			});
		}
		let agent = await getAgentsByUserId(user.id);
		formData.agent_id = agent.id;
		agentName = agent.agentname;
			
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
				<form >
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
								<Folder expanded={true} agentTreeViews={treeViews} ref_code={null} />
							</div>
						</div>
						<div class="col-lg-6">
							<div class="row">
								<div class="col-lg-4 ">
									<strong>Username </strong>
								</div>
								<div class="col-lg-8">
									<div class="">
										<BaseInput>
											<input 
												class="form-control" 
												placeholder="Nhập username" 
												on:change="{event => searchUserName(event)}"
											/>
										</BaseInput>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4 ">
									<strong> Họ và tên đại lý </strong>
								</div>
								<div class="col-lg-8">
									<div class="">
										<BaseInput>
											<!-- <select class="form-control" bind:value={formData.agent_id}>
												<option value="">-- Chọn --</option>
												{#each agents || [] as agent}
													<option value={agent.id}>{agent.agentname}</option>
												{/each}	
											</select> -->
											<input 
												class="form-control" 
												placeholder="Họ và tên đại lý" 
												bind:value={agentName}
												disabled
											/>
										</BaseInput>
									</div>
								</div>
							</div>
						</div>

						<div class="col-lg-6">
							<div class="row">
								<div class="col-lg-4 ">
									<strong> Gói đại lý </strong>
								</div>
								<div class="col-lg-8">
									<div class="">
										<BaseInput>
											<select class="form-control" id="exampleFormControlSelect1" bind:value={formData.packages_id}>
												<option value="">-- Chọn --</option>
												{#each $packagesStore || [] as item}
													<option value={item.id}>{item.package_name}</option>
												{/each}
											</select>
										</BaseInput>
									</div>
								</div>
							</div>

							<div class="row">
								<div class="col-lg-4 ">
									<strong> 2FA </strong>
								</div>
								<div class="col-lg-8">
									<div class="">
										<BaseInput placeholder="Nhập code 2FA" bind:value={formData.one_time_password} />
										{#if ($authStore.google2fa_secret === null) || ($authStore.google2fa_secret ==='')}
										<div class='row mt--3'>
											<p class='label-link-2fa text-left col-6'>* Bạn chưa có mã 2FA</p>
											<a href="/admin/profile" class='text-right link-create-2fa col-6'>Tạo mã 2FA ngay</a>
										</div>
										{:else}
										<span on:click={show2FA} {hidden} class="get-image-2fa">Lấy mã 2FA ngay</span>
											{#if (status == true)}
											{@html $authStore.imageQR}
											{/if}
										{/if}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div>
						<div class="text-left" style="float: left" />
						<div class="text-right" style="float: right">
							<button class="btn btn-success" on:click={event => onSubmit(event)}>Xuất map</button>
						</div>
					</div>
				</form>
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
	.label-link-2fa{
		color: red;
		font-style: italic;
	}
	.link-create-2fa{
		text-decoration: underline;
		font-weight: bold;
	}
	.get-image-2fa{
		display: inline-block;
		font-weight: 600;
		text-align: center;
		vertical-align: middle;
		user-select: none;
		border: 1px solid transparent;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		line-height: 1.5;
		border-radius: 0.25rem;
		color: #fff;
		background-color: #2dce89;
		border-color: #2dce89;
		box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
	}
</style>
