import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  Logger,
  Body,
  Param,
  Patch,
  ParseEnumPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetWorkflowsUseCase } from '../../application/use-cases/workflow/get-workflows.use-case';
import { WorkflowStatus } from '@prisma/client';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import {
  ApiGetWorkflowsDocs,
  ApiUpdateWorkflowStatusDocs,
} from '../decorators/swagger/workflow.swagger.decorator';
import { ApiSearchWorkflowsDocs } from '../decorators/swagger/search-workflow.swagger.decorator';
import { SearchWorkflowsUseCase } from '../../application/use-cases/workflow/search-workflow.use-case';
import { GetSuggestionsUseCase } from '../../application/use-cases/workflow/get-suggestions.use-case';
import { GetSuggestionsDto } from '../dtos/request/get-suggestions.dto';
import { GetSuggestionsResponseDto, SuggestionItemDto } from '../dtos/response/suggestion.response.dto';
import { SemanticSearchUseCase } from '../../application/use-cases/workflow/semantic-search.use-case';
import { SemanticSearchDto } from '../dtos/request/semantic-search.dto';
import { SemanticSearchResponseDto } from '../dtos/response/semantic-search.response.dto';
import { ApiSemanticSearchDocs } from '../decorators/swagger/semantic-search.swagger.decorator';
import { GetWorkflowsFilterDto, WorkflowSortBy } from '../dtos/request/get-workflows-filter.dto';

@ApiTags('Workflows')
@ApiBearerAuth('JWT-auth')
@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(
    private readonly getWorkflowsUseCase: GetWorkflowsUseCase,
    private readonly searchWorkflowsUseCase: SearchWorkflowsUseCase,
    private readonly getSuggestionsUseCase: GetSuggestionsUseCase,
    private readonly semanticSearchUseCase: SemanticSearchUseCase,
  ) {}

  @Get()
  @ApiGetWorkflowsDocs()
  async getWorkflows(
    @Req() req: any,
    @Query('status', new ParseEnumPipe(WorkflowStatus)) status: WorkflowStatus,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
    @Query() filterDto: GetWorkflowsFilterDto,
  ) {
    const userId = req.user.userId;
    let safeLimit = Math.max(1, limit);
    safeLimit = Math.min(safeLimit, 30);
    const safeOffset = Math.max(0, offset);
    
    // Debug logging for filter parsing
    this.logger.log(
      `[GET WORKFLOWS] Request - userId: ${userId}, status: ${status}, ` +
      `filters parsed: ${JSON.stringify({ 
        unreadOnly: filterDto.unreadOnly, 
        attachmentsOnly: filterDto.attachmentsOnly,
        unreadOnlyType: typeof filterDto.unreadOnly,
        attachmentsOnlyType: typeof filterDto.attachmentsOnly
      })}`
    );
    
    const result = await this.getWorkflowsUseCase.execute({
      userId,
      status,
      limit: safeLimit,
      offset: safeOffset,
      sortBy: filterDto.sortBy,
      unreadOnly: filterDto.unreadOnly,
      attachmentsOnly: filterDto.attachmentsOnly,
    });
    
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
      sort: result.sort,
      filters: result.filters,
    };
  }

  @Patch(':id/status')
  @ApiUpdateWorkflowStatusDocs()
  async updateWorkflowStatus(
    @Param('id') id: string,
    @Body('status', new ParseEnumPipe(WorkflowStatus)) status: WorkflowStatus,
    @Req() req: { user: { userId: string } },
  ): Promise<{ success: boolean; data: EmailWorkflowEntity }> {
    const userId = req.user.userId;
    this.logger.log(
      `PATCH /workflows/${id}/status - User: ${userId}, New status: ${status}`,
    );
    const updated = await this.getWorkflowsUseCase.updateWorkflowStatus(
      userId,
      id,
      status,
    );
    return { success: true, data: updated };
  }

  @Get('search')
  @ApiSearchWorkflowsDocs()
  async searchWorkflows(
    @Req() req: any,
    @Query('query') query: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
  ) {
    const userId = req.user.userId;
    this.logger.log(`GET /workflows/search (Fuzzy Search) - User: ${userId}, Query: "${query}"`);

    if (!query || query.trim() === '') {
      return {
        success: false,
        message: 'Query parameter is required',
      };
    }

    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const finalOffset = page > 1 ? (page - 1) * safeLimit : safeOffset;

    const startTime = Date.now();
    const result = await this.searchWorkflowsUseCase.execute({
      userId,
      query: query.trim(),
      limit: safeLimit,
      offset: finalOffset,
    });
    const totalTime = Date.now() - startTime;

    this.logger.log(
      `[FUZZY SEARCH] ✅ API response - Found ${result.data.length} results, ` +
      `Total: ${result.pagination.total}, Time: ${totalTime}ms`
    );

    return {
      success: true,
      data: result.data,
      pagination: {
        ...result.pagination,
        currentPage: page,
      },
    };
  }

  @Patch(':id/snooze')
  async updateSnooze(
    @Param('id') id: string,
    @Body('snoozedUntil') snoozedUntil: string,
    @Req() req: { user: { userId: string } },
  ): Promise<{ success: boolean; data: EmailWorkflowEntity }> {
    const userId = req.user.userId;
    this.logger.log(`PATCH /workflows/${id}/snooze - User: ${userId}`);
    const snoozedDate = new Date(snoozedUntil);
    const updated = await this.getWorkflowsUseCase.updateSnooze(
      userId,
      id,
      snoozedDate,
    );
    return { success: true, data: updated };
  }

  @Get('by-email/:emailId')
  async findByEmailId(
    @Param('emailId') emailId: string,
    @Req() req: { user: { userId: string } },
  ): Promise<{ success: boolean; data: EmailWorkflowEntity | null }> {
    const userId = req.user.userId;
    const workflow = await this.getWorkflowsUseCase.findByEmailId(
      userId,
      emailId,
    );
    return { success: true, data: workflow };
  }

  @Post()
  async createOrUpdateWorkflow(
    @Body()
    body: {
      emailId: string;
      subject: string;
      from: string;
      date: string;
      snippet?: string;
      status: WorkflowStatus;
    },
    @Req() req: { user: { userId: string } },
  ): Promise<{ success: boolean; data: EmailWorkflowEntity }> {
    const userId = req.user.userId;
    this.logger.log(
      `POST /workflows - User: ${userId}, Email: ${body.emailId}`,
    );
    const workflow = await this.getWorkflowsUseCase.createOrUpdateWorkflow(
      userId,
      {
        emailId: body.emailId,
        subject: body.subject,
        from: body.from,
        date: new Date(body.date),
        snippet: body.snippet,
      },
      body.status,
    );
    return { success: true, data: workflow };
  }

  @Patch(':id/priority')
  async updatePriority(
    @Param('id') id: string,
    @Body('priority') priority: number,
    @Req() req: { user: { userId: string } },
  ): Promise<{ success: boolean; data: EmailWorkflowEntity }> {
    const userId = req.user.userId;
    this.logger.log(`PATCH /workflows/${id}/priority - User: ${userId}`);
    const updated = await this.getWorkflowsUseCase.updatePriority(
      userId,
      id,
      priority,
    );
    return { success: true, data: updated };
  }

  @Get('search/suggestions')
  async getSuggestions(
    @Req() req: { user: { userId: string } },
    @Query() dto: GetSuggestionsDto,
  ): Promise<GetSuggestionsResponseDto> {
    const userId = req.user.userId;
    this.logger.log(`GET /workflows/search/suggestions - User: ${userId}, Query: ${dto.q}`);

    const suggestions = await this.getSuggestionsUseCase.execute({
      userId,
      query: dto.q,
      limit: dto.limit || 5,
    });

    return {
      success: true,
      suggestions,
    };
  }

  @Get('search/semantic')
  @ApiSemanticSearchDocs()
  async semanticSearch(
    @Req() req: any,
    @Query() queryDto: SemanticSearchDto,
  ): Promise<SemanticSearchResponseDto> {
    const userId = req.user.userId;
    const { query, limit = 10, offset = 0, page = 1 } = queryDto;
    
    this.logger.log(`GET /workflows/search/semantic - User: ${userId}, Query: ${query}`);

    if (!query || query.trim() === '') {
      return {
        success: false,
        data: [],
        pagination: {
          total: 0,
          limit: limit || 10,
          offset: offset || 0,
          hasMore: false,
          currentPage: page || 1,
        },
      };
    }

    const safeLimit = Math.max(1, Math.min(limit || 10, 100));
    const safeOffset = Math.max(0, offset || 0);
    const finalPage = Math.max(1, page || 1);
    const finalOffset = finalPage > 1 ? (finalPage - 1) * safeLimit : safeOffset;

    const startTime = Date.now();
    const result = await this.semanticSearchUseCase.execute({
      userId,
      query: query.trim(),
      limit: safeLimit,
      offset: finalOffset,
    });
    const totalTime = Date.now() - startTime;

    this.logger.log(
      `[SEMANTIC SEARCH] ✅ API response - ` +
      `Found ${result.data.length} results, ` +
      `Total: ${result.pagination.total}, ` +
      `Time: ${totalTime}ms`
    );

    return {
      success: true,
      data: result.data,
      pagination: {
        ...result.pagination,
        currentPage: finalPage,
      },
    };
  }
}
