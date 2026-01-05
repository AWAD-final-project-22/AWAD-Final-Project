import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { IKanbanColumnRepository } from '../../../domain/repositories/kanban.repository';
import {
  KanbanColumn,
  CreateKanbanColumnInput,
} from '../../../domain/entities/kanban-column.entity';

@Injectable()
export class CreateColumnUseCase {
  constructor(
    @Inject('IKanbanColumnRepository')
    private readonly columnRepository: IKanbanColumnRepository,
  ) {}

  async execute(input: CreateKanbanColumnInput): Promise<KanbanColumn> {
    const existingColumn = await this.columnRepository.findByUserIdAndName(
      input.userId,
      input.name,
    );

    if (existingColumn) {
      throw new ConflictException(
        `Column with name "${input.name}" already exists`,
      );
    }

    const maxOrder = await this.columnRepository.getMaxOrder(input.userId);

    return this.columnRepository.create({
      ...input,
      order: input.order ?? maxOrder + 1,
    });
  }
}
