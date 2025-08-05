import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/see-data';

@Injectable()
export class SeedService {
  constructor(private readonly productsService: ProductsService){

  }
  async runSeed() {
    await this.productsService.deletaAllProducts();
    
    initialData.products.forEach(async ( product)=>{
        await this.productsService.create(product)
    })
    return 'Seed excuted';
  }

}
