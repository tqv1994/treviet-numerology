<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		const sort = url.searchParams.get('sort') || '-id';
		const perPage = url.searchParams.get('perPage') || 10;
		let agentDatas: DataWithPagination<Agent> | undefined;
		const res = await fetch(
			`/p/agents/filter?${objectToQueryString({
				filter: { agentname: keyword },
				page: currentPage,
				sort,
				perPage
			})}`
		);

		let treeViews: AgentTreeView[];
		const resTree = await fetch(`/p/tree-view`);

		if (res.ok) {
			const data = await res.json();
			agentDatas = data.results;
			console.log(agentDatas);
		} else {
			const err = await res.json();
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
				agentDatas,
				treeViews,
				sort,
				perPage
			}
		};
	};
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	export let name = 'Quản trị';
	import { onMount } from 'svelte';
	import type { DataWithPagination } from '$lib/stores/type';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { redirect } from '$lib/utils/redirect';
	import Card from '$lib/components/Cards/Card.svelte';
	import type { Agent, AgentTreeView } from '$lib/stores/agent';
	import {
		getListAgentsService,
		getListFilterDateAgentService,
		updateAgentStatus
	} from '$lib/services/agent.service';
	import type { Load } from '@sveltejs/kit';
	import { objectToQueryString } from '$lib/utils/string';
	import Folder from '$lib/components/ABS/Global/SystemTree/Folder.svelte';
	import Flatpickr from 'svelte-flatpickr';
	import { packagesStore } from '$lib/stores/package';
	import { apiUrl } from '$lib/env';

	export let agentDatas: DataWithPagination<Agent>;
	export let treeViews: AgentTreeView[];
	export let keyword: string;
	export let currentPage: number;
	export let sort: string;
	export let perPage: number;
	export let filter: Record<string, string | number | boolean> = {};

	let filterTime = true;
	let packages = $packagesStore;
	let listColor = convertListColor(packages);
	let excelChecked = 'all';
	
	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'username',
			label: 'Username',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'agentname',
			label: 'Họ và tên',
			minWidth: 220,
			sortable: true
		},
		{
			prop: 'created_at',
			label: 'Ngày tham gia',
			minWidth: 135,
			sortable: true
		},
		{
			prop: 'phone',
			label: 'Điện thoại',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'email',
			label: 'Email',
			minWidth: 150,
			sortable: true
		},
		{
			prop: 'email',
			label: 'Cây',
			minWidth: 150,
			sortable: true
		},
		{
			prop: 'status',
			label: 'Trạng thái',
			minWidth: 150,
			sortable: true
		},
		{
			prop: 'action',
			label: 'Hành động',
			minWidth: 150
			// sortable: true
		}
	];

	let dates = {
		simple: new Date(),
		range: '2022-05-22 12:00 to 2022-06-21 12:00'
	};

	const flatpickrOptionsRange = {
		mode: 'range',
		enableTime: true,
		onChange: async (selectedDates: Date, dateStr: string, instance: []) => {
			let keyConnect = ' to ';
			console.log(dateStr);

			if (dateStr.includes(keyConnect)) {
				let listDateStr = dateStr.split(' to ');
				if (listDateStr.length > 1) {
					let fromDate = listDateStr[0];
					let toDate = listDateStr[1];
					filter.from_date = fromDate;
					filter.to_date = toDate;
					await getData();
				}
			}
		}
	};

	async function paginationChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await getData();
	}

	async function onSearch(event: CustomEvent<string>) {
		keyword = event.detail;
		filter.agentname = keyword;
		await getData();
	}

	async function getData() {
		window.openLoading();
		agentDatas = await getListAgentsService({
			filter,
			page: currentPage,
			sort,
			perPage
		});
		window.closeLoading();
	}

	async function updateStatusAgent(agent_id: number) {
		let agent = await updateAgentStatus(agent_id);
		let listAgent = agentDatas.data;
		listAgent = listAgent?.map((item) => {
			if (item.id === agent_id) {
				item.status = agent.status;
			}
			return item;
		});
		agentDatas.data = listAgent;
	}

	async function onChangePerPage(event: CustomEvent<number>) {
		perPage = event.detail;
		await getData();
	}

	async function onSort(event: CustomEvent<string>) {
		sort = event.detail;
		await getData();
	}

	function convertListColor(packages) {
		return packages.map(item => item.color).reverse();
	}

	function onExportExcel() {
		let link = '';
		if (excelChecked === 'all') {
			link = `${apiUrl}/agents/export-excel`
		} else {
			link = `${apiUrl}/agents/export-excel?from_date=${filter.from_date}&to_date=${filter.to_date}`;
		}
		console.log(excelChecked, filter);
		filter.from_date = '';
		filter.to_date = '';
		redirect(link);
	}

	function onChangeRadio(event) {
		excelChecked = event.currentTarget.value;
	}
</script>

<div class="content" transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-2">
		<div class="row align-items-center py-4">
			<div class="col-7 col-lg-6">
				<h6 class="h2 d-inline-block mb-0">{name}</h6>

				<nav
					aria-label="breadcrumb"
					class="d-none d-md-inline-block ml-md-4"
					style="color: #2DCE89"
				>
					<span> - Danh sách đại lý </span>
				</nav>
			</div>
			<div class="col-5 col-lg-6 text-right" />
		</div>
	</BaseHeader>
	<div class="container-fluid">
		<div class="card-wrapper">
			<Card>
				<!-- Card header -->
				<h3 slot="header" class="mb-0">
					Hệ thống đại lý
					<span class=" badge-pill badge-success badge ml-4">Close All</span>
					<span class=" badge-pill badge-success badge">Open All</span>
				</h3>
				<!-- Card body -->
				<div class="mt-3" style="color:mediumvioletred">
					<Folder expanded={false} agentTreeViews={treeViews} ref_code={null} colors={listColor}/>
				</div>
			</Card>
			<!-- Input groups -->
		</div>
	</div>
	<Table
		title="Danh sách đại lý"
		createLabel="Xuất excel"
		filterHeardClass="mt--4 ad-filter"
		classButton="mt-4"
		dataWithPagination={agentDatas}
		{tableColumns}
		{keyword}
		{sort}
		{perPage}
		{filterTime}
		on:changeCurrentPage={paginationChange}
		on:search={onSearch}
		on:changePerPage={onChangePerPage}
		on:sorting={onSort}
		on:create={onExportExcel}
		styleFilter="display: -webkit-inline-box;"
	>
		<div slot="filterRadio" class="mr-5 filter-radio">
			<label class="">
				<input 
					type="radio" 
					name="radio" 
					class="custom-radio" 
					checked={excelChecked==='all'} 
					on:change={onChangeRadio} 
					value="all_agent"
				/>
				<span class="checkmark" />
				Toàn bộ đại lý
			</label>
			<label class="ml-3">
				<input 
					type="radio" 
					name="radio" 
					class="custom-radio" 
					checked={excelChecked==='time'} 
					on:change={onChangeRadio} 
					value="time"
				/>
				<span class="checkmark" />
				Theo thời gian
			</label>
		</div>
		<div slot="filterTime" class="filterHeard">
			<div class="row form-group mb--3" style="margin-bottom:0px;margin-left: -5px">
				<p class="search-datetime">Từ</p>
				<div class="col-md-9 width-date-picker">
					<BaseInput>
						<Flatpickr
							options={flatpickrOptionsRange}
							class="form-control datepicker bg-white"
							defaultDate={dates.range}
							placeholder={dates.range}
							dateFormat="Y-m-d"
						/>
					</BaseInput>
				</div>
				<div class="col-md-3" />
			</div>
		</div>
		<div slot="cell" let:row let:cell>
			{#if cell.key === 'username'}
				{row.user ? row.user.name : ''}
			{:else if cell.key === 'action'}
				<span
					class={`badge-pill badge-success badge btn-active ${
						row.status === 'Chưa duyệt' ? 'not-active' : ''
					}`}
					on:click={updateStatusAgent(row.id)}
				>
					Active
				</span>
			{:else}
				{cell.value}
			{/if}
		</div>
	</Table>
</div>

<style>
	.ad-filter {
		display: -webkit-inline-box;
	}
	.filter-radio {
		margin-top: 35px;
		margin-right: 50px;
	}
	.custom-radio {
		margin-right: 10px;
	}

	.width-date-picker {
		width: 355px;
		margin-top: 25px;
	}

	.search-datetime {
		margin-top: 34px;
	}

	.btn-active {
		cursor: pointer;
	}

	.not-active {
		background: #cecece;
		color: #000;
	}
</style>
