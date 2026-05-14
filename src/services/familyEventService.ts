/**
 * 家族事件服务
 * 用于处理 events 表和 event_people 关联表的 CRUD 操作
 */

import { createClient } from '@supabase/supabase-js';
import type {
  FamilyEvent,
  FamilyEventWithPeople,
  EventPerson,
  Person,
  SupabaseFamilyEvent,
  SupabaseEventPerson,
  EventType
} from '../types/familyTree';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// 分页配置
const PAGE_SIZE = 20;

/**
 * 创建新的家族事件
 */
export async function createEvent(
  eventData: Omit<FamilyEvent, 'id' | 'created_at' | 'updated_at'>,
  relatedPersonIds: string[] = []
): Promise<{ success: boolean; event?: FamilyEvent; error?: string }> {
  try {
    const now = new Date().toISOString();
    const eventPayload: SupabaseFamilyEvent = {
      ...eventData,
      created_at: now,
      updated_at: now,
    };

    const { data: newEvent, error: eventError } = await supabase
      .from('events')
      .insert(eventPayload)
      .select()
      .single();

    if (eventError) {
      throw eventError;
    }

    // 处理关联成员
    if (relatedPersonIds.length > 0) {
      const eventPersonRecords: SupabaseEventPerson[] = relatedPersonIds.map(personId => ({
        event_id: newEvent.id,
        person_id: personId,
        family_id: eventData.family_id,
        created_at: now,
      }));

      const { error: relationError } = await supabase
        .from('event_people')
        .insert(eventPersonRecords);

      if (relationError) {
        console.error('关联成员插入失败:', relationError);
      }
    }

    return {
      success: true,
      event: newEvent as FamilyEvent,
    };
  } catch (error) {
    console.error('创建事件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '创建事件失败',
    };
  }
}

/**
 * 获取家族的所有事件（分页）
 */
export async function getFamilyEvents(
  familyId: string,
  page: number = 1
): Promise<{ success: boolean; events?: FamilyEventWithPeople[]; hasMore?: boolean; error?: string }> {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    // 获取事件列表
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('family_id', familyId)
      .order('date', { ascending: true })
      .range(offset, offset + PAGE_SIZE);

    if (eventsError) {
      throw eventsError;
    }

    if (events.length === 0) {
      return { success: true, events: [], hasMore: false };
    }

    // 获取事件关联的成员
    const eventIds = events.map(e => e.id);
    const { data: eventPeople, error: peopleError } = await supabase
      .from('event_people')
      .select('*, person:persons(*)')
      .in('event_id', eventIds);

    if (peopleError) {
      throw peopleError;
    }

    // 组合事件和成员数据
    const eventsWithPeople: FamilyEventWithPeople[] = events.map(event => {
      const relatedPeople = eventPeople
        .filter(ep => ep.event_id === event.id)
        .map(ep => ep.person as Person);

      return {
        ...(event as FamilyEvent),
        related_people: relatedPeople,
      };
    });

    // 检查是否有更多数据
    const { count, error: countError } = await supabase
      .from('events')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    const total = count || 0;
    const hasMore = offset + events.length < total;

    return {
      success: true,
      events: eventsWithPeople,
      hasMore,
    };
  } catch (error) {
    console.error('获取家族事件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取事件失败',
    };
  }
}

/**
 * 获取单个成员关联的所有事件（分页）
 */
export async function getMemberEvents(
  personId: string,
  familyId: string,
  page: number = 1
): Promise<{ success: boolean; events?: FamilyEventWithPeople[]; hasMore?: boolean; error?: string }> {
  try {
    const offset = (page - 1) * PAGE_SIZE;

    // 获取成员关联的事件 ID
    const { data: eventPeople, error: relationError } = await supabase
      .from('event_people')
      .select('event_id')
      .eq('person_id', personId)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + PAGE_SIZE);

    if (relationError) {
      throw relationError;
    }

    if (eventPeople.length === 0) {
      return { success: true, events: [], hasMore: false };
    }

    const eventIds = eventPeople.map(ep => ep.event_id);

    // 获取事件详情
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .in('id', eventIds)
      .order('date', { ascending: true });

    if (eventsError) {
      throw eventsError;
    }

    // 获取所有事件关联的成员
    const { data: allEventPeople, error: allPeopleError } = await supabase
      .from('event_people')
      .select('*, person:persons(*)')
      .in('event_id', eventIds);

    if (allPeopleError) {
      throw allPeopleError;
    }

    // 组合数据
    const eventsWithPeople: FamilyEventWithPeople[] = events.map(event => {
      const relatedPeople = allEventPeople
        .filter(ep => ep.event_id === event.id)
        .map(ep => ep.person as Person);

      return {
        ...(event as FamilyEvent),
        related_people: relatedPeople,
      };
    });

    // 检查是否有更多
    const { count, error: countError } = await supabase
      .from('event_people')
      .select('event_id', { count: 'exact' })
      .eq('person_id', personId)
      .eq('family_id', familyId);

    const total = count || 0;
    const hasMore = offset + eventPeople.length < total;

    return {
      success: true,
      events: eventsWithPeople,
      hasMore,
    };
  } catch (error) {
    console.error('获取成员事件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取事件失败',
    };
  }
}

/**
 * 更新事件
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Omit<FamilyEvent, 'id' | 'created_at' | 'updated_at'>>,
  relatedPersonIds?: string[]
): Promise<{ success: boolean; event?: FamilyEvent; error?: string }> {
  try {
    const now = new Date().toISOString();
    const { data: updatedEvent, error: updateError } = await supabase
      .from('events')
      .update({ ...updates, updated_at: now })
      .eq('id', eventId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // 如果提供了关联成员列表，则更新关联
    if (relatedPersonIds) {
      // 删除旧关联
      await supabase
        .from('event_people')
        .delete()
        .eq('event_id', eventId);

      // 插入新关联
      if (relatedPersonIds.length > 0) {
        const eventPersonRecords: SupabaseEventPerson[] = relatedPersonIds.map(personId => ({
          event_id: eventId,
          person_id: personId,
          family_id: updatedEvent.family_id,
          created_at: now,
        }));

        await supabase
          .from('event_people')
          .insert(eventPersonRecords);
      }
    }

    return {
      success: true,
      event: updatedEvent as FamilyEvent,
    };
  } catch (error) {
    console.error('更新事件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '更新事件失败',
    };
  }
}

/**
 * 删除事件
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // 先删除关联关系
    await supabase
      .from('event_people')
      .delete()
      .eq('event_id', eventId);

    // 再删除事件
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('删除事件失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '删除事件失败',
    };
  }
}

/**
 * 事件类型图标和中文名称映射
 */
export const EVENT_TYPE_CONFIG: Record<EventType, { label: string; icon: string }> = {
  birth: { label: '出生', icon: '🎉' },
  death: { label: '逝世', icon: '🕯️' },
  marriage: { label: '结婚', icon: '💒' },
  divorce: { label: '离婚', icon: '📜' },
  migration: { label: '迁徙', icon: '🚢' },
  education: { label: '教育', icon: '🎓' },
  occupation: { label: '职业', icon: '💼' },
  achievement: { label: '成就', icon: '🏆' },
  other: { label: '其他', icon: '📝' },
};

/**
 * 格式化日期显示
 */
export function formatEventDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return dateStr;
  }
}

/**
 * 格式化日期为中文显示
 */
export function formatEventDateChinese(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  } catch {
    return dateStr;
  }
}