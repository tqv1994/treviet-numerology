<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		const perPage = url.searchParams.get('perPage') || 10;
		let reportDatas: DataWithPagination<Report>;
		const res = await fetch(
			`/p/reports/filter?${objectToQueryString({ sort: `-id`, page: currentPage, perPage })}`
		);
		if (res.ok) {
			const data = await res.json();
			console.log(data);
			reportDatas = data.results;
		} else {
			const err = await res.json();
			console.error(err);
		}

		return {
			props: {
				keyword,
				currentPage,
				reportDatas,
				perPage
			}
		};
	};
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import { onMount } from 'svelte';
	import { getReportStatusItems, REPORT_STATUS, type Report } from '$lib/stores/report';
	import { getListReportsService } from '$lib/services/report.service';
	import type { DataWithPagination } from '$lib/stores/type';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import type { Load } from '@sveltejs/kit';
	import { apiUrl, appName } from '$lib/env';
	import { redirect } from '$lib/components/redirect.svelte';
	import { objectToQueryString } from '$lib/utils/string';
	import Cell from '$lib/components/ABS/Global/Datatable/Cell.svelte';
	import { formatDate } from '$lib/utils/datetime';
	import Badge from '$lib/components/Badge.svelte';
	import { getImage } from '$lib/utils/image';
	import { pget } from '$lib/utils/fetch';
	import { getErrorMessage } from '$lib/utils/response';
	export let reportDatas: DataWithPagination<Report>;
	export let keyword: string;
	export let currentPage: number;
	export let sort: string = '-id';
	export let perPage: number;
	onMount(async () => {});
	let tableColumns: TableColumn[] = [
		{
			type: 'selection'
		},
		{
			prop: 'created_at',
			label: 'Ngày',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'agent_id',
			label: 'Đại lý',
			minWidth: 220,
			sortable: true
		},
		{
			prop: 'name',
			label: 'Họ và tên',
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
			prop: 'status',
			label: 'Trạng thái',
			minWidth: 100,
			sortable: true
		},
		{
			prop: 'action',
			label: 'Hành động',
			minWidth: 100,
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

	async function onCreate() {
		redirect('/agent/reports/create');
	}

	async function getData() {
		window.openLoading();
		reportDatas = await getListReportsService({
			filter: {
				name: keyword
			},
			sort,
			page: currentPage,
			perPage
		});
		window.closeLoading();
	}

	async function onSort(event: CustomEvent<string>) {
		sort = event.detail;
		await getData();
	}

	async function onChangePerPage(event: CustomEvent<number>) {
		perPage = event.detail;
		await getData();
	}

	async function createReReport(report: Report) {
		window.openLoading();
		const rest = await pget(`reports/re-create/${report.id}`);
		if (rest.ok) {
			window.notice({
				text: `Tạo lại báo cáo cho ${report.name} thành công`,
				type: 'success'
			});
			const data = await rest.json();
			if (reportDatas && data.result) {
				reportDatas.data = reportDatas.data?.map((item) => {
					if(item.id.toString() === report.id.toString()){
						item.report_link = data.result.report_link;
					}
					return item;
				});
			}
		} else {
			const error = await rest.json();
			window.notice({
				text: getErrorMessage(error.errors),
				type: 'danger'
			});
		}
		window.closeLoading();
	}
</script>

<svelte:head>
	<title>{appName || ''} - Đại lý - Danh sách báo cáo</title>
</svelte:head>
<div class="content" transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center py-4">
			<div class="col-7 col-lg-6">
				<h6 class="h2 d-inline-block mb-0">Đại lý</h6>
				<nav
					aria-label="breadcrumb"
					class="d-none d-md-inline-block ml-md-4"
					style="color: #2DCE89"
				>
					<span> - Danh sách báo cáo </span>
				</nav>
			</div>
			<div class="col-5 col-lg-6 text-right" />
		</div>
	</BaseHeader>
	<Table
		title="Danh sách báo cáo"
		createLabel="Tạo mới báo cáo"
		dataWithPagination={reportDatas}
		{tableColumns}
		{keyword}
		{sort}
		on:sorting={onSort}
		on:create={onCreate}
		on:changeCurrentPage={paginationChange}
		on:search={onSearch}
		on:changePerPage={onChangePerPage}
	>
		<div slot="cell" let:row let:cell>
			{#if cell.key === 'agent_id'}
				{row.agent ? row.agent.agentname : ''}
			{:else if cell.key === 'created_at'}
				{cell.value ? formatDate(cell.value, 'dd/mm/yyyy') : ''}
			{:else if cell.key === 'status'}
				<Badge className="badge-dot mr-4">
					<i class={`bg-${cell.value === REPORT_STATUS ? 'success' : 'danger'}`} />
					<span class="status">{getReportStatusItems(cell.value)}</span>
				</Badge>
			{:else if cell.key === 'action'}
				{#if row.report_link}
					<a
						href={getImage(row.report_link)}
						class="btn btn-success btn-sm"
						data-toggle="tooltip"
						data-placement="top"
						title="Tải file pdf"
						data-original-title="Tải file pdf"><i class="ni ni-cloud-download-95" /></a
					>
				{:else}
					<button
						disabled
						class="btn btn-default btn-sm"
						data-toggle="tooltip"
						data-placement="top"
						title="File pdf chưa khả dụng để tải"
						data-original-title="File pdf chưa khả dụng để tải"
						><i class="ni ni-cloud-download-95" /></button
					>
				{/if}
				<button
					on:click={() => {
						createReReport(row);
					}}
					class="btn btn-warning btn-sm"
					data-toggle="tooltip"
					data-placement="top"
					title="Tạo lại báo cáo"
					data-original-title="Tạo lại báo cáo"><i class="ni ni-curved-next" /></button
				>
			{:else}
				{cell.value}
			{/if}
		</div>
	</Table>
</div>
