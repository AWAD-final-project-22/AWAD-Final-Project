import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IAiSummaryPort, AiSummaryResult } from '../../application/ports/ai-summary.port';

@Injectable()
export class AiSummaryService implements IAiSummaryPort {
  private readonly logger = new Logger(AiSummaryService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. AI summarization will be disabled.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');

    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async summarizeEmailBatch(emails: {id: string, subject: string, body: string}[]): Promise<{[id: string]: AiSummaryResult}> {
    try {
      const emailsText = emails
        .map(
          (email, index) => `---\nEmail ${index + 1} (ID: ${email.id}):\nSubject: ${email.subject}\nBody: ${email.body.substring(0, 500)}... (truncated)\n---`,
        )
        .join('\n');

      const prompt = `You are an expert email summarizer. For each email below, write a concise, natural summary (2-3 sentences) that does NOT repeat the subject, does NOT start with 'This is', 'This email', or similar phrases. Focus on the main content, actions, and urgency. Avoid generic statements and do not copy the subject. Also, provide an urgency score from 0.0 to 1.0.\n\nUrgency score guidelines:\n- 0.0-0.3: Low urgency (FYI, newsletters, promotional)\n- 0.4-0.6: Medium urgency (normal tasks, updates)\n- 0.7-1.0: High urgency (deadlines, urgent requests, important actions needed)\n\nEmails:\n${emailsText}\n\nRespond with a JSON array, each object:\n[\n  {\n    "id": "email_id_1",\n    "summary": "...",\n    "urgencyScore": 0.5\n  },\n  {\n    "id": "email_id_2",\n    "summary": "...",\n    "urgencyScore": 0.8\n  }\n]\nReturn ONLY the JSON array, no extra text.`;

      this.logger.log(`[Batch AI] Processing ${emails.length} emails in 1 request`);

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();

      if (!responseText) {
        throw new Error('Gemini returned empty response');
      }

      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      const parsedResults: Array<{ id: string; summary: string; urgencyScore: number }> =
        JSON.parse(jsonText);

      const batchResult: {[id: string]: AiSummaryResult} = {};
      for (const result of parsedResults) {
        batchResult[result.id] = {
          summary: result.summary || 'No summary available',
          urgencyScore: Math.max(0, Math.min(1, result.urgencyScore || 0.5)),
        };
      }

      this.logger.log(`[Batch AI] Successfully analyzed ${Object.keys(batchResult).length} emails`);

      return batchResult;
    } catch (error) {
      this.logger.error('[Batch AI] Failed to summarize emails with Gemini', error);

      const fallbackResult: {[id: string]: AiSummaryResult} = {};
      for (const email of emails) {
        fallbackResult[email.id] = {
          summary: 'AI summarization failed',
          urgencyScore: 0.5,
        };
      }
      return fallbackResult;
    }
  }

  async summarizeEmail(emailBody: string, subject: string): Promise<AiSummaryResult> {
    try {
      const prompt = `You are an AI assistant that analyzes emails.

        Email Subject: ${subject}

        Email Body:
        ${emailBody}

        Provide a JSON response with:
        1. A concise summary (2-3 sentences) covering:
        - Main purpose of the email
        - Key action items (if any)
        - Deadline or urgency (if mentioned)

        2. An urgency score from 0.0 to 1.0:
        - 0.0-0.3: Low urgency (FYI, newsletters)
        - 0.4-0.6: Medium urgency (normal tasks)
        - 0.7-1.0: High urgency (deadlines, important requests)

        Format your response as JSON:
        {
        "summary": "...",
        "urgencyScore": 0.5
        }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text().trim();
      
      if (!responseText) {
        throw new Error('Gemini returned empty response');
      }

      let jsonText = responseText;
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[1] || jsonMatch[0];
      }

      const parsedResult = JSON.parse(jsonText);

      this.logger.log(`Email analyzed: urgency=${parsedResult.urgencyScore}`);

      return {
        summary: parsedResult.summary || 'No summary available',
        urgencyScore: Math.max(0, Math.min(1, parsedResult.urgencyScore || 0.5)),
      };
    } catch (error) {
      this.logger.error('Failed to summarize email with Gemini', error);
      return {
        summary: 'AI summarization failed',
        urgencyScore: 0.5,
      };
    }
  }
}
