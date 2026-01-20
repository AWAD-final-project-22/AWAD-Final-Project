import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

export interface SearchSuggestion {
  text: string;
  type: 'sender' | 'subject';
  count: number;
}

export interface GetSuggestionsParams {
  userId: string;
  query: string;
  limit?: number;
}

@Injectable()
export class GetSuggestionsUseCase {
  private readonly logger = new Logger(GetSuggestionsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(params: GetSuggestionsParams): Promise<SearchSuggestion[]> {
    const { userId, query, limit = 5 } = params;

    this.logger.log(`Getting suggestions for user ${userId} with query: "${query}"`);

    if (!query || query.trim().length === 0) {
      return [];
    }

    const searchQuery = query.trim();
    const suggestions: SearchSuggestion[] = [];

    try {
      // Tìm kiếm theo người gửi (from)
      const senderResults = await this.prisma.emailWorkflow.groupBy({
        by: ['from'],
        where: {
          userId,
          from: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        _count: {
          from: true,
        },
        orderBy: {
          _count: {
            from: 'desc',
          },
        },
        take: limit,
      });

      suggestions.push(
        ...senderResults.map((result) => ({
          text: result.from,
          type: 'sender' as const,
          count: result._count.from,
        })),
      );

      // Nếu chưa đủ limit, tìm thêm theo tiêu đề (subject)
      const remainingLimit = limit - suggestions.length;
      if (remainingLimit > 0) {
        const subjectResults = await this.prisma.emailWorkflow.groupBy({
          by: ['subject'],
          where: {
            userId,
            subject: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          _count: {
            subject: true,
          },
          orderBy: {
            _count: {
              subject: 'desc',
            },
          },
          take: remainingLimit,
        });

        suggestions.push(
          ...subjectResults.map((result) => ({
            text: result.subject,
            type: 'subject' as const,
            count: result._count.subject,
          })),
        );
      }

      this.logger.log(`Found ${suggestions.length} suggestions for query: "${query}"`);
      return suggestions;
    } catch (error) {
      this.logger.error(`Error getting suggestions: ${error.message}`, error.stack);
      throw error;
    }
  }
}
