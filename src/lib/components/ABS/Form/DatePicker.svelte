<script lang="ts">
	import { formatDate } from '$lib/utils/datetime';

	import Flatpickr from 'svelte-flatpickr';
	export let value: string | Date | undefined;
	export let placeholder: string = formatDate(new Date(), 'dd/mm/yyyy');
    export let dateFormat: string = "Y-m-d";
    let classNames: string | "" = "";
    export { classNames as class };
	const flatpickrOptions = {
        dateFormat,
		enableTime: false
	};

	function handleChangeDate(event: CustomEvent<[Date, string]>) {
		if (event.detail[1]) {
			value = event.detail[1];
		}
	}
</script>

<Flatpickr
	options={flatpickrOptions}
	class="form-control datepicker bg-white {classNames}"
	{value}
    {placeholder}
	on:change={(event) => handleChangeDate(event)}
/>
