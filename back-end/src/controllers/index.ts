
import { AppController } from '../app.controller';
import { CategoryController } from '../database/category/category.controller';
import { CostController } from '../database/cost/cost.controller';
import { TypeController } from '../database/type/type.controller';
import { WalletController } from '../database/wallet/wallet.controller';
import { IncomeController } from '../database/income/income.controller';
import { AmortizationController } from '../database/amortization/amortization.controller';

const Controllers = [
    AppController,
    CostController,
    CategoryController,
    TypeController,
    WalletController,
    IncomeController,
    AmortizationController,
];

export default Controllers