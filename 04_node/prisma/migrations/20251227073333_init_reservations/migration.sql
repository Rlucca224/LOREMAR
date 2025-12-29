-- CreateTable
CREATE TABLE "Reservation" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientName" TEXT NOT NULL,
    "clientDni" TEXT,
    "clientPhone" TEXT,
    "eventType" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "hasAc" BOOLEAN NOT NULL DEFAULT false,
    "acHours" INTEGER NOT NULL DEFAULT 0,
    "acPricePerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "acTotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rentalPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Pendiente',

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);
