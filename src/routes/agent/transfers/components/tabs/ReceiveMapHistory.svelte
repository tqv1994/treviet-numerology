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
import { apiUrl } from '$lib/env';
import { redirect } from '$lib/components/redirect.svelte';
import Flatpickr from 'svelte-flatpickr';
import DatePickerRanger from '$lib/components/ABS/Form/DatePickerRanger.svelte';

	export let receiveDatas: DataWithPagination<Purchase>;
  	export let keyword: string;
	export let currentPage: number;
	export let props: any;
	export let filter: Record<string, string | number | boolean> = {};
	
	let sort: string = '-id';
	let perPage: number = 10;
	let agenId: number = props.myAgent.id;
	let excelChecked = 'all';
	
	onMount(async () => {
		await getData();
	});

	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'purchase_date',
			label: 'Ngày',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'user_sex',
			label: 'Giới tính',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'user_name',
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
			prop: 'user_phone',
			label: 'Điện thoại',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'user_email',
			label: 'Email',
			minWidth: 150,
			sortable: true
		}
	];

	let dates = {
		simple: new Date(),
		range: '2022-05-22 12:00 to 2022-06-21 12:00'
	};

	async function onChangeFilterDate(event: CustomEvent<[Date[], string]>) {
		if (event.detail[1]) {
			if (event.detail[1].includes(' đến ')) {
				let listDateStr = event.detail[1].split(' đến ');
				if (listDateStr.length > 1) {
					let fromDate = listDateStr[0];
					let toDate = listDateStr[1];
					filter.from_date = fromDate;
					filter.to_date = toDate;
					await getData();
				}
			}
		}
	}

	export async function getData() {
		let url = `purchases/filter?filter[agent_id]=${agenId}`
		if (filter.from_date && filter.to_date) {
			url += `&filter[from_date]=${filter.from_date}&filter[to_date]=${filter.to_date}`
		}
		const res = await pget(
			`${url}&${objectToQueryString({
				sort,
				perPage,
				page: currentPage
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

	function onExportExcel() {
		let link = `${apiUrl}/purchases/export-excel?agent_id=${agenId}from_date=${filter.from_date}&to_date=${filter.to_date}`;
		console.log(excelChecked, filter);
		filter.from_date = '';
		filter.to_date = '';
		redirect(link);
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
		on:create={onExportExcel}
	>
		<div slot="label-search">	
			<p class="label-search mt-2 ml-4 mr-4">Search:</p>
		</div>
		<div slot="filter-form-content" class="filter-form-content">
			<div class="row form-group">
				<p class="search-datetime mt-2">Từ:</p>
				<div class="col-md-9 width-date-picker">
					<BaseInput>
						<DatePickerRanger value={undefined} on:change={onChangeFilterDate} />
					</BaseInput>
				</div>
			</div>
		</div>
		<div slot="cell" let:row let:cell>
			{#if cell.key === 'user_sex'}
				{row.user_create.user_detail ? row.user_create.user_detail.sex : '' }
			{:else if cell.key === 'user_name'} 
				{row.user_create.user_detail ? `${row.user_create.user_detail.last_name} ${row.user_create.user_detail.first_name}` : '' }
			{:else if cell.key === 'package_name'} 
				{row.purchase_details[0].package ? row.purchase_details[0].package.package_name : '' }
			{:else if cell.key === 'user_phone'} 
				{row.user_create.user_detail ? row.user_create.user_detail.phone : '' }
			{:else if cell.key === 'user_email'} 
				{row.user_create ? row.user_create.email : '' }
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

	.width-date-picker {
		width: 384px;
	}
</style>
