/**
 * Supabase Realtime 实时协作服务
 * 
 * 功能说明：
 * 1. 订阅家族树数据变化
 * 2. 监听成员在线状态
 * 3. 处理实时数据同步
 * 4. 管理协作者心跳
 */

import { getSupabase } from './supabase';
import type { Person, Relation } from '../types/familyTree';

export type RealtimeEventType = 
  | 'INSERT' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'PRESENCE_SYNC' 
  | 'PRESENCE_JOIN' 
  | 'PRESENCE_LEAVE';

export interface RealtimeChange<T> {
  eventType: RealtimeEventType;
  table: string;
  new: T | null;
  old: T | null;
  timestamp: string;
}

export interface PresenceState {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  online_at: string;
  cursor_position?: { x: number; y: number };
}

type ChangeCallback<T> = (change: RealtimeChange<T>) => void;
type PresenceCallback = (state: PresenceState[]) => void;

/**
 * 实时协作管理器
 */
class RealtimeCollaboration {
  private channel: any = null;
  private familyId: string = '';
  private userId: string = '';
  private userName: string = '';
  private personCallbacks: ChangeCallback<Person>[] = [];
  private relationCallbacks: ChangeCallback<Relation>[] = [];
  private presenceCallbacks: PresenceCallback[] = [];
  private heartbeatInterval: NodeJS.Timeout | null = null;

  /**
   * 初始化实时协作
   */
  async initialize(
    familyId: string,
    userId: string,
    userName: string,
    userAvatar?: string
  ): Promise<void> {
    const supabase = getSupabase();
    this.familyId = familyId;
    this.userId = userId;
    this.userName = userName;

    // 创建频道
    this.channel = supabase.channel(`family:${familyId}`, {
      config: {
        presence: {
          key: userId,
        },
        broadcast: {
          self: true,
        },
      },
    });

    // 监听 Persons 表变化
    this.channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'persons',
          filter: `family_id=eq.${familyId}`,
        },
        (payload: any) => {
          const change: RealtimeChange<Person> = {
            eventType: payload.eventType,
            table: 'persons',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString(),
          };
          this.personCallbacks.forEach(cb => cb(change));
        }
      );

    // 监听 Relations 表变化
    this.channel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'relations',
          filter: `family_id=eq.${familyId}`,
        },
        (payload: any) => {
          const change: RealtimeChange<Relation> = {
            eventType: payload.eventType,
            table: 'relations',
            new: payload.new,
            old: payload.old,
            timestamp: new Date().toISOString(),
          };
          this.relationCallbacks.forEach(cb => cb(change));
        }
      );

    // 监听 Presence 状态
    this.channel
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel.presenceState() || {};
        const onlineUsers: PresenceState[] = Object.values(state)
          .flat()
          .map((presence: any) => ({
            user_id: presence.user_id,
            user_name: presence.user_name,
            avatar_url: presence.avatar_url,
            online_at: presence.online_at || new Date().toISOString(),
            cursor_position: presence.cursor_position,
          }));
        this.presenceCallbacks.forEach(cb => cb(onlineUsers));
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }: any) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }: any) => {
        console.log('User left:', key, leftPresences);
      });

    // 订阅频道
    await this.channel.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        // 追踪在线状态
        await this.trackPresence(userAvatar);
        // 启动心跳
        this.startHeartbeat();
      }
    });
  }

  /**
   * 追踪用户在线状态
   */
  async trackPresence(avatarUrl?: string): Promise<void> {
    if (!this.channel) return;

    await this.channel.track({
      user_id: this.userId,
      user_name: this.userName,
      avatar_url: avatarUrl,
      online_at: new Date().toISOString(),
      family_id: this.familyId,
    });
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      await this.trackPresence();
    }, 30000); // 每30秒更新一次
  }

  /**
   * 停止实时协作
   */
  async disconnect(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.channel) {
      await this.channel.unsubscribe();
      this.channel = null;
    }

    this.personCallbacks = [];
    this.relationCallbacks = [];
    this.presenceCallbacks = [];
  }

  /**
   * 监听成员变化
   */
  onPersonChange(callback: ChangeCallback<Person>): () => void {
    this.personCallbacks.push(callback);
    return () => {
      this.personCallbacks = this.personCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 监听关系变化
   */
  onRelationChange(callback: ChangeCallback<Relation>): () => void {
    this.relationCallbacks.push(callback);
    return () => {
      this.relationCallbacks = this.relationCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 监听在线状态变化
   */
  onPresenceChange(callback: PresenceCallback): () => void {
    this.presenceCallbacks.push(callback);
    return () => {
      this.presenceCallbacks = this.presenceCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * 广播游标位置（可选，用于显示谁在查看哪里）
   */
  async broadcastCursor(x: number, y: number): Promise<void> {
    if (!this.channel) return;

    await this.channel.track({
      user_id: this.userId,
      user_name: this.userName,
      cursor_position: { x, y },
      online_at: new Date().toISOString(),
    });
  }

  /**
   * 获取当前在线用户
   */
  getOnlineUsers(): PresenceState[] {
    if (!this.channel) return [];

    const state = this.channel.presenceState() || {};
    return Object.values(state).flat() as PresenceState[];
  }
}

// 导出单例
export const realtimeCollaboration = new RealtimeCollaboration();

/**
 * 广播编辑事件
 */
export async function broadcastEdit(
  familyId: string,
  type: 'person' | 'relation',
  action: 'create' | 'update' | 'delete',
  data: any
): Promise<void> {
  const supabase = getSupabase();
  
  await supabase.channel(`family:${familyId}`).send({
    type: 'broadcast',
    event: `edit_${type}`,
    payload: {
      action,
      data,
      user_id: supabase.auth.currentUser?.id,
      timestamp: new Date().toISOString(),
    },
  });
}
