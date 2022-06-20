<script lang="ts" context="module">
	export const load: Load = async ({ fetch }) => {
		let packageDatas: DataTableAgenctLevel[] | undefined;
		let treeViews: DataTableAgentList[];
    let revenueDatas:[];
		const res = await fetch(`/p/packages`);
		const resTree = await fetch(`/p/tree-view`);
    const resRevenue = await fetch(`/p/revenue-month`);
    console.log("resRevenue",resRevenue);

    if (resRevenue.ok) {
      const data = await resRevenue.json();
      revenueDatas = data.results;
    } 
    else {
      const err = await resTree.json();
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
        revenueDatas
			}
		};
	};

	
</script>
<script lang="ts">
    import { fade } from "svelte/transition";
    // Components
    import RouteBreadCrumb from "$lib/components/Breadcrumb/RouteBreadcrumb.svelte";
    import StatsCard from "$lib/components/Cards/StatsCard.svelte";
    import BaseHeader from '$lib/components/BaseHeader.svelte';
    import Card from '$lib/components/Cards/Card.svelte';
    // Tables
    export let name = "Trang chủ";
    import { onMount } from 'svelte';
    import AgentList from '$lib/components/ABS/Agent/AgentList.svelte';
    import type { DataTableAgentList } from '$lib/components/ABS/Agent/AgentList.svelte';
    import AgentLevelTable from '$lib/components/ABS/Agent/AgentLevelTable.svelte';
    import type { DataTableAgenctLevel } from '$lib/components/ABS/Agent/AgentLevelTable.svelte';
    import type { Load } from "@sveltejs/kit";
    import type { Agent, AgentTreeView } from "$lib/stores/agent";
    import { packagesStore } from "$lib/stores/package";

    export let treeViews: DataTableAgentList[];
    console.log('treeViews',treeViews);
    
    export let packageDatas: DataTableAgenctLevel[];
    export let revenueDatas: [];

    let sum = 0;
    for (let i = 0; i < revenueDatas.length; i++) {
      sum += revenueDatas[i].revenue;
    }
    let sumRevenueAgent = sum;
    export let sumAgent = treeViews.length;

    
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
            subTitle="160"
            icon="ni ni-chart-bar-32"
            bodyClasses="bg-revenue">
            <div slot="footer">
              <span class="text-dank mr-2">
                Chi tiết
              </span>
            </div>
          </StatsCard>
        </div>
        <div class="col-xl-3 col-md-6">
          <StatsCard
            title="Doanh số đại lý tháng"
            type="gradient-info"
            subTitle="{sumRevenueAgent}"
            icon="ni ni-chart-bar-32"
            bodyClasses="bg-revenue-agent">
            <div slot="footer">
              <span class="text-dank mr-2">
                Chi tiết
              </span>
            </div>
          </StatsCard>
        </div>
        <div class="col-xl-3 col-md-6">
          <StatsCard
            title="Tổng số đại lý trực thuộc"
            type="gradient-info"
            subTitle="{sumAgent}"
            icon="ni ni-chart-pie-35"
            bodyClasses="bg-sum-agent">
            <div slot="footer">
              <span class="text-dank mr-2">
                Chi tiết
              </span>
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
				<AgentList tableData={treeViews} packages={$packagesStore}/>
			</div>
			<div class="col-xl-4">
				<AgentLevelTable tableData={packageDatas} />
			</div>
		</div>
	</div>
  </div>
  