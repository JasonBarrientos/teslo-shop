import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Product, ProductImage } from './entities/';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

import { validate } from "uuid";
@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  constructor(@InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage) private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource
  ) {

  }

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      const product = this.productRepository.create(
        {
          ...productDetails,
          images: images.map(imageUrl => this.productImageRepository.create({ url: imageUrl }))
        })

      await this.productRepository.save(product)
      return { ...product, images };
    } catch (error) {
      this.errorDbHandler(error)
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    return products.map(product => ({
      ...product,
      images: product.images?.map(image => image.url)
    }));
  }

  async findOne(term: string) {
    try {
      let product;

      if (validate(term)) {
        product = await this.productRepository.findOneBy({ id: term });
        product = {
          ...product
        }

      } else {
        const queryBulider = this.productRepository.createQueryBuilder('prod');
        product = await queryBulider.where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        }).leftJoinAndSelect('prod.images', 'prodImages').getOne()
      }

      return product;
    } catch (error) {
      this.errorDbHandler(error)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;
    const product = await this.productRepository.preload({ id, ...toUpdate })

    if (!product) throw new BadRequestException(`Porduct with id ${id} not found`)

    //crate query runner 
    const queryrunner = this.dataSource.createQueryRunner();
    await queryrunner.connect()
    await queryrunner.startTransaction();

    try {
      if (images) {
        queryrunner.manager.delete(ProductImage, { product: id })
        product.images = images.map(image => this.productImageRepository.create({ url: image }));
      } else {

      }

      await queryrunner.manager.save(product)
      // await this.productRepository.save(product);
      await queryrunner.commitTransaction();
      await queryrunner.release();//descoenctr query runner

      return this.findOnePlain(id);
    } catch (error) {

      await queryrunner.rollbackTransaction();
      await queryrunner.release();//descoenctr query runner

      console.log(error);

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
  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map(img => img.url)
    }
  }
}
