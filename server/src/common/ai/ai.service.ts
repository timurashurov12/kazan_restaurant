import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const LOCALE_NAMES: Record<string, string> = {
  ru: 'Russian',
  en: 'English',
  kk: 'Kazakh',
  uz: 'Uzbek',
  tr: 'Turkish',
  de: 'German',
  fr: 'French',
  es: 'Spanish',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
};

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;
  private groq: Groq | null = null;

  constructor(private config: ConfigService) {}

  private getProvider(): 'gemini' | 'groq' {
    return (this.config.get<string>('TRANSLATE_PROVIDER')?.trim() || 'gemini') as 'gemini' | 'groq';
  }

  private getGenAI(): GoogleGenerativeAI {
    if (this.genAI) return this.genAI;
    const key = this.config.get<string>('GEMINI_API_KEY')?.trim();
    if (!key) {
      throw new BadRequestException('Translation unavailable: set GEMINI_API_KEY in .env');
    }
    this.genAI = new GoogleGenerativeAI(key);
    return this.genAI;
  }

  private getGroq(): Groq {
    if (this.groq) return this.groq;
    const key = this.config.get<string>('GROQ_API_KEY')?.trim();
    if (!key) {
      throw new BadRequestException('Translation unavailable: set GROQ_API_KEY in .env');
    }
    this.groq = new Groq({ apiKey: key });
    return this.groq;
  }

  buildPrompt(sourceLang: string, targetLang: string, text: string): string {
    return `You are a restaurant menu translator. Translate the following text from ${sourceLang} to ${targetLang}.
Keep the tone neutral and suitable for a menu. For dish names use established equivalents where they exist, otherwise transliterate.
Return ONLY the translation, no explanations.

Text to translate:
${text}`;
  }

  resolveLocale(locale: string): string {
    return LOCALE_NAMES[locale] || locale;
  }

  async translate(text: string, sourceLocale: string, targetLocale: string): Promise<string> {
    if (!text?.trim()) return '';

    const provider = this.getProvider();
    const sourceLang = this.resolveLocale(sourceLocale);
    const targetLang = this.resolveLocale(targetLocale);
    const prompt = this.buildPrompt(sourceLang, targetLang, text);

    if (provider === 'groq') {
      return this.translateViaGroq(prompt);
    }
    return this.translateViaGemini(prompt);
  }

  private async translateViaGemini(prompt: string): Promise<string> {
    const genAI = this.getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });
      return result.response.text()?.trim() ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Translation error (Gemini): ${msg}`);
    }
  }

  private async translateViaGroq(prompt: string): Promise<string> {
    const groq = this.getGroq();
    try {
      const result = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      });
      return result.choices[0]?.message?.content?.trim() ?? '';
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new BadRequestException(`Translation error (Groq): ${msg}`);
    }
  }
}
