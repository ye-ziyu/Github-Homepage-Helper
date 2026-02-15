import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  
  // 简单的专有名词翻译映射表
  private readonly properNounsMap: Record<string, string> = {
    '太原理工大学': 'Taiyuan University of Technology',
    '北京大学': 'Peking University',
    '清华大学': 'Tsinghua University',
    '上海交通大学': 'Shanghai Jiao Tong University',
    '复旦大学': 'Fudan University',
    '山西': 'Shanxi',
    '北京': 'Beijing',
    '上海': 'Shanghai',
    '软件工程师': 'Software Engineer',
    '后端开发': 'Backend Development',
    '前端开发': 'Frontend Development',
    '人工智能': 'Artificial Intelligence',
    '机器学习': 'Machine Learning',
    '深度学习': 'Deep Learning',
    '大数据': 'Big Data',
    '云计算': 'Cloud Computing',
  };

  /**
   * 翻译文本中的专有名词
   * @param text 待翻译的文本
   * @param targetLanguage 目标语言
   * @returns 翻译后的文本
   */
  translateText(text: string, targetLanguage: 'en' | 'zh'): string {
    if (!text) return text;

    try {
      let translatedText = text;

      // 处理中文到英文的翻译
      if (targetLanguage === 'en') {
        // 先处理映射表中的专有名词
        for (const [chinese, english] of Object.entries(this.properNounsMap)) {
          if (translatedText.includes(chinese)) {
            translatedText = translatedText.replace(new RegExp(chinese, 'g'), english);
          }
        }

        // 尝试使用外部翻译API（如果配置了）
        // 这里可以集成百度翻译、谷歌翻译等API
      }

      // 处理英文到中文的翻译
      if (targetLanguage === 'zh') {
        // 先处理映射表中的专有名词（反向）
        for (const [chinese, english] of Object.entries(this.properNounsMap)) {
          if (translatedText.includes(english)) {
            translatedText = translatedText.replace(new RegExp(english, 'g'), chinese);
          }
        }

        // 尝试使用外部翻译API（如果配置了）
      }

      return translatedText;
    } catch (error) {
      this.logger.error('Translation error:', error);
      return text; // 出错时返回原文
    }
  }

  /**
   * 翻译单个专有名词
   * @param noun 专有名词
   * @param targetLanguage 目标语言
   * @returns 翻译后的专有名词
   */
  translateProperNoun(noun: string, targetLanguage: 'en' | 'zh'): string {
    // 中文到英文
    if (targetLanguage === 'en') {
      return this.properNounsMap[noun] || noun;
    }

    // 英文到中文
    if (targetLanguage === 'zh') {
      for (const [chinese, english] of Object.entries(this.properNounsMap)) {
        if (english === noun) {
          return chinese;
        }
      }
      return noun;
    }

    return noun;
  }

  /**
   * 批量翻译专有名词
   * @param nouns 专有名词数组
   * @param targetLanguage 目标语言
   * @returns 翻译后的专有名词数组
   */
  translateProperNouns(nouns: string[], targetLanguage: 'en' | 'zh'): string[] {
    return nouns.map(noun => this.translateProperNoun(noun, targetLanguage));
  }
}
