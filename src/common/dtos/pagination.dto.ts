import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
    @IsOptional()
    @IsPositive()
    @Min(1)
    @Type(()=> Number)
    limit?:number

    @IsOptional()
    @Min(0)
    @Type(()=> Number)
    offset?:number
}