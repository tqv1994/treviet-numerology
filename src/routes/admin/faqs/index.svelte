<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const keyword = url.searchParams.get('keyword') || '';
		const currentPage = url.searchParams.get('page') || 1;
		const sort = url.searchParams.get('sort') || '-id';
		const perPage = url.searchParams.get('perPage') || 10;
		let faqsDatas: DataWithPagination<Faq> | undefined;

		const res = await fetch(
			`/p/faqs/filter?${objectToQueryString({
				filter: { question: keyword },
				page: currentPage,
				sort,
				perPage
			})}`
		);
		if (res.ok) {
			const data = await res.json();
			faqsDatas = data.results;
		} else {
			const err = await res.json();
			console.error(err);
		}

		return {
			props: {
				keyword,
				currentPage,
				faqsDatas,
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
	import type { Faq, FaqsFormData } from '$lib/stores/faq';
	import type { Load } from '@sveltejs/kit';
	import type { DataWithPagination } from '$lib/stores/type';
	import type { TableColumn } from '$lib/components/ABS/Global/Datatable/Table.svelte';
	import { fade } from 'svelte/transition';
	import { getListFaqsService } from '$lib/services/faqs.service';
	import { objectToQueryString } from '$lib/utils/string';
	import { redirectAdmin } from '$lib/components/redirect.svelte';

	export let faqsDatas: DataWithPagination<Faq> | undefined;
	export let keyword: string;
	export let currentPage: number;
	export let name = 'FAQs';
	export let sort: string;
	export let perPage: number;

	let formData: FaqsFormData;

	let suffix = false;

	function onEdit(faq: Faq) {
		redirectAdmin(`/faqs/update/${faq.id}`);
	}

	let tableColumns: TableColumn[] = [
		{
			prop: 'question',
			label: 'Câu hỏi',
			minWidth: 160,
			position: 'text-align: center;',
			sortable: true
		},
		{
			prop: 'answer',
			label: 'Câu trả lời',
			minWidth: 220,
			position: 'text-align: center;',
			sortable: true
		},
		{
			prop: 'actions',
			label: 'Hành động',
			minWidth: 100,
			position: 'text-align: center;',
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
		faqsDatas = await getListFaqsService({
			filter: { question: keyword },
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

	async function onSort(event: CustomEvent<string>){
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
					<span style="color:#2DCE89"> - Danh sách FAQs</span>
				</nav>
			</div>
			<div class="col-lg-6 col-5 text-right">
				<button class="btn btn-success mt-4 s-oXUrrgDkZpjO">
					<a href="/admin/faqs/create" style="color:white">Thêm mới FAQS</a></button
				>
			</div>
		</div>
	</BaseHeader>
	<div>
		<div class="row">
			<div class="card-wrapper">
				<!-- Input groups -->
				<Table
					title="Danh sách FAQs"
					dataWithPagination={faqsDatas}
					{tableColumns}
					{keyword}
					{sort}
					{perPage}
					on:changePerPage={onChangePerPage}
					on:sorting={onSort}
					on:changeCurrentPage={paginationChange}
					on:search={onSearch}
				>
					<div slot="cell" let:row let:cell class="d-flex justify-content-center">
						{#if cell.key === 'actions'}
							<div class="d-inline" style="color:#000;">
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
	</div>
</div>
