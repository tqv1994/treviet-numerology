import { backendUrl } from '$lib/env';

export function getImage(path: string | undefined): string | null {
	if (path) {
		let backendDomain = backendUrl.replace("https://","");
		backendDomain = backendDomain.replace("http://","");
		if(path.includes(backendDomain)){
			return path;
		}
		if (path.includes('uploads') === false) {
			return `${backendUrl}/uploads/${path}`;
		} else {
			return `${backendUrl}/${path}`;
		}
	}
	return null;
}
