import {
  Controller,
  Get,
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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ApiGetWorkflowsDocs, ApiUpdateWorkflowStatusDocs } from '../decorators/swagger/workflow.swagger.decorator';
import { ApiSearchWorkflowsDocs } from '../decorators/swagger/search-workflow.swagger.decorator';
import { SearchWorkflowsUseCase } from '../../application/use-cases/workflow/search-workflow.use-case';
import { GetSuggestionsUseCase } from '../../application/use-cases/workflow/get-suggestions.use-case';
import { GetSuggestionsDto } from '../dtos/request/get-suggestions.dto';
import { GetSuggestionsResponseDto, SuggestionItemDto } from '../dtos/response/suggestion.response.dto';

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
  ) {}
  
  @Get()
  @ApiGetWorkflowsDocs()
  async getWorkflows(
    @Req() req: any,
    @Query('status', new ParseEnumPipe(WorkflowStatus)) status: WorkflowStatus,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset = 0,
  ) {
    const userId = req.user.userId;
    this.logger.log(`GET /workflows - User: ${userId}, Status: ${status}`);
    const safeLimit = Math.max(1, limit);
    const safeOffset = Math.max(0, offset);
    const result = await this.getWorkflowsUseCase.execute({
      userId,
      status,
      limit: safeLimit,
      offset: safeOffset,
    });
    return {
      success: true,
      data: result.data,
      pagination: result.pagination,
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
    this.logger.log(`PATCH /workflows/${id}/status - User: ${userId}, New status: ${status}`);
    const updated = await this.getWorkflowsUseCase.updateWorkflowStatus(userId, id, status);
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
  ){
    const userId = req.user.userId;
    this.logger.log(`GET /workflows/search - User: ${userId}, Query: ${query}`);

    if (!query || query.trim() === '') {
      return {
        success: false,
        message: 'Query parameter is required',
      }
    }

    const safeLimit = Math.max(1, Math.min(limit, 100));
    const safeOffset = Math.max(0, offset);

    const finalOffset = page > 1 ? (page - 1) * safeLimit : safeOffset;

    const result = await this.searchWorkflowsUseCase.execute({
      userId,
      query: query.trim(),
      limit: safeLimit,
      offset: finalOffset,
    });

    return {
      success: true,
      data: result.data,
      pagination: {
        ...result.pagination,
        currentPage: page,
      },
    }
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
}
