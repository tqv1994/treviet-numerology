<script lang="ts">
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import { fade } from 'svelte/transition';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import Flatpickr from 'svelte-flatpickr';
	import { formatDate } from '$lib/helper/datetime';
	import {
		getListFilterDatePurchaseService,
		getListPurchasesService
	} from '$lib/services/purchase.service';
	import type { Purchase } from '$lib/stores/purchase';

	export let keyword: string;
	export let currentPage: number = 1;
	export let props: DataWithPagination<Purchase>;
	export let filter: Record<string, string | number | boolean> = {};
	export let perPage: number = 10;
	export let sort: string = '-id';

	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'user_create',
			label: 'Người chuyển',
			minWidth: 220,
			sortable: false
		},
		{
			prop: 'purchase_date',
			label: 'Ngày',
			minWidth: 135,
			sortable: false
		},
		{
			prop: 'agent_name',
			label: 'Họ và tên',
			minWidth: 220,
			sortable: false
		},
		{
			prop: 'package',
			label: 'Gói',
			minWidth: 100,
			sortable: false
		},
		{
			prop: 'agent_phone',
			label: 'Điện thoại',
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
		// keyword = event.detail;
		// await getData();
	}

	async function getData() {
		window.openLoading();
		props = await getListPurchasesService({
			filter,
			page: currentPage,
			sort,
			perPage
		});
		window.closeLoading();
	}

	async function onChangePerPage(event: CustomEvent<number>){
		perPage = event.detail;
		await getData();
	}
</script>

<div class="content" transition:fade={{ duration: 250 }}>
	<Table
		createLabel="Xuất excel"
		dataWithPagination={props}
		{tableColumns}
		{keyword}
		{sort}
		{perPage}
		navTab
		on:changeCurrentPage={paginationChange}
		on:search={onSearch}
		on:changePerPage={onChangePerPage}
	>
		<div slot="label-search">
			<p class="label-search mt-2 ml-4 mr-4">Tìm kiếm:</p>
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
			{#if cell.key === 'creater_name'}
				{row.user ? row.user.name : ''}
			{:else if cell.key === 'agent_phone'}
				{row.agent ? row.agent.phone : ''}
			{:else if cell.key === 'agent_email'}
				{row.agent ? row.agent.email : ''}
			{:else if cell.key === 'agent_name'}
				{row.agent ? row.agent.agentname : ''}
			{:else if cell.key === 'agent_level'}
				{row.agent ? `Cấp ${row.agent.level}` : ''}
			{:else if cell.key === 'user_create'}
				{row.user_create ? row.user_create.name : ''}
			{:else if cell.key === 'package'}
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
