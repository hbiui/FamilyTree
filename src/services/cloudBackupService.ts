/**
 * 云端备份服务
 * 
 * 功能说明：
 * 1. 创建本地备份文件
 * 2. 备份到 iCloud (使用 expo-file-system)
 * 3. 备份到 Google Drive (通过 expo-sharing)
 * 4. 从备份恢复数据
 * 5. 备份历史管理
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { gedcomService } from './gedcomService';
import type { TreeNode, Person, Family, Relation } from '../types/familyTree';

export interface BackupMetadata {
  id: string;
  familyId: string;
  familyName: string;
  createdAt: string;
  version: string;
  memberCount: number;
  fileSize?: number;
  checksum?: string;
}

export interface BackupData {
  version: string;
  exportedAt: string;
  family: {
    id: string;
    name: string;
    description?: string;
  };
  persons: Person[];
  relations: Relation[];
  metadata?: BackupMetadata;
}

export interface BackupResult {
  success: boolean;
  backupId?: string;
  filePath?: string;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  data?: BackupData;
  error?: string;
}

const BACKUP_DIR = `${FileSystem.documentDirectory}backups/`;
const BACKUP_INDEX_FILE = `${BACKUP_DIR}index.json`;
const CURRENT_VERSION = '1.0.0';

export async function ensureBackupDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(BACKUP_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(BACKUP_DIR, { intermediates: true });
  }
}

export async function createBackupIndex(): Promise<void> {
  await ensureBackupDir();
  const info = await FileSystem.getInfoAsync(BACKUP_INDEX_FILE);
  if (!info.exists) {
    await FileSystem.writeAsStringAsync(BACKUP_INDEX_FILE, JSON.stringify([], null, 2));
  }
}

export async function getBackupList(): Promise<BackupMetadata[]> {
  try {
    await createBackupIndex();
    const content = await FileSystem.readAsStringAsync(BACKUP_INDEX_FILE);
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to read backup index:', error);
    return [];
  }
}

export async function saveBackupIndex(backups: BackupMetadata[]): Promise<void> {
  await ensureBackupDir();
  await FileSystem.writeAsStringAsync(BACKUP_INDEX_FILE, JSON.stringify(backups, null, 2));
}

function calculateChecksum(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

export async function createLocalBackup(
  familyId: string,
  familyName: string,
  persons: Person[],
  relations: Relation[]
): Promise<BackupResult> {
  try {
    await ensureBackupDir();
    
    const backupId = `${familyId}_${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    const backupData: BackupData = {
      version: CURRENT_VERSION,
      exportedAt: timestamp,
      family: {
        id: familyId,
        name: familyName,
      },
      persons,
      relations,
    };
    
    const jsonContent = JSON.stringify(backupData, null, 2);
    const checksum = calculateChecksum(jsonContent);
    
    const gedcomContent = gedcomService.exportToGedcom(
      { id: familyId, name: familyName, created_by: '' } as any,
      persons,
      relations
    );
    
    const jsonFileName = `${familyName}_backup_${backupId}.json`;
    const gedcomFileName = `${familyName}_backup_${backupId}.ged`;
    const jsonPath = `${BACKUP_DIR}${jsonFileName}`;
    const gedcomPath = `${BACKUP_DIR}${gedcomFileName}`;
    
    await FileSystem.writeAsStringAsync(jsonPath, jsonContent);
    await FileSystem.writeAsStringAsync(gedcomPath, gedcomContent);
    
    const fileInfo = await FileSystem.getInfoAsync(jsonPath);
    const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
    
    const metadata: BackupMetadata = {
      id: backupId,
      familyId,
      familyName,
      createdAt: timestamp,
      version: CURRENT_VERSION,
      memberCount: persons.length,
      fileSize,
      checksum,
    };
    
    const backups = await getBackupList();
    backups.unshift(metadata);
    await saveBackupIndex(backups);
    
    return {
      success: true,
      backupId,
      filePath: jsonPath,
    };
  } catch (error) {
    console.error('Backup creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '备份创建失败',
    };
  }
}

export async function backupToIcloud(
  familyId: string,
  familyName: string,
  persons: Person[],
  relations: Relation[]
): Promise<BackupResult> {
  try {
    const localResult = await createLocalBackup(familyId, familyName, persons, relations);
    
    if (!localResult.success) {
      return localResult;
    }
    
    const icloudBaseUri = FileSystem.documentDirectory;
    if (!icloudBaseUri) {
      return {
        success: false,
        error: 'iCloud 存储不可用',
      };
    }
    
    const icloudBackupDir = `${icloudBaseUri}iCloud/FamilyTree/`;
    const icloudDirInfo = await FileSystem.getInfoAsync(icloudBackupDir);
    
    if (!icloudDirInfo.exists) {
      await FileSystem.makeDirectoryAsync(icloudBackupDir, { intermediates: true });
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const icloudJsonPath = `${icloudBackupDir}${familyName}_${timestamp}.json`;
    const icloudGedcomPath = `${icloudBackupDir}${familyName}_${timestamp}.ged`;
    
    if (localResult.filePath) {
      await FileSystem.copyAsync({
        from: localResult.filePath,
        to: icloudJsonPath,
      });
      
      const gedcomPath = localResult.filePath.replace('.json', '.ged');
      const gedcomInfo = await FileSystem.getInfoAsync(gedcomPath);
      if (gedcomInfo.exists) {
        await FileSystem.copyAsync({
          from: gedcomPath,
          to: icloudGedcomPath,
        });
      }
    }
    
    return {
      success: true,
      backupId: localResult.backupId,
      filePath: icloudJsonPath,
    };
  } catch (error) {
    console.error('iCloud backup failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'iCloud 备份失败',
    };
  }
}

export async function shareToCloud(
  familyId: string,
  familyName: string,
  persons: Person[],
  relations: Relation[]
): Promise<BackupResult> {
  try {
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString();
    const backupData: BackupData = {
      version: CURRENT_VERSION,
      exportedAt: timestamp,
      family: {
        id: familyId,
        name: familyName,
      },
      persons,
      relations,
    };
    
    const gedcomContent = gedcomService.exportToGedcom(
      { id: familyId, name: familyName, created_by: '' } as any,
      persons,
      relations
    );
    
    const jsonFileName = `${familyName}_${Date.now()}.json`;
    const gedcomFileName = `${familyName}_${Date.now()}.ged`;
    const jsonPath = `${BACKUP_DIR}${jsonFileName}`;
    const gedcomPath = `${BACKUP_DIR}${gedcomFileName}`;
    
    await FileSystem.writeAsStringAsync(jsonPath, JSON.stringify(backupData, null, 2));
    await FileSystem.writeAsStringAsync(gedcomPath, gedcomContent);
    
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (!isAvailable) {
      return {
        success: false,
        error: '当前设备不支持分享功能',
      };
    }
    
    await Sharing.shareAsync(gedcomPath, {
      mimeType: 'text/plain',
      dialogTitle: `分享 ${familyName} 家族数据`,
      UTI: 'public.plain-text',
    });
    
    return {
      success: true,
      filePath: gedcomPath,
    };
  } catch (error) {
    console.error('Cloud share failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '云端分享失败',
    };
  }
}

export async function restoreFromFile(fileUri: string): Promise<RestoreResult> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    
    if (!fileInfo.exists) {
      return {
        success: false,
        error: '文件不存在',
      };
    }
    
    const content = await FileSystem.readAsStringAsync(fileUri);
    
    const isJson = fileUri.toLowerCase().endsWith('.json');
    
    if (isJson) {
      try {
        const data = JSON.parse(content) as BackupData;
        
        if (!data.version || !data.persons) {
          return {
            success: false,
            error: '无效的备份文件格式',
          };
        }
        
        return {
          success: true,
          data,
        };
      } catch {
        return {
          success: false,
          error: 'JSON 解析失败',
        };
      }
    }
    
    return {
      success: false,
      error: '请选择 .json 格式的备份文件',
    };
  } catch (error) {
    console.error('Restore failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '恢复失败',
    };
  }
}

export async function pickAndRestoreFile(): Promise<RestoreResult> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true,
    });
    
    if (result.canceled) {
      return {
        success: false,
        error: '用户取消选择',
      };
    }
    
    const fileUri = result.assets[0]?.uri;
    if (!fileUri) {
      return {
        success: false,
        error: '未能获取文件',
      };
    }
    
    return restoreFromFile(fileUri);
  } catch (error) {
    console.error('File pick failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '文件选择失败',
    };
  }
}

export async function deleteBackup(backupId: string): Promise<boolean> {
  try {
    const backups = await getBackupList();
    const backupIndex = backups.findIndex(b => b.id === backupId);
    
    if (backupIndex === -1) {
      return false;
    }
    
    const backup = backups[backupIndex];
    const jsonFileName = `${backup.familyName}_backup_${backupId}.json`;
    const gedcomFileName = `${backup.familyName}_backup_${backupId}.ged`;
    
    const jsonPath = `${BACKUP_DIR}${jsonFileName}`;
    const gedcomPath = `${BACKUP_DIR}${gedcomFileName}`;
    
    const jsonInfo = await FileSystem.getInfoAsync(jsonPath);
    if (jsonInfo.exists) {
      await FileSystem.deleteAsync(jsonPath, { idempotent: true });
    }
    
    const gedcomInfo = await FileSystem.getInfoAsync(gedcomPath);
    if (gedcomInfo.exists) {
      await FileSystem.deleteAsync(gedcomPath, { idempotent: true });
    }
    
    backups.splice(backupIndex, 1);
    await saveBackupIndex(backups);
    
    return true;
  } catch (error) {
    console.error('Delete backup failed:', error);
    return false;
  }
}

export async function getBackupStats(): Promise<{
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
}> {
  try {
    const backups = await getBackupList();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        totalSize: 0,
      };
    }
    
    let totalSize = 0;
    let oldestDate = backups[0].createdAt;
    let newestDate = backups[0].createdAt;
    
    for (const backup of backups) {
      totalSize += backup.fileSize || 0;
      
      if (backup.createdAt < oldestDate) {
        oldestDate = backup.createdAt;
      }
      if (backup.createdAt > newestDate) {
        newestDate = backup.createdAt;
      }
    }
    
    return {
      totalBackups: backups.length,
      totalSize,
      oldestBackup: oldestDate,
      newestBackup: newestDate,
    };
  } catch (error) {
    console.error('Failed to get backup stats:', error);
    return {
      totalBackups: 0,
      totalSize: 0,
    };
  }
}

export async function validateBackup(fileUri: string): Promise<{
  valid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  try {
    const content = await FileSystem.readAsStringAsync(fileUri);
    let data: BackupData;
    
    try {
      data = JSON.parse(content);
    } catch {
      errors.push('文件不是有效的 JSON 格式');
      return { valid: false, errors, warnings };
    }
    
    if (!data.version) {
      errors.push('缺少版本信息');
    } else if (data.version !== CURRENT_VERSION) {
      warnings.push(`版本不匹配: 当前 ${CURRENT_VERSION}, 文件 ${data.version}`);
    }
    
    if (!data.family) {
      errors.push('缺少家族信息');
    }
    
    if (!data.persons || !Array.isArray(data.persons)) {
      errors.push('缺少成员数据');
    } else {
      if (data.persons.length === 0) {
        warnings.push('成员数据为空');
      }
      
      const invalidPersons = data.persons.filter(p => !p.name);
      if (invalidPersons.length > 0) {
        errors.push(`${invalidPersons.length} 个成员缺少姓名`);
      }
    }
    
    if (!data.relations || !Array.isArray(data.relations)) {
      warnings.push('缺少关系数据');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : '验证失败');
    return { valid: false, errors, warnings };
  }
}
