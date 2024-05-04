import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Amortization } from 'src/database/amortization/amortization.entity';
import { EntityManager, MoreThan } from 'typeorm';
import { addMonths, differenceInMonths, endOfDay, startOfDay } from 'date-fns';
import { TransactionService } from 'src/database/transaction/transaction.service';
import { Transaction } from 'src/database/transaction/transaction.entity';

import * as cron from 'node-cron';
import { logger } from 'src/module/logger'; //My logger

//TODO verificare se funziona
@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionService: TransactionService,
  ) {}

  async onApplicationBootstrap() {
    await this.createMonthlyTransaction();

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
    // Create a queryRunner
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Retrieve amortizations with residual value greater than 0
      const amortizations = await queryRunner.manager.find(Amortization, {
        where: { residualValue: MoreThan(0) },
        relations: ['wallet', 'transactions', 'category'],
      });

      // Iterate over each amortization
      amortizations.forEach(async (amortization) => {
        // Get today's date and start date of the amortization
        const today = endOfDay(new Date());
        const startDate = startOfDay(new Date(amortization.startDate));

        // Calculate the next date to pay based on the number of transactions
        const nextDate = addMonths(startDate, amortization.transactions.length);

        // If today is greater than or equal to the next payment date
        if (today.getTime() >= nextDate.getTime()) {
          // Calculate the months passed since the last payment
          const monthsPassed = differenceInMonths(today, nextDate);

          // Calculate the months to pay considering durationMonths and monthsPassed
          const monthsToPay = Math.min(
            amortization.durationMonths,
            monthsPassed,
          );

          // Iterate over each month to pay
          for (let i = 0; i <= monthsToPay; i++) {
            const toPay = amortization.initialAmount / amortization.durationMonths;

            // Calculate the current month's date
            const currentMonthDate = addMonths(nextDate, i);

            // Create a transaction object
            const transaction: Partial<Transaction> = {
              amount: toPay,
              description: `Amortization: ${amortization.description}`,
              date: currentMonthDate,
              wallet: amortization.wallet,
              category: amortization.category,
              amortization: amortization,
            };

            // Create the transaction and update amortization's transactions and residual value
            const newTrans = await this.transactionService.createAmort(
              transaction,
              queryRunner,
            );
            amortization.transactions.push(newTrans);
            amortization.residualValue -= toPay;

            // Ensure residual value is not negative
            if (amortization.residualValue < 0) amortization.residualValue = 0;
          }
        }
      });

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of error
      logger.error(`Error while executing createMonthlyTransaction: ${error}`);
      await queryRunner.rollbackTransaction();
      throw new Error(
        `Error while executing createMonthlyTransaction: ${error}`,
      );
    } finally {
      // Release the queryRunner
      await queryRunner.release();
      logger.info('Event createMonthlyTransaction....OK');
    }
  }
}
