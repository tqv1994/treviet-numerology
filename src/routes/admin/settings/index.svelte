<script lang="ts" context="module">
	export const load: Load = async ({ fetch, session, url }) => {
		let settingDatas: [];

		const res = await fetch(`/p/system-parameters`);
		if (res.ok) {
			const data = await res.json();
			settingDatas = data;
			console.log(settingDatas);
		} else {
			const err = await res.json();
			console.error(err);
		}

		return {
			props: {
				settingDatas
			}
		};
	};
</script>

<script lang="ts">
	import type { Load } from '@sveltejs/kit';
	import { fade } from 'svelte/transition';
	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import type { SettingFormData } from '$lib/stores/setting';
	import type { DataWithPagination } from '$lib/stores/type';
	import Card from '$lib/components/Cards/Card.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { createEventDispatcher } from 'svelte';
	import { pput } from '$lib/utils/fetch';

	let suffix = false;
	let errors: any = {};
	const dispatch = createEventDispatcher();
	export let settingDatas: [];
	// export let formData: SettingFormData;

    let formData = {};

    
    function initFormData() {
        for (let property of settingDatas) {
            // console.log(property.option_name);
            formData[property.option_name] = property.option_value;          
        }
    }
    initFormData();
    
	async function onSubmit(event) {
        event.preventDefault(); 
        console.log("form data", formData);
		try {

			const res = await pput('system-parameters', formData);
			if (res.ok) {
				window.notice({
					text: 'Cập nhật cài đặt thành công',
					type: 'success'
				});
				formData = reset();
				isReloadTab.set(true);
			} else {
				const error = await res.json();
				window.notice({
					text: getErrorMessage(error.errors),
					type: 'danger'
				});
			}
		} catch (err) {
			if (err.inner) {
				errors = err.inner.reduce((acc, err) => {
					return { ...acc, [err.path]: err.message };
				}, {});
			}
		}
		window.closeLoading();
	}
</script>

<div class="content" transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center py-4">
			<div class="col-7 col-lg-6">
				<h6 class="h2 d-inline-block mb-0">Đại lý</h6>
			</div>
			<div class="col-5 col-lg-6 text-right" />
		</div>
	</BaseHeader>

	<div class="container-fluid mt--6 mb-4">
		<div class="card-wrapper">
			<Card>
				<!-- Card header -->
				<!-- Card body -->
				<form on:submit={event => onSubmit(event)}>
					<!-- Input groups with icon -->

					<div class="row">
						<div class="col-12 mb-5">
							<h3 class="mb-0">Các thông số chung</h3>
							<!-- Card body -->
						</div>
						{#each Object.entries(formData) as [name, value]}
							<div class="col-lg-6">
								<div class="row">
									<div class="col-lg-2 social-media">
										<span class="social-label">{name}</span>
									</div>
									<div class="col-lg-7">
										<div class="">
											<BaseInput
												placeholder={value}
												bind:value={formData[name]}
											/>
										</div>
									</div>
									<div class="col-lg-3" />
								</div>
							</div>
						{/each}
					</div>
					<div>
						<div class="text-left" style="float: left">
							<button class="btn btn-success">Lưu câu hình hệ thống</button>
						</div>
						<div class="text-right" style="float: right" />
					</div>
				</form>
			</Card>
			<!-- Input groups -->
		</div>
	</div>
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

	.social-label {
		font-style: normal;
		font-weight: 600;
		font-size: 14px;
		line-height: 19px;
		/* identical to box height */

		display: flex;
		align-items: center;
	}

	.social-media {
		display: flex;
		align-items: center;
		margin-top: -20px;
	}
</style>
