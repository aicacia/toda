import { browser, building } from '$app/environment';
import { env } from '$env/dynamic/public';
import { PUBLIC_TODA_URL } from '$env/static/public';
import { sep } from '@tauri-apps/api/path';
import { v7 } from 'uuid';

export function unsafeId() {
	return Math.random().toString(36);
}

export function createUniqueId(type: string) {
	return `${type}-${v7()}`;
}

export function getOrigin() {
	if (browser) {
		return window.location.origin;
	}
	if (building) {
		return PUBLIC_TODA_URL;
	}
	return env.PUBLIC_TODA_URL;
}

export function noop() { }
