import site from '@/data/site.json';
import type { SiteData } from './types';

// Next.js 把 JSON 视作模块，build-time 静态解析
const data = site as unknown as SiteData;

export default data;
