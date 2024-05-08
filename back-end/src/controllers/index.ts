import { AppController } from '../app.controller';
import { CategoryController } from '../database/category/category.controller';
import { WalletController } from '../database/wallet/wallet.controller';
import { AmortizationController } from '../database/amortization/amortization.controller';
import { TransactionController } from '../database/transaction/transaction.controller';
import { MovementController } from 'src/database/movement/movement.controller';
import { ImageController } from 'src/database/image/image.controller';
import { NotificationController } from 'src/database/notification/notification.controller';

const Controllers = [
  AppController,
  CategoryController,
  WalletController,
  AmortizationController,
  TransactionController,
  MovementController,
  ImageController,
  NotificationController,
];

export default Controllers;
