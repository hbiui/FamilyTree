import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';

export interface DeleteAccountResult {
  success: boolean;
  message: string;
  error?: string;
}

export const deleteAccountService = {
  async deleteAccount(userId: string): Promise<DeleteAccountResult> {
    try {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
      
      if (deleteUserError) {
        return {
          success: false,
          message: '删除账号失败',
          error: deleteUserError.message,
        };
      }

      return {
        success: true,
        message: '账号已成功删除',
      };
    } catch (error) {
      console.error('Error deleting account:', error);
      return {
        success: false,
        message: '删除账号失败',
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  },

  async deleteAllUserData(userId: string): Promise<DeleteAccountResult> {
    const promises = [
      supabase.from('families').delete().eq('created_by', userId),
      supabase.from('members').delete().eq('created_by', userId),
      supabase.from('relationships').delete().eq('created_by', userId),
      supabase.from('family_members').delete().eq('user_id', userId),
      supabase.from('collaborations').delete().eq('user_id', userId),
      supabase.from('feedback_entries').delete().eq('user_id', userId),
    ];

    try {
      const results = await Promise.all(promises);
      
      const errors = results.filter(r => r.error);
      if (errors.length > 0) {
        return {
          success: false,
          message: '部分数据删除失败',
          error: errors.map(e => e.error?.message).join(', '),
        };
      }

      return {
        success: true,
        message: '所有用户数据已删除',
      };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return {
        success: false,
        message: '删除数据失败',
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  },

  async fullAccountDeletion(userId: string): Promise<DeleteAccountResult> {
    const dataResult = await this.deleteAllUserData(userId);
    
    if (!dataResult.success) {
      return dataResult;
    }

    return await this.deleteAccount(userId);
  },

  async checkUserExists(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      
      if (error) {
        console.error('Error checking user:', error);
        return false;
      }
      
      return data.user !== null;
    } catch (error) {
      console.error('Error checking user:', error);
      return false;
    }
  },
};
