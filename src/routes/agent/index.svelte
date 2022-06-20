<script lang="ts" context="module">
	export const load: Load = async ({ fetch,session }) => {
	
	let thisUserId = session.user.id;

	let packageDatas: DataTableAgenctLevel[] | undefined;
	let treeViews: DataTableAgentList[];
    let revenueDatas:[];
	let resRevenuePersonalDatas:[];
	const res = await fetch(`/p/packages`);
	const resTree = await fetch(`/p/tree-view`);
    const resRevenue = await fetch(`/p/revenue-month`);
	const resRevenuePersonal = await fetch(`/p/revenue/${thisUserId}`);
	
    

	if (resRevenuePersonal.ok) {
      const data = await resRevenuePersonal.json();
      resRevenuePersonalDatas = data;
	  console.log("data",resRevenuePersonalDatas.revenue);
    } 
    

    if (resRevenue.ok) {
      const data = await resRevenue.json();
      revenueDatas = data.results;
    } 
    else {
      const err = await resRevenue.json();
      console.error(err);
    }

    if (resTree.ok) {
      const data = await resTree.json();
      treeViews = data.results;
    } 
    else {
      const err = await resTree.json();
      console.error(err);
    }
		
	if (res.ok) {
		const data = await res.json();
		
		packageDatas = data.results.data;
	} else {
		const err = await res.json();
		console.error(err);
	}
	return {
		props: {
			packageDatas,
			treeViews,
			revenueDatas,
			resRevenuePersonalDatas
		}
	};
};

	
</script>

<script lang="ts">
	import { fade } from 'svelte/transition';
	// Components
	import RouteBreadCrumb from '$lib/components/Breadcrumb/RouteBreadcrumb.svelte';
	import StatsCard from '$lib/components/Cards/StatsCard.svelte';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	// Tables
	export let name = 'Trang chủ';
	import { onMount } from 'svelte';
	import AgentList from '$lib/components/ABS/Agent/AgentList.svelte';
	import type { DataTableAgentList } from '$lib/components/ABS/Agent/AgentList.svelte';
	import AgentLevelTable from '$lib/components/ABS/Agent/AgentLevelTable.svelte';
	import type { DataTableAgenctLevel } from '$lib/components/ABS/Agent/AgentLevelTable.svelte';
	import type { Load } from '@sveltejs/kit';
	import { getMyAgent } from '$lib/utils/user';
	import type { Agent, AgentTreeView } from '$lib/stores/agent';
import { packagesAllStore } from '$lib/stores/package';
	export let myAgent: Agent;
	export let role: string;

	export let revenueDatas: [];
	export let resRevenuePersonalDatas:[];
	export let treeViews: DataTableAgentList[] = [];
	export let packageDatas: DataTableAgenctLevel[];

	export let sumAgent = treeViews.length;

	let sum = 0;
    for (let i = 0; i < revenueDatas.length; i++) {
      sum += revenueDatas[i].revenue;
    }
	let sumRevenueAgent = sum;

	onMount(function () {});

	let line = '';

	let bigLineChart = {
		activeIndex: 0,
		monthdata: {
			chart: {
				showValues: '0',
				theme: 'candy'
			},
			colorrange: {
				minvalue: '0',
				code: '#5E72E4',
				gradient: '1',
				color: [
					{
						minvalue: '0',
						maxvalue: '70',
						color: '#5E72E4'
					}
				]
			},
			data: [
				{
					label: 'May',
					value: '0'
				},
				{
					label: 'Jun',
					value: '20'
				},
				{
					label: 'Jul',
					value: '10'
				},
				{
					label: 'Aug',
					value: '30'
				},
				{
					label: 'Sep',
					value: '15'
				},
				{
					label: 'Oct',
					value: '40'
				},
				{
					label: 'Nov',
					value: '20'
				},
				{
					label: 'Dec',
					value: '60'
				}
			]
		},
		weekdata: {
			chart: {
				showValues: '0',
				theme: 'candy'
			},
			colorrange: {
				minvalue: '0',
				code: '#5E72E4',
				gradient: '1',
				color: [
					{
						minvalue: '0',
						maxvalue: '70',
						color: '#5E72E4'
					}
				]
			},
			data: [
				{
					label: 'May',
					value: '0'
				},
				{
					label: 'Jun',
					value: '20'
				},
				{
					label: 'Jul',
					value: '5'
				},
				{
					label: 'Aug',
					value: '25'
				},
				{
					label: 'Sep',
					value: '10'
				},
				{
					label: 'Oct',
					value: '30'
				},
				{
					label: 'Nov',
					value: '15'
				},
				{
					label: 'Dec',
					value: '40'
				}
			]
		},
		barData: {
			chart: {
				theme: 'fusion'
			},
			data: [
				{
					label: 'Jul',
					value: '25',
					color: '#FB6340'
				},
				{
					label: 'Aug',
					value: '20',
					color: '#FB6340'
				},
				{
					label: 'Sep',
					value: '30',
					color: '#FB6340'
				},
				{
					label: 'Oct',
					value: '22',
					color: '#FB6340'
				},
				{
					label: 'Nov',
					value: '17',
					color: '#FB6340'
				},
				{
					label: 'Dec',
					value: '19',
					color: '#FB6340'
				}
			]
		}
	};

	line = bigLineChart.monthdata;

	let lineChartConfig = {
		type: 'spline',
		width: '100%',
		height: '370',
		renderAt: 'chart-container',
		dataSource: line
	};

	let barChartConfig = {
		type: 'column2d',
		width: '100%',
		height: '370',
		renderAt: 'chart-container',
		dataSource: bigLineChart.barData
	};

	const updateChart = (index) => {
		if (index === 0) {
			line = bigLineChart.monthdata;
			bigLineChart.activeIndex = 1;
		} else {
			line = bigLineChart.weekdata;
			bigLineChart.activeIndex = 0;
		}

		lineChartConfig = {
			type: 'spline',
			width: '1000',
			height: '370',
			renderAt: 'chart-container',
			dataSource: line
		};
	};
</script>

<div transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center py-4">
			<div class="col-lg-6 col-7">
				<h6 class="h2 text-black d-inline-block mb-0">Đại lý</h6>
				<nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
					<RouteBreadCrumb {name} />
				</nav>
			</div>
		</div>
		<!-- Card stats -->
		<div class="row">
			<div class="col-xl-3 col-md-6">
				<StatsCard
					title="Doanh số cá nhân tháng"
					type="gradient-info"
					subTitle="{resRevenuePersonalDatas.revenue}"
					icon="ni ni-chart-bar-32"
					bodyClasses="bg-revenue"
				>
					<div slot="footer">
						<span class="text-dank mr-2"> Chi tiết </span>
					</div>
				</StatsCard>
			</div>
			<div class="col-xl-3 col-md-6">
				<StatsCard
					title="Doanh số đại lý tháng"
					type="gradient-info"
					subTitle={sumRevenueAgent}
					icon="ni ni-chart-bar-32"
					bodyClasses="bg-revenue-agent"
				>
					<div slot="footer">
						<span class="text-dank mr-2"> Chi tiết </span>
					</div>
				</StatsCard>
			</div>
			<div class="col-xl-3 col-md-6">
				<StatsCard
					title="Tổng số đại lý trực thuộc"
					type="gradient-info"
					subTitle={sumAgent}
					icon="ni ni-chart-pie-35"
					bodyClasses="bg-sum-agent"
				>
					<div slot="footer">
						<span class="text-dank mr-2"> Chi tiết </span>
					</div>
				</StatsCard>
			</div>
		</div>
	</BaseHeader>

	<!--Charts-->
	<div class="container-fluid mt--6">
		<div class="row">
			<div class="col-xl-12">
				<Card headerClasses="bg-transparent">
					<div class="row align-items-center" slot="header">
						<div class="col">
							<h6 class="text-uppercase text-muted ls-1 mb-1">Doanh số</h6>
							<h5 class="h3 mb-0">Cá nhân</h5>
						</div>
					</div>
					<!-- <SvelteFC {...barChartConfig} /> -->
				</Card>
			</div>
		</div>
		<!-- End charts-->
		<!--Tables-->
		<div class="row">
			<div class="col-xl-8">
				<AgentList tableData={treeViews} packages={$packagesAllStore} />
			</div>
			<div class="col-xl-4">
				<AgentLevelTable tableData={packageDatas} />
			</div>
		</div>
	</div>
</div>
