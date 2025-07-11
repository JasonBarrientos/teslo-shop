import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product,ProductImage } from './entities/index';

@Module({
  imports:[TypeOrmModule.forFeature([
    Product,ProductImage
  ])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
