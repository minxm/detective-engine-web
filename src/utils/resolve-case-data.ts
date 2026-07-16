import { fetchCaseById } from '@/services/case';
import { loadCaseData, normalizeCaseData, saveCaseData } from '@/utils/case-store';
import type { CaseData } from '@/types';

/**
 * 优先从 API 拉取案件（含服务端刷新后的图片 URL），并写回本地缓存；
 * 网络失败时再回退 localStorage，避免库存案件过期/旧代理路径被永久缓存。
 */
export async function resolveCaseData(caseId: string): Promise<CaseData | null> {
  try {
    const res = await fetchCaseById(caseId);
    if (res.caseData) {
      const data = normalizeCaseData(res.caseData);
      await saveCaseData(data);
      return data;
    }
  } catch {
    /* 网络失败时使用本地缓存 */
  }
  return loadCaseData(caseId);
}
