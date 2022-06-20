<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		const myAgent = getMyAgent(session.user);
		const res = await fetch(`/p/packages?sort=id`);
		if (res.ok) {
			const data = await res.json();
			packagesAllStore.set(data.results.data);
		} else {
			const err = await res.json();
			console.error(err);
		}
		
		if (!session.user || !myAgent) {
			redirect('/');
		}
		return {
			props: {
				pathname: url.pathname
			}
		};
	};
</script>

<script lang="ts">
	import DashboardNavbar from '$lib/components/ABS/Global/DashboardNavbar.svelte';
	import Notification from '$lib/components/ABS/Notification.svelte';
	import SideBar from '$lib/components/SidebarPlugin/SideBar.svelte';
	import SideBarItem from '$lib/components/SidebarPlugin/SideBarItem.svelte';
	import Notifications from 'svelte-notifications';
	import CustomNotification from '$lib/components/NotificationPlugin/CustomNotification.svelte';
	import { onMount } from 'svelte';
	import ContentFooter from '$lib/components/ABS/Global/ContentFooter.svelte';
	import type { Load } from '@sveltejs/kit';
	import { redirect } from '$lib/components/redirect.svelte';
	import Loading from '$lib/components/ABS/Loading.svelte';
	import { getMyAgent } from '$lib/utils/user';
	import { packagesAllStore, packagesStore } from '$lib/stores/package';

	export let type = 'default';
	export let pathname: string;

	let toggle = false;
	let sideBarToggle = true;

	onMount(() => {
		document.body.classList.remove('bg-default');
		// if (window.innerWidth < 1200) {
		//   toggle = false;
		//   sideBarToggle = false;
		//   document.body.classList = "g-sidenav-hidden";
		//   let collapse = document.getElementsByClassName("sidebarcollapse");
		//   for (var i = 0; i < collapse.length; i++) {
		//     collapse[i].classList.remove("d-none");
		//   }
		// } else {
		//   toggle = true;
		//   sideBarToggle = true;
		//   document.body.classList = "g-sidenav-pinned g-sidenav-show";
		// }
	});

	function changeToggle() {
		if (document.body.classList.contains('g-sidenav-hidden')) {
			toggle = false;
			sideBarToggle = false;
		} else {
			toggle = true;
			sideBarToggle = true;
			if (window.innerWidth < 1200) {
				let collapse = document.getElementsByClassName('sidebarcollapse');
				for (var i = 0; i < collapse.length; i++) {
					collapse[i].classList.remove('d-none');
				}
			}
		}
	}

	function checkMenuActive(
		path: string,
		currentPath: string,
		isContains: boolean = false
	): boolean {
		if (path === currentPath && !isContains) {
			return true;
		} else if (currentPath.includes(path) && isContains === true) {
			return true;
		}
		return false;
	}
</script>

<Notifications item={CustomNotification}>
	<div class="wrapper">
		<!-- sidebar component  -->
		<SideBar toggle={sideBarToggle} on:click={changeToggle}>
			<ul class="navbar-nav" slot="links" id="navbar-nav">
				<SideBarItem
					link={{
						name: 'Trang chủ',
						icon: 'ni ni-shop',
						path: '/agent',
						isActive: checkMenuActive('/agent', pathname)
					}}
				/>

				<SideBarItem
					link={{
						name: 'Xuất MAP',
						icon: 'ni ni-ui-04',
						path: '/agent/map-publishing',
						isActive: checkMenuActive('/agent/map-publishing', pathname)
					}}
				/>
				<SideBarItem
					link={{
						name: 'Báo cáo',
						icon: 'ni ni-single-copy-04 ',
						path: '/agent/reports',
						isActive: checkMenuActive('/agent/reports', pathname, true)
					}}
				/>


				<SideBarItem
					link={{
						name: 'Cây hệ thống',
						icon: 'ni ni-books',
						path: '/agent/system-tree',
						isActive: checkMenuActive('/agent/system-tree', pathname)
					}}
				/>

				<SideBarItem
					link={{
						name: 'Chuyển map',
						icon: 'ni ni-ungroup',
						path: '/agent/transfers',
						isActive: checkMenuActive('/agent/transfers', pathname)
					}}
				/>
				
				<SideBarItem
					link={{
						name: 'Hỗ trợ',
						icon: 'ni ni-spaceship',
						path: '/agent/support-information',
						isActive: checkMenuActive('/agent/support-information', pathname)
					}}
				/>
			</ul>
		</SideBar>
		<div class="main-content">
			<DashboardNavbar {type} showSidebar={toggle} on:click={changeToggle} />
			<!-- your content here -->
			<slot />
			<ContentFooter />
		</div>
	</div>
	<Notification />
	<Loading />
</Notifications>
