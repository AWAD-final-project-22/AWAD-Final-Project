import { Injectable, NotFoundException, Inject, Logger } from '@nestjs/common';
import {
  IKanbanColumnRepository,
  IKanbanCardRepository,
} from '../../../domain/repositories/kanban.repository';
import { KanbanCard } from '../../../domain/entities/kanban-card.entity';
import { GmailLabelSyncService } from '../../../infrastructure/services/gmail-label-sync.service';

export interface MoveCardInput {
  cardId: string;
  userId: string;
  sourceColumnId: string;
  destinationColumnId: string;
}

export interface MoveCardOutput {
  success: boolean;
  card: KanbanCard;
}

@Injectable()
export class MoveCardUseCase {
  private readonly logger = new Logger(MoveCardUseCase.name);

  constructor(
    @Inject('IKanbanColumnRepository')
    private readonly columnRepository: IKanbanColumnRepository,
    @Inject('IKanbanCardRepository')
    private readonly cardRepository: IKanbanCardRepository,
    private readonly gmailLabelSyncService: GmailLabelSyncService,
  ) {}

  async execute(input: MoveCardInput): Promise<MoveCardOutput> {
    const { cardId, userId, sourceColumnId, destinationColumnId } = input;

    const card = await this.cardRepository.findById(cardId);
    if (!card) {
      throw new NotFoundException(`Card with id "${cardId}" not found`);
    }

    if (card.userId !== userId) {
      throw new NotFoundException(`Card with id "${cardId}" not found`);
    }

    const sourceColumn = await this.columnRepository.findById(sourceColumnId);
    const destinationColumn =
      await this.columnRepository.findById(destinationColumnId);

    if (!sourceColumn || sourceColumn.userId !== userId) {
      throw new NotFoundException(`Source column not found`);
    }

    if (!destinationColumn || destinationColumn.userId !== userId) {
      throw new NotFoundException(`Destination column not found`);
    }

    try {
      await this.gmailLabelSyncService.moveCard(
        userId,
        card.emailId,
        sourceColumn.label,
        destinationColumn.label,
      );
    } catch (error) {
      this.logger.error(`Failed to sync Gmail labels: ${error}`);
      throw new Error('Failed to sync Gmail labels. Card movement reverted.');
    }

    const updatedCard = await this.cardRepository.updateColumn(
      cardId,
      destinationColumnId,
    );

    return {
      success: true,
      card: updatedCard,
    };
  }
}
