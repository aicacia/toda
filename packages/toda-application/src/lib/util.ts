import { browser, building } from '$app/environment';
import { env } from '$env/dynamic/public';
import { PUBLIC_TODO_URL } from '$env/static/public';
import { v4 } from 'uuid';

export function unsafeId() {
	return Math.random().toString(36);
}

export function createUniqueId(id: string, type: string) {
	return `${id.replaceAll('.', '_')}_${type}-${v4()}`;
}

export function getOrigin() {
	if (typeof __DEV_TODO_URL__ !== 'undefined') {
		return __DEV_TODO_URL__;
	}
	if (browser) {
		return window.location.origin;
	}
	if (building) {
		return PUBLIC_TODO_URL;
	}
	return env.PUBLIC_TODO_URL;
}
