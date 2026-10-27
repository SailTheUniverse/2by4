-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'mock';

-- AlterTable
ALTER TABLE "PricePoint" ADD COLUMN     "shippingCost" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "ProjectList" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'My project',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectItem" (
    "id" TEXT NOT NULL,
    "listId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectItem_listId_productId_key" ON "ProjectItem"("listId", "productId");

-- AddForeignKey
ALTER TABLE "ProjectItem" ADD CONSTRAINT "ProjectItem_listId_fkey" FOREIGN KEY ("listId") REFERENCES "ProjectList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectItem" ADD CONSTRAINT "ProjectItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
