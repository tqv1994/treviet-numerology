<script lang="ts">
	import type { ReportFormData } from '$lib/stores/report';

	import BaseHeader from '$lib/components/BaseHeader.svelte';
	import Card from '$lib/components/Cards/Card.svelte';
	import BaseInput from '$lib/components/Inputs/BaseInput.svelte';
	import { onMount } from 'svelte';
	import Flatpickr from 'svelte-flatpickr';
	import { fade } from 'svelte/transition';
	import 'flatpickr/dist/flatpickr.css';
	import 'flatpickr/dist/themes/light.css';
	import { ppost } from '$lib/utils/fetch';
	import { getErrorMessage } from '$lib/utils/response';
	import { redirectAgent } from '$lib/components/redirect.svelte';
	import * as yup from 'yup';
	import { getMsgRequired } from '$lib/utils/message';
	import type { SwalResult } from '$lib/utils/swal';
	import Swal from 'sweetalert2/dist/sweetalert2.js';
	let errors: any = {};
	const schemaValidator = yup.object().shape({
		name: yup.string().typeError(getMsgRequired('Họ tên')).required(getMsgRequired('Họ tên')),
		dob: yup.string().typeError(getMsgRequired('Ngày sinh')).required(getMsgRequired('Ngày sinh')),
		phone: yup
			.string()
			.typeError(getMsgRequired('Số điện thoại'))
			.required(getMsgRequired('Số điện thoại')),
		email: yup.string().typeError(getMsgRequired('Email')).required(getMsgRequired('Email')),
		nickname: yup
			.string()
			.typeError(getMsgRequired('Tên thường gọi'))
			.required(getMsgRequired('Tên thường gọi')),
		one_time_password: yup
			.string()
			.typeError(getMsgRequired('Mã 2FA'))
			.required(getMsgRequired('Mã 2FA'))
	});

	let formData: ReportFormData;
	reset();
	function reset() {
		formData = {
			name: '',
			dob: '',
			phone: '',
			email: '',
			nickname: '',
			one_time_password: '',
			initials: '1'
		};
	}
	const flatpickrOptions = {
		enableTime: false,
		onChange: (selectedDates, dateStr, instance) => {}
	};

	function handleChangeDOB(event: CustomEvent<[Date, string]>) {
		if (event.detail[1]) {
			formData.dob = event.detail[1];
		}
	}

	let suffix = false;
	export let name = 'Tạo báo cáo';

	async function onSubmit() {
		errors = {};
		try {
			await schemaValidator.validate({ ...formData }, { abortEarly: false });
			const result: SwalResult = await Swal.fire({
				title: `Bạn có chắc chắn muốn tạo báo cáo cho ${formData.name}, ${formData.dob} không?`,
				text: `Bạn sẽ không thể hoàn nguyên điều này!`,
				type: 'warning',
				showCancelButton: true,
				confirmButtonClass: 'btn btn-success btn-fill',
				cancelButtonClass: 'btn btn-danger btn-fill',
				confirmButtonText: 'Vâng, tạo nó!',
				cancelButtonText: 'Huỷ',
				buttonsStyling: false
			});
			if (result.isConfirmed) {
				window.openLoading();
				const res = await ppost('reports', formData);
				if (res.ok) {
					window.notice({
						text: 'Tạo báo cáo thành công',
						type: 'success'
					});
					reset();
					redirectAgent('/reports');
				} else {
					const error = await res.json();
					window.notice({
						text: getErrorMessage(error.errors),
						type: 'danger'
					});
				}
			}
		} catch (err) {
			if (err.inner) {
				errors = err.inner.reduce((acc, err) => {
					return { ...acc, [err.path]: err.message };
				}, {});
			} else {
				window.notice({
					text: 'Có lỗi xảy ra! Vui lòng thử lại sau',
					type: 'danger'
				});
			}
		}
		window.closeLoading();
	}
</script>

<div transition:fade={{ duration: 250 }}>
	<BaseHeader className="pb-6">
		<div class="row align-items-center py-4">
			<div class="col-lg-6 col-7">
				<h6 class="h2 d-inline-block mb-0">{name}</h6>
				<nav aria-label="breadcrumb" class="d-none d-md-inline-block ml-md-4">
					<span style="color:#2DCE89"> - Đại lý </span>
				</nav>
			</div>
			<div class="col-lg-6 col-5 text-right">
				<a href="/agent/reports" class="btn btn-success">Danh sách báo báo</a>
			</div>
		</div>
	</BaseHeader>

	<div class="container-fluid mt--6">
		<div class="row">
			<div class="col-lg-6">
				<div class="card-wrapper">
					<!-- Input groups -->
					<Card>
						<!-- Card header -->
						<h3 slot="header" class="mb-0">Tạo mới báo cáo</h3>
						<!-- Card body -->
						<form on:submit|preventDefault={onSubmit}>
							<!-- Input groups with icon -->
							<div class="">
								<div class="row">
									<div class="col-lg-4 ">
										<strong> Họ và tên* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput
												placeholder="Trần Văn A"
												bind:value={formData.name}
												error={errors.name}
											/>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-4 ">
										<strong> Tên thường gọi* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput
												placeholder=""
												bind:value={formData.nickname}
												error={errors.nickname}
											/>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-4 ">
										<strong> Ngày sinh* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput appendIcon="fas fa-calendar" error={errors.dob}>
												<Flatpickr
													options={flatpickrOptions}
													class="form-control datepicker bg-white"
													value={formData.dob}
													dateFormat="Y-m-d"
													placeholder="01/01/2022"
													on:change={(event) => handleChangeDOB(event)}
												/>
											</BaseInput>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-4 ">
										<strong> Điện thoại* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput
												placeholder="(+84) 123 456 789"
												bind:value={formData.phone}
												error={errors.phone}
											/>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-4 ">
										<strong> Email* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput
												placeholder="tranvana@example.com"
												bind:value={formData.email}
												error={errors.email}
											/>
										</div>
									</div>
								</div>

								<div class="row">
									<div class="col-lg-4 ">
										<strong> Mã 2FA* </strong>
									</div>
									<div class="col-lg-8">
										<div class="">
											<BaseInput
												placeholder="208304"
												bind:value={formData.one_time_password}
												error={errors.one_time_password}
											/>
										</div>
									</div>
								</div>
								<div class="text-right" style="float: right">
									<button class="btn btn-success">Tạo báo cáo</button>
								</div>
							</div>
						</form>
					</Card>
				</div>
			</div>
			<div class="col-lg-6">
				<div class="card-wrapper" />
			</div>
		</div>
	</div>
</div>
