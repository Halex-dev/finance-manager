import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallet(): Promise<Wallet[]> {
    return this.walletService.findAllWallet();
  }

  @Get(':id') // Aggiunta della route per ottenere una riga tramite ID
  async getWalletById(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.findWalletById(id);
  }

  @Post()
  async createWallet(@Body() cost: Wallet): Promise<Wallet> {
    return this.walletService.createWallet(cost);
  }

  @Post(':id')
  async updateWallet(
    @Param('id') id: number,
    @Body() cost: Wallet,
  ): Promise<Wallet> {
    return this.walletService.updateWallet(id, cost);
  }

  @Delete(':id') // Aggiunta della route per eliminare una riga tramite ID
  async deleteWalletById(@Param('id') id: number): Promise<void> {
    await this.walletService.deleteWallet(id);
  }
}
