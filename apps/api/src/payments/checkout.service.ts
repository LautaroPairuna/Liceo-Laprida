import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { env } from "../config/env.js";
import { PrismaService } from "../database/prisma.service.js";
import { enrollmentCode } from "../enrollments/enrollments.js";
import { discountFor, type OffersContent, priceFor } from "../site/pricing.js";
import { SiteService } from "../site/site.service.js";
import type { CheckoutInput } from "./checkout.js";
import { PAYMENT_GATEWAY, type PaymentGateway } from "./payment-gateway.js";

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly site: SiteService,
    @Inject(PAYMENT_GATEWAY) private readonly gateway: PaymentGateway,
  ) {}

  async start(input: CheckoutInput) {
    if (!this.gateway.configured) {
      throw new ServiceUnavailableException("Los pagos todavía no están habilitados.");
    }
    const course = await this.site.course(input.courseId);
    if (!course.formats.includes(input.modality)) {
      throw new BadRequestException("Ese curso no se ofrece en esa modalidad.");
    }
    const content = await this.site.content();
    const price = priceFor(
      course,
      discountFor(course, content.offers as OffersContent, input.promo),
    );

    const enrollment = await this.prisma.enrollment.create({
      data: {
        code: enrollmentCode(input.dni),
        name: input.name,
        dni: input.dni,
        email: input.email,
        phone: input.phone,
        courseId: course.id,
        courseTitle: course.title,
        modality: input.modality,
        shift: input.shift,
        amount: price.initialPayment,
        notes: price.discount ? `Descuento aplicado: ${price.discount}% (${input.promo}).` : "",
        source: "web",
      },
    });

    const { orderId, checkoutUrl } = await this.gateway.createCheckout({
      reference: enrollment.id,
      amount: price.initialPayment,
      title: `Inscripción · ${course.title}`,
      itemCode: course.id,
      payer: { email: input.email, name: input.name, dni: input.dni },
      returnUrl: `${env.PUBLIC_SITE_URL}/inscripcion/resultado?id=${enrollment.id}`,
    });

    await this.prisma.enrollment.update({
      where: { id: enrollment.id },
      data: { mpOrderId: orderId },
    });
    return { id: enrollment.id, checkoutUrl };
  }

  async status(id: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id },
      select: {
        name: true,
        email: true,
        courseTitle: true,
        code: true,
        amount: true,
        payment: true,
      },
    });
    if (!enrollment) throw new NotFoundException("No encontramos esa inscripción.");
    return {
      firstName: enrollment.name.split(" ")[0],
      email: enrollment.email,
      course: enrollment.courseTitle,
      code: enrollment.code,
      amount: enrollment.amount,
      payment: enrollment.payment,
    };
  }
}
