import { Injectable } from '@nestjs/common';
import {
  IKanbanColumnRepository,
  IKanbanCardRepository,
} from '../../domain/repositories/kanban.repository';
import {
  KanbanColumn,
  CreateKanbanColumnInput,
  UpdateKanbanColumnInput,
} from '../../domain/entities/kanban-column.entity';
import {
  KanbanCard,
  CreateKanbanCardInput,
} from '../../domain/entities/kanban-card.entity';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class KanbanColumnRepositoryImpl implements IKanbanColumnRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateKanbanColumnInput): Promise<KanbanColumn> {
    return this.prisma.kanbanColumn.create({
      data: {
        userId: input.userId,
        name: input.name,
        label: input.label,
        order: input.order ?? 0,
      },
    });
  }

  async findById(id: string): Promise<KanbanColumn | null> {
    return this.prisma.kanbanColumn.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string): Promise<KanbanColumn[]> {
    return this.prisma.kanbanColumn.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async findByUserIdAndName(
    userId: string,
    name: string,
  ): Promise<KanbanColumn | null> {
    return this.prisma.kanbanColumn.findUnique({
      where: {
        userId_name: { userId, name },
      },
    });
  }

  async update(
    id: string,
    input: UpdateKanbanColumnInput,
  ): Promise<KanbanColumn> {
    return this.prisma.kanbanColumn.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.label !== undefined && { label: input.label }),
        ...(input.order !== undefined && { order: input.order }),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kanbanColumn.delete({
      where: { id },
    });
  }

  async getMaxOrder(userId: string): Promise<number> {
    const result = await this.prisma.kanbanColumn.aggregate({
      where: { userId },
      _max: { order: true },
    });
    return result._max.order ?? -1;
  }
}

@Injectable()
export class KanbanCardRepositoryImpl implements IKanbanCardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateKanbanCardInput): Promise<KanbanCard> {
    return this.prisma.kanbanCard.create({
      data: {
        emailId: input.emailId,
        columnId: input.columnId,
        userId: input.userId,
      },
    });
  }

  async findById(id: string): Promise<KanbanCard | null> {
    return this.prisma.kanbanCard.findUnique({
      where: { id },
    });
  }

  async findByEmailId(
    userId: string,
    emailId: string,
  ): Promise<KanbanCard | null> {
    return this.prisma.kanbanCard.findUnique({
      where: {
        userId_emailId: { userId, emailId },
      },
    });
  }

  async findByColumnId(columnId: string): Promise<KanbanCard[]> {
    return this.prisma.kanbanCard.findMany({
      where: { columnId },
    });
  }

  async updateColumn(cardId: string, columnId: string): Promise<KanbanCard> {
    return this.prisma.kanbanCard.update({
      where: { id: cardId },
      data: { columnId },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kanbanCard.delete({
      where: { id },
    });
  }

  async deleteByColumnId(columnId: string): Promise<void> {
    await this.prisma.kanbanCard.deleteMany({
      where: { columnId },
    });
  }
}
