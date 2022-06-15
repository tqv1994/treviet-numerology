<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		let reportDatas: DataWithPagination<Report> | undefined;
		const res = await fetch(
			`/p/reports?${objectToQueryString({ keyword, page: currentPage, sort: 'id' })}`
		);
		if (res.ok) {
			const data = await res.json();
			reportDatas = data.results;
		} else {
			const err = await res.json();
			console.error(err);
		}

		return {
			props: {
				keyword,
				currentPage,
				reportDatas
			}
		};
	};
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	export let name = 'Xuất MAP';
	import { onMount } from 'svelte';
	import {
		getListFilterDateReportService,
		getListReportsService
	} from '$lib/services/report.service';
	import type { DataWithPagination } from '$lib/stores/type';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import type { Load } from '@sveltejs/kit';
	import { objectToQueryString } from '$lib/utils/string';
	import Flatpickr from 'svelte-flatpickr';
	import type { Report } from '$lib/stores/report';
	import { formatDate } from '$lib/helper/datetime';
	import { apiUrl } from '$lib/env';
import { redirect } from '$lib/components/redirect.svelte';

	export let reportDatas: DataWithPagination<Report>;
	export let keyword: string;
	export let currentPage: number;
	
  let filterTime = true;
	const flatpickrOptionsRange = {
		mode: 'range',
		enableTime: true,
		onChange: (selectedDates: Date, dateStr: string, instance: []) => {
			let keyConnect = ' to ';
			if (dateStr.includes(keyConnect)) {
				let listDateStr = dateStr.split(' to ');
				let fromDate = listDateStr[0];
				let toDate = listDateStr[1];
				getFilterDateData(fromDate, toDate);
			}
		}
	};

	let dates = {
		simple: new Date(),
		range: '2022-05-22 12:00 to 2022-06-21 12:00'
	};

	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'agent.agentname',
			label: 'Đại lý',
			minWidth: 135,
			sortable: true
		},
		{
			prop: 'created_at',
			label: 'Ngày',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'agent.sex',
			label: 'Giới tính',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'name',
			label: 'Họ và tên',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'agent.phone',
			label: 'Điện thoại',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'agent.email',
			label: 'Email',
			minWidth: 150,
			sortable: true
		},
		{
			prop: 'report_link',
			label: 'Report link',
			minWidth: 150,
			sortable: true
		}
	];

	async function paginationChange(event: CustomEvent<number>) {
		currentPage = event.detail;
		await getData();
	}

	async function onSearch(event: CustomEvent<string>) {
		keyword = event.detail;
		await getData();
	}

	async function getData() {
		window.openLoading();
		reportDatas = await getListReportsService({
			keyword,
			page: currentPage
		});
		window.closeLoading();
	}

	async function getFilterDateData(from_date: string, to_date: string) {
		window.openLoading();
		reportDatas = await getListFilterDateReportService(from_date, to_date);
		window.closeLoading();
	}

  function onExportExcel() {
		let link = `${apiUrl}/purchases/export-excel`;
		redirect(link);
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
					<span> - Lịch sử xuất MAP </span>
				</nav>
			</div>
			<div class="col-5 col-lg-6 text-right" />
		</div>
	</BaseHeader>
	<Table
		title="Lịch sử xuất MAP"
		createLabel="Xuất excel"
		filterHeardClass="mt--4 ad-filter"
		classButton="mt-4"
		dataWithPagination={reportDatas}
		{tableColumns}
		{keyword}
		{filterTime}
		on:changeCurrentPage={paginationChange}
		on:search={onSearch}
    on:create={onExportExcel}
		styleFilter=""
	>
		<!-- <div slot="filterHeard">
  
        </div> -->

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
			{#if cell.key === 'agent_id'}
				{row.agent ? row.agent.agentname : ''}
			{:else if cell.key === 'agent.agentname'}
				{row.agent ? row.agent.agentname : ''}
			{:else if cell.key === 'agent.phone'}
				{row.agent ? row.agent.phone : ''}
			{:else if cell.key === 'agent.email'}
				{row.agent ? row.agent.email : ''}
			{:else if cell.key === 'agent.sex'}
				{row.agent ? row.agent.sex : ''}
			{:else if cell.key === 'created_at'}
				{formatDate(new Date(row.created_at))}
			{:else if cell.key === 'report_link'}
				{#if row.report_link === null}
					Đang xử lý
				{:else}
					<a href={`${apiUrl}${row.report_link}`}>Link PDF</a>
				{/if}
			{:else}
				{cell.value}
			{/if}
		</div>
	</Table>
</div>

<style>
	.filter-form-content {
		display: flex;
	}

	.width-date-picker {
		min-width: 302px;
	}
	.filter-radio {
		margin-top: 40px;
		margin-right: 50px;
	}
	.custom-radio {
		margin-right: 10px;
	}
	.custom-label-checkbox::before {
		color: white;
		background-color: green;
	}
	.custom-radio:checked {
		color: green;
		background-color: green;
	}

	.search-datetime {
		margin-top: 10px;
	}
</style>
