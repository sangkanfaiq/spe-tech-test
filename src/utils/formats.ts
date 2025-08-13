export function formatCurrency(value: any) {
	if (value) {
		const options: any = {
			style: "currency",
			currency: "IDR",
			maximumFractionDigits: 0,
		};
		return new Intl.NumberFormat("id-ID", options).format(value);
	}
}
