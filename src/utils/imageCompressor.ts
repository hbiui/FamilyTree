import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';

interface CompressImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  compressFormat?: ImageManipulator.SaveFormat;
}

const DEFAULT_OPTIONS: CompressImageOptions = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.7,
  compressFormat: ImageManipulator.SaveFormat.JPEG,
};

/**
 * 压缩图片工具函数
 */
export class ImageCompressor {
  /**
   * 压缩单张图片
   */
  static async compressImage(
    uri: string,
    options: CompressImageOptions = DEFAULT_OPTIONS
  ): Promise<ImageManipulator.ImageResult> {
    const { maxWidth, maxHeight, quality, compressFormat } = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    const actions: ImageManipulator.Action[] = [];

    // 调整大小
    actions.push({
      resize: {
        width: maxWidth,
        height: maxHeight,
      },
    });

    const saveOptions: ImageManipulator.SaveOptions = {
      compress: quality,
      format: compressFormat,
      base64: false,
    };

    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        actions,
        saveOptions
      );
      return result;
    } catch (error) {
      console.error('Image compression failed:', error);
      throw error;
    }
  }

  /**
   * 为头像优化压缩
   */
  static async compressForAvatar(
    uri: string
  ): Promise<ImageManipulator.ImageResult> {
    return this.compressImage(uri, {
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.6,
      compressFormat: ImageManipulator.SaveFormat.JPEG,
    });
  }

  /**
   * 为相册图片优化压缩
   */
  static async compressForPhoto(
    uri: string
  ): Promise<ImageManipulator.ImageResult> {
    return this.compressImage(uri, {
      maxWidth: 1200,
      maxHeight: 1200,
      quality: 0.8,
      compressFormat: ImageManipulator.SaveFormat.JPEG,
    });
  }

  /**
   * 为家族树卡片优化压缩
   */
  static async compressForTreeCard(
    uri: string
  ): Promise<ImageManipulator.ImageResult> {
    return this.compressImage(uri, {
      maxWidth: 400,
      maxHeight: 400,
      quality: 0.65,
      compressFormat: ImageManipulator.SaveFormat.JPEG,
    });
  }

  /**
   * 计算压缩比例信息
   */
  static async getCompressionInfo(
    originalUri: string,
    compressedUri: string
  ): Promise<{ originalSize: number; compressedSize: number; compressionRatio: number }> {
    const getFileSize = async (uri: string): Promise<number> => {
      // 在Web上无法直接获取文件大小，这里返回模拟值
      // 在原生环境可以使用expo-file-system获取
      return 0;
    };

    const originalSize = await getFileSize(originalUri);
    const compressedSize = await getFileSize(compressedUri);
    const compressionRatio =
      originalSize > 0 ? (originalSize - compressedSize) / originalSize : 0;

    return {
      originalSize,
      compressedSize,
      compressionRatio,
    };
  }
}
