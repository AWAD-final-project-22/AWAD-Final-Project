import {
  Injectable,
  ConflictException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { IKanbanColumnRepository } from '../../../domain/repositories/kanban.repository';
import {
  KanbanColumn,
  UpdateKanbanColumnInput,
} from '../../../domain/entities/kanban-column.entity';

@Injectable()
export class UpdateColumnUseCase {
  constructor(
    @Inject('IKanbanColumnRepository')
    private readonly columnRepository: IKanbanColumnRepository,
  ) {}

  async execute(
    id: string,
    userId: string,
    input: UpdateKanbanColumnInput,
  ): Promise<KanbanColumn> {
    const column = await this.columnRepository.findById(id);

    if (!column) {
      throw new NotFoundException(`Column with id "${id}" not found`);
    }

    if (column.userId !== userId) {
      throw new NotFoundException(`Column with id "${id}" not found`);
    }

    if (input.name && input.name !== column.name) {
      const existingColumn = await this.columnRepository.findByUserIdAndName(
        userId,
        input.name,
      );

      if (existingColumn) {
        throw new ConflictException(
          `Column with name "${input.name}" already exists`,
        );
      }
    }

    return this.columnRepository.update(id, input);
  }
}
