import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { type CheckoutInput, checkoutSchema } from "./checkout.js";
import { CheckoutService } from "./checkout.service.js";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  start(@Body({ schema: checkoutSchema }) input: CheckoutInput) {
    return this.checkout.start(input);
  }

  @Get(":id")
  status(@Param("id") id: string) {
    return this.checkout.status(id);
  }
}
