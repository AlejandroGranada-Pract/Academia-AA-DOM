-- CreateTable
CREATE TABLE "SsoJti" (
    "jti" TEXT NOT NULL,
    "usadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SsoJti_pkey" PRIMARY KEY ("jti")
);
