import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\_\-]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getCategoryUrl(category: { slug?: string; name?: string }): string {
  if (!category) return '/category/all';
  const slug = category.slug && category.slug !== 'lowers' && category.slug !== 'category' ? category.slug : (category.name ? slugify(category.name) : 'all');
  return `/category/${slug}`;
}
