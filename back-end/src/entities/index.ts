import { Cost } from '../database/cost/cost.entity';
import { Category } from '../database/category/category.entity';
import { Income } from '../database/income/income.entity';
import { Type } from '../database/type/type.entity';
import { Wallet } from '../database/wallet/wallet.entity';
import { Amortization } from 'src/database/amortization/amortization.entity';

const Entities = [
    Cost,
    Category,
    Income,
    Type,
    Wallet,
    Amortization,
];

export default Entities