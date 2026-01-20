import { Injectable, Inject } from '@nestjs/common';
import { IKanbanColumnRepository } from '../../../domain/repositories/kanban.repository';
import { KanbanColumn } from '../../../domain/entities/kanban-column.entity';

@Injectable()
export class GetColumnsUseCase {
  constructor(
    @Inject('IKanbanColumnRepository')
    private readonly columnRepository: IKanbanColumnRepository,
  ) {}

  async execute(userId: string): Promise<KanbanColumn[]> {
    return this.columnRepository.findByUserId(userId);
  }
}
