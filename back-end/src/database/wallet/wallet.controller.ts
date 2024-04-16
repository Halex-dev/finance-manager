import { Controller, Get, Post, Delete, Body, Param, Patch } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async findAll(): Promise<Wallet[]> {
    return this.walletService.findAllWallet();
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async findOne(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.findWalletById(id);
  }

  @Post()
  async create(@Body() wallet: Partial<Wallet>): Promise<Wallet> {
    return this.walletService.createWallet(wallet);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() wallet: Wallet,
  ): Promise<Wallet> {
    return this.walletService.updateWallet(id, wallet);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    await this.walletService.deleteWallet(id);
  }
}
