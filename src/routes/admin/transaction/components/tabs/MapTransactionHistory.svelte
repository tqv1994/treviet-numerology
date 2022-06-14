<script lang="ts">
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { fade } from 'svelte/transition';
	import { getListFilterDatePurchaseService, getListPurchasesService } from '$lib/services/purchase.service';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import Flatpickr from 'svelte-flatpickr';
	import { formatDate } from '$lib/helper/datetime';
	import type { Purchase } from '$lib/stores/purchase';

	export let keyword: string;
	export let currentPage: number = 1;
	export let props: any;
	export let listPurchase: DataWithPagination<Purchase> = props.purchaseByIdDatas;
	export let userId: number = props.userId;
	export let perPage: number = 10;
	export let sort: string = "-id";
	export let filter: Record<string, string | number | boolean> = {};

	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'purchase_date',
			label: 'Ngày',
			minWidth: 220,
			sortable: true
		},
		{
			prop: 'agent_agentname',
			label: 'Người nhận',
			minWidth: 135,
			sortable: false
		},
		{
			prop: 'package_name',
			label: 'Tên gói',
			minWidth: 100,
			sortable: false
		},
		{
			prop: 'agent_level',
			label: 'Đại lý',
			minWidth: 100,
			sortable: false
		},
		{
			prop: 'agent_email',
			label: 'Email',
			minWidth: 150,
			sortable: false
		},
		{
			prop: 'agent_phone',
			label: 'Điện thoại',
			minWidth: 100,
			sortable: false
		},
	];

	let dates = {
		simple: new Date(),
		range: '2022-05-22 12:00 to 2022-06-21 12:00'
	};

	const flatpickrOptionsRange = {
		mode: 'range',
		enableTime: true,
		onChange: async(selectedDates: Date, dateStr: string, instance: []) => {
			let keyConnect = ' to ';
			if (dateStr.includes(keyConnect)) {
				let listDateStr = dateStr.split(' to ');
				if(listDateStr.length > 1){
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
		// keyword = event.detail;
		// await getData();
	}

	async function getData() {
		filter.create_user_id = userId;
		window.openLoading();
		listPurchase = await getListPurchasesService({
			page: currentPage,
			filter,
			perPage,
			sort
		});
		window.closeLoading();
	}

	async function onChangePerPage(event: CustomEvent<number>){
		perPage = event.detail;
		await getData();
	}

	async function onSort(event: CustomEvent<string>){
		sort = event.detail;
		await getData();
	}
</script>

<div class="content" transition:fade={{ duration: 250 }}>
	<Table
		createLabel="Xuất excel"
		dataWithPagination={listPurchase}
		{tableColumns}
		{keyword}
		{sort}
		{perPage}
		navTab
		on:changeCurrentPage={paginationChange}
		on:search={onSearch}
		on:changePerPage={onChangePerPage}
		on:sorting={onSort}
	>	
		<div slot="label-search">
			<p class="label-search mt-2 ml-4 mr-4">Search:</p>
		</div>
		<div slot="filter-form-content" class="filter-form-content">
			<div class="row form-group">
				<p class="search-datetime mt-2">Từ:</p>
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
			</div>
		</div>
		<div slot="cell" let:row let:cell>
			{#if cell.key === 'agent_sex'}
				{row.agent ? row.agent.sex : ''}
			{:else if cell.key === 'agent_agentname'}
				{row.agent ? row.agent.agentname : ''}
			{:else if cell.key === 'agent_phone'}
				{row.agent ? row.agent.phone : ''}
			{:else if cell.key === 'agent_email'}
				{row.agent ? row.agent.email : ''}
			{:else if cell.key === 'agent_level'}
				{row.agent ? `Cấp ${row.agent.level}` : ''}
			{:else if cell.key === 'package_name'}
				{row.purchase_details ? row.purchase_details[0].package.package_name : ''}
			{:else}
				{cell.value}
			{/if}
		</div>
	</Table>
</div>

<style lang="scss">
	.filter-form-content {
		display: flex;
	}

	.width-date-picker {
		min-width: 302px;
	}
</style>
