import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RedisService } from '../../../common/redis/redis.service';
import { TranslationService } from '../../../common/translation/translation.service';

@Processor('bio-generation')
export class BioQueueProcessor {
  private readonly logger = new Logger(BioQueueProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly translationService: TranslationService,
  ) {}

  @Process('generate-bio')
  async handleBioGeneration(job: Job) {
    const { userId, config, jobId, historyId } = job.data;

    this.logger.log(`Processing bio generation for user ${userId}`);

    try {
      // Update progress
      await this.updateProgress(historyId, 10);
      await this.updateJobCache(jobId, 10);

      // Get user info
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      await this.updateProgress(historyId, 30);
      await this.updateJobCache(jobId, 30);

      // Generate bio (in production, call OpenAI API)
      const bioContent = await this.generateBioContent(user, config);
      const shortBio = this.generateShortBio(bioContent, config.language);

      await this.updateProgress(historyId, 80);
      await this.updateJobCache(jobId, 80);

      // Save result
      const result = {
        bio: bioContent,
        shortBio,
        wordCount: bioContent.split(/\s+/).filter(w => w.length > 0).length,
        characterCount: bioContent.length,
        shortBioCharacterCount: shortBio.length,
      };

      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: {
          status: 'completed',
          progress: 100,
          outputResult: JSON.stringify(result),
        },
      });

      await this.updateProgress(historyId, 100);
      await this.updateJobCache(jobId, 100, result);

      // Clear job cache after completion
      setTimeout(() => {
        this.redis.del(`job:${jobId}`);
      }, 3600000); // 1 hour

      return result;
    } catch (error) {
      this.logger.error(`Bio generation failed: ${error.message}`);

      await this.prisma.generationHistory.update({
        where: { id: historyId },
        data: {
          status: 'failed',
          errorMessage: error.message,
        },
      });

      await this.updateJobCache(jobId, 100, null, error.message);

      throw error;
    }
  }

  private async generateBioContent(user: any, config: any): Promise<string> {
    const displayName = user.displayName || user.username;
    const language = config.language || 'en';
    const style = config.style || 'professional';
    
    const bioInfo = await this.extractBioInfo(user, config);
    const processedPrompt = this.processCustomPrompt(config.customPrompt || '');
    
    const styleVariations = this.getStyleVariations(style);
    
    let bio = '';
    
    switch (language) {
      case 'zh':
        bio = this.generateChineseBio(displayName, bioInfo, processedPrompt, styleVariations.zh);
        break;
      case 'bilingual':
        const chineseBio = this.generateChineseBio(displayName, bioInfo, processedPrompt, styleVariations.zh);
        const englishBio = this.generateEnglishBio(displayName, bioInfo, processedPrompt, styleVariations.en);
        bio = `${chineseBio.trim()}\n\n${englishBio.trim()}`;
        break;
      case 'en':
      default:
        bio = this.generateEnglishBio(displayName, bioInfo, processedPrompt, styleVariations.en);
        break;
    }

    return bio.trim();
  }

  private async extractBioInfo(user: any, config: any): Promise<any> {
    const userIdentity = config.identity || '';
    const userWorkplace = config.workplace || '';
    const includeStats = config.includeStats || false;
    const includeSkills = config.includeSkills || false;
    const includeProjects = config.includeProjects || false;
    
    // Debug log
    this.logger.log(`ExtractBioInfo: userIdentity='${userIdentity}', userWorkplace='${userWorkplace}'`);

    let isStudent = false;
    let identity = '';
    let chineseIdentity = '';
    let workplace = '';
    let chineseWorkplace = '';
    let location = '';
    let chineseLocation = '';
    let major = '';
    let chineseMajor = '';
    let personalDescription = '';
    let languages = '';
    let hasStars = false;

    if (userIdentity && userIdentity.trim()) {
      // Use user-provided identity
      if (this.containsEnglish(userIdentity)) {
        identity = userIdentity;
      } else {
        // Map Chinese identity to English
        if (userIdentity.includes('学生')) {
          identity = 'student';
        } else if (userIdentity.includes('开发者')) {
          identity = 'developer';
        } else if (userIdentity.includes('工程师')) {
          identity = 'engineer';
        } else if (userIdentity.includes('老师')) {
          identity = 'teacher';
        } else if (userIdentity.includes('教授')) {
          identity = 'professor';
        } else if (userIdentity.includes('研究员')) {
          identity = 'researcher';
        } else {
          identity = userIdentity;
        }
      }
      
      if (!this.containsEnglish(userIdentity)) {
        chineseIdentity = userIdentity;
      } else {
        // Map English identity to Chinese
        if (userIdentity.toLowerCase().includes('student')) {
          chineseIdentity = '学生';
        } else if (userIdentity.toLowerCase().includes('developer')) {
          chineseIdentity = '开发者';
        } else if (userIdentity.toLowerCase().includes('engineer')) {
          chineseIdentity = '工程师';
        } else if (userIdentity.toLowerCase().includes('teacher')) {
          chineseIdentity = '老师';
        } else if (userIdentity.toLowerCase().includes('professor')) {
          chineseIdentity = '教授';
        } else if (userIdentity.toLowerCase().includes('researcher')) {
          chineseIdentity = '研究员';
        } else {
          chineseIdentity = userIdentity;
        }
      }
      
      // Set isStudent based on user-provided identity
      if (userIdentity.toLowerCase().includes('student') || userIdentity.includes('学生')) {
        isStudent = true;
      } else {
        isStudent = false; // Explicitly set to false for non-student identities
      }
    } else {
      // Extract from GitHub bio if no identity provided
      if (user.bio && (user.bio.toLowerCase().includes('student') || user.bio.toLowerCase().includes('university') || user.bio.toLowerCase().includes('college'))) {
        isStudent = true;
        identity = 'student';
        chineseIdentity = '学生';
      } else {
        identity = 'developer';
        chineseIdentity = '开发者';
      }
    }

    if (userWorkplace && userWorkplace.trim()) {
      // Use user-provided workplace
      const translatedWorkplaceEn = this.translationService.translateText(userWorkplace, 'en');
      const translatedWorkplaceZh = this.translationService.translateText(userWorkplace, 'zh');
      
      // 过滤掉所有中文内容
      const filteredWorkplaceEn = translatedWorkplaceEn.replace(/[\u4e00-\u9fa5]+/g, '');
      
      if (isStudent) {
        workplace = ` at ${filteredWorkplaceEn}`;
        chineseWorkplace = `，在${translatedWorkplaceZh}学习`;
      } else {
        workplace = ` at ${filteredWorkplaceEn}`;
        chineseWorkplace = `，在${translatedWorkplaceZh}工作`;
      }
    } else if (user.company) {
      // Use GitHub company if no workplace provided
      workplace = ` at ${user.company}`;
      chineseWorkplace = isStudent ? `，在${user.company}学习` : `，在${user.company}工作`;
    }

    if (user.location) {
      // Use GitHub location
      const locationParts = user.location.split(',');
      if (locationParts.length > 0) {
        const mainLocation = locationParts[locationParts.length - 2] || locationParts[0];
        location = ` from ${mainLocation.trim()}`;
        chineseLocation = `，来自${mainLocation.trim()}`;
      }
    }

    if (user.bio) {
      // Extract major info from GitHub bio if available
      if (user.bio.toLowerCase().includes('major')) {
        const majorMatch = user.bio.match(/majoring in ([^.]+)/i);
        if (majorMatch) {
          let majorText = majorMatch[1];
          // 过滤掉所有中文内容
          majorText = majorText.replace(/[\u4e00-\u9fa5]+/g, '');
          major = ` majoring in ${majorText}`;
          if (this.containsChinese(majorMatch[1])) {
            chineseMajor = `，专业是${majorMatch[1]}`;
          } else {
            const majorEnglish = majorText.toLowerCase();
            if (majorEnglish.includes('software')) {
              chineseMajor = '，专业是软件工程';
            } else if (majorEnglish.includes('computer')) {
              chineseMajor = '，专业是计算机科学';
            } else if (majorEnglish.includes('engineering')) {
              chineseMajor = '，专业是工程学';
            } else {
              chineseMajor = `，专业是${majorText}`;
            }
          }
        }
      }
      
      personalDescription = user.bio;
    }

    if (includeSkills && user.languages) {
      languages = (user.languages as string[]).slice(0, 3).join(', ');
    }

    if (includeStats && user.stars > 0) {
      hasStars = true;
    }

    return {
      identity,
      chineseIdentity,
      workplace,
      chineseWorkplace,
      location,
      chineseLocation,
      major,
      chineseMajor,
      personalDescription,
      languages,
      hasStars,
      includeStats,
      includeSkills,
      includeProjects,
      isStudent,
    };
  }

  private generateShortBio(fullBio: string, language: string): string {
    if (!fullBio) return '';
    
    // Count characters for single language versions
    const charCount = this.countCharacters(fullBio);
    
    // For single language (Chinese or English)
    if (language === 'zh' || language === 'en') {
      if (charCount <= 150) {
        // 过滤掉所有中文内容（如果是英文）
        if (language === 'en') {
          return fullBio.replace(/[\u4e00-\u9fa5]+/g, '');
        }
        return fullBio; // Within 150 chars, use as is
      } else if (charCount <= 200) {
        // 过滤掉所有中文内容（如果是英文）
        if (language === 'en') {
          const filteredFullBio = fullBio.replace(/[\u4e00-\u9fa5]+/g, '');
          return this.generateSummary(filteredFullBio, language, 150, 158);
        }
        return this.generateSummary(fullBio, language, 150, 158); // 150-200 chars, summarize to ~150
      } else {
        // 过滤掉所有中文内容（如果是英文）
        if (language === 'en') {
          const filteredFullBio = fullBio.replace(/[\u4e00-\u9fa5]+/g, '');
          return this.generateSummary(filteredFullBio, language, 158, 158);
        }
        return this.generateSummary(fullBio, language, 158, 158); // >200 chars, summarize to 158
      }
    }
    
    // For bilingual bio, process each part separately
    if (language === 'bilingual') {
      const parts = fullBio.split('\n\n');
      if (parts.length === 2) {
        const chinesePart = parts[0].trim();
        const englishPart = parts[1].trim();
        
        const chineseCharCount = this.countCharacters(chinesePart);
        const englishCharCount = this.countCharacters(englishPart);
        
        // Process Chinese part
        let chineseResult = chinesePart;
        if (chineseCharCount <= 150) {
          chineseResult = chinesePart;
        } else if (chineseCharCount <= 200) {
          chineseResult = this.generateSummary(chinesePart, 'zh', 150, 158);
        } else {
          chineseResult = this.generateSummary(chinesePart, 'zh', 158, 158);
        }
        
        // Process English part
        let englishResult = englishPart;
        // 过滤掉所有中文内容
        englishResult = englishResult.replace(/[\u4e00-\u9fa5]+/g, '');
        if (englishCharCount <= 150) {
          // 过滤掉所有中文内容
          englishResult = englishResult.replace(/[\u4e00-\u9fa5]+/g, '');
        } else if (englishCharCount <= 200) {
          // 过滤掉所有中文内容
          const filteredEnglishPart = englishPart.replace(/[\u4e00-\u9fa5]+/g, '');
          englishResult = this.generateSummary(filteredEnglishPart, 'en', 150, 158);
        } else {
          // 过滤掉所有中文内容
          const filteredEnglishPart = englishPart.replace(/[\u4e00-\u9fa5]+/g, '');
          englishResult = this.generateSummary(filteredEnglishPart, 'en', 158, 158);
        }
        
        return `${chineseResult.trim()}\n\n${englishResult.trim()}`;
      }
    }
    
    // Default: simple truncation
    return fullBio.substring(0, 157) + '...';
  }

  private countCharacters(text: string): number {
    if (!text) return 0;
    return text.length;
  }

  private generateSummary(text: string, language: string, targetLength: number, maxLength: number): string {
    if (!text) return '';
    
    // Split into sentences
    const sentenceRegex = language === 'zh' ? /[。！？.!?]/ : /[.!?]/;
    const sentences = text.split(sentenceRegex).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return '';
    
    // Extract key information from sentences
    let summary = '';
    let charCount = 0;
    
    for (const sentence of sentences) {
      if (charCount + sentence.length > targetLength) {
        break;
      }
      summary += sentence + (language === 'zh' ? '。' : '. ');
      charCount += sentence.length + (language === 'zh' ? 1 : 2);
    }
    
    // If summary is too short, add more content
    if (summary.length < targetLength * 0.8 && sentences.length > 1) {
      const remaining = sentences.slice(1, 3);
      for (const sentence of remaining) {
        if (summary.length + sentence.length > targetLength) {
          break;
        }
        summary += sentence + (language === 'zh' ? '。' : '. ');
      }
    }
    
    summary = summary.trim();
    
    // If exceeds maxLength, truncate with "..."
    if (summary.length > maxLength) {
      return summary.substring(0, maxLength - 3) + '...';
    }
    
    return summary;
  }

  private processCustomPrompt(prompt: string): any {
    if (!prompt) {
      return { zh: '', en: '' };
    }

    let zh = '';
    let en = '';
    const processedKeywords = new Set<string>();

    if (this.containsChinese(prompt)) {
      if (prompt.includes('后端开发') && !processedKeywords.has('backend')) {
        processedKeywords.add('backend');
        zh += '，专注于后端开发技术';
        en += ' specializing in backend development';
      }
      if (prompt.includes('前端开发') && !processedKeywords.has('frontend')) {
        processedKeywords.add('frontend');
        zh += '，专注于前端开发技术';
        en += ' specializing in frontend development';
      }
      if ((prompt.includes('AI') || prompt.includes('人工智能')) && !processedKeywords.has('ai')) {
        processedKeywords.add('ai');
        zh += '，对人工智能技术充满兴趣';
        en += ' passionate about artificial intelligence';
      }
      if ((prompt.includes('coding') || prompt.includes('编程')) && !processedKeywords.has('coding')) {
        processedKeywords.add('coding');
        zh += '，热衷于编程练习';
        en += ' enthusiastic about coding practice';
      }
      if (prompt.includes('学习') && !processedKeywords.has('learning')) {
        processedKeywords.add('learning');
        zh += '，持续学习新技术';
        en += ' continuously learning new technologies';
      }
      if (prompt.includes('练习') && !processedKeywords.has('practice')) {
        processedKeywords.add('practice');
        zh += '，积极进行技术练习';
        en += ' actively practicing technical skills';
      }
    }

    if (this.containsEnglish(prompt)) {
      if (prompt.toLowerCase().includes('backend') && !processedKeywords.has('backend')) {
        processedKeywords.add('backend');
        zh += '，专注于后端开发技术';
        en += ' specializing in backend development';
      }
      if (prompt.toLowerCase().includes('frontend') && !processedKeywords.has('frontend')) {
        processedKeywords.add('frontend');
        zh += '，专注于前端开发技术';
        en += ' specializing in frontend development';
      }
      if ((prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('artificial intelligence')) && !processedKeywords.has('ai')) {
        processedKeywords.add('ai');
        zh += '，对人工智能技术充满兴趣';
        en += ' passionate about artificial intelligence';
      }
      if ((prompt.toLowerCase().includes('coding') || prompt.toLowerCase().includes('programming')) && !processedKeywords.has('coding')) {
        processedKeywords.add('coding');
        zh += '，热衷于编程练习';
        en += ' enthusiastic about coding practice';
      }
      if (prompt.toLowerCase().includes('learning') && !processedKeywords.has('learning')) {
        processedKeywords.add('learning');
        zh += '，持续学习新技术';
        en += ' continuously learning new technologies';
      }
      if (prompt.toLowerCase().includes('practice') && !processedKeywords.has('practice')) {
        processedKeywords.add('practice');
        zh += '，积极进行技术练习';
        en += ' actively practicing technical skills';
      }
    }

    return { zh, en, keywords: Array.from(processedKeywords) };
  }

  private generateChineseBio(displayName: string, bioInfo: any, processedPrompt: any, styleVariation: string): string {
    let bio = `我是${displayName}，一名${bioInfo.chineseIdentity}${bioInfo.chineseWorkplace}${bioInfo.chineseMajor}${bioInfo.chineseLocation}。`;
    
    if (bioInfo.personalDescription && !this.containsEnglish(bioInfo.personalDescription)) {
      bio += ` ${bioInfo.personalDescription}`;
    }
    
    if (processedPrompt.zh) {
      bio += processedPrompt.zh;
    }
    
    if (bioInfo.includeStats && bioInfo.hasStars) {
      bio += '，我的作品获得了一些星标';
    }
    
    if (bioInfo.includeSkills && bioInfo.languages) {
      bio += `，精通${bioInfo.languages}`;
    }
    
    if (bioInfo.includeProjects) {
      bio += '，正在致力于多个项目';
    }
    
    bio += styleVariation;
    
    return bio;
  }

  private generateEnglishBio(displayName: string, bioInfo: any, processedPrompt: any, styleVariation: string): string {
    // 确保 workplace 中没有中文词汇
    const cleanedWorkplace = this.translationService.translateText(bioInfo.workplace, 'en');
    // 过滤掉所有中文内容
    const filteredWorkplace = cleanedWorkplace.replace(/[\u4e00-\u9fa5]+/g, '');
    
    // 过滤掉 major 中的中文内容
    const filteredMajor = bioInfo.major.replace(/[\u4e00-\u9fa5]+/g, '');
    
    // 过滤掉 location 中的中文内容
    const filteredLocation = bioInfo.location.replace(/[\u4e00-\u9fa5]+/g, '');
    
    // 生成英文开头
    let bio = `I am ${displayName}, a ${bioInfo.identity}${filteredWorkplace}${filteredMajor}${filteredLocation}.`;
    
    if (bioInfo.personalDescription) {
      // 确保 personalDescription 中没有中文词汇
      let cleanedBio = this.translationService.translateText(bioInfo.personalDescription, 'en');
      // 过滤掉所有中文内容
      cleanedBio = cleanedBio.replace(/[\u4e00-\u9fa5]+/g, '');
      // Remove duplicate personal information
      cleanedBio = cleanedBio.replace(/My name is [^.]+\./g, '');
      cleanedBio = cleanedBio.replace(/I am a [^.]+ student[^.]+\./g, '');
      if (cleanedBio.includes('I focus on')) {
        cleanedBio = cleanedBio.split('I focus on')[0].trim();
      }
      if (cleanedBio) {
        bio += ` ${cleanedBio}`;
      }
    }
    
    if (processedPrompt.en) {
      // 过滤掉 processedPrompt.en 中的中文内容
      const filteredProcessedPrompt = processedPrompt.en.replace(/[\u4e00-\u9fa5]+/g, '');
      bio += filteredProcessedPrompt;
    }
    
    if (bioInfo.includeStats && bioInfo.hasStars) {
      bio += '. My work has received several stars';
    }
    
    if (bioInfo.includeSkills && bioInfo.languages) {
      bio += `. I am proficient in ${bioInfo.languages}`;
    }
    
    if (bioInfo.includeProjects) {
      bio += '. I am working on various projects';
    }
    
    // 过滤掉 styleVariation 中的中文内容
    const filteredStyleVariation = styleVariation.replace(/[\u4e00-\u9fa5]+/g, '');
    bio += filteredStyleVariation;
    
    // 最后再过滤一次所有中文内容，确保没有遗漏
    bio = bio.replace(/[\u4e00-\u9fa5]+/g, '');
    
    return bio;
  }

  private getStyleVariations(style: string): { zh: string; en: string } {
    // Personal traits to add more variety
    const personalTraits = {
      zh: [
        ' 我热衷于解决复杂的技术挑战，不断突破自己的能力边界。',
        ' 我相信技术的力量可以改变世界，致力于用代码创造价值。',
        ' 我注重细节，追求代码的优雅与效率，享受编程带来的成就感。',
        ' 我善于团队合作，喜欢与志同道合的人一起攻克技术难题。',
        ' 我保持开放的心态，积极学习新技术，不断提升自己的专业能力。',
        ' 我相信持续学习是成长的关键，每天都在努力成为更好的自己。',
      ],
      en: [
        ' I am passionate about solving complex technical challenges and constantly pushing my boundaries.',
        ' I believe in the power of technology to change the world and strive to create value through code.',
        ' I pay attention to details, pursue elegant and efficient code, and enjoy the sense of accomplishment that programming brings.',
        ' I am good at teamwork and enjoy tackling technical challenges with like-minded people.',
        ' I maintain an open mind, actively learn new technologies, and continuously improve my professional abilities.',
        ' I believe that continuous learning is the key to growth and work hard every day to become a better version of myself.',
      ],
    };

    // Project interests to add more content
    const projectInterests = {
      zh: [
        ' 我对开源项目充满热情，积极参与社区贡献，希望能为技术生态系统做出自己的贡献。',
        ' 我对Web开发、移动应用和人工智能等领域都有浓厚的兴趣，喜欢探索不同技术栈的可能性。',
        ' 我致力于构建可持续、可扩展的系统架构，注重代码的可维护性和系统的稳定性。',
        ' 我对用户体验设计也有一定的研究，相信好的技术应该服务于优秀的产品体验。',
      ],
      en: [
        ' I am passionate about open source projects, actively participate in community contributions, and hope to make my own contribution to the technology ecosystem.',
        ' I have strong interests in web development, mobile applications, and artificial intelligence, enjoying exploring the possibilities of different technology stacks.',
        ' I am committed to building sustainable and scalable system architectures, focusing on code maintainability and system stability.',
        ' I also have some research in user experience design, believing that good technology should serve excellent product experiences.',
      ],
    };

    // Random style variations to ensure different content each time
    const variations = {
      professional: {
        zh: [
          ' 专注于构建高质量、可扩展的软件解决方案，注重代码的可维护性和系统的稳定性。',
          ' 致力于开发可靠、高效的技术产品，通过创新的解决方案为业务创造价值。',
          ' 专注于创造优雅且功能强大的软件系统，追求技术与业务的完美结合。',
          ' 致力于打造用户友好、性能卓越的应用程序，为用户提供极致的使用体验。',
          ' 专注于前沿技术的研究与应用，不断探索技术的新边界，推动行业的发展。',
        ],
        en: [
          ' I focus on building high-quality, scalable software solutions, emphasizing code maintainability and system stability.',
          ' I am dedicated to developing reliable and efficient technical products, creating value for businesses through innovative solutions.',
          ' I specialize in creating elegant and powerful software systems, pursuing the perfect combination of technology and business.',
          ' I strive to build user-friendly and high-performance applications, providing users with an exceptional experience.',
          ' I focus on the research and application of cutting-edge technologies, constantly exploring new frontiers and driving industry development.',
        ],
      },
      casual: {
        zh: [
          ' 热爱编程，享受创造的过程，喜欢把复杂的问题变成简单优雅的解决方案。',
          ' 喜欢写代码，探索技术的无限可能，每一天都在学习和成长中度过。',
          ' 热衷于编程，享受解决问题的乐趣，代码是我表达创造力的方式。',
          ' 喜欢开发有趣且实用的项目，把自己的想法变成现实是一件很有成就感的事。',
          ' 热爱技术，喜欢尝试新的工具和框架，保持对技术的好奇心和热情。',
        ],
        en: [
          ' I love coding and enjoy the creative process, turning complex problems into simple and elegant solutions.',
          ' I enjoy writing code and exploring the endless possibilities of technology, spending every day learning and growing.',
          ' I am passionate about programming and enjoy the joy of problem-solving, with code as my way of expressing creativity.',
          ' I like developing interesting and useful projects, and turning my ideas into reality is a very fulfilling experience.',
          ' I love technology, enjoy trying new tools and frameworks, and maintain curiosity and passion for technology.',
        ],
      },
      humorous: {
        zh: [
          ' 代码是我的母语，bug是我的朋友，每天都在与它们斗智斗勇中寻找乐趣。',
          ' 每天与代码搏斗，偶尔获胜，但正是这些挑战让编程变得如此有趣。',
          ' 编程让我快乐，bug让我成长，每一次调试都是一次自我提升的机会。',
          ' 代码如诗，bug如歌，构成了我丰富多彩的编程人生，无怨无悔。',
          ' 我是代码的魔法师，用键盘创造奇迹，虽然偶尔会失手变出bug。',
        ],
        en: [
          ' I speak code and make friends with bugs, finding joy in our daily battles of wits.',
          ' I fight with code every day, occasionally winning, but it\'s these challenges that make programming so interesting.',
          ' Programming makes me happy, and bugs make me grow, with every debugging session being an opportunity for self-improvement.',
          ' Code is like poetry, bugs are like songs, composing my colorful programming life without regret.',
          ' I am a code magician, creating miracles with my keyboard, though I occasionally失手 and conjure up bugs.',
        ],
      },
      minimal: {
        zh: [
          ' 简单即是美，我追求简洁而有力的代码，用最少的代码实现最多的功能。',
          ' 专注于本质，剥离冗余，让代码回归最纯粹的状态，展现技术的真正魅力。',
          ' 追求简洁与效率，相信优秀的代码应该是一目了然的，易于理解和维护。',
          ' 大道至简，我相信最复杂的问题往往有最简洁的解决方案，这是我一直追求的目标。',
          ' 简约而不简单，用简洁的代码构建强大的系统，这是我对编程的理解和追求。',
        ],
        en: [
          ' Simple is beautiful, I pursue concise and powerful code, implementing maximum functionality with minimal code.',
          ' Focus on the essence, stripping away redundancy, letting code return to its purest state and showcasing the true charm of technology.',
          ' Pursue simplicity and efficiency, believing that good code should be clear at a glance, easy to understand and maintain.',
          ' Less is more, I believe the most complex problems often have the simplest solutions, which is a goal I constantly pursue.',
          ' Simple but not simplistic, building powerful systems with concise code, this is my understanding and pursuit of programming.',
        ],
      },
    };

    const styleVariations = variations[style as keyof typeof variations] || variations.professional;
    
    // Get random variation
    const randomZh = styleVariations.zh[Math.floor(Math.random() * styleVariations.zh.length)];
    const randomEn = styleVariations.en[Math.floor(Math.random() * styleVariations.en.length)];

    // Randomly add personal traits and project interests for more variety
    let zhAddition = '';
    let enAddition = '';

    // 30% chance to add personal trait
    if (Math.random() < 0.3) {
      const randomTraitZh = personalTraits.zh[Math.floor(Math.random() * personalTraits.zh.length)];
      const randomTraitEn = personalTraits.en[Math.floor(Math.random() * personalTraits.en.length)];
      zhAddition += randomTraitZh;
      enAddition += randomTraitEn;
    }

    // 20% chance to add project interest
    if (Math.random() < 0.2) {
      const randomInterestZh = projectInterests.zh[Math.floor(Math.random() * projectInterests.zh.length)];
      const randomInterestEn = projectInterests.en[Math.floor(Math.random() * projectInterests.en.length)];
      zhAddition += randomInterestZh;
      enAddition += randomInterestEn;
    }

    return { 
      zh: randomZh + zhAddition,
      en: randomEn + enAddition 
    };
  }

  private containsEnglish(text: string): boolean {
    // Check if text contains English characters
    return /[a-zA-Z]/.test(text);
  }

  private containsChinese(text: string): boolean {
    // Check if text contains Chinese characters
    return /[\u4e00-\u9fa5]/.test(text);
  }

  private async updateProgress(historyId: string, progress: number) {
    await this.prisma.generationHistory.update({
      where: { id: historyId },
      data: { progress },
    });
  }

  private async updateJobCache(jobId: string, progress: number, result: any = null, error: string = null) {
    await this.redis.set(
      `job:${jobId}`,
      JSON.stringify({
        jobId,
        status: progress < 100 ? 'processing' : error ? 'failed' : 'completed',
        progress,
        result,
        error,
      }),
      60,
    );
  }
}
