import { signal, computed, effect, Signal, WritableSignal } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

/**
 * Creates a debounced signal that updates after a delay
 * Perfect for search inputs in Zoneless mode
 * 
 * @param source - The source signal to debounce
 * @param delayMs - Debounce delay in milliseconds
 * @returns A signal that updates with debounced values
 */
export function debouncedSignal<T>(
	source: Signal<T>,
	delayMs: number = 300
): Signal<T> {
	const source$ = toObservable(source).pipe(
		debounceTime(delayMs),
		distinctUntilChanged()
	);

	return toSignal(source$, { initialValue: source() });
}

/**
 * Creates a signal with localStorage persistence
 * Automatically syncs state with browser storage
 * 
 * @param key - localStorage key
 * @param initialValue - Default value if no stored value exists
 */
export function persistedSignal<T>(
	key: string,
	initialValue: T
): WritableSignal<T> {
	const storedValue = typeof window !== 'undefined'
		? localStorage.getItem(key)
		: null;

	const parsedValue = storedValue ? JSON.parse(storedValue) : initialValue;
	const sig = signal<T>(parsedValue);

	// Auto-sync to localStorage
	effect(() => {
		const value = sig();
		if (typeof window !== 'undefined') {
			localStorage.setItem(key, JSON.stringify(value));
		}
	});

	return sig;
}

/**
 * Creates a toggle signal (boolean with toggle method)
 */
export function toggleSignal(initialValue: boolean = false) {
	const sig = signal(initialValue);

	return {
		value: sig.asReadonly(),
		toggle: () => sig.update((v) => !v),
		set: (value: boolean) => sig.set(value),
		on: () => sig.set(true),
		off: () => sig.set(false),
	};
}

/**
 * Creates a counter signal with increment/decrement methods
 */
export function counterSignal(initialValue: number = 0) {
	const sig = signal(initialValue);

	return {
		value: sig.asReadonly(),
		increment: (by: number = 1) => sig.update((v) => v + by),
		decrement: (by: number = 1) => sig.update((v) => v - by),
		reset: () => sig.set(initialValue),
		set: (value: number) => sig.set(value),
	};
}

/**
 * Creates a signal that tracks loading state
 */
export function loadingSignal() {
	const isLoading = signal(false);
	const error = signal<string | null>(null);

	return {
		isLoading: isLoading.asReadonly(),
		error: error.asReadonly(),
		isError: computed(() => error() !== null),
		start: () => {
			isLoading.set(true);
			error.set(null);
		},
		success: () => {
			isLoading.set(false);
			error.set(null);
		},
		fail: (err: string) => {
			isLoading.set(false);
			error.set(err);
		},
		reset: () => {
			isLoading.set(false);
			error.set(null);
		},
	};
}
