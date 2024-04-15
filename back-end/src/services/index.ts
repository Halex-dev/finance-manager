import { TransactionService } from 'src/database/transaction/transaction.service';
import { AppService } from '../app.service';
import { CategoryService } from '../database/category/category.service';
import { WalletService } from '../database/wallet/wallet.service';
import { AmortizationService } from 'src/database/amortization/amortization.service';
import { MovementService } from 'src/database/movement/movement.service';

const Services = [
  AppService,
  CategoryService,
  WalletService,
  AmortizationService,
  TransactionService,
  MovementService,
];

export default Services;
