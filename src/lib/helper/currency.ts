export function formatCurrencyVN(number: number) {
	return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'VND' }).format(number);
}