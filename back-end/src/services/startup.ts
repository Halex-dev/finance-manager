import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Amortization } from 'src/database/amortization/amortization.entity';
import { EntityManager, In, LessThanOrEqual, MoreThan } from 'typeorm';
import { addMonths, differenceInMonths, endOfDay, startOfDay } from 'date-fns';
import { TransactionService } from 'src/database/transaction/transaction.service';
import { Transaction } from 'src/database/transaction/transaction.entity';

import * as cron from 'node-cron';
import { logger } from 'src/module/logger'; //My logger

import { NotificationService } from 'src/database/notification/notification.service';

import { StateType } from 'src/database/transaction/transaction.entity';
import { Wallet } from 'src/database/wallet/wallet.entity';
import { Category, CategoryType } from 'src/database/category/category.entity';
import {
  Notification,
  NotificationState,
} from 'src/database/notification/notification.type';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly transactionService: TransactionService,
    private readonly notificationService: NotificationService,
  ) {}

  async onApplicationBootstrap() {
    await this.checkAmortization();
    await this.checkTransction();

    // Programma la funzione createMonthlyTransaction per essere eseguita ogni giorno alle ore 00:00.
    cron.schedule('0 0 * * *', async () => {
      try {
        await this.checkAmortization();
        await this.checkTransction();
      } catch (error) {
        logger.error(`Error while executing schedule: ${error}`);
      }
    });
  }

  //TODO testare
  async checkTransction(): Promise<void> {
    const queryRunner = this.entityManager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date();
      const endOfToday = endOfDay(today);

      // Retrieve transactions with residual value greater than 0
      const transactions = await queryRunner.manager.find(Transaction, {
        where: {
          state: In([
            StateType.UNPAID,
            StateType.FAILED,
            StateType.NOT_RECEIVED,
          ]),
          date: LessThanOrEqual(endOfToday),
        },
        relations: ['category', 'wallet'],
      });

      transactions.sort((a, b) => {
        if (a.category.category_type === CategoryType.INCOME) return -1;
        if (b.category.category_type === CategoryType.INCOME) return 1;
        return 0;
      });

      // Iterate over each transactions
      transactions.forEach(async (transaction) => {
        const wallet = await queryRunner.manager.findOneOrFail(Wallet, {
          where: { id: transaction.wallet.id },
        });

        const category = await queryRunner.manager.findOneOrFail(Category, {
          where: { id: transaction.category.id },
        });

        if (!wallet) {
          throw new Error('Invalid wallet');
        }

        if (!category) {
          throw new Error('Invalid wallet');
        }

        if (category.category_type === CategoryType.INCOME) {
          wallet.currency += transaction.amount;
          transaction.state = StateType.RECEIVED;
        } else {
          // Se la categoria è una spesa, controlla se ci sono abbastanza soldi nel portafoglio
          if (wallet.currency < transaction.amount) {
            transaction.state = StateType.FAILED;

            const notification: Partial<Notification> = {
              icon: 'money_off',
              message: `to pay an amount of ${transaction.amount} (ID ${transaction.id})`,
              code: NotificationState.ERROR_MONEY,
              date: new Date(),
              read: false,
            };
            await this.notificationService.create(notification);
          } else {
            wallet.currency -= transaction.amount;
            transaction.state = StateType.PAID;
          }
        }

        await queryRunner.manager.save(wallet);
        await queryRunner.manager.save(transaction);
      });

      // Commit the transaction
      await queryRunner.commitTransaction();
    } catch (error) {
      // Rollback the transaction in case of error
      logger.error(`Error while executing checkTransction: ${error}`);
      await queryRunner.rollbackTransaction();
      throw new Error(`Error while executing checkTransction: ${error}`);
    } finally {
      // Release the queryRunner
      await queryRunner.release();
      logger.info('Event checkTransction....OK');
    }
  }

  async checkAmortization(): Promise<void> {
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
            const toPay =
              amortization.initialAmount / amortization.durationMonths;

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
      logger.error(`Error while executing checkAmortization: ${error}`);
      await queryRunner.rollbackTransaction();
      throw new Error(`Error while executing checkAmortization: ${error}`);
    } finally {
      // Release the queryRunner
      await queryRunner.release();
      logger.info('Event checkAmortization....OK');
    }
  }
}
