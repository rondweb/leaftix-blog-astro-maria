import type { ImageMetadata } from 'astro';

export type Project = {
	name: string;
	title: string;
	description: string;
	background: 'lime' | 'cyan' | 'lavender' | 'mint';
	variant: 'desktop' | 'split' | 'mobile' | 'board';
	href: string;
	image: ImageMetadata;
	alt: string;
	imageClass: string;
};

export const workPageSize = 10;

export const projects: Project[] = [];