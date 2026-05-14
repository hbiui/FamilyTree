import { executeApiRequest } from '../lib/api/client';
import { useNetworkSimulationStore } from '../store/useNetworkSimulationStore';
import { v4 as uuidv4 } from 'uuid';

// 模拟成员数据（用于演示）
const MOCK_MEMBERS = Array.from({ length: 20 }, (_, i) => ({
  id: `member-${i}`,
  name: `成员${i + 1}`,
  gender: i % 2 === 0 ? 'male' : 'female',
  birth_date: `199${(i % 9) + 1}-0${(i % 12) + 1}-15`,
}));

// 模拟 API 延迟
async function simulateNetworkDelay(ms: number = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 获取成员列表
export async function getMembersApi(): Promise<any[]> {
  const { executeWithNetworkSimulation } = useNetworkSimulationStore.getState();
  
  return executeWithNetworkSimulation(async () => {
    await simulateNetworkDelay();
    console.log('[API] getMembers called');
    return [...MOCK_MEMBERS];
  }, { id: 'get-members' });
}

// 获取单个成员
export async function getMemberApi(id: string): Promise<any> {
  const { executeWithNetworkSimulation } = useNetworkSimulationStore.getState();
  
  return executeWithNetworkSimulation(async () => {
    await simulateNetworkDelay();
    console.log(`[API] getMember called for ${id}`);
    const member = MOCK_MEMBERS.find(m => m.id === id);
    if (!member) {
      throw { status: 404, message: 'Member not found' };
    }
    return member;
  }, { id: `get-member-${id}` });
}

// 保存成员（关键操作）
export async function saveMemberApi(member: any): Promise<any> {
  const { executeWithNetworkSimulation } = useNetworkSimulationStore.getState();
  
  return executeWithNetworkSimulation(async () => {
    await simulateNetworkDelay();
    console.log('[API] saveMember called');
    
    // 模拟保存逻辑
    if (!member.id) {
      member.id = uuidv4();
    }
    member.created_at = new Date().toISOString();
    
    return member;
  }, { id: `save-member-${Date.now()}` });
}

// 删除成员
export async function deleteMemberApi(id: string): Promise<void> {
  const { executeWithNetworkSimulation } = useNetworkSimulationStore.getState();
  
  return executeWithNetworkSimulation(async () => {
    await simulateNetworkDelay();
    console.log(`[API] deleteMember called for ${id}`);
  }, { id: `delete-member-${id}` });
}

// 包装 API 调用的便捷 Hook
export function useMemberApiService() {
  return {
    getMembers: () =>
      executeApiRequest({
        id: 'get-members',
        requestFn: getMembersApi,
        maxRetries: 3,
      }),
      
    getMember: (id: string) =>
      executeApiRequest({
        id: `get-member-${id}`,
        requestFn: () => getMemberApi(id),
        maxRetries: 2,
      }),
      
    saveMember: (member: any) =>
      executeApiRequest({
        id: `save-member-${Date.now()}`,
        requestFn: () => saveMemberApi(member),
        maxRetries: 3,
      }),
      
    deleteMember: (id: string) =>
      executeApiRequest({
        id: `delete-member-${id}`,
        requestFn: () => deleteMemberApi(id),
        maxRetries: 2,
      }),
  };
}
