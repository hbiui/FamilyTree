import { v4 as uuidv4 } from 'uuid';
import type {
  RelationParseResult,
  PhotoEnhancementResult,
  ParsedPerson,
  ParsedRelation,
  PhotoAnalysis,
  Gender,
  RelationType,
} from '../types/familyTree';

const MOCK_MODE = true; // 设置为 false 使用真实 API

const RELATION_TYPE_MAP: Record<string, RelationType> = {
  '父亲': 'father',
  '爸爸': 'father',
  '母亲': 'mother',
  '妈妈': 'mother',
  '儿子': 'son',
  '女儿': 'daughter',
  '配偶': 'spouse',
  '妻子': 'spouse',
  '丈夫': 'spouse',
  '兄弟': 'brother',
  '哥哥': 'brother',
  '弟弟': 'brother',
  '姐妹': 'sister',
  '姐姐': 'sister',
  '妹妹': 'sister',
  '祖父': 'grandfather',
  '爷爷': 'grandfather',
  '祖母': 'grandmother',
  '奶奶': 'grandmother',
  '孙子': 'grandson',
  '孙女': 'granddaughter',
  '叔叔': 'uncle',
  '伯伯': 'uncle',
  '舅舅': 'uncle',
  '阿姨': 'aunt',
  '姑姑': 'aunt',
  '姨妈': 'aunt',
  '堂兄': 'cousin',
  '表弟': 'cousin',
  '堂姐': 'cousin',
  '堂妹': 'cousin',
  '表兄': 'cousin',
  '表姐': 'cousin',
  '表妹': 'cousin',
};

const REVERSE_RELATION_MAP: Record<RelationType, RelationType> = {
  father: 'son',
  mother: 'son',
  son: 'father',
  daughter: 'father',
  spouse: 'spouse',
  brother: 'brother',
  sister: 'sister',
  grandfather: 'grandson',
  grandmother: 'grandson',
  grandson: 'grandfather',
  granddaughter: 'grandfather',
  uncle: 'nephew',
  aunt: 'nephew',
  cousin: 'cousin',
  brother_in_law: 'brother_in_law',
  sister_in_law: 'sister_in_law',
  nephew: 'uncle',
  niece: 'uncle',
};

export class AIService {
  private openaiApiKey?: string;
  private replicateApiKey?: string;

  constructor(config?: { openaiApiKey?: string; replicateApiKey?: string }) {
    this.openaiApiKey = config?.openaiApiKey;
    this.replicateApiKey = config?.replicateApiKey;
  }

  async parseRelationDescription(
    text: string,
    existingPersons?: { id: string; name: string }[]
  ): Promise<RelationParseResult> {
    if (MOCK_MODE) {
      return this.mockParseRelationDescription(text, existingPersons);
    }

    try {
      if (!this.openaiApiKey) {
        throw new Error('OpenAI API key 未配置');
      }

      const systemPrompt = this.getSystemPrompt(existingPersons);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: text },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 请求失败: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        success: true,
        persons: result.persons || [],
        relations: result.relations || [],
        raw_text: text,
        ai_notes: result.notes,
      };
    } catch (error) {
      return {
        success: false,
        persons: [],
        relations: [],
        raw_text: text,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private getSystemPrompt(
    existingPersons?: { id: string; name: string }[]
  ): string {
    let prompt = `你是一位专业的家族关系分析助手。请分析用户输入的自然语言描述，提取家族成员信息和他们之间的关系。

输出格式必须是 JSON，包含以下字段：
- persons: 数组，每个成员包含 id, name, gender ("male" | "female" | "unknown"), birth_date (可选, YYYY-MM-DD 格式), death_date (可选), is_alive (boolean), is_placeholder (总是 true), notes (可选)
- relations: 数组，每个关系包含 from_id, to_id, relation_type (必须是以下之一: father, mother, son, daughter, spouse, brother, sister, grandfather, grandmother, grandson, granddaughter, uncle, aunt, cousin, brother_in_law, sister_in_law, nephew, niece), confidence (0-1的数字), notes (可选)
- notes: 字符串，AI 对此分析的备注

重要规则：
1. 为每个新成员生成唯一的 id（使用 UUID 格式）
2. relation_type 必须严格从给定列表中选择
3. 如果已有成员列表，请优先使用已有的 id
4. 每个关系必须双向建立（如果 A 是 B 的父亲，那么 B 是 A 的儿子）
5. 不确定的信息设置较低的 confidence 值
6. 不要编造信息，不确定时留空或设为 unknown`;

    if (existingPersons && existingPersons.length > 0) {
      prompt += `\n\n已有成员列表：
${existingPersons.map((p) => `- ${p.id}: ${p.name}`).join('\n')}
如果输入中提到这些成员，请使用对应的 id。`;
    }

    return prompt;
  }

  private mockParseRelationDescription(
    text: string,
    existingPersons?: { id: string; name: string }[]
  ): Promise<RelationParseResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const persons: ParsedPerson[] = [];
        const relations: ParsedRelation[] = [];
        const nameToId: Record<string, string> = {};

        existingPersons?.forEach((p) => {
          nameToId[p.name] = p.id;
        });

        const createPerson = (name: string, gender: Gender = 'unknown'): string => {
          if (nameToId[name]) {
            return nameToId[name];
          }
          const id = uuidv4();
          nameToId[name] = id;
          persons.push({
            id,
            name,
            gender,
            is_alive: true,
            is_placeholder: true,
            notes: 'AI 生成的占位节点',
          });
          return id;
        };

        const addRelation = (
          fromName: string,
          toName: string,
          relationType: RelationType,
          confidence: number = 0.9
        ) => {
          const fromId = createPerson(
            fromName,
            ['father', 'son', 'brother', 'grandfather', 'grandson', 'uncle', 'nephew'].includes(
              relationType
            )
              ? 'male'
              : ['mother', 'daughter', 'sister', 'grandmother', 'granddaughter', 'aunt', 'niece'].includes(
                  relationType
                )
              ? 'female'
              : 'unknown'
          );
          const toId = createPerson(
            toName,
            ['son', 'grandson', 'nephew', 'brother'].includes(relationType)
              ? 'male'
              : ['daughter', 'granddaughter', 'niece', 'sister'].includes(relationType)
              ? 'female'
              : 'unknown'
          );
          relations.push({
            from_id: fromId,
            to_id: toId,
            relation_type: relationType,
            confidence,
            notes: `从描述 "${text}" 解析`,
          });
          const reverseType = REVERSE_RELATION_MAP[relationType];
          if (reverseType) {
            relations.push({
              from_id: toId,
              to_id: fromId,
              relation_type: reverseType,
              confidence,
              notes: `反向关系`,
            });
          }
        };

        let notes = '成功解析家族关系';

        if (text.includes('张三') && text.includes('李四')) {
          if (text.includes('父亲') || text.includes('爸爸')) {
            addRelation('张三', '李四', 'father', 0.95);
          } else if (text.includes('儿子')) {
            addRelation('张三', '李四', 'son', 0.95);
          } else if (text.includes('结婚') || text.includes('配偶')) {
            addRelation('张三', '李四', 'spouse', 0.9);
          }
        } else if (text.includes('李华') && text.includes('李明')) {
          if (text.includes('兄弟')) {
            addRelation('李华', '李明', 'brother', 0.85);
          }
        } else {
          const names = text.match(/[\u4e00-\u9fa5]{2,4}/g) || [];
          if (names.length >= 2) {
            addRelation(names[0], names[1], 'father', 0.7);
            notes = '模糊解析，请仔细核对关系类型';
          } else if (names.length === 1) {
            createPerson(names[0], 'unknown');
          }
        }

        resolve({
          success: true,
          persons,
          relations,
          raw_text: text,
          ai_notes: notes,
        });
      }, 1500);
    });
  }

  async enhancePhoto(imageUrl: string): Promise<PhotoEnhancementResult> {
    if (MOCK_MODE) {
      return this.mockEnhancePhoto(imageUrl);
    }

    try {
      if (!this.replicateApiKey) {
        throw new Error('Replicate API key 未配置');
      }

      const beforeAnalysis = await this.analyzePhoto(imageUrl);

      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${this.replicateApiKey}`,
        },
        body: JSON.stringify({
          version: '92836086cc3a16d220e16282a636b498c764d6d39d299e49e59b0a113c862227',
          input: {
            image: imageUrl,
            version: 'v1.4',
            scale: 2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Replicate API 请求失败: ${response.status}`);
      }

      const prediction = await response.json();
      const enhancedUrl = prediction.output;

      const afterAnalysis = await this.analyzePhoto(enhancedUrl);

      return {
        success: true,
        original_url: imageUrl,
        enhanced_url: enhancedUrl,
        before_analysis: beforeAnalysis,
        after_analysis: afterAnalysis,
        processing_time_ms: prediction.metrics?.predict_time * 1000 || 3000,
      };
    } catch (error) {
      return {
        success: false,
        original_url: imageUrl,
        enhanced_url: imageUrl,
        before_analysis: await this.analyzePhoto(imageUrl),
        after_analysis: await this.analyzePhoto(imageUrl),
        processing_time_ms: 0,
        error: error instanceof Error ? error.message : '未知错误',
      };
    }
  }

  private async analyzePhoto(imageUrl: string): Promise<PhotoAnalysis> {
    return {
      clarity_score: MOCK_MODE ? 45 : 50,
      sharpness_score: MOCK_MODE ? 40 : 55,
      color_score: MOCK_MODE ? 60 : 65,
      noise_level: MOCK_MODE ? 70 : 40,
      face_detected: true,
      face_count: 1,
      resolution: { width: 800, height: 600 },
      file_size_kb: 150,
    };
  }

  private mockEnhancePhoto(imageUrl: string): Promise<PhotoEnhancementResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const beforeAnalysis: PhotoAnalysis = {
          clarity_score: 42,
          sharpness_score: 38,
          color_score: 55,
          noise_level: 75,
          face_detected: true,
          face_count: 1,
          resolution: { width: 600, height: 800 },
          file_size_kb: 120,
        };

        const afterAnalysis: PhotoAnalysis = {
          clarity_score: 88,
          sharpness_score: 92,
          color_score: 85,
          noise_level: 15,
          face_detected: true,
          face_count: 1,
          resolution: { width: 1200, height: 1600 },
          file_size_kb: 450,
        };

        resolve({
          success: true,
          original_url: imageUrl,
          enhanced_url: imageUrl,
          before_analysis: beforeAnalysis,
          after_analysis: afterAnalysis,
          processing_time_ms: 2800,
        });
      }, 2500);
    });
  }
}

export const aiService = new AIService();
