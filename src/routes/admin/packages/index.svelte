<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		const sort = url.searchParams.get('sort') || "-id";
		const perPage = url.searchParams.get('perPage') || 10;
		let packageDatas: DataWithPagination<Package> | undefined;
		const res = await fetch(
			`/p/packages/filter?${objectToQueryString({
				filter: { package_name: keyword },
				page: currentPage,
				sort,
				perPage
			})}`
		);
		if (res.ok) {
			const data = await res.json();
			packageDatas = data.results;
		} else {
			const err = await res.json();
			console.error(err);
		}

		return {
			props: {
				keyword,
				currentPage,
				packageDatas,
				sort,
				perPage
			}
		};
	};
</script>

<script lang="ts">
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Table from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import 'flatpickr/dist/flatpickr.css';
	import 'flatpickr/dist/themes/light.css';
	import type { Package, PackageFormData } from '$lib/stores/package';
	import type { Load } from '@sveltejs/kit';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import { fade } from 'svelte/transition';
	import { getListPackagesService } from '$lib/services/package.service';
	import { objectToQueryString } from '$lib/utils/string';
	import { redirectAdmin } from '$lib/components/redirect.svelte';

	export let packageDatas: DataWithPagination<Package> | undefined;
	export let keyword: string;
	export let currentPage: number;
	export let name = 'QUẢN TRỊ';
	export let sort: string;
	export let perPage: number;
	export let filter: Record<string, string | number | boolean> = {};

	let formData: PackageFormData;

	let suffix = false;

	function onEdit(Package: Package) {
		console.log(Package);
		redirectAdmin(`/packages/update/${Package.id}`);
	}

	let tableColumns: TableColumn[] = [
		{
			prop: 'package_name',
			label: 'Tên gói',
			minWidth: 160,
			sortable: true
		},
		{
			prop: 'amount',
			label: 'Số lượng bài',
			minWidth: 220,
			sortable: true
		},
		{
			prop: 'expiry_time',
			label: 'Thời hạn',
			minWidth: 135,
			sortable: true
		},
		{
			prop: 'actions',
			label: 'Hành động',
			minWidth: 100,
			sortable: false
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
		packageDatas = await getListPackagesService({
			filter: {
				package_name: keyword
			},
			page: currentPage,
			sort,
			perPage
		});
		window.closeLoading();
	}

	async function onChangePerPage(event: CustomEvent<number>) {
		perPage = event.detail;
		await getData();
	}

	async function onSort(event: CustomEvent<string>) {
		sort = event.detail;
		await getData();
	}
</script>

<div transition:fade={{ duration: 250 }}>
	<BaseHeader>
		<div class="row align-items-center py-4">
			<div class="col-lg-6 col-7">
				<h6 class="h2 d-inline-block mb-0">{name}</h6>
				<nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
					<span style="color:#2DCE89"> - Danh sách gói</span>
				</nav>
			</div>
			<div class="col-lg-6 col-5 text-right" />
		</div>
	</BaseHeader>

	<div>
		<div class="row">
			<div class="col-lg-6">
				<div class="card-wrapper">
					<!-- Input groups -->
					<Table
						title="Danh sách gói"
						dataWithPagination={packageDatas}
						{tableColumns}
						{keyword}
						{perPage}
						{sort}
						on:changeCurrentPage={paginationChange}
						on:sorting={onSort}
						on:changePerPage={onChangePerPage}
						on:search={onSearch}
					>
						<div slot="cell" let:row let:cell>
							{#if cell.key === 'actions'}
								<div class="d-inline" style="color:#000">
									<a
										href="#!"
										on:click={() => onEdit(row)}
										class="table-action"
										data-original-title="Sửa nhóm"
										data-toggle="tooltip"
										data-placement="top"
										title="Sửa"
									>
										<i class="fas fa-edit" style="color:#2dce89" />
									</a>
								</div>
							{:else if cell.key === 'package_name'}
								<b style={`color: #${row.color}`}>{cell.value}</b>
							{:else if cell.key === 'amount'}
								{`${cell.value} bài`}
							{:else if cell.key === 'expiry_time'}
								{`${cell.value} năm`}
							{:else}
								{cell.value}
							{/if}
						</div>
					</Table>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="card-wrapper" />
			</div>
		</div>
	</div>
</div>
