import { backendUrl } from '$lib/env';
import { getImage } from './image';

export function getLink(path: string | undefined): string | null {
	return getImage(path);
}
