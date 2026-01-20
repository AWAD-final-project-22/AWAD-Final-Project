import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import {
  IKanbanColumnRepository,
  IKanbanCardRepository,
} from '../../../domain/repositories/kanban.repository';

@Injectable()
export class DeleteColumnUseCase {
  constructor(
    @Inject('IKanbanColumnRepository')
    private readonly columnRepository: IKanbanColumnRepository,
    @Inject('IKanbanCardRepository')
    private readonly cardRepository: IKanbanCardRepository,
  ) {}

  async execute(id: string, userId: string): Promise<{ success: boolean }> {
    const column = await this.columnRepository.findById(id);

    if (!column) {
      throw new NotFoundException(`Column with id "${id}" not found`);
    }

    if (column.userId !== userId) {
      throw new NotFoundException(`Column with id "${id}" not found`);
    }

    await this.cardRepository.deleteByColumnId(id);
    await this.columnRepository.delete(id);

    return { success: true };
  }
}
