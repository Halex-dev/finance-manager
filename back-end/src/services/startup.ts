import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Amortization } from 'src/database/amortization/amortization.entity';
import { EntityManager, MoreThan } from 'typeorm';
import { logger } from 'src/module/logger';
import { addMonths, differenceInMonths, endOfDay, startOfDay } from 'date-fns';
import { TransactionService } from 'src/database/transaction/transaction.service';
import { Transaction } from 'src/database/transaction/transaction.entity';

import * as cron from 'node-cron'; // Importa node-cron

//TODO verificare se funziona
@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionService: TransactionService,
  ) {}

  async onApplicationBootstrap() {
    //await this.createMonthlyTransaction();

    // Programma la funzione createMonthlyTransaction per essere eseguita ogni giorno alle ore 00:00.
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.createMonthlyTransaction();
      } catch (error) {
        logger.error(
          `Error while executing createMonthlyTransaction: ${error}`,
        );
      }
    });
  }

  async createMonthlyTransaction(): Promise<void> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const amortizations = await queryRunner.manager.find(Amortization, {
        where: { residualValue: MoreThan(0) },
        relations: ['wallet', 'transactions', 'category'],
      });

      amortizations.forEach(async (amortization) => {
        const today = endOfDay(new Date());
        const startDate = startOfDay(new Date(amortization.startDate));

        const nextDate = addMonths(startDate, amortization.transactions.length);

        if (today.getTime() >= nextDate.getTime()) {
          const monthsPassed = differenceInMonths(today, nextDate);

          const monthsToPay = Math.min(
            amortization.durationMonths,
            monthsPassed,
          );

          for (let i = 0; i <= monthsToPay; i++) {
            const toPay =
              amortization.initialAmount / amortization.durationMonths;

            // Calculate the month
            const currentMonthDate = addMonths(nextDate, i);

            const transaction: Partial<Transaction> = {
              amount: toPay,
              description: `Amortization: ${amortization.description}`,
              date: currentMonthDate,
              wallet: amortization.wallet,
              category: amortization.category,
              amortization: amortization,
            };

            const newTrans = await this.transactionService.createAmort(
              transaction,
              queryRunner,
            );
            amortization.transactions.push(newTrans);
            amortization.residualValue -= toPay;

            if (amortization.residualValue < 0) amortization.residualValue = 0;
          }
        }
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      logger.error(`Error while executing createMonthlyTransaction: ${error}`);
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Error while executing createMonthlyTransaction: ${error}`,
      );
    } finally {
      // Rilascio del queryRunner
      await queryRunner.release();
      logger.info('Event createMonthlyTransaction....OK');
    }
  }
}
