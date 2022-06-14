import { apiUrl } from "$lib/env";
import type { Agent } from "$lib/stores/agent";
import type { DataWithPagination, QueryParams } from "$lib/stores/type";
import { pget } from "$lib/utils/fetch";
import {
  getErrorMessage,
  getResponseAuthorizationHeaders,
  handleError,
} from "$lib/utils/response";
import { objectToQueryString } from "$lib/utils/string";
const endpoint = "agents";

export const getListAgentsService = async (
	queryParams?: QueryParams
): Promise<DataWithPagination<Agent>> => {
	return new Promise(async (resolve, reject) => {
		const res = await pget(`${endpoint}/filter?${objectToQueryString(queryParams)}`);
		if (res.ok) {
			const data: { results: DataWithPagination<Agent> } = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};

export const getListFilterDateAgentService = async (
	from_date: string,
	to_date: string
): Promise<DataWithPagination<Agent>> => {
	return new Promise(async (resolve, reject) => {
		const res = await pget(`${endpoint}?from_date=${from_date}&to_date=${to_date}&sort=id`);
		if (res.ok) {
			const data: { results: DataWithPagination<Agent> } = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};

export const getAgentsByUserId = async (
	userId: number,
): Promise<[]> => {
	return new Promise(async (resolve, reject) => {
		const res = await pget(`${endpoint}/get-agent/${userId}`);
		if (res.ok) {
			const data = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};

export const updateAgentStatus = async (
	agentId: number,
): Promise<[]> => {
	return new Promise(async (resolve, reject) => {
		const res = await pget(`${endpoint}/${agentId}/status`);
		if (res.ok) {
			const data = await res.json();
			resolve(data.results);
		} else {
			const error = await res.json();
			handleError(error.errors);
			reject(error);
		}
	});
};


