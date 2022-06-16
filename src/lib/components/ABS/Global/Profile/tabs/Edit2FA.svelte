<script lang="ts">
	import { authStore } from '$lib/stores/auth';
	import { ppost, pget } from '$lib/utils/fetch';
	console.log($authStore);
	reset();
	function reset() {}
	async function onSubmit() {
    if(!$authStore?.google2fa_secret){
      window.openLoading();
      const res = await ppost('insert-2fa-code', { email: $authStore?.email || '',id: $authStore?.id });
      if (res.ok) {
        const data = await res.json();
        authStore.update(s=>{
          if(s){
            s.imageQR = data.results[0]['QR-image'];
            s.google2fa_secret = data.results['Secret Code'];
          }
          return s;
        });
      }
      window.closeLoading();
    }
	}
</script>

<div class="pl-lg-4">
	<form on:submit|preventDefault={onSubmit}>
		<!-- Input groups with icon -->
		<div class="row">
			<div class="col-10">
				{#if !$authStore?.imageQR}
					<button class="btn btn-success">Lấy QR code</button>
        {:else}
          {@html $authStore.imageQR}
        {/if}
			</div>
		</div>
	</form>
	<div class="mt-4">
		<span class='label-link-2fa'>
			* Để xác minh 2FA vui lòng tải phần mềm Google Authenticator về Smartphone của bạn
		</span>
		<div class="download-authentication mt-3">
			<div class="link-download">
				<a href="https://apps.apple.com/vn/app/google-authenticator/id388497605"><i class="fa fa-download" aria-hidden="true"></i>  Tải về cho IOS</a>
			</div>
			<div class="link-download mt-3">
				<a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=vi&gl=US"><i class="fa fa-download" aria-hidden="true"></i>   Tải về cho Android </a>
			</div>
		</div>
	</div>
</div>
<style>
	.password-strength {
		float: right;
		margin-top: -26px;
		padding-bottom: 15px;
	}

	#verify {
		min-height: 2.5rem;
	}

	.form-control-label {
		font-size: 600;
	}

	.label-link-2fa{
		color: red;
		font-style: italic;
	}
</style>
