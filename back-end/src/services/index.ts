
import { AppService } from '../app.service';
import { CategoryService } from '../database/category/category.service';
import { CostService } from '../database/cost/cost.service';
import { TypeService } from '../database/type/type.service';
import { WalletService } from '../database/wallet/wallet.service';
import { IncomeService } from '../database/income/income.service';
import { AmortizationService } from 'src/database/amortization/amortization.service';

const Services = [
    AppService,
    CategoryService,
    CostService,
    TypeService,
    WalletService,
    IncomeService,
    AmortizationService,
];

export default Services