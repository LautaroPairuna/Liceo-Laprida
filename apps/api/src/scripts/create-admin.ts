import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { createAuth } from "../auth/auth.factory.js";
import { env } from "../config/env.js";
import { PrismaClient } from "../generated/prisma/client.js";

const [email, password, ...nameParts] = process.argv.slice(2);
if (!email || !password || password.length < 10) {
  console.error("Uso: npm run admin:create -w api -- correo@dominio clave-de-10-o-mas Nombre");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaMariaDb(env.DATABASE_URL) });

try {
  const context = await createAuth(prisma).$context;
  const existing = await context.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.error(`[admin] ya existe un usuario con ${email}`);
    process.exitCode = 1;
  } else {
    const user = await context.internalAdapter.createUser(
      {
        email,
        name: nameParts.join(" ") || "Administración",
        emailVerified: true,
      },
      { method: "admin" },
    );
    await context.internalAdapter.linkAccount({
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await context.password.hash(password),
    });
    console.log(`[admin] usuario creado: ${email}`);
  }
} finally {
  await prisma.$disconnect();
}
