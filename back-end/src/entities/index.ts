import { Transaction } from 'src/database/transaction/transaction.entity';
import { Category } from '../database/category/category.entity';
import { Wallet } from '../database/wallet/wallet.entity';
import { Amortization } from 'src/database/amortization/amortization.entity';
import { Movement } from 'src/database/movement/movement.entity';

const Entities = [Category, Wallet, Amortization, Transaction, Movement];

export default Entities;
