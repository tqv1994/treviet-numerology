<script lang="ts">
	import Card from '$lib/components/Cards/Card.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { formatDate } from '$lib/helper/datetime';
	import { packagesStore } from '$lib/stores/package';
	import { ppost } from '$lib/utils/fetch';
	import type { Load } from '@sveltejs/kit';
	import { getErrorMessage } from '$lib/utils/response';
	import { isReloadTab } from '$lib/components/ABS/Tab/Tabs.svelte';
	import * as yup from 'yup';
	import { getMsgRequired } from '$lib/utils/message';
	import type { Purchase, PurchaseFormData } from '$lib/stores/purchase';
	import { authStore, type User } from '$lib/stores/auth';
	export let status: false;
	export let hidden: string = '' ;
	
	let errors: any = {};
	const schemaValidator = yup.object().shape({
		agent_id: yup
			.number()
			.typeError(getMsgRequired('Đại lý'))
			.required(getMsgRequired('Đại lý')),
		packages_id: yup.number().typeError(getMsgRequired('Gói')).required(getMsgRequired('Gói')),
		one_time_password: yup
			.string()
			.typeError(getMsgRequired('Mã 2FA'))
			.required(getMsgRequired('Mã 2FA'))
	});

	let formData: PurchaseFormData	 = reset();
	export let agentsLevel1: [];
	function reset(): PurchaseFormData {
		return {
			agent_id:  undefined,
			packages_id: 1,
			one_time_password: '',
			purchase_date: formatDate(new Date()),
			amount: 1
		};
	}

	function show2FA() {
		status = true;
		hidden = "hidden"
	}

	async function onSubmit() {
		const user = $authStore
		if (user?.google2fa_secret === null) {
			window.notice({
				text: 'Bạn chưa tạo mã 2FA',
				type: 'danger'
			});
		} else {
			window.openLoading();
			try {
				await schemaValidator.validate({ ...formData }, { abortEarly: false });
				const res = await ppost('purchases', formData);
				if (res.ok) {
					window.notice({
						text: 'Tạo báo cáo thành công',
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
	}
</script>

<Card>
	<!-- Card header -->
	<h3 slot="header" class="mb-0">Tạo mới chuyển map</h3>
	<!-- Card body -->
	<form on:submit|preventDefault={onSubmit}>
		<!-- Input groups with icon -->
		<div class="">
			<div class="row">
				<div class="col-lg-4 ">
					<strong> Đại lý* </strong>
				</div>
				<div class="col-lg-8">
					<div class="">
						<BaseInput error={errors.agent_id}>
							<select class="form-control" bind:value={formData.agent_id}>
								{#each agentsLevel1 || [] as agent}
									{#if agent.ref_code_agent == null}
										<option value={agent.id}>{agent.agentname}</option>
									{/if}
								{/each}
							</select>
						</BaseInput>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-4 ">
					<strong> Gói đại lý* </strong>
				</div>
				<div class="col-lg-8">
					<div class="">
						<BaseInput error={errors.package_id}>
							<select class="form-control" bind:value={formData.packages_id}>
								{#each $packagesStore || [] as item}
									<option value={item.id}>{item.package_name}</option>
								{/each}
							</select>
						</BaseInput>
					</div>
				</div>
			</div>

			<div class="row">
				<div class="col-lg-4 ">
					<strong> Mã 2FA* </strong>
				</div>
				<div class="col-lg-8">
					<div class="">
						<BaseInput error={errors.one_time_password} placeholder="Nhập mã 2FA" bind:value={formData.one_time_password} />
						{#if ($authStore.google2fa_secret === null) || ($authStore.google2fa_secret ==='')}
										<div class='row mt--3'>
											<p class='label-link-2fa text-left col-6'>* Bạn chưa có mã 2FA</p>
											<a href="/admin/profile" class='text-right link-create-2fa col-6'>Tạo mã 2FA ngay</a>
										</div>
										{:else}
										<span on:click={show2FA} {hidden} class="get-image-2fa">Lấy mã 2FA ngay</span>
											{#if (status == true)}
											{@html $authStore.imageQR}
											{/if}
										{/if}
					</div>
				</div>
			</div>
			<div class="text-right" style="float: right">
				<button class="btn btn-success">Chuyển map</button>
			</div>
		</div>
	</form>
</Card>
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
	.label-link-2fa{
		color: red;
		font-style: italic;
	}
	.link-create-2fa{
		text-decoration: underline;
		font-weight: bold;
	}
	.get-image-2fa{
		display: inline-block;
		font-weight: 600;
		text-align: center;
		vertical-align: middle;
		user-select: none;
		border: 1px solid transparent;
		padding: 0.625rem 1.25rem;
		font-size: 0.875rem;
		line-height: 1.5;
		border-radius: 0.25rem;
		color: #fff;
		background-color: #2dce89;
		border-color: #2dce89;
		box-shadow: 0 4px 6px rgb(50 50 93 / 11%), 0 1px 3px rgb(0 0 0 / 8%);
	}
</style>
