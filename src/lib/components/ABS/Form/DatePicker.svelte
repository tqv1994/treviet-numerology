<script lang="ts">
	import { formatDate } from '$lib/utils/datetime';

	import Flatpickr from 'svelte-flatpickr';
    import { Vietnamese } from "flatpickr/dist/l10n/vn.js"
	export let value: string | Date | undefined;
	export let placeholder: string = formatDate(new Date(), 'yyyy-mm-dd');
    export let dateFormat: string = "Y-m-d";
    let classNames: string | "" = "";
    export { classNames as class };
	const flatpickrOptions = {
        dateFormat,
		enableTime: false,
        allowInput: true,
        locale: Vietnamese
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
