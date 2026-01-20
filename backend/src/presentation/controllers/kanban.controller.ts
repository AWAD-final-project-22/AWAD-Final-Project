import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateColumnUseCase,
  UpdateColumnUseCase,
  DeleteColumnUseCase,
  GetColumnsUseCase,
  MoveCardUseCase,
} from '../../application/use-cases/kanban';
import {
  CreateColumnDto,
  UpdateColumnDto,
  MoveCardDto,
} from '../dtos/request/kanban.dto';

@ApiTags('Kanban')
@ApiBearerAuth('JWT-auth')
@Controller('kanban')
@UseGuards(JwtAuthGuard)
export class KanbanController {
  private readonly logger = new Logger(KanbanController.name);

  constructor(
    private readonly createColumnUseCase: CreateColumnUseCase,
    private readonly updateColumnUseCase: UpdateColumnUseCase,
    private readonly deleteColumnUseCase: DeleteColumnUseCase,
    private readonly getColumnsUseCase: GetColumnsUseCase,
    private readonly moveCardUseCase: MoveCardUseCase,
  ) {}

  @Get('columns')
  @ApiOperation({ summary: 'Get all Kanban columns' })
  @ApiResponse({
    status: 200,
    description: 'List of columns returned successfully',
  })
  async getColumns(@Req() req: { user: { userId: string } }) {
    const userId = req.user.userId;
    this.logger.log(`GET /kanban/columns - User: ${userId}`);

    const columns = await this.getColumnsUseCase.execute(userId);

    return {
      success: true,
      data: columns,
    };
  }

  @Post('columns')
  @ApiOperation({ summary: 'Create a new Kanban column' })
  @ApiBody({ type: CreateColumnDto })
  @ApiResponse({ status: 201, description: 'Column created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Column with this name already exists',
  })
  async createColumn(
    @Req() req: { user: { userId: string } },
    @Body() dto: CreateColumnDto,
  ) {
    const userId = req.user.userId;
    const columnName = dto.name || dto.label;
    this.logger.log(
      `POST /kanban/columns - User: ${userId}, Name: ${columnName}`,
    );

    const column = await this.createColumnUseCase.execute({
      userId,
      name: columnName,
      label: dto.label,
      order: dto.order,
    });

    return {
      success: true,
      data: column,
    };
  }

  @Put('columns/:id')
  @ApiOperation({ summary: 'Update a Kanban column' })
  @ApiParam({ name: 'id', description: 'Column ID' })
  @ApiBody({ type: UpdateColumnDto })
  @ApiResponse({ status: 200, description: 'Column updated successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  @ApiResponse({
    status: 409,
    description: 'Column with this name already exists',
  })
  async updateColumn(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
    @Body() dto: UpdateColumnDto,
  ) {
    const userId = req.user.userId;
    this.logger.log(`PUT /kanban/columns/${id} - User: ${userId}`);

    const column = await this.updateColumnUseCase.execute(id, userId, {
      name: dto.name,
      label: dto.label,
      order: dto.order,
    });

    return {
      success: true,
      data: column,
    };
  }

  @Delete('columns/:id')
  @ApiOperation({ summary: 'Delete a Kanban column' })
  @ApiParam({ name: 'id', description: 'Column ID' })
  @ApiResponse({ status: 200, description: 'Column deleted successfully' })
  @ApiResponse({ status: 404, description: 'Column not found' })
  async deleteColumn(
    @Req() req: { user: { userId: string } },
    @Param('id') id: string,
  ) {
    const userId = req.user.userId;
    this.logger.log(`DELETE /kanban/columns/${id} - User: ${userId}`);

    return this.deleteColumnUseCase.execute(id, userId);
  }

  @Put('cards/:cardId/move')
  @ApiOperation({ summary: 'Move a card to a different column' })
  @ApiParam({ name: 'cardId', description: 'Card ID' })
  @ApiBody({ type: MoveCardDto })
  @ApiResponse({ status: 200, description: 'Card moved successfully' })
  @ApiResponse({ status: 404, description: 'Card or column not found' })
  @ApiResponse({ status: 500, description: 'Failed to sync Gmail labels' })
  async moveCard(
    @Req() req: { user: { userId: string } },
    @Param('cardId') cardId: string,
    @Body() dto: MoveCardDto,
  ) {
    const userId = req.user.userId;
    this.logger.log(`PUT /kanban/cards/${cardId}/move - User: ${userId}`);

    return this.moveCardUseCase.execute({
      cardId,
      userId,
      sourceColumnId: dto.sourceColumnId,
      destinationColumnId: dto.destinationColumnId,
    });
  }
}
