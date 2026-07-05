import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsInt, IsUUID, Min } from 'class-validator';
import {
  CurrentUser,
  type JwtUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

class AddCartDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private cart: CartService) {}
  @Get() list(@CurrentUser() u: JwtUser) {
    return this.cart.list(u.sub);
  }
  @Post() add(@CurrentUser() u: JwtUser, @Body() dto: AddCartDto) {
    return this.cart.add(u.sub, dto.productId, dto.quantity);
  }
  @Delete(':id') remove(@CurrentUser() u: JwtUser, @Param('id') id: string) {
    return this.cart.remove(u.sub, id);
  }
}
