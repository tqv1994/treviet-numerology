<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { pget } from '$lib/utils/fetch';
	import { objectToQueryString } from '$lib/utils/string';
	import { authStore } from '$lib/stores/auth';
	import { formatDate } from '$lib/helper/datetime';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
  import type { Purchase } from '$lib/stores/purchase';

	export let receiveDatas: DataWithPagination<Purchase>;
	export let keyword: string;
	export let currentPage: number;

	let sort: string = '-id';
	let perPage: number = 10;

	onMount(async () => {
		await getData();
	});

	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'transfer_date',
			label: 'Ngày',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'receive_sex',
			label: 'Giới tính',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'receive_name',
			label: 'Họ và tên',
			minWidth: 135,
			sortable: true
		},
		{
			prop: 'package_name',
			label: 'Tên gói',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'receive_phone',
			label: 'Điện thoại',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'receive_email',
			label: 'Email',
			minWidth: 150,
			sortable: true
		}
	];

	export async function getData() {
		const res = await pget(
			`purchases/${$authStore?.id}/purchases?${objectToQueryString({
				sort,
				perPage
			})}`
		);
		if (res.ok) {
			const data = await res.json();
			receiveDatas = data.results;
			console.log(receiveDatas);
			
		}
	}
	async function onChangePerPage(event: CustomEvent<number>) {
		perPage = event.detail;
		await getData();
	}

	async function onSort(event: CustomEvent<string>) {
		sort = event.detail;
		await getData();
	}

	async function onSearch(event: CustomEvent<string>) {
		sort = event.detail;
		await getData();
	}

	async function paginationChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await getData();
	}
</script>

<div class="content mt--6" transition:fade={{ duration: 250 }}>
	<Table
		createLabel="Xuất excel"
		dataWithPagination={receiveDatas}
		{tableColumns}
		{keyword}
		navTab
		on:changeCurrentPage={paginationChange}
		on:changePerPage={onChangePerPage}
		on:search={onSearch}
		on:sort={onSort}
	>
		<div slot="label-search">
			<p class="label-search mt-2 ml-4 mr-4">Search:</p>
		</div>
		<div slot="filter-form-content" class="filter-form-content">
			<div class="row form-group">
				<p class="search-datetime mt-2">Từ:</p>
				<div class="col-md-9">
					<BaseInput
						type="datetime-local"
						value="2018-11-23T10:30:00"
						id="example-datetime-local-input"
						inputClasses="form-control datetime-input"
						styleInput="width:200px"
					/>
				</div>
			</div>

			<div class="row form-group" style="margin-left: 25px">
				<p class="search-datetime mt-2">Đến:</p>
				<div class="col-md-9">
					<BaseInput
						type="datetime-local"
						value="2018-11-23T10:30:00"
						id="example-datetime-local-input"
						inputClasses="form-control datetime-input"
						styleInput="width:200px"
					/>
				</div>
			</div>
		</div>
		<div slot="cell" let:row let:cell>
			{#if cell.key === 'transfer_date'}
				{row.transfer_date ? row.transfer_date : ''}
			{:else if cell.key === 'receive_sex'}
				{row.agent_receive ? row.agent_receive.sex : '' }
			{:else if cell.key === 'receive_name'} 
				{row.agent_receive ? row.agent_receive.agentname : '' }
			{:else if cell.key === 'package_name'} 
				{row.transfer_details[0].package ? row.transfer_details[0].package.package_name : '' }
			{:else if cell.key === 'receive_phone'} 
				{row.agent_receive ? row.agent_receive.phone : '' }
			{:else if cell.key === 'receive_email'} 
				{row.agent_receive ? row.agent_receive.email : '' }
			{:else}
				{cell.value}
			{/if}
		</div>
	</Table>
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
