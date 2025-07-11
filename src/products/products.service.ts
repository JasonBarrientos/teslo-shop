import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product , ProductImage} from './entities/';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate } from "uuid";
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,@InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>) {

  }

  async create(createProductDto: CreateProductDto) {
    try {
      const {images=[], ...productDetails} = createProductDto;
      const  product= this.productRepository.create(
        {...productDetails,
          images:images.map(imageUrl => this.productImageRepository.create({url:imageUrl}))})
      
      await this.productRepository.save(product)
      return product;
    } catch (error) {
      this.errorDbHandler(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    let { limit = 10, offset = 0 } = paginationDto
    let products = await this.productRepository.find({
      take: limit,
      skip: offset
      //TODO:relacione
    });
    return products;
  }

  async findOne(term: string) {
    try {
      let product;
      if (validate(term)) {
        product = await this.productRepository.findOneBy({ id: term });

      } else {
        const queryBulider = this.productRepository.createQueryBuilder();
        product = await queryBulider.where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).getOne()
      }

      return product;
    } catch (error) {
      this.errorDbHandler(error)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id,
        ...updateProductDto,
        images:[]
      })
      if (!product) {
        throw new BadRequestException(`Porduct with id ${id} not found`)
      }
      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.errorDbHandler(error)
    }
  }

  async remove(id: string) {
    let product = await this.findOne(id)
    await this.productRepository.delete({ id: id })
    return `This action removes a #${id} product`;
  }
  private errorDbHandler(error) {
    this.logger.error(error)
    switch (error.code) {
      case '23505':
        throw new BadRequestException(error.detail);
      case '22P02':
        throw new NotFoundException(`Product with id ${error.parameters[0]} not found.`);
      default:
        throw new InternalServerErrorException(" Error inespErado revisar logs");
    }
  }
}
