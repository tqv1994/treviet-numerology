import { apiUrl } from '$lib/env';
import type { Purchase, PurchaseFormData } from '$lib/stores/purchase';
import type { DataWithPagination, QueryParams } from '$lib/stores/type';
import { pget, ppost } from '$lib/utils/fetch';
import { getErrorMessage, getResponseAuthorizationHeaders, handleError } from '$lib/utils/response';
import { objectToQueryString } from '$lib/utils/string';
const endpoint = 'purchases';

export const getListPurchasesService = async (
	queryParams?: QueryParams
): Promise<DataWithPagination<Purchase>> => {
	return new Promise(async (resolve, reject) => {
		const res = await pget(`${endpoint}/filter?${objectToQueryString(queryParams)}`);
		if (res.ok) {
			const data: { results: DataWithPagination<Purchase> } = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};

export const createPurchaseService = async (formData: any): Promise<Purchase> => {
	return new Promise(async (resolve, reject) => {
		const res = await ppost(`${endpoint}`, formData);
		if (res.ok) {
			const data: { results: Purchase } = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			reject(getErrorMessage(error.errors));
		}
	});
};

export const getListFilterDatePurchaseService = async (
	from_date: string,
	to_date: string,
	create_user_id?: number
): Promise<DataWithPagination<Purchase>> => {
	return new Promise(async (resolve, reject) => {
		console.log(from_date, to_date);
		
		const res = await pget(`${endpoint}/filter?filter[from_date]=${from_date}&filter[to_date]=${to_date}&create_user_id=${create_user_id}`);
		if (res.ok) {
			const data: { results: DataWithPagination<Purchase> } = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};
